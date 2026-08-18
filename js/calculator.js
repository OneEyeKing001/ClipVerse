/* ==========================================================================
   ClipVerse - Interactive Campaign ROI & Reach Calculator
   ========================================================================== */

(function () {
  const budgetSlider = document.getElementById('budgetSlider');
  const budgetValue = document.getElementById('budgetValue');
  const calcLockBtn = document.getElementById('calcLockBtn');
  
  const metricViews = document.getElementById('calcMetricViews');
  const metricCreators = document.getElementById('calcMetricCreators');
  const metricProtection = document.getElementById('calcMetricProtection');
  const metricSavings = document.getElementById('calcMetricSavings');

  if (!budgetSlider) return;

  function formatCurrency(num) {
    return '$' + num.toLocaleString();
  }

  function formatShortNumber(num) {
    if (num >= 100000000) {
      return (num / 1000000).toFixed(0) + 'M';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  }

  function getBudgetTier(budget) {
    if (budget <= 2500) return '$1,000 - $2,500';
    if (budget <= 5000) return '$2,500 - $5,000';
    if (budget <= 15000) return '$5,000 - $15,000';
    if (budget <= 30000) return '$15,000 - $30,000';
    return '$30,000+ (Full Omnipresence)';
  }

  function updateCalculator() {
    const budget = parseInt(budgetSlider.value);
    budgetValue.textContent = formatCurrency(budget);

    // Increased views by ~20% + scaling viral multiplier
    // At $1,000 -> 850K - 2.5M+ views
    const minViews = Math.round(budget * 850);
    const maxViews = Math.round(budget * 2500);
    const avgViews = Math.round((minViews + maxViews) / 2);

    // Dedicated Clipper Fleet (scaling with volume)
    const clippers = Math.round(budget * 0.115) + 5;

    // Meta / TikTok Ads Manager baseline ($18 CPM average)
    const paidAdsCost = (avgViews / 1000) * 18.0;
    const estimatedSavings = Math.max(0, Math.round(paidAdsCost - budget));

    if (metricViews) {
      metricViews.textContent = `${formatShortNumber(minViews)} – ${formatShortNumber(maxViews)}+`;
    }
    if (metricCreators) {
      metricCreators.textContent = `${clippers.toLocaleString()}+ Creators`;
    }
    if (metricProtection) {
      metricProtection.textContent = '100% Protected';
    }
    if (metricSavings) {
      metricSavings.textContent = formatCurrency(estimatedSavings);
    }
  }

  budgetSlider.addEventListener('input', updateCalculator);
  updateCalculator();

  // Lock In Campaign Plan Button -> Map Budget Tier & Smooth Scroll to Calendar
  if (calcLockBtn) {
    calcLockBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentBudget = parseInt(budgetSlider.value);
      const matchedTier = getBudgetTier(currentBudget);

      // Trigger global budget selector helper if available
      if (typeof window.setCampaignBudget === 'function') {
        window.setCampaignBudget(matchedTier);
      }

      // Smooth scroll to scheduler
      const schedulerEl = document.getElementById('scheduler');
      if (schedulerEl) {
        schedulerEl.scrollIntoView({ behavior: 'smooth' });

        // Smoothly scroll to scheduler without box shadow glow flare
        const bookingCard = document.getElementById('bookingSuccessCard');
        if (bookingCard) {
          bookingCard.style.transition = 'border-color 0.4s ease';
          bookingCard.style.borderColor = 'var(--accent-primary)';
          setTimeout(() => {
            bookingCard.style.borderColor = '';
          }, 1200);
        }
      }
    });
  }
})();
