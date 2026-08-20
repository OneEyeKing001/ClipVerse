/* ==========================================================================
   ClipVerse - Enhanced Cal.com Live Scheduler Engine
   (Featuring Real Cal.com Inline Embed, Dark Modal, Budget Lock-In & Bulletproof Scroll)
   ========================================================================== */

(function () {
  // Cal.com Embed SDK Initialization
  (function (C, A, L) {
    let p = function (a, ar) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () {
      let cal = C.Cal;
      let ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        d.head.appendChild(d.createElement("script")).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () { p(api, arguments); };
        const namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === "string") {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ["initNamespace", namespace]);
        } else p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, "https://app.cal.com/embed/embed.js", "init");

  // Determine brand & accent colors based on page theme
  const isEmerald = document.body.classList.contains('theme-emerald') || window.location.pathname.includes('emerald');
  const isCobalt = document.body.classList.contains('theme-cobalt') || window.location.pathname.includes('cobalt');
  const brandColor = isEmerald ? '#10b981' : (isCobalt ? '#38bdf8' : '#a855f7');
  const brandSubtle = isEmerald ? 'rgba(16, 185, 129, 0.15)' : (isCobalt ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)');
  const brandEmphasis = isEmerald ? '#059669' : (isCobalt ? '#0284c7' : '#9333ea');
  const borderEmphasis = isEmerald ? 'rgba(16, 185, 129, 0.35)' : (isCobalt ? 'rgba(56, 189, 248, 0.35)' : 'rgba(168, 85, 247, 0.35)');

  // Agency Configuration
  const AGENCY_CONFIG = {
    agencyName: 'ClipVerse Strategy Team',
    agencyEmail: 'clipverseofficial001@gmail.com',
    telegramHandle: 'ClipVerseTeam',
    calUsername: 'clipverse', // Cal.com username (cal.com/clipverse)
    calEventSlug: '30min'     // Specific event slug (cal.com/clipverse/30min)
  };

  // Initialize Cal.com Namespace with ClipVerse Dark Theme Styling
  if (window.Cal) {
    window.Cal("init", "clipverse", { origin: "https://cal.com" });
    window.Cal.ns.clipverse("ui", {
      "theme": "dark",
      "cssVarsPerTheme": {
        "dark": {
          "cal-brand": brandColor,
          "cal-brand-emphasis": brandEmphasis,
          "cal-brand-text": "#ffffff",
          "cal-brand-subtle": brandSubtle,
          "cal-bg": "#0c0f18",
          "cal-bg-emphasis": "#141824",
          "cal-bg-subtle": "#101320",
          "cal-bg-muted": "#181c2c",
          "cal-border": "rgba(255, 255, 255, 0.08)",
          "cal-border-default": "rgba(255, 255, 255, 0.08)",
          "cal-border-subtle": "rgba(255, 255, 255, 0.04)",
          "cal-border-emphasis": borderEmphasis,
          "cal-text": "#f8fafc",
          "cal-text-muted": "#94a3b8",
          "cal-text-emphasis": "#ffffff",
          "cal-text-subtle": "#64748b"
        }
      },
      "hideEventTypeDetails": false, // Shows left details section on homepage desktop for a balanced layout
      "layout": "month_view"
    });

    // 1. Initialize Real Inline Embed on Homepage Section (Clean default, no prefilled notes)
    const inlineEl = document.getElementById('cal-inline-embed');
    if (inlineEl) {
      window.Cal.ns.clipverse("inline", {
        elementOrSelector: "#cal-inline-embed",
        config: { "layout": "month_view", "theme": "dark", "hideEventTypeDetails": false },
        calLink: `${AGENCY_CONFIG.calUsername}/${AGENCY_CONFIG.calEventSlug}`
      });
    }

    // 2. Listen to Cal.com Events
    window.Cal.ns.clipverse("on", {
      action: "__closeIframe",
      callback: () => {
        unlockBackgroundScroll();
      }
    });

    window.Cal.ns.clipverse("on", {
      action: "bookingSuccessful",
      callback: (e) => {
        unlockBackgroundScroll();
        showBookingConfirmationModal(e?.detail?.data);
      }
    });
  }

  // Lock In Campaign Plan Handler: ONLY called when clicking "Lock In This Campaign Plan →"
  window.lockInCampaignBudget = function(budgetFormatted) {
    const inlineEl = document.getElementById('cal-inline-embed');
    if (inlineEl && window.Cal && window.Cal.ns && window.Cal.ns.clipverse) {
      inlineEl.innerHTML = '';
      const notesQuery = encodeURIComponent(`Campaign Budget : ${budgetFormatted}`);
      window.Cal.ns.clipverse("inline", {
        elementOrSelector: "#cal-inline-embed",
        config: { "layout": "month_view", "theme": "dark", "hideEventTypeDetails": false },
        calLink: `${AGENCY_CONFIG.calUsername}/${AGENCY_CONFIG.calEventSlug}?notes=${notesQuery}`
      });
    }
  };

  // 3. Inline Embed Scroll Lock: Lock background scroll when user interacts with the inline embed
  const calEmbedWrapper = document.querySelector('.cal-inline-wrapper');
  if (calEmbedWrapper) {
    let inlineScrollLocked = false;

    function lockInlineScroll() {
      if (!inlineScrollLocked) {
        inlineScrollLocked = true;
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.touchAction = 'none';
      }
    }

    function unlockInlineScroll() {
      if (inlineScrollLocked) {
        inlineScrollLocked = false;
        // Don't unlock if a Cal modal or confirmation modal is open
        const activeModal = document.querySelector('[data-cal-modal], .cal-modal, .cal-modal-container');
        const confirmationModal = document.getElementById('bookingConfirmationModal');
        const isConfirmOpen = confirmationModal && confirmationModal.classList.contains('open');
        if (!activeModal && !isConfirmOpen) {
          document.body.style.overflow = '';
          document.body.style.touchAction = '';
          document.documentElement.style.overflow = '';
          document.documentElement.style.touchAction = '';
        }
      }
    }

    // Lock scroll on touch start inside embed
    calEmbedWrapper.addEventListener('touchstart', lockInlineScroll, { passive: true });
    calEmbedWrapper.addEventListener('mousedown', lockInlineScroll, { passive: true });

    // Unlock when touching/clicking outside the embed area
    document.addEventListener('touchstart', (e) => {
      if (!calEmbedWrapper.contains(e.target)) {
        unlockInlineScroll();
      }
    }, { passive: true });

    document.addEventListener('mousedown', (e) => {
      if (!calEmbedWrapper.contains(e.target)) {
        unlockInlineScroll();
      }
    }, { passive: true });

    // Also unlock on scroll reaching edges (desktop scroll wheel outside embed)
    document.addEventListener('scroll', () => {
      if (inlineScrollLocked) {
        // Check if the embed is still in viewport
        const rect = calEmbedWrapper.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) {
          unlockInlineScroll();
        }
      }
    }, { passive: true });
  }

  // Dynamically adjust inline embed iframe height on Cal.com step changes
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    // Cal.com sends dimension change messages — resize the iframe accordingly
    if (e.data.type === 'CAL:DIMENSION_CHANGE' || e.data.action === 'dimensionChanged') {
      const embedEl = document.getElementById('cal-inline-embed');
      if (embedEl) {
        const iframe = embedEl.querySelector('iframe');
        if (iframe && e.data.data && e.data.data.iframeHeight) {
          const newHeight = Math.max(520, e.data.data.iframeHeight);
          iframe.style.height = newHeight + 'px';
          iframe.style.minHeight = newHeight + 'px';
        }
      }
    }
  });

  // Fallback message listener for all possible iframe events
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    const type = e.data.type || e.data.action || '';
    if (type === '__closeIframe' || type === 'CAL:MODAL_CLOSED' || type === 'CAL:CLOSE' || type === 'modalClose') {
      unlockBackgroundScroll();
    }
    if (type === 'bookingSuccessful' || type === 'CAL:BOOKING_SUCCESSFUL') {
      unlockBackgroundScroll();
      showBookingConfirmationModal(e.data.data || e.data.payload);
    }
  });

  // Bulletproof Background Scroll Locking & Unlocking Engine
  let modalSafetyTimer = null;

  function lockBackgroundScroll() {
    document.body.classList.add('cal-modal-open');
    document.body.style.overflow = 'hidden';

    // Active watcher to detect when modal is dismissed
    if (modalSafetyTimer) clearInterval(modalSafetyTimer);
    modalSafetyTimer = setInterval(() => {
      const activeModal = document.querySelector('iframe[src*="cal.com"], [data-cal-modal], .cal-modal, .cal-modal-container');
      const confirmationModal = document.getElementById('bookingConfirmationModal');
      const isConfirmOpen = confirmationModal && confirmationModal.classList.contains('open');
      
      // If neither Cal modal nor Confirmation modal is open, immediately unlock
      if (!activeModal && !isConfirmOpen) {
        unlockBackgroundScroll();
      }
    }, 120);
  }

  function unlockBackgroundScroll() {
    document.body.classList.remove('cal-modal-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.touchAction = '';
    document.documentElement.style.touchAction = '';
    if (modalSafetyTimer) {
      clearInterval(modalSafetyTimer);
      modalSafetyTimer = null;
    }
  }

  // MutationObserver to automatically unlock scroll when Cal.com removes modal from DOM
  const modalObserver = new MutationObserver(() => {
    const activeModal = document.querySelector('iframe[src*="cal.com"], [data-cal-modal], .cal-modal, .cal-modal-container');
    const confirmationModal = document.getElementById('bookingConfirmationModal');
    const isConfirmOpen = confirmationModal && confirmationModal.classList.contains('open');

    if (!activeModal && !isConfirmOpen) {
      if (document.body.classList.contains('cal-modal-open') || document.body.style.overflow === 'hidden') {
        unlockBackgroundScroll();
      }
    }
  });

  modalObserver.observe(document.body, { childList: true, subtree: true });

  // Escape key handler to unlock scroll
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const confirmModal = document.getElementById('bookingConfirmationModal');
      if (confirmModal && confirmModal.classList.contains('open')) {
        confirmModal.classList.remove('open');
      }
      unlockBackgroundScroll();
    }
  });

  // Global click/touch listener: if clicking outside after modal dismiss, ensure scroll is restored
  function checkAndRestoreScroll() {
    setTimeout(() => {
      const activeModal = document.querySelector('iframe[src*="cal.com"], [data-cal-modal], .cal-modal, .cal-modal-container');
      const confirmationModal = document.getElementById('bookingConfirmationModal');
      const isConfirmOpen = confirmationModal && confirmationModal.classList.contains('open');

      if (!activeModal && !isConfirmOpen) {
        unlockBackgroundScroll();
      }
    }, 80);
  }

  window.addEventListener('click', checkAndRestoreScroll, { passive: true });
  window.addEventListener('touchend', checkAndRestoreScroll, { passive: true });

  // Show Dedicated Confirmation Modal Only Upon Confirmed Booking
  function showBookingConfirmationModal(bookingData) {
    const modal = document.getElementById('bookingConfirmationModal');
    if (!modal) return;

    if (bookingData && bookingData.date) {
      const desc = document.getElementById('confirmModalDesc');
      if (desc) {
        try {
          const d = new Date(bookingData.date);
          const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
          desc.innerHTML = `Your discovery strategy session is locked for <strong style="color:var(--accent-light);">${dateStr}</strong>.<br>A Google Meet invitation has been sent to your email.`;
        } catch (err) {}
      }
    }

    modal.classList.add('open');
    lockBackgroundScroll();
  }

  // Close Confirmation Modal Handlers
  const confirmModal = document.getElementById('bookingConfirmationModal');
  if (confirmModal) {
    const closeBtns = confirmModal.querySelectorAll('.close-modal-btn');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        confirmModal.classList.remove('open');
        unlockBackgroundScroll();
      });
    });

    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        confirmModal.classList.remove('open');
        unlockBackgroundScroll();
      }
    });
  }

  // Wire All "Book Call" CTA Buttons to Launch Clean Cal.com Dark Modal (No prefilled notes)
  const openModalBtns = document.querySelectorAll('.open-scheduler-btn');
  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.id === 'calcLockBtn') return;

      e.preventDefault();
      lockBackgroundScroll();

      const cleanCalLink = `${AGENCY_CONFIG.calUsername}/${AGENCY_CONFIG.calEventSlug}`;

      if (window.Cal && window.Cal.ns && window.Cal.ns.clipverse) {
        window.Cal.ns.clipverse("modal", {
          calLink: cleanCalLink,
          config: { "layout": "month_view", "theme": "dark" }
        });
      } else {
        window.open(`https://cal.com/${cleanCalLink}`, '_blank');
        unlockBackgroundScroll();
      }
    });
  });
})();
