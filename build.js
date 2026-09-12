#!/usr/bin/env node
/**
 * Certonis — Seitengenerator
 *
 * Setzt aus src/layout.html, src/partials/ und src/sections/ die fertigen
 * HTML-Dateien im Projektwurzelverzeichnis zusammen. Die erzeugten Dateien
 * werden eingecheckt, GitHub Pages braucht also keinen Build-Schritt.
 *
 *   node build.js
 *
 * Inhalte werden NIE in den erzeugten Dateien bearbeitet — immer in src/.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");

const read = (...p) => fs.readFileSync(path.join(SRC, ...p), "utf8");
const layout = read("layout.html");
const nav = read("partials", "nav.html").trim();
const footer = read("partials", "footer.html").trim();
const section = (name) => read("sections", name + ".html").trim();
const page = (name) => read("pages", name + ".html").trim();

/* ---------------------------------------------------------------- Version
   GitHub Pages liefert alles mit `Cache-Control: max-age=600` aus. Ohne
   Kennzeichnung serviert der Browser bis zu zehn Minuten lang altes CSS zu
   neuem HTML — im schlimmsten Fall eine kaputt aussehende Seite.

   Deshalb bekommt jede CSS- und JS-Datei einen Parameter mit dem Hash ihres
   Inhalts. Ändert sich die Datei, ändert sich die Adresse, und der Browser
   lädt sie neu. Ändert sich nichts, bleibt sie im Cache.

   Alles wird aus den Dateiinhalten abgeleitet, nie aus Datum oder Git-Stand:
   derselbe Quellstand ergibt immer dasselbe Ergebnis, sonst würde die
   Build-Prüfung im Deploy-Workflow anschlagen. */
const hash = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

function fileHash(rel) {
  try {
    return hash(fs.readFileSync(path.join(ROOT, rel))).slice(0, 8);
  } catch {
    return null;
  }
}

/* Build-Kennung: Hash über alle Eingaben, in stabiler Reihenfolge. */
function buildId() {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  };
  walk(SRC);
  walk(path.join(ROOT, "css"));
  walk(path.join(ROOT, "js"));
  files.push(path.join(ROOT, "build.js"));
  return hash(Buffer.concat(files.map((f) => fs.readFileSync(f)))).slice(0, 7);
}

const BUILD = buildId();

/* Hängt an jede lokale CSS- und JS-Adresse den Hash ihres Inhalts. */
function versionAssets(html) {
  return html.replace(/(href|src)="(\/(?:css|js)\/[^"?]+\.(?:css|js))"/g, (m, attr, url) => {
    const h = fileHash(url.slice(1));
    return h ? `${attr}="${url}?v=${h}"` : m;
  });
}

const PRELOADER = `<div class="preloader" aria-hidden="true">
  <div class="preloader__inner">
    <img class="preloader__mark" src="/assets/icons/logo-mark.svg" alt="" width="54" height="54">
    <div class="preloader__bar"><span></span></div>
    <div class="preloader__pct">000</div>
  </div>
</div>`;

const ORG = {
  "@type": "Organization",
  "@id": "https://certonis.com/#org",
  name: "Certonis GmbH",
  url: "https://certonis.com/",
  logo: "https://certonis.com/assets/icons/icon-512.png",
  image: "https://certonis.com/assets/img/og.jpg",
  email: "info@certonis.com",
  telephone: "+43 732 674 278 22",
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+43 732 674 278 22",
      email: "info@certonis.com",
      contactType: "sales",
      areaServed: "AT",
      availableLanguage: ["de", "en"]
    },
    {
      "@type": "ContactPoint",
      telephone: "+49 545 263 499 30",
      contactType: "sales",
      areaServed: ["DE", "CH", "LI", "LU"],
      availableLanguage: ["de", "en"]
    }
  ],
  description:
    "Certonis begleitet Unternehmen beim Umstieg auf das Open-Source-ERP Odoo. Datenanalyse, Einrichtung und Migration durch KI.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Untergeng 29",
    postalCode: "4201",
    addressLocality: "Eidenberg",
    addressCountry: "AT"
  },
  founder: { "@type": "Person", name: "Michael Simon" },
  foundingDate: "2026-01-26",
  identifier: "FN 674951 a"
};

