/* ==========================================================================
   CERTONIS — WebGL atmosphere
   A domain-warped flow field rendered in a single fragment shader.
   Degrades silently to the CSS gradient in .atmosphere when WebGL is absent,
   the device is low-powered, or the visitor prefers reduced motion.
   ========================================================================== */
(function () {
  "use strict";

  var canvas = document.getElementById("gl-canvas");
  if (!canvas) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  if (reduced || lowPower) return;

  var gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: "high-performance"
  });
  if (!gl) return;

  var VERT = [
    "attribute vec2 p;",
    "void main(){ gl_Position = vec4(p, 0.0, 1.0); }"
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "uniform vec2  u_res;",
    "uniform float u_time;",
    "uniform vec2  u_mouse;",
    "uniform float u_scroll;",

    // --- value noise ---------------------------------------------------
    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }",

    "float noise(vec2 p){",
    "  vec2 i = floor(p), f = fract(p);",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),",
    "             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);",
    "}",

    "float fbm(vec2 p){",
    "  float v = 0.0, a = 0.5;",
    "  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);",
    "  for (int i = 0; i < 5; i++){",
    "    v += a * noise(p);",
    "    p = rot * p * 2.02;",
    "    a *= 0.5;",
    "  }",
    "  return v;",
    "}",

    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);",
    "  float t = u_time * 0.045;",
    "  vec2 m = u_mouse * 0.34;",

    // domain warp: q -> r -> field
    "  vec2 q = vec2(fbm(uv * 1.5 + vec2(0.0, t)), fbm(uv * 1.5 + vec2(5.2, 1.3 - t)));",
    "  vec2 r = vec2(fbm(uv * 1.9 + 3.4 * q + vec2(1.7, 9.2) + m + t * 0.6),",
    "               fbm(uv * 1.9 + 3.4 * q + vec2(8.3, 2.8) - m - t * 0.4));",
    "  float f = fbm(uv * 2.1 + 3.2 * r + u_scroll * 0.55);",

    // palette: deep ink -> violet -> cyan
    "  vec3 ink    = vec3(0.020, 0.024, 0.047);",
    "  vec3 violet = vec3(0.424, 0.294, 0.965);",
    "  vec3 cyan   = vec3(0.133, 0.890, 0.824);",
    "  vec3 col = mix(ink, violet, clamp(f * f * 2.1, 0.0, 1.0));",
    "  col = mix(col, cyan, clamp(length(r) * 0.55 - 0.18, 0.0, 1.0) * 0.72);",

    // filament highlights along the warp ridges
    "  float ridge = smoothstep(0.42, 0.98, abs(q.x - r.y) * 2.4);",
    "  col += vec3(0.30, 0.42, 0.95) * ridge * 0.22;",

    // vignette + top bias so the hero copy stays readable
    "  float vig = smoothstep(1.25, 0.16, length(uv * vec2(1.0, 1.25)));",
    "  float band = smoothstep(-0.72, 0.55, uv.y);",
    "  float a = vig * (0.30 + 0.34 * band) * (0.55 + 0.45 * f);",
    "  gl_FragColor = vec4(col * a, a * 0.94);",
    "}"
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, "u_res");
  var uTime = gl.getUniformLocation(prog, "u_time");
  var uMouse = gl.getUniformLocation(prog, "u_mouse");
  var uScroll = gl.getUniformLocation(prog, "u_scroll");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  var scroll = 0, scrollTarget = 0;
  var running = true;
  var start = performance.now();

  function resize() {
    var w = Math.floor(window.innerWidth * dpr);
    var h = Math.floor(window.innerHeight * dpr);
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  window.addEventListener("pointermove", function (e) {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  window.addEventListener("scroll", function () {
    scrollTarget = window.scrollY / Math.max(1, window.innerHeight);
  }, { passive: true });

  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) {
      start = performance.now() - elapsed * 1000;
      requestAnimationFrame(frame);
    }
  });

  var elapsed = 0;

  function frame(now) {
    if (!running) return;
    elapsed = (now - start) / 1000;
    mouse.x += (mouse.tx - mouse.x) * 0.045;
    mouse.y += (mouse.ty - mouse.y) * 0.045;
    scroll += (scrollTarget - scroll) * 0.06;

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uScroll, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
  canvas.classList.add("is-ready");
})();
