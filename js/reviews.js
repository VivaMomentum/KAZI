/**
 * KAZI - Reviews Module
 * Manages post-job verified customer review submission, validation,
 * rating recalculation, and review feed displays.
 */

const KaziReviews = (function() {
  let selectedRating = 5;

  /**
   * Sets the interactive star rating in the review form
   */
  function setFormRating(val) {
    selectedRating = parseInt(val, 10) || 5;
    const starButtons = document.querySelectorAll('.star-picker-btn');
    starButtons.forEach(btn => {
      const starVal = parseInt(btn.getAttribute('data-value'), 10);
      if (starVal <= selectedRating) {
        btn.classList.add('star-active');
        btn.textContent = '★';
      } else {
        btn.classList.remove('star-active');
        btn.textContent = '☆';
      }
    });

    const ratingLabel = document.getElementById('review-rating-label');
    if (ratingLabel) {
      const labels = ['', 'Poor (1/5)', 'Fair (2/5)', 'Good (3/5)', 'Very Good (4/5)', 'Excellent (5/5)'];
      ratingLabel.textContent = labels[selectedRating] || `${selectedRating}/5`;
    }
  }

  /**
   * Prepares and opens the review modal for a specific completed job
   */
  function openReviewModalForJob(jobId) {
    const job = KaziStorage.getJobById(jobId);
    if (!job) {
      KaziUI.toast('Job record not found.', 'error');
      return;
    }

    if (job.status !== 'completed') {
      KaziUI.toast('Reviews can only be submitted for completed jobs.', 'warning');
      return;
    }

    // Check if review already exists
    const existing = KaziStorage.getReviews().find(r => r.jobId === jobId);
    if (existing) {
      KaziUI.toast('A review has already been submitted for this job record.', 'info');
      return;
    }

    // Populate modal inputs
    document.getElementById('review-job-id').value = jobId;
    document.getElementById('review-provider-id').value = job.providerId;

    document.getElementById('review-job-context').innerHTML = `
      <div class="review-context-card">
        <span class="context-label">Reviewing Verified Job</span>
        <h4 class="context-provider">${job.providerName} — ${job.category}</h4>
        <div class="context-details">
          <span>Agreed Price: <strong>${KaziUI.formatNaira(job.agreedPrice)}</strong></span> · 
          <span>Service Date: <strong>${KaziUI.formatDate(job.agreedDate)}</strong></span>
        </div>
      </div>
    `;

    // Reset inputs
    setFormRating(5);
    document.getElementById('review-text-input').value = '';
    
    // Set radios to Yes by default
    const arrivedYes = document.querySelector('input[name="rev-arrived"][value="true"]');
    if (arrivedYes) arrivedYes.checked = true;
    const priceYes = document.querySelector('input[name="rev-price"][value="true"]');
    if (priceYes) priceYes.checked = true;
    const completedYes = document.querySelector('input[name="rev-completed"][value="true"]');
    if (completedYes) completedYes.checked = true;

    KaziUI.openModal('submit-review-modal');
  }

  /**
   * Submits verified review and triggers profile update
   */
  function submitReview() {
    const jobId = document.getElementById('review-job-id').value;
    const providerId = document.getElementById('review-provider-id').value;
    const reviewText = document.getElementById('review-text-input').value.trim();

    if (!reviewText) {
      KaziUI.toast('Please write a brief summary of how the job went.', 'warning');
      return;
    }

    const job = KaziStorage.getJobById(jobId);
    if (!job) return;

    const arrivedEl = document.querySelector('input[name="rev-arrived"]:checked');
    const priceEl = document.querySelector('input[name="rev-price"]:checked');
    const completedEl = document.querySelector('input[name="rev-completed"]:checked');

    const arrivedAsAgreed = arrivedEl ? arrivedEl.value === 'true' : true;
    const priceAsAgreed = priceEl ? priceEl.value === 'true' : true;
    const jobCompleted = completedEl ? completedEl.value === 'true' : true;

    const currentUser = KaziStorage.getCurrentUser();

    const reviewRecord = {
      jobId: jobId,
      customerId: currentUser?.id || 'usr_customer_01',
      customerName: currentUser?.name || 'Funke Adeyemi',
      providerId: providerId,
      rating: selectedRating,
      reviewText: reviewText,
      arrivedAsAgreed: arrivedAsAgreed,
      priceAsAgreed: priceAsAgreed,
      jobCompleted: jobCompleted,
      createdAt: new Date().toISOString(),
      verified: true
    };

    KaziStorage.createReview(reviewRecord);

    KaziUI.closeModal('submit-review-modal');
    KaziUI.toast(`Thank you! Your verified review for ${job.providerName} has been recorded.`, 'success');

    // Refresh My Jobs view
    KaziJobs.renderJobsDashboard();

    // If currently viewing this provider's profile, update it dynamically
    const profileView = document.getElementById('screen-provider-profile');
    if (profileView && profileView.classList.contains('screen-active')) {
      KaziProviders.renderProviderProfile(providerId);
    }
  }

  return {
    setFormRating,
    openReviewModalForJob,
    submitReview
  };
})();