const SERVICE = {
  "@type": "ProfessionalService",
  "@id": "https://certonis.com/#service",
  name: "Odoo ERP-Einführung durch KI",
  provider: { "@id": "https://certonis.com/#org" },
  areaServed: ["AT", "DE", "CH"],
  serviceType: "ERP-Implementierung, Odoo-Einführung, Datenmigration",
  url: "https://certonis.com/leistungen.html",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Leistungen",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Odoo Community Lizenz",
        price: "0",
        priceCurrency: "EUR",
        description: "0 € Lizenzkosten pro User und Monat"
      },
      {
        "@type": "Offer",
        name: "Odoo Enterprise Lizenz",
        description: "Abrechnung laut offizieller Odoo-Preisliste"
      },
      {
        "@type": "Offer",
        name: "Einrichtung durch Certonis",
        description: "Festpreis nach KI-gestützter Datenanalyse"
      }
    ]
  }
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": "https://certonis.com/#website",
  url: "https://certonis.com/",
  name: "Certonis",
  inLanguage: "de-AT",
  publisher: { "@id": "https://certonis.com/#org" }
};

/* Die FAQ-Fragen werden direkt aus der FAQ-Sektion gelesen, damit Schema und
   sichtbarer Text nicht auseinanderlaufen. */
function faqSchema() {
  const html = section("faq");
  const q = [...html.matchAll(/<span data-i18n="faq\.q\d+">([\s\S]*?)<\/span>/g)].map((m) => m[1]);
  const a = [...html.matchAll(/<p data-i18n="faq\.a\d+">([\s\S]*?)<\/p>/g)].map((m) => m[1]);
  const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return {
    "@type": "FAQPage",
    mainEntity: q.map((question, i) => ({
      "@type": "Question",
      name: strip(question),
      acceptedAnswer: { "@type": "Answer", text: strip(a[i] || "") }
    }))
  };
}

function breadcrumbs(p) {
  if (!p.path) return null;
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: "https://certonis.com/" },
      {
        "@type": "ListItem",
        position: 2,
        name: p.crumb || p.nav,
        item: "https://certonis.com/" + p.path
      }
    ]
  };
}

