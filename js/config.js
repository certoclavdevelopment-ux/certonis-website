/* ==========================================================================
   CERTONIS — Site configuration
   The only file you need to touch for day-to-day changes.
   ========================================================================== */
window.CERTONIS_CONFIG = {
  /* Where the contact form posts to.
     Leave empty ("") and the form falls back to opening the visitor's mail
     client with everything pre-filled — so the site never loses a lead.

     Options:
       1) Cloudflare Worker in /worker  ->  "https://contact.certonis.workers.dev"
          (sends through Microsoft 365 / info@certonis.com)
       2) Formspree                     ->  "https://formspree.io/f/XXXXXXXX"
       3) Web3Forms                     ->  "https://api.web3forms.com/submit"
          (then also set web3formsKey below)                                   */
  contactEndpoint: "",

  /* Only needed for the Web3Forms option. */
  web3formsKey: "",

  /* Contact details used across the page and in the mailto fallback. */
  email: "info@certonis.com",
  phone: "",
  company: "Certonis GmbH",

  /* Where visitors land after a successful submit. Empty = stay on page. */
  successRedirect: "",

  /* Booking link for the discovery call (Calendly, Cal.com, MS Bookings …).
     Empty = the "Termin buchen" buttons scroll to the contact form instead. */
  bookingUrl: ""
};
