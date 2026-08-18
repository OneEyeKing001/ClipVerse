/* ==========================================================================
   ClipVerse - Bot Detector Backend Pipeline Interactive Demo
   ========================================================================== */

(function () {
  const pipelineViewport = document.getElementById('pipelineViewport');
  const stepNodes = document.querySelectorAll('.step-node');
  
  if (!pipelineViewport) return;

  let currentStep = 1;
  let autoTimer = null;
  let resumeTimer = null;

  // Mock Reel Data
  const sampleReels = [
    {
      id: 1,
      thumbEmoji: '🔥',
      url: 'instagram.com/reel/C8qK9_vL1',
      views: '1,420,500',
      likesComments: '118.2K / 4.1K',
      verdict: 'real',
      reason: 'Natural velocity, real viewers'
    },
    {
      id: 2,
      thumbEmoji: '🤖',
      url: 'instagram.com/reel/C9mX2_pQ8',
      views: '980,400',
      likesComments: '92.4K / 820',
      verdict: 'bot',
      reason: 'Spike anomaly, 94% bot cluster'
    },
    {
      id: 3,
      thumbEmoji: '💎',
      url: 'instagram.com/reel/D0aV4_mZ2',
      views: '2,840,100',
      likesComments: '241.6K / 8.9K',
      verdict: 'real',
      reason: 'Organic watch duration & shares'
    },
    {
      id: 4,
      thumbEmoji: '⚠️',
      url: 'instagram.com/reel/D1xY7_nK5',
      views: '640,000',
      likesComments: '58.0K / 310',
      verdict: 'bot',
      reason: 'Server center IP proxy cluster'
    }
  ];

  function getActiveReels() {
    return (window.innerWidth <= 768) ? sampleReels.slice(0, 3) : sampleReels;
  }

  // Render Step 1: Clean Minimalist Dashboard
  function renderStep1() {
    const reels = getActiveReels();
    pipelineViewport.innerHTML = `
      <div class="clean-dashboard-view">
        <div class="dash-topbar">
          <div class="dash-title">
            <span style="color:var(--accent-light);">📊</span> Master Clipper Submissions
            <span class="badge badge-primary text-mono">${reels.length} Reels</span>
          </div>
          <div class="export-btn-container">
            <button id="simExportBtn" class="btn btn-primary btn-sm">
              <span>📥 Export CSV for Bot Check</span>
            </button>
            <div id="simCursor" class="cursor-sim" style="top: 75px; right: 110px;"></div>
          </div>
        </div>

        <table class="reels-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Submitted Reel URL</th>
              <th>Reported Views</th>
              <th>Likes / Comments</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${reels.map(r => `
              <tr>
                <td><div class="reel-thumb-box">${r.thumbEmoji}</div></td>
                <td><span class="url-link">${r.url}</span></td>
                <td class="text-mono" style="font-weight:700;">${r.views}</td>
                <td class="text-mono text-muted">${r.likesComments}</td>
                <td><span class="badge text-mono" style="font-size:0.68rem;">⏳ PENDING</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Mouse cursor animation clicking export
    setTimeout(() => {
      const cursor = document.getElementById('simCursor');
      const exportBtn = document.getElementById('simExportBtn');
      if (cursor && exportBtn) {
        cursor.style.top = '10px';
        cursor.style.right = '35px';
        setTimeout(() => {
          exportBtn.style.transform = 'scale(0.96)';
          setTimeout(() => {
            exportBtn.style.transform = 'none';
            exportBtn.innerHTML = '<span>✅ CSV Exported</span>';
          }, 250);
        }, 900);
      }
    }, 300);

    const btn = document.getElementById('simExportBtn');
    if (btn) {
      btn.addEventListener('click', () => handleUserStepClick(2));
    }
  }

  // Render Step 2: Drag & Drop into Bot-Detector Terminal
  function renderStep2() {
    pipelineViewport.innerHTML = `
      <div class="terminal-drag-view">
        <div class="terminal-box">
          <div>
            <div class="terminal-line purple">> ClipVerse Sentinel [INITIALIZED]</div>
            <div class="terminal-line">> Target: Reels & TikTok Telemetry</div>
            <div class="terminal-line">> Ingesting reels_batch.csv...</div>
            <div class="terminal-line yellow">> Analyzing velocity curves... [READY]</div>
          </div>
          <div class="terminal-line green">> Status: Anomaly Audit Running</div>
        </div>

        <div id="dragTarget" class="drag-target-zone" style="cursor:pointer;">
          <div class="csv-icon-animated">📄</div>
          <h4 style="font-family:var(--font-display); font-size:1.1rem; margin-bottom:6px;">reels_batch.csv</h4>
          <p class="text-muted" style="font-size:0.85rem; margin-bottom:16px;">Automated Bot-Detection Script</p>
          <button id="btnRunScript" class="btn btn-primary btn-sm">⚡ Run Anomaly Script</button>
        </div>
      </div>
    `;

    const runBtn = document.getElementById('btnRunScript');
    const dragTarget = document.getElementById('dragTarget');
    if (runBtn) runBtn.addEventListener('click', () => handleUserStepClick(3));
    if (dragTarget) dragTarget.addEventListener('click', () => handleUserStepClick(3));
  }

  // Render Step 3: Circular Radar Anomaly Scanner
  function renderStep3() {
    pipelineViewport.innerHTML = `
      <div class="radar-scan-container" style="padding:16px;">
        <div class="radar-spinner" style="width:80px; height:80px; margin-bottom:14px;"></div>
        <h3 style="font-family:var(--font-display); font-size:1.1rem; margin-bottom:6px;">Analyzing Velocity & Curves</h3>
        <p class="text-mono text-muted" style="font-size:0.75rem; max-width:440px; margin-bottom:14px;">
          Checking velocity patterns • account age • watch time telemetry...
        </p>
        <div class="badge badge-bot-shield text-mono" style="font-size:0.72rem;">
          <span class="pulse-dot"></span> ZERO BOT AUDIT ACTIVE
        </div>
      </div>
    `;
  }

  // Render Step 4: Audit Spreadsheet & Ban Action
  function renderStep4() {
    const reels = getActiveReels();
    pipelineViewport.innerHTML = `
      <div class="clean-dashboard-view">
        <div class="dash-topbar">
          <div class="dash-title">
            <span style="color:var(--status-real);">🛡️</span> Audit Result: Flagged Botted Rows
          </div>
          <button id="btnBanBotters" class="btn btn-primary btn-sm" style="background:linear-gradient(135deg, #ef4444, #dc2626); box-shadow:0 0 15px rgba(239,68,68,0.4);">
            🚫 Ban Botters & Block Payout
          </button>
        </div>

        <table class="reels-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Submitted Reel URL</th>
              <th>Views</th>
              <th>Detection Verdict</th>
              <th>Audit Diagnostic</th>
            </tr>
          </thead>
          <tbody>
            ${reels.map(r => `
              <tr class="${r.verdict === 'bot' ? 'audit-row-botted' : 'audit-row-real'}">
                <td><div class="reel-thumb-box">${r.thumbEmoji}</div></td>
                <td><span class="url-link">${r.url}</span></td>
                <td class="text-mono" style="font-weight:700;">${r.views}</td>
                <td>
                  ${r.verdict === 'bot'
                    ? `<span class="status-badge-botted">⚠️ BOTTED</span>`
                    : `<span class="status-badge-real">✓ REAL</span>`
                  }
                </td>
                <td style="font-size:0.72rem; color:${r.verdict === 'bot' ? '#fda4af' : '#a7f3d0'};">
                  ${r.reason}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div id="banSuccessToast" style="display:none; margin-top:12px; padding:10px 14px; background:var(--status-real-bg); border:1px solid var(--status-real-border); border-radius:var(--radius-sm); color:var(--status-real); font-family:var(--font-mono); font-size:0.78rem; text-align:center;">
          ✓ ZERO BOT GUARANTEE: Botted clippers banned with $0 payout.
        </div>
      </div>
    `;

    const banBtn = document.getElementById('btnBanBotters');
    if (banBtn) {
      banBtn.addEventListener('click', () => {
        banBtn.innerHTML = '✅ Banned & $0 Wasted';
        banBtn.disabled = true;
        const toast = document.getElementById('banSuccessToast');
        if (toast) toast.style.display = 'block';
      });
    }
  }

  // Set Step Function
  function setStep(step) {
    currentStep = step;
    stepNodes.forEach((node, index) => {
      node.classList.remove('active', 'done');
      if (index + 1 === step) {
        node.classList.add('active');
      } else if (index + 1 < step) {
        node.classList.add('done');
      }
    });

    switch (step) {
      case 1: renderStep1(); break;
      case 2: renderStep2(); break;
      case 3: renderStep3(); break;
      case 4: renderStep4(); break;
    }
  }

  // Timing:
  // Step 1-3 = 3.5s (3500ms)
  // Step 4 = 5.5s (5500ms)
  function scheduleNextStep() {
    clearTimeout(autoTimer);
    let delay = (currentStep === 4) ? 5500 : 3500;

    autoTimer = setTimeout(() => {
      let nextStep = currentStep + 1;
      if (nextStep > 4) nextStep = 1;
      setStep(nextStep);
      scheduleNextStep();
    }, delay);
  }

  // Handle manual tab clicks:
  // 1. Move to clicked step immediately
  // 2. Wait 2000ms (2 sec)
  // 3. Smoothly resume autoplay from that position
  function handleUserStepClick(step) {
    clearTimeout(autoTimer);
    clearTimeout(resumeTimer);
    setStep(step);

    resumeTimer = setTimeout(() => {
      let next = currentStep + 1;
      if (next > 4) next = 1;
      setStep(next);
      scheduleNextStep();
    }, 2000);
  }

  // Step navigation click handlers
  stepNodes.forEach(node => {
    node.addEventListener('click', () => {
      const step = parseInt(node.getAttribute('data-step'));
      if (step) handleUserStepClick(step);
    });
  });

  // Initial step & start continuous autoplay
  setStep(1);
  scheduleNextStep();
})();