const PAGES = [
  {
    file: "index.html",
    path: "",
    title: "Certonis — Odoo ERP, eingerichtet von KI",
    description:
      "Certonis begleitet den Umstieg auf Odoo, das größte Open-Source-ERP der Welt. Datenanalyse, Einrichtung und Migration durch KI. Festpreis, 4–20 Wochen, Schulung inklusive.",
    titleEn: "Certonis — Odoo ERP, configured by AI",
    descriptionEn:
      "Certonis guides your move to Odoo, the world's largest open-source ERP. Data analysis, configuration and migration by AI. Fixed price, 4–20 weeks, training included.",
    sections: ["hero", "marquee", "bordcomputer", "teasers", "cta"],
    promoteHeading: false,
    extraSchema: [SERVICE, WEBSITE]
  },
  {
    file: "leistungen.html",
    path: "leistungen.html",
    nav: "Leistungen",
    title: "Leistungen — von der Prozessaufnahme bis zur Schulung | Certonis",
    description:
      "Discovery, KI-gestützte Datenanalyse, Konfiguration mit Claude Code, Datenmigration, Schnittstellen und Schulung — alles, was zwischen Ihrem heutigen System und einem laufenden Odoo liegt.",
    titleEn: "Services — from process mapping to training | Certonis",
    descriptionEn:
      "Discovery, AI-driven data analysis, configuration with Claude Code, data migration, integrations and training — everything between the system you run today and a working Odoo.",
    sections: ["leistungen", "cta"],
    extraSchema: [SERVICE]
  },
  {
    file: "ablauf.html",
    path: "ablauf.html",
    nav: "Ablauf",
    title: "Ablauf — in sechs Schritten zu Odoo, in 4 bis 20 Wochen | Certonis",
    description:
      "Discovery Call, NDA und Datenschutz, Datenanalyse durch AI, Festpreisangebot, Einrichtung und Schulung. Der vollständige Ablauf mit realistischem Zeitplan.",
    titleEn: "Process — six steps to Odoo, in 4 to 20 weeks | Certonis",
    descriptionEn:
      "Discovery call, NDA and data processing agreement, AI data analysis, fixed-price quote, implementation and training. The full process with a realistic schedule.",
    sections: ["ablauf", "zeitplan", "cta"]
  },
  {
    file: "ki.html",
    path: "ki.html",
    nav: "Warum KI",
    title: "Warum KI — dieselbe Arbeit in einem Bruchteil der Zeit | Certonis",
    description:
      "Was die KI im ERP-Projekt übernimmt und was Menschen entscheiden. Vergleich zum klassischen Projektverlauf: 1–5 statt 9–18 Monate, rund 20 statt 120 Beratertage.",
    titleEn: "Why AI — the same work in a fraction of the time | Certonis",
    descriptionEn:
      "What AI handles in an ERP project and what people decide. Compared with a classic project: 1–5 instead of 9–18 months, roughly 20 instead of 120 consulting days.",
    sections: ["ki", "manifest", "cta"]
  },
  {
    file: "preise.html",
    path: "preise.html",
    nav: "Preise",
    title: "Preise — Odoo Community 0 €, Einrichtung zum Festpreis | Certonis",
    description:
      "Odoo Community kostet 0 € pro User und Monat. Odoo Enterprise läuft über die offizielle Odoo-Preisliste. Die Einrichtung durch Certonis gibt es als Festpreis nach der Datenanalyse.",
    titleEn: "Pricing — Odoo Community €0, implementation at a fixed price | Certonis",
    descriptionEn:
      "Odoo Community costs €0 per user and month. Odoo Enterprise follows the official Odoo price list. Implementation by Certonis comes as a fixed price after the data analysis.",
    sections: ["preise", "cta"],
    extraSchema: [SERVICE]
  },
  {
    file: "sicherheit.html",
    path: "sicherheit.html",
    nav: "Sicherheit",
    title: "Sicherheit & Datenschutz — NDA, AVV und Verarbeitung in der EU | Certonis",
    description:
      "Geheimhaltungsvereinbarung vor der ersten Datei, Auftragsverarbeitung nach Art. 28 DSGVO, Verarbeitung in der EU, Datenminimierung und kein KI-Training mit Ihren Daten.",
    titleEn: "Security & privacy — NDA, DPA and processing inside the EU | Certonis",
    descriptionEn:
      "Non-disclosure agreement before the first file, data processing under Art. 28 GDPR, processing inside the EU, data minimisation and no AI training on your data.",
    sections: ["sicherheit", "cta"]
  },
  {
    file: "faq.html",
    path: "faq.html",
    nav: "FAQ",
    title: "FAQ — häufige Fragen zur Odoo-Einführung | Certonis",
    description:
      "Was kostet die Einrichtung, warum ist Odoo Community kostenlos, was macht die KI und was der Mensch, können Altdaten übernommen werden und wo läuft das System?",
    titleEn: "FAQ — common questions about moving to Odoo | Certonis",
    descriptionEn:
      "What does implementation cost, why is Odoo Community free, what does the AI do and what do humans do, can legacy data be migrated, and where does the system run?",
    sections: ["faq", "cta"],
    extraSchema: [faqSchema()]
  },
  {
    file: "kontakt.html",
    path: "kontakt.html",
    nav: "Kontakt",
    title: "Kontakt — Discovery Call vereinbaren | Certonis",
    description:
      "45 Minuten, kostenlos und unverbindlich. Schreiben Sie uns, wo Sie stehen — wir melden uns innerhalb eines Werktags.",
    titleEn: "Contact — book a discovery call | Certonis",
    descriptionEn:
      "45 minutes, free and non-binding. Tell us where you stand — we reply within one business day.",
    sections: ["kontakt"],
    form: true,
    extraSchema: [
      {
        "@type": "ContactPage",
        url: "https://certonis.com/kontakt.html",
        about: { "@id": "https://certonis.com/#org" }
      }
    ]
  },

  /* Rechtstexte: gleiche Navigation, kein Vorhang */
  {
    file: "404.html",
    path: "404.html",
    title: "Seite nicht gefunden — Certonis",
    description: "Diese Seite existiert nicht. Zurück zur Startseite von Certonis.",
    titleEn: "Page not found — Certonis",
    descriptionEn: "This page does not exist. Back to the Certonis home page.",
    pageBody: "404",
    noPreloader: true,
    robots: "noindex, follow",
    noSitemap: true
  },
  {
    file: "impressum.html",
    path: "impressum.html",
    crumb: "Impressum",
    nav: "Impressum",
    title: "Impressum — Certonis GmbH",
    description:
      "Impressum und Offenlegung der Certonis GmbH gemäß § 5 ECG, § 14 UGB und §§ 24, 25 MedienG.",
    titleEn: "Imprint — Certonis GmbH",
    descriptionEn: "Company information for Certonis GmbH under Austrian disclosure law.",
    pageBody: "impressum",
    noPreloader: true
  },
  {
    file: "datenschutz.html",
    path: "datenschutz.html",
    crumb: "Datenschutz",
    nav: "Datenschutz",
    title: "Datenschutzerklärung — Certonis GmbH",
    description:
      "Datenschutzerklärung der Certonis GmbH: Welche Daten beim Besuch von certonis.com verarbeitet werden, auf welcher Rechtsgrundlage und welche Rechte Sie haben.",
    titleEn: "Privacy policy — Certonis GmbH",
    descriptionEn:
      "How certonis.com processes personal data, on what legal basis, and the rights you have.",
    pageBody: "datenschutz",
    noPreloader: true
  },
  {
    file: "agb.html",
    path: "agb.html",
    crumb: "AGB",
    nav: "AGB",
    title: "Allgemeine Geschäftsbedingungen — Certonis GmbH",
    description:
      "Allgemeine Geschäftsbedingungen der Certonis GmbH für Leistungen rund um die Einführung und Betreuung von Odoo-ERP-Systemen.",
    titleEn: "Terms and conditions — Certonis GmbH",
    descriptionEn:
      "Terms and conditions of Certonis GmbH for services around implementing and supporting Odoo.",
    pageBody: "agb",
    noPreloader: true
  }
];

