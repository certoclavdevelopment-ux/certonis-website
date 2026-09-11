/* ==========================================================================
   CERTONIS — Contact form
   Validates, posts to the configured endpoint, and falls back to a
   pre-filled mail draft when no endpoint is configured or the network fails.
   ========================================================================== */
(function () {
  "use strict";

  var cfg = window.CERTONIS_CONFIG || {};
  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("form-status");
  var submit = form.querySelector('button[type="submit"]');
  var startedAt = Date.now();

  var MSG = {
    de: {
      required: "Bitte ausfüllen.",
      email: "Bitte eine gültige E-Mail-Adresse angeben.",
      consent: "Bitte die Datenschutzerklärung bestätigen.",
      sending: "Wird gesendet …",
      ok: "Danke! Ihre Anfrage ist angekommen. Wir melden uns innerhalb von 24 Stunden (werktags).",
      mail: "Ihr E-Mail-Programm wurde mit der fertigen Anfrage geöffnet. Bitte nur noch abschicken.",
      error: "Senden fehlgeschlagen. Bitte schreiben Sie direkt an info@certonis.com."
    },
    en: {
      required: "This field is required.",
      email: "Please enter a valid email address.",
      consent: "Please accept the privacy policy.",
      sending: "Sending …",
      ok: "Thank you! Your request has arrived. We'll get back to you within 24 hours (business days).",
      mail: "Your mail client opened with the request pre-filled. Just hit send.",
      error: "Sending failed. Please email us directly at info@certonis.com."
    }
  };

  function t(key) {
    var lang = document.documentElement.lang === "en" ? "en" : "de";
    return MSG[lang][key];
  }

  function setError(field, message) {
    var wrap = field.closest(".field") || field.closest(".form__foot");
    if (!wrap) return;
    wrap.classList.add("has-error");
    var slot = wrap.querySelector(".field__error");
    if (slot) slot.textContent = message;
  }

  function clearError(field) {
    var wrap = field.closest(".field") || field.closest(".form__foot");
    if (wrap) wrap.classList.remove("has-error");
  }

  form.addEventListener("input", function (e) {
    if (e.target.matches("input, select, textarea")) clearError(e.target);
  });

  function validate() {
    var ok = true;
    var first = null;

    form.querySelectorAll("[required]").forEach(function (field) {
      var value = field.type === "checkbox" ? field.checked : field.value.trim();
      if (!value) {
        setError(field, field.type === "checkbox" ? t("consent") : t("required"));
        ok = false;
        first = first || field;
      } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(field.value.trim())) {
        setError(field, t("email"));
        ok = false;
        first = first || field;
      }
    });

    if (first) first.focus({ preventScroll: false });
    return ok;
  }

  function collect() {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      if (key === "_hp") return;
      if (data[key]) data[key] = [].concat(data[key], value);
      else data[key] = value;
    });
    data.page = location.href;
    data.language = document.documentElement.lang;
    return data;
  }

  function show(kind, message) {
    if (!status) return;
    status.textContent = message;
    status.className = "form__status is-visible " + (kind === "ok" ? "is-ok" : "is-error");
    status.setAttribute("role", "status");
  }

  function mailtoFallback(data) {
    var lines = [
      "Name: " + (data.name || ""),
      "Firma: " + (data.company || ""),
      "E-Mail: " + (data.email || ""),
      "Telefon: " + (data.phone || ""),
      "Mitarbeiter: " + (data.employees || ""),
      "Aktuelles System: " + (data.current_system || ""),
      "Zeithorizont: " + (data.timeline || ""),
      "",
      "Nachricht:",
      data.message || ""
    ].join("\n");

    var href = "mailto:" + (cfg.email || "info@certonis.com") +
      "?subject=" + encodeURIComponent("Anfrage Odoo-Einführung – " + (data.company || data.name || "")) +
      "&body=" + encodeURIComponent(lines);

    window.location.href = href;
    show("ok", t("mail"));
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    // bot traps: hidden field + impossibly fast submit
    var hp = form.querySelector('[name="_hp"]');
    if ((hp && hp.value) || Date.now() - startedAt < 2500) {
      show("ok", t("ok"));
      form.reset();
      return;
    }

    var data = collect();

    if (!cfg.contactEndpoint) {
      mailtoFallback(data);
      return;
    }

    submit.classList.add("is-loading");
    submit.disabled = true;
    show("ok", t("sending"));

    var payload = data;
    if (cfg.web3formsKey) {
      payload = Object.assign({}, data, {
        access_key: cfg.web3formsKey,
        subject: "Certonis Anfrage – " + (data.company || data.name || ""),
        from_name: "certonis.com"
      });
    }

    fetch(cfg.contactEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json().catch(function () { return {}; });
      })
      .then(function () {
        form.reset();
        show("ok", t("ok"));
        if (cfg.successRedirect) setTimeout(function () { location.href = cfg.successRedirect; }, 1200);
      })
      .catch(function () {
        show("error", t("error"));
        mailtoFallback(data);
      })
      .finally(function () {
        submit.classList.remove("is-loading");
        submit.disabled = false;
      });
  });
})();
