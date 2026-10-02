/**
 * KAZI - UI Utilities Module
 * Handles toast notifications, modal dialogues, currency & date formatting,
 * and badge rendering.
 */

const KaziUI = (function() {
  /**
   * Formats a numeric value into Nigerian Naira currency string (e.g. ₦32,000)
   */
  function formatNaira(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '₦0';
    const num = Math.round(Number(amount));
    return '₦' + num.toLocaleString('en-NG');
  }

  /**
   * Formats a date string into readable text (e.g. "October 4, 2026" or "Oct 4")
   */
  function formatDate(dateStr, includeYear = true) {
    if (!dateStr) return 'TBD';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const options = {
        month: 'short',
        day: 'numeric'
      };
      if (includeYear) {
        options.year = 'numeric';
      }
      return d.toLocaleDateString('en-NG', options);
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Renders star rating display with count and color
   */
  function renderStars(rating = 0) {
    const r = Math.min(5, Math.max(0, parseFloat(rating) || 0));
    const fullStars = Math.floor(r);
    const hasHalf = r - fullStars >= 0.4;
    let starsHtml = '';

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        starsHtml += '<span class="star-icon star-full">★</span>';
      } else if (i === fullStars + 1 && hasHalf) {
        starsHtml += '<span class="star-icon star-half">★</span>';
      } else {
        starsHtml += '<span class="star-icon star-empty">☆</span>';
      }
    }
    return `<div class="rating-display">${starsHtml} <span class="rating-val">${r.toFixed(1)}</span></div>`;
  }

  /**
   * Renders a status badge HTML snippet with corresponding color classes
   */
  function renderStatusBadge(status) {
    const s = (status || '').toLowerCase();
    let label = 'Requested';
    let icon = '⚪';
    let badgeClass = 'status-requested';

    switch (s) {
      case 'agreed':
        label = 'Agreed';
        icon = '🤝';
        badgeClass = 'status-agreed';
        break;
      case 'in-progress':
        label = 'In Progress';
        icon = '🟡';
        badgeClass = 'status-in-progress';
        break;
      case 'completed':
        label = 'Completed';
        icon = '🟢';
        badgeClass = 'status-completed';
        break;
      case 'issue-reported':
        label = 'Issue Reported';
        icon = '🔴';
        badgeClass = 'status-issue-reported';
        break;
      case 'cancelled':
        label = 'Cancelled';
        icon = '⚪';
        badgeClass = 'status-cancelled';
        break;
      default:
        label = 'Requested';
        icon = '⚪';
        badgeClass = 'status-requested';
    }

    return `<span class="status-badge ${badgeClass}"><span class="status-dot">${icon}</span> ${label}</span>`;
  }

  /**
   * Displays a non-blocking toast alert at the top right of the viewport
   */
  function toast(message, type = 'info', duration = 3800) {
    let container = document.getElementById('kazi-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'kazi-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast-item toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'warning') icon = '⚠️';

    toastEl.innerHTML = `
      <div class="toast-icon-wrap">${icon}</div>
      <div class="toast-body">${message}</div>
      <button class="toast-close-btn" aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toastEl);

    const closeBtn = toastEl.querySelector('.toast-close-btn');
    const dismiss = () => {
      toastEl.classList.add('toast-hiding');
      setTimeout(() => {
        if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      }, 250);
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  }

  /**
   * Modal management
   */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('modal-open');
    document.body.classList.add('modal-active');

    // Accessibility: Focus first interactive element inside modal
    setTimeout(() => {
      const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
    }, 60);
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('modal-open');
    if (!document.querySelector('.modal-wrapper.modal-open')) {
      document.body.classList.remove('modal-active');
    }
  }

  /**
   * Sets up global modal dismiss listener on click outside and escape key
   */
  function initModalDismissHandlers() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        const modal = e.target.closest('.modal-wrapper');
        if (modal) {
          closeModal(modal.id);
        }
      }
      if (e.target.matches('[data-close-modal]')) {
        const modal = e.target.closest('.modal-wrapper');
        if (modal) {
          closeModal(modal.id);
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModalEl = document.querySelector('.modal-wrapper.modal-open');
        if (openModalEl) {
          closeModal(openModalEl.id);
        }
      }
    });
  }

  return {
    formatNaira,
    formatDate,
    renderStars,
    renderStatusBadge,
    toast,
    openModal,
    closeModal,
    initModalDismissHandlers
  };
})();
