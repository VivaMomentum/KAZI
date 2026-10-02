/**
 * KAZI - Jobs Module
 * Manages job creation, lifecycle state transitions, agreed price locking,
 * issue reporting, and dashboard rendering (Active, Completed, Issues).
 */

const KaziJobs = (function() {
  let activeTab = 'active'; // 'active', 'completed', 'issues'

  /**
   * Returns list of jobs for current user context (customer or artisan)
   */
  function getUserJobs() {
    const allJobs = KaziStorage.getJobs();
    const currentUser = KaziStorage.getCurrentUser();
    if (!currentUser) return [];

    if (currentUser.role === 'artisan') {
      const providerId = currentUser.providerId || 'prv_001';
      return allJobs.filter(j => 
        j.providerId === providerId || 
        (j.providerKaziId && j.providerKaziId === currentUser.kaziId) ||
        (j.providerName && j.providerName.toLowerCase() === currentUser.fullName.toLowerCase())
      );
    } else {
      const customerId = currentUser.id || 'usr_customer_01';
      return allJobs.filter(j => 
        j.customerId === customerId || 
        (j.customerKaziId && j.customerKaziId === currentUser.kaziId)
      );
    }
  }

  /**
   * Filters jobs based on the active dashboard tab
   */
  function getTabJobs(tab = activeTab) {
    const jobs = getUserJobs();

    if (tab === 'active') {
      return jobs.filter(j => ['requested', 'agreed', 'in-progress'].includes(j.status));
    } else if (tab === 'completed') {
      return jobs.filter(j => j.status === 'completed');
    } else if (tab === 'issues') {
      return jobs.filter(j => j.status === 'issue-reported' || j.status === 'cancelled');
    }
    return jobs;
  }

  /**
   * Renders the jobs dashboard
   */
  function renderJobsDashboard(containerId = 'my-jobs-list') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Update counts on tabs
    const all = getUserJobs();
    const activeCount = all.filter(j => ['requested', 'agreed', 'in-progress'].includes(j.status)).length;
    const completedCount = all.filter(j => j.status === 'completed').length;
    const issuesCount = all.filter(j => j.status === 'issue-reported' || j.status === 'cancelled').length;

    const countActiveEl = document.getElementById('tab-count-active');
    if (countActiveEl) countActiveEl.textContent = activeCount;
    const countCompEl = document.getElementById('tab-count-completed');
    if (countCompEl) countCompEl.textContent = completedCount;
    const countIssuesEl = document.getElementById('tab-count-issues');
    if (countIssuesEl) countIssuesEl.textContent = issuesCount;

    const jobs = getTabJobs(activeTab);

    if (jobs.length === 0) {
      let emptyTitle = 'No active jobs';
      let emptyMsg = 'You have no service agreements currently in progress.';
      if (activeTab === 'completed') {
        emptyTitle = 'No completed jobs yet';
        emptyMsg = 'Jobs marked as completed will appear here for your service history.';
      } else if (activeTab === 'issues') {
        emptyTitle = 'No issue reports';
        emptyMsg = 'No problems or disputed jobs reported.';
      }

      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">${activeTab === 'completed' ? '📦' : activeTab === 'issues' ? '🛡️' : '📋'}</div>
          <h3>${emptyTitle}</h3>
          <p>${emptyMsg}</p>
          ${activeTab === 'active' ? `<button class="btn btn-primary btn-sm" onclick="KaziApp.showDirectory()">Browse Providers</button>` : ''}
        </div>
      `;
      return;
    }

    container.innerHTML = jobs.map(renderJobCard).join('');
  }

  /**
   * Renders an individual job card
   */
  function renderJobCard(job) {
    const formattedPrice = KaziUI.formatNaira(job.agreedPrice);
    const formattedDate = KaziUI.formatDate(job.agreedDate);
    const isCustomer = KaziStorage.getCurrentRole() === 'customer';

    // Action buttons based on status
    let actionButtons = '';

    if (job.status === 'agreed' || job.status === 'requested') {
      actionButtons = `
        <button class="btn btn-outline btn-sm" onclick="KaziJobs.transitionStatus('${job.id}', 'in-progress')">
          Mark as In Progress
        </button>
        <button class="btn btn-text-danger btn-sm" onclick="KaziJobs.openReportIssueModal('${job.id}')">
          Report Problem
        </button>
      `;
    } else if (job.status === 'in-progress') {
      actionButtons = `
        <button class="btn btn-success btn-sm" onclick="KaziJobs.transitionStatus('${job.id}', 'completed')">
          ✓ Mark Completed
        </button>
        <button class="btn btn-text-danger btn-sm" onclick="KaziJobs.openReportIssueModal('${job.id}')">
          Report Problem
        </button>
      `;
    } else if (job.status === 'completed') {
      // Check if review already exists
      const reviews = KaziStorage.getReviews();
      const hasReview = reviews.some(r => r.jobId === job.id);

      if (!hasReview && isCustomer) {
        actionButtons = `
          <button class="btn btn-primary btn-sm" onclick="KaziApp.openReviewModal('${job.id}')">
            ★ Review ${job.providerName}
          </button>
        `;
      } else {
        actionButtons = `
          <span class="badge-tag badge-verified">✓ Reviewed</span>
        `;
      }
    } else if (job.status === 'issue-reported') {
      actionButtons = `
        <button class="btn btn-outline btn-sm" onclick="KaziJobs.viewJobDetails('${job.id}')">
          View Report
        </button>
      `;
    }

    return `
      <article class="job-card status-border-${job.status}" id="job-card-${job.id}">
        <div class="job-card-header">
          <div class="job-provider-summary">
            <span class="job-category-tag">${job.category || 'Service'}</span>
            <h3 class="job-card-title">${isCustomer ? `${job.providerName} — ${job.serviceName || 'Custom Service'}` : `Customer: ${job.customerName || 'Client'} — ${job.serviceName || 'Service'}`}</h3>
            <div class="job-counterparty-meta">
              <span class="job-kazi-id-tag">${isCustomer ? `Artisan ID: <strong>${job.providerKaziId || 'KZ-ART-000001'}</strong>` : `Client ID: <strong>${job.customerKaziId || 'KZ-CUS-000001'}</strong>`}</span> · 
              <span class="job-card-date">Agreed Date: <strong>${formattedDate}</strong></span>
            </div>
          </div>
          <div class="job-badge-column">
            ${KaziUI.renderStatusBadge(job.status)}
            <div class="job-agreed-price-box">
              <span class="agreed-label">Agreed Price</span>
              <strong class="agreed-amount">${formattedPrice}</strong>
            </div>
          </div>
        </div>

        <p class="job-card-description">${job.description || 'No detailed scope recorded.'}</p>

        ${job.notes ? `<div class="job-notes-snip"><em>Note:</em> ${job.notes}</div>` : ''}

        ${job.issue ? `
          <div class="job-issue-alert">
            <div class="issue-head">
              <strong>⚠️ Customer Issue Report: ${job.issue.type}</strong>
              <span class="issue-time">${KaziUI.formatDate(job.issue.reportedAt)}</span>
            </div>
            <p class="issue-body">"${job.issue.customerNote}"</p>
            <div class="issue-foot-note">Original agreed price (${formattedPrice}) preserved in record.</div>
          </div>
        ` : ''}

        <div class="job-card-footer">
          <button class="btn btn-text btn-sm" onclick="KaziJobs.viewJobDetails('${job.id}')">
            Job Details & Record →
          </button>
          <div class="job-actions-row">
            ${actionButtons}
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Transitions job status along the state machine
   */
  function transitionStatus(jobId, newStatus) {
    const job = KaziStorage.getJobById(jobId);
    if (!job) {
      KaziUI.toast('Job record not found.', 'error');
      return;
    }

    const updates = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    const updated = KaziStorage.updateJob(jobId, updates);
    if (updated) {
      if (newStatus === 'in-progress') {
        KaziUI.toast(`Job with ${job.providerName} marked In Progress.`, 'info');
      } else if (newStatus === 'completed') {
        KaziUI.toast(`Job completed! Agreed price: ${KaziUI.formatNaira(job.agreedPrice)}. Please submit a review.`, 'success');
        // Prompt for review if customer
        if (KaziStorage.getCurrentRole() === 'customer') {
          setTimeout(() => {
            KaziApp.openReviewModal(jobId);
          }, 800);
        }
      }

      // Re-render current view
      renderJobsDashboard();
      if (document.getElementById('job-details-modal') && document.getElementById('job-details-modal').classList.contains('modal-open')) {
        renderJobDetailsModal(jobId);
      }
    }
  }

  /**
   * Opens the Report Issue Modal for a job
   */
  function openReportIssueModal(jobId) {
    const job = KaziStorage.getJobById(jobId);
    if (!job) return;

    const modal = document.getElementById('report-issue-modal');
    if (!modal) return;

    document.getElementById('issue-job-id').value = jobId;
    document.getElementById('issue-job-summary').innerHTML = `
      Job with <strong>${job.providerName}</strong> (${job.serviceName})<br>
      Agreed Price: <strong>${KaziUI.formatNaira(job.agreedPrice)}</strong>
    `;
    document.getElementById('issue-description-input').value = '';

    KaziUI.openModal('report-issue-modal');
  }

  /**
   * Submits a customer-reported issue
   */
  function submitIssueReport() {
    const jobId = document.getElementById('issue-job-id').value;
    const issueType = document.getElementById('issue-type-select').value;
    const note = document.getElementById('issue-description-input').value.trim();

    if (!note) {
      KaziUI.toast('Please provide details regarding what happened.', 'warning');
      return;
    }

    const job = KaziStorage.getJobById(jobId);
    if (!job) return;

    const issueData = {
      type: issueType,
      reportedAt: new Date().toISOString(),
      reportedBy: KaziStorage.getCurrentUser()?.name || 'Customer',
      customerNote: note
    };

    KaziStorage.updateJob(jobId, {
      status: 'issue-reported',
      issue: issueData
    });

    KaziUI.closeModal('report-issue-modal');
    KaziUI.toast('Issue report recorded. Original agreed price and terms preserved.', 'info');
    activeTab = 'issues';
    setTab('issues');
  }

  /**
   * Renders the complete Job Details Modal / View
   */
  function viewJobDetails(jobId) {
    renderJobDetailsModal(jobId);
    KaziUI.openModal('job-details-modal');
  }

  function renderJobDetailsModal(jobId) {
    const job = KaziStorage.getJobById(jobId);
    const container = document.getElementById('job-details-content');
    if (!job || !container) return;

    const formattedPrice = KaziUI.formatNaira(job.agreedPrice);
    const formattedDate = KaziUI.formatDate(job.agreedDate);
    const provider = KaziStorage.getProviderById(job.providerId);
    const review = KaziStorage.getReviews().find(r => r.jobId === job.id);

    container.innerHTML = `
      <div class="job-detail-dossier">
        <div class="dossier-header">
          <div>
            <span class="dossier-id">Record ID: #${job.id.slice(-6).toUpperCase()}</span>
            <h2 class="dossier-title">${job.serviceName || 'Agreed Service'}</h2>
            <p class="dossier-sub">With <strong>${job.providerName}</strong> (${job.category})</p>
          </div>
          <div class="dossier-status-block">
            ${KaziUI.renderStatusBadge(job.status)}
            <div class="dossier-price-tag">
              <span class="dossier-price-label">Agreed Price</span>
              <span class="dossier-price-val">${formattedPrice}</span>
            </div>
          </div>
        </div>

        <div class="dossier-grid">
          <div class="dossier-item">
            <span class="dossier-label">Customer</span>
            <strong>${job.customerName || 'Vivian Dike'}</strong>
            <span class="dossier-sub-id">${job.customerKaziId || 'KZ-CUS-000001'}</span>
          </div>
          <div class="dossier-item">
            <span class="dossier-label">Artisan</span>
            <strong>${job.providerName}</strong>
            <span class="dossier-sub-id">${job.providerKaziId || 'KZ-ART-000001'}</span>
          </div>
          <div class="dossier-item">
            <span class="dossier-label">Agreed Service Date</span>
            <strong>${formattedDate}</strong>
          </div>
          <div class="dossier-item">
            <span class="dossier-label">Created On</span>
            <span>${KaziUI.formatDate(job.createdAt)}</span>
          </div>
        </div>

        <div class="dossier-section">
          <h3>Agreed Scope of Work</h3>
          <p class="dossier-text">${job.description || 'Standard repair and service scope agreed by both parties.'}</p>
        </div>

        ${job.notes ? `
          <div class="dossier-section">
            <h3>Special Notes / Access Instructions</h3>
            <p class="dossier-text">${job.notes}</p>
          </div>
        ` : ''}

        ${job.issue ? `
          <div class="dossier-issue-box">
            <h3>⚠️ Customer Issue Report</h3>
            <p><strong>Complaint Type:</strong> ${job.issue.type}</p>
            <p><strong>Submitted by:</strong> ${job.issue.reportedBy} on ${KaziUI.formatDate(job.issue.reportedAt)}</p>
            <p class="issue-quote">"${job.issue.customerNote}"</p>
            <div class="issue-audit-note">
              This report is preserved as a factual record of the customer's experience. The agreed price of ${formattedPrice} remains permanently locked.
            </div>
          </div>
        ` : ''}

        ${review ? `
          <div class="dossier-review-box">
            <h3>★ Verified Job Review</h3>
            <div class="review-stars-row">
              ${KaziUI.renderStars(review.rating)}
              <span class="verified-pill">✓ Verified Job Record</span>
            </div>
            <p class="review-comment">"${review.reviewText}"</p>
            <div class="review-checks-list">
              <span>${review.arrivedAsAgreed ? '✓ Arrived as agreed' : '✕ Arrived late'}</span>
              <span>${review.priceAsAgreed ? '✓ Agreed price respected' : '✕ Price increased'}</span>
              <span>${review.jobCompleted ? '✓ Completed' : '✕ Incomplete'}</span>
            </div>
          </div>
        ` : ''}

        <div class="dossier-actions-bar">
          ${job.status === 'agreed' ? `
            <button class="btn btn-outline" onclick="KaziJobs.transitionStatus('${job.id}', 'in-progress'); KaziUI.closeModal('job-details-modal');">
              Change Status to In Progress
            </button>
            <button class="btn btn-danger" onclick="KaziJobs.openReportIssueModal('${job.id}'); KaziUI.closeModal('job-details-modal');">
              Report Issue
            </button>
          ` : ''}

          ${job.status === 'in-progress' ? `
            <button class="btn btn-success" onclick="KaziJobs.transitionStatus('${job.id}', 'completed'); KaziUI.closeModal('job-details-modal');">
              ✓ Mark Job as Completed
            </button>
            <button class="btn btn-danger" onclick="KaziJobs.openReportIssueModal('${job.id}'); KaziUI.closeModal('job-details-modal');">
              Report Issue
            </button>
          ` : ''}

          ${job.status === 'completed' && !review && KaziStorage.getCurrentRole() === 'customer' ? `
            <button class="btn btn-primary" onclick="KaziUI.closeModal('job-details-modal'); KaziApp.openReviewModal('${job.id}');">
              ★ Submit Verified Review
            </button>
          ` : ''}

          <button class="btn btn-secondary" onclick="KaziUI.closeModal('job-details-modal')">Close</button>
        </div>
      </div>
    `;
  }

  function setTab(tab) {
    activeTab = tab;
    const tabBtns = document.querySelectorAll('.job-tab-btn');
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('tab-active');
      } else {
        btn.classList.remove('tab-active');
      }
    });
    renderJobsDashboard();
  }

  return {
    getUserJobs,
    getTabJobs,
    renderJobsDashboard,
    transitionStatus,
    openReportIssueModal,
    submitIssueReport,
    viewJobDetails,
    setTab
  };
})();
