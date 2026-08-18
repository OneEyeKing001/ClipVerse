/* ==========================================================================
   ClipVerse - Enhanced Calendar & Meeting Scheduler Engine
   (Featuring 1-by-1 Mobile Step Wizard & Smooth Multi-Calendar Sync)
   ========================================================================== */

(function () {
  // Agency Configuration
  const AGENCY_CONFIG = {
    agencyName: 'ClipVerse Strategy Team',
    agencyEmail: 'contact@clipverse.agency', // Replace with your email to receive updates
    telegramHandle: 'ClipVerse',
    webhookUrl: '', // Optional Google Apps Script / Webhook URL
    availableWeekdays: [1, 2, 3, 4, 5, 6], // Mon - Sat
    timeSlots: [
      '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
      '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
      '07:00 PM', '07:30 PM'
    ],
    presetBooked: ['10:00 AM', '02:00 PM']
  };

  // Persistent Store for Booked Slots
  function getBookedSlots() {
    try {
      const stored = localStorage.getItem('clipverse_booked_slots');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  function saveBookedSlot(dateKey, timeSlot) {
    const booked = getBookedSlots();
    if (!booked[dateKey]) booked[dateKey] = [];
    if (!booked[dateKey].includes(timeSlot)) {
      booked[dateKey].push(timeSlot);
    }
    try {
      localStorage.setItem('clipverse_booked_slots', JSON.stringify(booked));
    } catch (e) {}
  }

  // Calendar State
  let currentDate = new Date();
  let selectedDate = new Date();
  let selectedSlot = '11:00 AM';
  let selectedBudget = '$5,000 - $15,000';

  // Mobile Wizard Steps (1 = Date, 2 = Time, 3 = Details)
  let mobileStepPage = 1;
  let mobileStepModal = 1;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function getDateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Render Calendar Days Grid
  function populateCalendar(gridEl, monthEl, isModal = false) {
    if (!gridEl) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (monthEl) {
      monthEl.textContent = `${months[month]} ${year}`;
    }

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    gridEl.innerHTML = '';
    const frag = document.createDocumentFragment();

    for (let i = 0; i < firstDayIndex; i++) {
      const blank = document.createElement('div');
      blank.className = 'day-blank';
      frag.appendChild(blank);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDays; day++) {
      const thisDate = new Date(year, month, day);
      const dayOfWeek = thisDate.getDay();
      const isPast = thisDate < today;
      const isAvailable = AGENCY_CONFIG.availableWeekdays.includes(dayOfWeek) && !isPast;

      const dayBtn = document.createElement('button');
      dayBtn.type = 'button';
      dayBtn.className = 'day-btn';
      dayBtn.textContent = day;

      if (!isAvailable) {
        dayBtn.classList.add('disabled');
        dayBtn.disabled = true;
      } else {
        if (selectedDate && thisDate.toDateString() === selectedDate.toDateString()) {
          dayBtn.classList.add('selected');
        }

        dayBtn.addEventListener('click', () => {
          selectedDate = thisDate;
          if (window.innerWidth <= 768) {
            setMobileStep(2, isModal);
          }
          renderAllCalendars();
        });
      }

      frag.appendChild(dayBtn);
    }

    // Fill remaining grid slots to guarantee 42 cells (6 rows) without layout shifting
    const totalFilled = firstDayIndex + totalDays;
    const trailingBlanks = 42 - totalFilled;
    for (let k = 0; k < trailingBlanks; k++) {
      const blankDiv = document.createElement('div');
      blankDiv.className = 'day-blank';
      frag.appendChild(blankDiv);
    }

    gridEl.appendChild(frag);
  }

  // Render Time Slots Grid
  function populateSlots(slotsEl, isModal = false) {
    if (!slotsEl) return;
    slotsEl.innerHTML = '';

    const dateKey = getDateKey(selectedDate);
    const bookedMap = getBookedSlots();
    const bookedForDate = bookedMap[dateKey] || AGENCY_CONFIG.presetBooked;

    const frag = document.createDocumentFragment();

    AGENCY_CONFIG.timeSlots.forEach(slot => {
      const isBooked = bookedForDate.includes(slot);
      const slotBtn = document.createElement('button');
      slotBtn.type = 'button';
      slotBtn.className = 'slot-btn';

      if (isBooked) {
        slotBtn.classList.add('slot-booked');
        slotBtn.disabled = true;
        slotBtn.textContent = 'Booked';
      } else {
        slotBtn.textContent = slot;
        if (slot === selectedSlot) {
          slotBtn.classList.add('selected');
        }

        slotBtn.addEventListener('click', () => {
          selectedSlot = slot;
          if (window.innerWidth <= 768) {
            if (isModal) {
              setMobileStep(3, true);
            } else {
              setMobileStep(3, false);
            }
          }
          renderAllCalendars();
        });
      }

      frag.appendChild(slotBtn);
    });

    slotsEl.appendChild(frag);
  }

  function updateSummaries() {
    const dateFormatted = selectedDate.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    const summaryText = `${dateFormatted} at ${selectedSlot}`;

    const summaryOnPage = document.getElementById('selectedDateSummary');
    const summaryModal = document.getElementById('modalSelectedDateSummary');

    if (summaryOnPage) summaryOnPage.textContent = summaryText;
    if (summaryModal) summaryModal.textContent = summaryText;

    // Mobile Step indicators
    const mobDatePillPage = document.getElementById('mobDatePillPage');
    const mobDatePillModal = document.getElementById('mobDatePillModal');
    if (mobDatePillPage) mobDatePillPage.textContent = dateFormatted;
    if (mobDatePillModal) mobDatePillModal.textContent = dateFormatted;
  }

  // Mobile 1-by-1 Step Wizard Controller
  function setMobileStep(step, isModal = false) {
    if (isModal) {
      mobileStepModal = step;
      updateMobileWizardDOM('modal', step);
      const modalCard = document.querySelector('.modal-card');
      if (modalCard) {
        modalCard.scrollTop = 0;
      }
      const intro = document.getElementById('modalIntroHeader');
      if (intro && window.innerWidth <= 768) {
        intro.style.display = (step === 1) ? 'block' : 'none';
      }
    } else {
      mobileStepPage = step;
      updateMobileWizardDOM('page', step);
      if (step > 1 && window.innerWidth <= 768) {
        const schedulerEl = document.getElementById('scheduler');
        if (schedulerEl) {
          schedulerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }

  function updateMobileWizardDOM(context, step) {
    const isModal = context === 'modal';
    const prefix = isModal ? 'modal' : 'page';

    const dateView = document.getElementById(`${prefix}DateStep`);
    const timeView = document.getElementById(`${prefix}TimeStep`);
    const formView = document.getElementById(`${prefix}FormStep`);
    const calCard = isModal
      ? document.querySelector('#schedulerModal .calendar-card')
      : document.querySelector('#scheduler .calendar-card');

    if (window.innerWidth > 768) {
      // Desktop: show all elements naturally
      if (dateView) dateView.style.display = 'block';
      if (timeView) timeView.style.display = 'block';
      if (formView) formView.style.display = 'block';
      if (calCard) calCard.style.display = 'block';
      return;
    }

    // Mobile: Show 1-by-1
    if (dateView) dateView.style.display = (step === 1) ? 'block' : 'none';
    if (timeView) timeView.style.display = (step === 2) ? 'block' : 'none';
    if (formView) formView.style.display = (step === 3) ? 'block' : 'none';

    // On Step 3 (Session Details), hide the empty calendar card outline on mobile
    if (calCard) {
      calCard.style.display = (step === 3) ? 'none' : 'block';
    }
  }

  function renderAllCalendars() {
    populateCalendar(document.getElementById('calDaysGrid'), document.getElementById('calMonthName'), false);
    populateSlots(document.getElementById('slotsContainer'), false);

    populateCalendar(document.getElementById('modalCalDaysGrid'), document.getElementById('modalCalMonthName'), true);
    populateSlots(document.getElementById('modalSlotsContainer'), true);

    updateSummaries();
  }

  // Month Switchers
  function attachMonthNav(prevId, nextId) {
    const prev = document.getElementById(prevId);
    const next = document.getElementById(nextId);
    if (prev) {
      prev.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderAllCalendars();
      });
    }
    if (next) {
      next.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderAllCalendars();
      });
    }
  }

  attachMonthNav('prevMonth', 'nextMonth');
  attachMonthNav('modalPrevMonth', 'modalNextMonth');

  // Mobile Back Buttons
  function attachMobileBack(btnId, targetStep, isModal) {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        setMobileStep(targetStep, isModal);
      });
    }
  }

  attachMobileBack('pageBackToDate', 1, false);
  attachMobileBack('pageBackToTime', 2, false);
  attachMobileBack('modalBackToDate', 1, true);
  attachMobileBack('modalBackToTime', 2, true);

  // Custom Dropdown Initializer
  function initCustomDropdowns() {
    document.querySelectorAll('.custom-select-box').forEach(box => {
      const trigger = box.querySelector('.custom-select-trigger');
      const options = box.querySelectorAll('.custom-option');

      if (trigger) {
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.custom-select-box').forEach(b => {
            if (b !== box) b.classList.remove('open');
          });
          const isOpen = box.classList.toggle('open');
          if (isOpen && window.innerWidth <= 768) {
            setTimeout(() => {
              box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 80);
          }
        });
      }

      options.forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = opt.getAttribute('data-value');
          window.setCampaignBudget(val);
          box.classList.remove('open');
        });
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.custom-select-box').forEach(b => b.classList.remove('open'));
    });
  }

  // Global Budget Synchronizer
  window.setCampaignBudget = function(tierValue) {
    selectedBudget = tierValue;
    document.querySelectorAll('.custom-select-box').forEach(box => {
      const trigger = box.querySelector('.custom-select-trigger');
      const options = box.querySelectorAll('.custom-option');
      const hiddenInput = box.querySelector('.custom-select-input');

      if (trigger) {
        const textSpan = trigger.querySelector('.select-value-text');
        if (textSpan) textSpan.textContent = tierValue;
      }
      if (hiddenInput) hiddenInput.value = tierValue;

      options.forEach(opt => {
        if (opt.getAttribute('data-value') === tierValue) {
          opt.classList.add('selected');
        } else {
          opt.classList.remove('selected');
        }
      });
    });
  };

  // Handle Booking Form Submission & Notifications
  function handleBookingSuccess(containerEl, clientName, clientEmail, clientTelegram, budget) {
    const dateKey = getDateKey(selectedDate);
    saveBookedSlot(dateKey, selectedSlot);
    renderAllCalendars();

    const dateFormatted = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    // Generate Google Calendar Link
    const startTime = new Date(selectedDate);
    const [timeStr, ampm] = selectedSlot.split(' ');
    let [hours, mins] = timeStr.split(':').map(Number);
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    startTime.setHours(hours, mins, 0, 0);

    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 min
    const isoStart = startTime.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const isoEnd = endTime.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('ClipVerse Strategy & Campaign Call')}&dates=${isoStart}/${isoEnd}&details=${encodeURIComponent(`ClipVerse Short-Form Strategy Call with ${clientName} (${clientEmail}). Campaign Budget: ${budget}. Discussing viral clipping rollout and zero-bot quality assurance.`)}&location=${encodeURIComponent('Google Meet / Telegram')}`;

    if (AGENCY_CONFIG.webhookUrl) {
      try {
        fetch(AGENCY_CONFIG.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName,
            clientEmail,
            clientTelegram,
            budget,
            dateFormatted,
            timeSlot: selectedSlot,
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.log('Webhook dispatched'));
      } catch (err) {}
    }

    containerEl.innerHTML = `
      <div style="text-align:center; padding:28px 16px;">
        <div style="font-size:3.2rem; margin-bottom:10px;">🎉</div>
        <h3 style="font-family:var(--font-display); font-size:1.5rem; color:var(--text-highlight); margin-bottom:8px;">
          Call Confirmed & Locked!
        </h3>
        <p class="text-muted" style="font-size:0.9rem; margin-bottom:18px; line-height:1.6;">
          Your discovery session is locked for <strong style="color:var(--accent-light);">${dateFormatted} at ${selectedSlot}</strong>.<br>
          Budget selected: <strong>${budget}</strong>.<br>
          This spot has been marked <strong>Booked</strong> on our calendar.
        </p>

        <div style="display:flex; flex-direction:column; gap:10px; max-width:340px; margin-inline:auto; margin-bottom:18px;">
          <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="width:100%;">
            📅 Add to Google Calendar
          </a>
          <a href="https://t.me/${AGENCY_CONFIG.telegramHandle}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="width:100%;">
            💬 Message Founders on Telegram
          </a>
        </div>
        
        <div style="font-size:0.78rem; color:var(--text-dim); font-family:var(--font-mono);">
          Confirmation ID: #CV-${Math.floor(100000 + Math.random() * 900000)} · Invite sent to ${clientEmail}
        </div>
      </div>
    `;
  }

  // Attach Form Submit Handlers
  const onPageForm = document.getElementById('bookingForm');
  if (onPageForm) {
    onPageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('bookName').value;
      const email = document.getElementById('bookEmail').value;
      const telegram = document.getElementById('bookTelegram').value || 'N/A';
      handleBookingSuccess(document.getElementById('bookingSuccessCard'), name, email, telegram, selectedBudget);
    });
  }

  const modalForm = document.getElementById('modalBookingForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('modalBookName').value;
      const email = document.getElementById('modalBookEmail').value;
      const telegram = document.getElementById('modalBookTelegram').value || 'N/A';
      handleBookingSuccess(document.getElementById('modalBookingCard'), name, email, telegram, selectedBudget);
    });
  }

  // Modal Open & Outside Click Close
  const modalScheduler = document.getElementById('schedulerModal');
  const openModalBtns = document.querySelectorAll('.open-scheduler-btn');
  const closeModalBtns = document.querySelectorAll('.close-modal-btn');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.id === 'calcLockBtn') return;

      e.preventDefault();
      if (modalScheduler) {
        modalScheduler.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        setMobileStep(1, true);
        renderAllCalendars();
      }
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalScheduler) {
        modalScheduler.classList.remove('open');
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
    });
  });

  if (modalScheduler) {
    modalScheduler.addEventListener('click', (e) => {
      if (e.target === modalScheduler) {
        modalScheduler.classList.remove('open');
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
    });
  }

  // Resize handler for mobile wizard view
  window.addEventListener('resize', () => {
    updateMobileWizardDOM('page', mobileStepPage);
    updateMobileWizardDOM('modal', mobileStepModal);
  });

  // Initialize
  initCustomDropdowns();
  setMobileStep(1, false);
  setMobileStep(1, true);
  renderAllCalendars();
})();