/* Die erste Überschrift einer Unterseite ist deren h1. */
function promote(html) {
  return html.replace("<h2 ", "<h1 ").replace("</h2>", "</h1>");
}

function buildBody(p) {
  if (p.pageBody) return page(p.pageBody);
  return p.sections
    .map((name, i) => {
      const html = section(name);
      return i === 0 && p.promoteHeading !== false ? promote(html) : html;
    })
    .join("\n\n");
}

function jsonld(p) {
  const graph = [ORG, ...(p.extraSchema || [])];
  const crumbs = breadcrumbs(p);
  if (crumbs) graph.push(crumbs);
  return (
    '<script type="application/ld+json">\n' +
    JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2) +
    "\n</script>"
  );
}

function render(p) {
  const bodyAttrs = [
    p.noPreloader ? 'class="is-loaded"' : "",
    `data-en-title="${p.titleEn.replace(/"/g, "&quot;")}"`,
    `data-en-description="${p.descriptionEn.replace(/"/g, "&quot;")}"`
  ]
    .filter(Boolean)
    .join(" ");

  let out = layout
    .replace(/\{\{title\}\}/g, p.title)
    .replace(/\{\{description\}\}/g, p.description)
    .replace(/\{\{path\}\}/g, p.path)
    .replace("{{robots}}", p.robots || "index, follow, max-image-preview:large")
    .replace("{{jsonld}}", jsonld(p))
    .replace("{{bodyclass}}", " " + bodyAttrs)
    .replace("{{preloader}}", p.noPreloader ? "" : PRELOADER)
    .replace("{{nav}}", nav)
    .replace("{{body}}", buildBody(p))
    .replace("{{footer}}", footer)
    .replace("{{formscript}}", p.form ? '<script src="/js/form.js" defer></script>' : "");

  out = versionAssets(out).replace(/\{\{build\}\}/g, BUILD);

  const banner =
    "<!-- Erzeugt von build.js aus src/ — nicht direkt bearbeiten. " +
    "Inhalte in src/sections/ oder src/pages/ ändern und `node build.js` laufen lassen. -->\n";
  return out.replace("<!DOCTYPE html>\n", "<!DOCTYPE html>\n" + banner);
}

function sitemap() {
  const prio = { "": "1.0", "leistungen.html": "0.9", "ablauf.html": "0.9", "preise.html": "0.9" };
  const legal = ["impressum.html", "datenschutz.html", "agb.html"];
  const urls = PAGES.filter((p) => !p.noSitemap).map((p) => {
    const isLegal = legal.includes(p.path);
    return `  <url>
    <loc>https://certonis.com/${p.path}</loc>
    <changefreq>${isLegal ? "yearly" : "monthly"}</changefreq>
    <priority>${isLegal ? "0.3" : prio[p.path] || "0.8"}</priority>
  </url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

let count = 0;
for (const p of PAGES) {
  fs.writeFileSync(path.join(ROOT, p.file), render(p));
  console.log("  ✓ " + p.file);
  count++;
}
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap());
console.log("  ✓ sitemap.xml");
console.log(`\n${count} Seiten erzeugt · Build ${BUILD}`);
