/* ==========================================================================
   CERTONIS — Language switch (DE default, EN on demand)
   German lives in the markup so it is crawlable without JavaScript.
   English is applied from this dictionary and remembered per visitor.
   ========================================================================== */
(function () {
  "use strict";

  var EN = {
    "a11y.skip": "Skip to content",

    "nav.services": "Services",
    "nav.process": "Process",
    "nav.timeline": "Timeline",
    "nav.pricing": "Pricing",
    "nav.security": "Security",
    "nav.faq": "FAQ",
    "nav.ai": "Why AI",
    "nav.contact": "Contact",

    "cta.call": "Discovery call",
    "cta.callLong": "Book a discovery call",
    "cta.process": "See the process",
    "cta.eyebrow": "Next step",
    "cta.title": "Let's talk about your processes, not about software.",
    "cta.lead": "45 minutes, free of charge, no strings attached. Afterwards you'll know whether the move pays off for you.",

    "hero.badge": "ERP implementation with Claude Code",
    "hero.l1": "Moving to Odoo.",
    "hero.l2": "Configured by AI.",
    "hero.lead": "Certonis moves your company onto the world's largest open-source ERP. Process mapping, data analysis, configuration and migration are handled by AI — you get a fixed price, a clear schedule and a system that matches how you actually work.",
    "hero.for": "For",
    "hero.for2": "— from the 5-person shop to the mid-sized company.",
    "hero.f1": "weeks to go-live",
    "hero.f2": "licence per user (Community)",
    "hero.f3": "steps in the process",
    "hero.scroll": "Scroll",

    "teaser.eyebrow": "Overview",
    "teaser.title": "An ERP project measured in weeks instead of quarters.",
    "teaser.lead": "We broke the road to Odoo into six clear steps and handed the grunt work to AI. What that means in practice is on these pages.",
    "teaser.more": "View",
    "teaser.services": "Discovery, data analysis, configuration, migration, integrations, training \u2014 and the Odoo modules we set up.",
    "teaser.process": "Six steps from the first conversation to go-live, with a realistic schedule for 4 to 20 weeks.",
    "teaser.ai": "What the AI takes over, what people decide \u2014 and why that turns into a fraction of the usual project duration.",
    "teaser.pricing": "Odoo Community costs \u20ac0 per user. What implementation costs is fixed after the data analysis.",
    "teaser.security": "NDA before the first file, data processing under Art. 28 GDPR, processing inside the EU, no AI training on your data.",
    "teaser.faq": "What does implementation cost, what happens to legacy data, where does the system run, and what if Odoo isn't the fit?",

    "home.s1": "weeks to go-live",
    "home.s2": "licence cost per user on Odoo Community",
    "home.s3": "fewer consulting days than a classic ERP project",
    "home.s4": "from data handover to the first analysis",

    "manifest.eyebrow": "The starting point",
    "manifest.text": "An ERP project rarely fails because of the software. It fails because of months of workshops, endless proposals and consultants who never learn your business. We turn that around.",
    "manifest.s1": "fewer consulting days than a classic ERP project",
    "manifest.s2": "from data handover to the first analysis",

    "svc.eyebrow": "Services",
    "svc.title": "Everything between the system you run today and a working Odoo.",
    "svc.lead": "Certonis covers the whole way — from the first process interview to the day your team works without asking questions.",
    "svc.1t": "Discovery & process mapping",
    "svc.1d": "We listen before we configure: how does an order travel through your company today? Where is data entered twice? The result is a process map that informs every later decision.",
    "svc.2t": "Data analysis by AI",
    "svc.2d": "Your exports from SAP, Sage, DATEV, Xero, QuickBooks or Excel are read, cleaned and mapped onto the Odoo data model automatically. Duplicates, gaps and legacy debt are on the table before the quote is.",
    "svc.3t": "Implementation with Claude Code",
    "svc.3d": "Configuration, fields, workflows, reports and custom modules are produced with AI — versioned, testable and reviewed by us.",
    "svc.4t": "Data migration",
    "svc.4d": "Master data, open documents, stock, balances and history move across traceably — with a dry run, reconciliation and your sign-off.",
    "svc.5t": "Integrations & automation",
    "svc.5d": "Web shop, bank, shipping, time tracking, machines, tax advisor: whatever produces data gets connected instead of retyped.",
    "svc.6t": "Training & hypercare",
    "svc.6d": "Role-based training, short videos for everyday questions and a supported launch phase where answers come the same day.",
    "svc.modules": "Odoo modules we set up",
    "svc.modulesNote": "Which modules you actually need is decided by the data analysis, not by a sales pitch. A lean Odoo that people use beats a full suite nobody opens.",

    "flow.eyebrow": "Process",
    "flow.title": "Six steps. No surprises.",
    "flow.1t": "Discovery call",
    "flow.1d": "45 minutes, free and non-binding. We work out what you run today, what hurts, and whether Odoo is the right answer at all. If it isn't, we say so.",
    "flow.1m": "45 minutes",
    "flow.free": "free",
    "flow.2t": "NDA & data processing",
    "flow.2d": "Before a single file changes hands: a mutual non-disclosure agreement and a data processing agreement under Art. 28 GDPR. In writing, reviewed, signed by both sides.",
    "flow.2m": "1–3 days",
    "flow.3t": "Data analysis by AI",
    "flow.3d": "Your exports are analysed automatically: data quality, volumes, process gaps, migration effort. You receive a report that holds value even without us.",
    "flow.3m": "1–2 weeks",
    "flow.report": "analysis report",
    "flow.4t": "Fixed-price quote",
    "flow.4d": "One price, one scope, one date. No day-rate poker, no change requests for things that were clear from the start. You decide on numbers, not on hope.",
    "flow.4m": "3–5 days",
    "flow.fixed": "fixed price",
    "flow.5t": "Implementation by AI",
    "flow.5d": "Configuration, migration, customisations and integrations are built with AI in short cycles. Every week you see a running system, not a slide deck.",
    "flow.5m": "2–14 weeks",
    "flow.weekly": "weekly demos",
    "flow.6t": "Training & go-live",
    "flow.6d": "Your team is trained per role, the switch happens on a defined date, and we stay close during the first weeks afterwards.",
    "flow.6m": "1–3 weeks",

    "tl.eyebrow": "Timeline",
    "tl.title": "4 to 20 weeks — depending on company size.",
    "tl.lead": "An 8-person service company is productive after roughly a month. A manufacturer with warehousing, production and integrations takes up to five months. The difference is scope, not speed.",
    "tl.r1": "Discovery & process mapping",
    "tl.r2": "NDA & data processing",
    "tl.r3": "Data analysis by AI",
    "tl.r4": "Quote & approval",
    "tl.r5": "Implementation & migration",
    "tl.r6": "Training, go-live, hypercare",
    "tl.s1": "weeks · small business, 1–3 modules",
    "tl.s2": "weeks · retail & services",
    "tl.s3": "weeks · manufacturing & multi-warehouse",
    "tl.s4": "cut-over date for the switch",

    "ai.eyebrow": "Why AI",
    "ai.title": "The same work. A fraction of the time.",
    "ai.lead": "A classic ERP project consists largely of work nobody needs to do by hand any more: reviewing data, mapping it, testing, documenting. That is exactly the work AI does here — reviewed and signed off by people.",
    "ai.c1": "Classic ERP project",
    "ai.c2": "Certonis",
    "ai.c3": "Consulting days, classic",
    "ai.c4": "Consulting days at Certonis",
    "ai.months": "months",
    "ai.note": "Reference values from comparable mid-market projects. Your actual scope is fixed after the data analysis.",

    "pr.eyebrow": "Pricing",
    "pr.title": "Transparent, in three positions.",
    "pr.lead": "Licence, hosting and implementation are three separate things. We only earn on the third — and we tell you what it costs beforehand.",
    "pr.perUser": "per user / month",
    "pr.onRequest": "On request",
    "pr.tag": "Our service",
    "pr.1s": "Open source. The default route for most companies.",
    "pr.1n": "Permanently free of licence fees — no matter how many people use it.",
    "pr.1f1": "All core modules: CRM, sales, purchasing, inventory, projects, website",
    "pr.1f2": "Unlimited users at no licence cost",
    "pr.1f3": "Runs at an EU host or on your own hardware",
    "pr.1f4": "Full access to your data and the source code",
    "pr.1f5": "Without Odoo Studio, vendor support and Enterprise apps",
    "pr.cta1": "Is this right for us?",
    "pr.2t": "Implementation by Certonis",
    "pr.2s": "Analysis, configuration, migration, training — as one package.",
    "pr.2n": "Fixed price after the data analysis. Non-binding before, binding after.",
    "pr.2f1": "Discovery call and process mapping",
    "pr.2f2": "AI-driven data analysis including report",
    "pr.2f3": "Configuration, customisations and integrations",
    "pr.2f4": "Data migration with dry run and acceptance",
    "pr.2f5": "Role-based training and a supported go-live",
    "pr.cta2": "Request a quote",
    "pr.3s": "When Studio, vendor support and Enterprise apps are required.",
    "pr.3p": "Odoo pricing",
    "pr.3n": "Billed directly by Odoo S.A. according to their official price list.",
    "pr.3f1": "All Community features plus Enterprise apps",
    "pr.3f2": "Odoo Studio, mobile apps, IoT, Enterprise accounting",
    "pr.3f3": "Support and upgrades from the vendor",
    "pr.3f4": "Hosting on Odoo Online or odoo.sh",
    "pr.cta3": "Odoo price list",
    "pr.disclaimer": "All prices exclude VAT. Hosting, licence and third-party costs are billed directly by the respective provider. Certonis is an independent company and is not affiliated with Odoo S.A. or Anthropic.",

    "sec.eyebrow": "Security & privacy",
    "sec.title": "Your data stays your data.",
    "sec.1t": "NDA before anything else",
    "sec.1d": "The non-disclosure agreement is signed before you show us a single file. Mutual, and unlimited in time for trade secrets.",
    "sec.2t": "DPA under Art. 28 GDPR",
    "sec.2d": "A data processing agreement with documented technical and organisational measures, sub-processors and deletion periods.",
    "sec.3t": "Processing inside the EU",
    "sec.3d": "Production systems and backups run with EU providers. Where a third-country transfer would be needed, we say so upfront — or avoid it.",
    "sec.4t": "Data minimisation",
    "sec.4d": "The analysis needs structures and volumes, rarely real names. Wherever data can be pseudonymised, it is.",
    "sec.5t": "No AI training on your data",
    "sec.5d": "Your content is used exclusively for your project and is not released for model training.",
    "sec.6t": "Everything stays exportable",
    "sec.6d": "Odoo runs on PostgreSQL and its source is open. You can export everything at any time — including away from us.",

    "faq.eyebrow": "FAQ",
    "faq.title": "Questions that come up in every project.",
    "faq.lead": "Yours isn't listed? Write to us — we answer within one business day.",
    "faq.q1": "What does the implementation cost?",
    "faq.a1": "The implementation is offered as a fixed price. The amount follows from the data analysis and depends on the number of modules, data volume, integrations and training scope. You receive the quote after the analysis — no day rates and no extra invoices within the agreed scope.",
    "faq.q2": "Why is Odoo Community €0?",
    "faq.a2": "Because Odoo Community is open source (LGPLv3). There are no per-user licence fees, no matter how many people work with it. Costs arise only for hosting, implementation and optional Enterprise features.",
    "faq.q3": "What exactly does the AI do — and what do humans do?",
    "faq.a3": "The AI does the diligent work: reviewing and mapping data, producing configuration and customisations, writing tests, documenting. Humans decide on processes, review every result, sign off on acceptance and run the training.",
    "faq.q4": "Can our legacy data be migrated?",
    "faq.a4": "As a rule, yes. Typically customers, suppliers, products, bills of material, open documents, stock, accounting balances and history — from SAP Business One, Sage, DATEV, Xero, QuickBooks, Excel or industry software. What actually moves is your decision after the analysis report.",
    "faq.q5": "Where does our Odoo run?",
    "faq.a5": "At an EU host, on odoo.sh, on Odoo Online or on your own server. We give a recommendation based on privacy requirements, IT resources and budget — the decision stays with you.",
    "faq.q6": "What happens after go-live?",
    "faq.a6": "Go-live is followed by a hypercare phase with short response times. After that you can continue on your own, order changes individually or agree on ongoing support. Lock-in is technically impossible: you own the data and the system.",
    "faq.q7": "Are you an official Odoo partner?",
    "faq.a7": "Certonis is an independent Austrian company working with Odoo as a product. Enterprise licences are billed directly between you and Odoo S.A. — which keeps our recommendations free of licence commissions.",
    "faq.q8": "And if Odoo isn't the right fit?",
    "faq.a8": "Then we say so in the discovery call. There are industries and requirements where specialised software is the better answer. A project that doesn't fit costs both sides more than it returns.",

    "ct.eyebrow": "Contact",
    "ct.title": "Let's start with 45 minutes.",
    "ct.lead": "Tell us briefly where you stand. In the discovery call we work out together whether and how Odoo works for you — no slide deck, no sales pressure.",
    "ct.response": "Response time",
    "ct.responseVal": "Within one business day, usually faster.",
    "ct.nda": "Confidential",
    "ct.ndaVal": "On request we sign the NDA before the first conversation.",

    "form.name": "Name",
    "form.company": "Company",
    "form.email": "Email",
    "form.phone": "Phone",
    "form.employees": "Employees",
    "form.system": "Current system",
    "form.timeline": "Preferred start",
    "form.t0": "Still open",
    "form.t1": "As soon as possible",
    "form.t2": "In 1–3 months",
    "form.t3": "In 3–6 months",
    "form.t4": "We're gathering information first",
    "form.message": "What is this about?",
    "form.messagePh": "We currently work with … and are running into limits with …",
    "form.consent": 'I have read the <a href="/datenschutz.html">privacy policy</a> and agree that my details will be stored in order to process this enquiry.',
    "form.submit": "Send enquiry",
    "form.note": "No newsletters, no sharing with third parties. Your details are used solely to answer this enquiry.",

    "footer.tagline": "Certonis helps companies move to Odoo — with AI for the grunt work and people for the decisions.",
    "footer.nav": "Navigation",
    "footer.legal": "Legal",
    "footer.imprint": "Imprint",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "footer.contact": "Contact",
    "footer.contactForm": "Contact form",
    "e404.title": "This page does not exist.",
    "e404.lead": "Maybe the address changed \u2014 or the link was never right. Here's the way on:",
    "e404.home": "To the home page",

    "footer.built": "Built with Claude Code."
  };

  var ROTATOR_EN = ["Manufacturing", "Retail", "Services", "Trades", "Wholesale"];

  var store = {
    get: function () {
      try { return localStorage.getItem("certonis-lang"); } catch (e) { return null; }
    },
    set: function (v) {
      try { localStorage.setItem("certonis-lang", v); } catch (e) { /* private mode */ }
    }
  };

  var de = {};   // captured German originals, so switching back is lossless
  var deRotator = [];
  var captured = false;

  function capture() {
    if (captured) return;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      de[el.dataset.i18n] = el.innerHTML;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      de["ph:" + el.dataset.i18nPh] = el.getAttribute("placeholder") || "";
    });
    de["__title"] = document.title;
    var md = document.querySelector('meta[name="description"]');
    de["__description"] = md ? md.getAttribute("content") : "";
    deRotator = Array.prototype.map.call(
      document.querySelectorAll(".hero__rotator span"),
      function (s) { return s.textContent; }
    );
    captured = true;
  }

  function apply(lang) {
    capture();
    var en = lang === "en";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.dataset.i18n;
      var value = en ? EN[key] : de[key];
      if (typeof value === "string") el.innerHTML = value;
    });

    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.dataset.i18nPh;
      var value = en ? EN[key] : de["ph:" + key];
      if (typeof value === "string") el.setAttribute("placeholder", value);
    });

    var rot = document.querySelectorAll(".hero__rotator span");
    rot.forEach(function (s, i) {
      var list = en ? ROTATOR_EN : deRotator;
      if (list[i]) s.textContent = list[i];
    });

    document.documentElement.lang = en ? "en" : "de";

    // every page carries its own English title and description on <body>
    var title = en ? document.body.dataset.enTitle : de["__title"];
    var desc = en ? document.body.dataset.enDescription : de["__description"];
    if (title) document.title = title;
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && desc) metaDesc.setAttribute("content", desc);

    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.lang === (en ? "en" : "de") ? "true" : "false");
    });

    // re-run the text effects that rewrite the DOM
    if (window.certonis && window.certonis.resplit) window.certonis.resplit();
    if (window.certonis && window.certonis.remanifest) window.certonis.remanifest();

    store.set(en ? "en" : "de");
  }

  function initial() {
    var param = new URLSearchParams(location.search).get("lang");
    if (param === "en" || param === "de") return param;
    var saved = store.get();
    if (saved) return saved;
    return (navigator.language || "de").toLowerCase().indexOf("de") === 0 ? "de" : "en";
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-lang]");
    if (!btn) return;
    apply(btn.dataset.lang);
  });

  // capture the German markup before app.js rewrites headlines into lines
  capture();

  if (initial() === "en") {
    // …but wait for app.js to register its hooks before the first swap
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { apply("en"); });
    } else {
      apply("en");
    }
  }
})();
