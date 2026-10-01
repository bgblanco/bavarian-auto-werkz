/* Bavarian Auto Werkz - shared site scripts (2026) */
(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.classList.toggle('active');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    menu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('active');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('active');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  function initHeaderScroll() {
    var header = document.querySelector('.header');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Modern icons (Lucide) ---------- */
  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /* ---------- Cookie consent ---------- */
  var CONSENT_KEY = 'baw-cookie-consent';

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function buildCookieBanner() {
    if (getConsent()) return; // already decided

    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<p>We use essential cookies to run this site and, with your consent, third-party cookies from our ' +
      'booking and contact tools to make scheduling work. See our ' +
      '<a href="privacy.html#cookies">Privacy &amp; Cookie Policy</a>.</p>' +
      '<div class="cookie-actions">' +
        '<button type="button" class="btn btn-secondary" data-consent="declined">Decline</button>' +
        '<button type="button" class="btn btn-primary" data-consent="accepted">Accept</button>' +
      '</div>';

    document.body.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add('show'); });

    banner.querySelectorAll('[data-consent]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setConsent(btn.getAttribute('data-consent'));
        banner.classList.remove('show');
        setTimeout(function () { banner.remove(); }, 450);
      });
    });
  }

  /* ---------- Booking iframe safety net ----------
     GoHighLevel's form_embed.js hides the booking iframe until the embedded
     calendar posts a "ready" message. If that never arrives (slow network,
     blocked, etc.) the calendar stays invisible. After a grace period we
     force any still-hidden booking iframe to show. */
  function ensureBookingVisible() {
    var frames = document.querySelectorAll('iframe[src*="/widget/booking/"]');
    if (!frames.length) return;
    setTimeout(function () {
      frames.forEach(function (f) {
        var cs = getComputedStyle(f);
        var offscreen = cs.position === 'absolute' && parseInt(cs.left, 10) < -1000;
        var hidden = cs.visibility === 'hidden' ||
                     parseFloat(cs.opacity) === 0 ||
                     offscreen ||
                     f.getAttribute('data-initial-iframe-hidden') === 'true';
        if (hidden) {
          [['visibility', 'visible'], ['opacity', '1'], ['position', 'static'],
           ['left', 'auto'], ['top', 'auto'], ['pointer-events', 'auto'],
           ['min-height', '720px'], ['height', '720px'], ['width', '100%'],
           ['display', 'block']].forEach(function (kv) {
            f.style.setProperty(kv[0], kv[1], 'important');
          });
          f.removeAttribute('data-initial-iframe-hidden');
        }
      });
    }, 2500);
  }

  /* ---------- Init ---------- */
  function init() {
    initMobileMenu();
    initHeaderScroll();
    initIcons();
    buildCookieBanner();
    ensureBookingVisible();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
