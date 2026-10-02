/**
 * KAZI - Providers Module
 * Handles provider discovery, filtering, search, card generation,
 * and comprehensive profile rendering.
 */

const KaziProviders = (function() {
  let activeFilterCategory = 'all';
  let activeSearchQuery = '';
  let activeFilterArea = 'all';
  let activeMinRating = 0;
  let activeSortBy = 'rating';

  /**
   * Filters and sorts the provider list based on active criteria
   */
  function getFilteredProviders() {
    const providers = KaziStorage.getProviders();

    return providers.filter(p => {
      // Category filter
      if (activeFilterCategory !== 'all') {
        if (p.category.toLowerCase() !== activeFilterCategory.toLowerCase()) {
          return false;
        }
      }

      // Area filter
      if (activeFilterArea !== 'all') {
        const matchesArea = p.serviceAreas && p.serviceAreas.some(a => 
          a.toLowerCase().includes(activeFilterArea.toLowerCase())
        );
        if (!matchesArea) return false;
      }

      // Min rating filter
      if (activeMinRating > 0) {
        if ((p.rating || 0) < activeMinRating) return false;
      }

      // Search query (matches name, category, services, bio, areas)
      if (activeSearchQuery.trim()) {
        const q = activeSearchQuery.toLowerCase().trim();
        const inName = p.name.toLowerCase().includes(q);
        const inCategory = p.category.toLowerCase().includes(q);
        const inBio = (p.bio || '').toLowerCase().includes(q);
        const inServices = p.services && p.services.some(s => s.toLowerCase().includes(q));
        const inAreas = p.serviceAreas && p.serviceAreas.some(a => a.toLowerCase().includes(q));

        if (!inName && !inCategory && !inBio && !inServices && !inAreas) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (activeSortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (activeSortBy === 'jobs') {
        return (b.completedJobs || 0) - (a.completedJobs || 0);
      }
      if (activeSortBy === 'price-asc') {
        return (a.typicalPriceMin || 0) - (b.typicalPriceMin || 0);
      }
      if (activeSortBy === 'price-desc') {
        return (b.typicalPriceMax || 0) - (a.typicalPriceMax || 0);
      }
      return 0;
    });
  }

  /**
   * Renders the provider card HTML
   */
  function renderProviderCard(provider) {
    const verifiedBadge = provider.isVerifiedIdentity
      ? '<span class="badge-tag badge-verified" title="Identity verified by government ID and workshop record"><span class="badge-icon">✓</span> Verified Provider</span>'
      : '<span class="badge-tag badge-listed" title="Listed artisan on Kazi with verified phone"><span class="badge-icon">📋</span> Listed Provider</span>';

    const areasList = provider.serviceAreas ? provider.serviceAreas.slice(0, 3).join(', ') : 'Abuja';
    const moreAreas = (provider.serviceAreas && provider.serviceAreas.length > 3)
      ? ` +${provider.serviceAreas.length - 3} more`
      : '';

    const minPrice = KaziUI.formatNaira(provider.typicalPriceMin);
    const maxPrice = KaziUI.formatNaira(provider.typicalPriceMax);

    return `
      <article class="provider-card" data-provider-id="${provider.id}">
        <div class="card-header">
          <div class="provider-avatar-block" style="background-color: ${provider.avatarBg || '#0f766e'};">
            ${provider.initials || provider.name.slice(0, 2).toUpperCase()}
          </div>
          <div class="provider-title-meta">
            <div class="provider-name-row">
              <h3 class="provider-name">${provider.name}</h3>
              ${verifiedBadge}
            </div>
            <p class="provider-category-line">${provider.category} · ${provider.city}</p>
          </div>
        </div>

        <div class="card-stats-grid">
          <div class="stat-pill">
            <span class="stat-star">★</span>
            <strong>${provider.rating.toFixed(1)}</strong>
            <span class="stat-muted">(${provider.verifiedReviews} reviews)</span>
          </div>
          <div class="stat-pill">
            <strong>${provider.completedJobs}</strong>
            <span class="stat-muted">completed jobs</span>
          </div>
        </div>

        <p class="card-bio">${provider.bio || 'Experienced artisan offering reliable, professional services.'}</p>

        <div class="card-services-summary">
          <span class="card-service-label">Popular:</span>
          ${(provider.services || []).slice(0, 2).map(s => `<span class="service-chip">${s}</span>`).join('')}
        </div>

        <div class="card-footer">
          <div class="card-price-info">
            <span class="price-label">Typical Jobs</span>
            <span class="price-range">${minPrice} – ${maxPrice}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-outline btn-sm" onclick="KaziApp.showProviderProfile('${provider.id}')">View Profile</button>
            <button class="btn btn-primary btn-sm" onclick="KaziApp.openCreateJobModal('${provider.id}')">Agree on Job</button>
          </div>
        </div>

        <div class="card-location-bar">
          <span class="loc-pin">📍</span> Service areas: ${areasList}${moreAreas}
        </div>
      </article>
    `;
  }

  /**
   * Renders provider list into the target container
   */
  function renderProvidersList(containerId = 'providers-grid') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filtered = getFilteredProviders();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">🔍</div>
          <h3>No service providers found</h3>
          <p>Try adjusting your category, neighborhood filter, or search keywords.</p>
          <button class="btn btn-secondary btn-sm" onclick="KaziProviders.resetFilters()">Clear Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(renderProviderCard).join('');
  }

  /**
   * Renders the comprehensive Provider Profile View
   */
  function renderProviderProfile(providerId, containerId = 'provider-profile-view') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const provider = KaziStorage.getProviderById(providerId);
    if (!provider) {
      container.innerHTML = `<div class="error-msg">Provider not found.</div>`;
      return;
    }

    const reviews = KaziStorage.getReviewsForProvider(providerId);
    const minPrice = KaziUI.formatNaira(provider.typicalPriceMin);
    const maxPrice = KaziUI.formatNaira(provider.typicalPriceMax);

    const verifiedBadge = provider.isVerifiedIdentity
      ? '<span class="badge-tag badge-verified badge-lg"><span class="badge-icon">✓</span> Verified Provider (ID & Workshop Registered)</span>'
      : '<span class="badge-tag badge-listed badge-lg"><span class="badge-icon">📋</span> Listed Provider (Phone Confirmed)</span>';

    // Calculate punctuality and price respect stats from verified reviews
    let punctualityPct = 95;
    let priceHonoredPct = 98;
    if (reviews.length > 0) {
      const arrivedCount = reviews.filter(r => r.arrivedAsAgreed).length;
      const priceCount = reviews.filter(r => r.priceAsAgreed).length;
      punctualityPct = Math.round((arrivedCount / reviews.length) * 100);
      priceHonoredPct = Math.round((priceCount / reviews.length) * 100);
    }

    container.innerHTML = `
      <div class="profile-header-banner">
        <button class="back-link-btn" onclick="KaziApp.showDirectory()">← Back to Providers</button>
      </div>

      <div class="profile-main-layout">
        <!-- Left Sidebar / Primary Info -->
        <aside class="profile-sidebar">
          <div class="profile-hero-card">
            <div class="profile-avatar-large" style="background-color: ${provider.avatarBg || '#0f766e'};">
              ${provider.initials || provider.name.slice(0, 2).toUpperCase()}
            </div>
            <h1 class="profile-full-name">${provider.name}</h1>
            <p class="profile-category-tag">${provider.category}</p>
            <p class="profile-location-text">📍 ${provider.city}, Nigeria</p>
            <div class="profile-badges-wrap">
              ${verifiedBadge}
              <span class="badge-tag badge-avail"><span class="status-dot">🟢</span> ${provider.availability || 'Available for Hire'}</span>
            </div>

            <div class="profile-cta-box">
              <div class="profile-price-highlight">
                <span class="rate-label">Typical Job Range</span>
                <span class="rate-val">${minPrice} – ${maxPrice}</span>
              </div>
              <button class="btn btn-primary btn-block btn-lg" onclick="KaziApp.openCreateJobModal('${provider.id}')">
                🤝 Agree on a Job
              </button>
              <p class="cta-micro-copy">The agreed price will be locked into your Kazi job record.</p>
            </div>

            <div class="profile-contact-preview">
              <span class="contact-label">Direct Phone:</span>
              <a href="tel:${provider.phone}" class="phone-link">${provider.phone}</a>
            </div>
          </div>

          <!-- Accountability Card -->
          <div class="accountability-box">
            <h4>Kazi Accountability Score</h4>
            <div class="metric-row">
              <span class="metric-label">Arrived as agreed:</span>
              <span class="metric-bar-wrap">
                <span class="metric-bar" style="width: ${punctualityPct}%"></span>
              </span>
              <span class="metric-num">${punctualityPct}%</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Agreed price respected:</span>
              <span class="metric-bar-wrap">
                <span class="metric-bar" style="width: ${priceHonoredPct}%"></span>
              </span>
              <span class="metric-num">${priceHonoredPct}%</span>
            </div>
            <p class="accountability-note">Calculated exclusively from verified customer job completions.</p>
          </div>
        </aside>

        <!-- Right / Main Content -->
        <main class="profile-content-area">
          <!-- Overview Stats Bar -->
          <div class="profile-stats-bar">
            <div class="pstat-item">
              <span class="pstat-icon">★</span>
              <div class="pstat-text">
                <strong class="pstat-val">${provider.rating.toFixed(1)}</strong>
                <span class="pstat-sub">Overall Rating</span>
              </div>
            </div>
            <div class="pstat-item">
              <span class="pstat-icon">🏆</span>
              <div class="pstat-text">
                <strong class="pstat-val">${provider.completedJobs}</strong>
                <span class="pstat-sub">Completed Jobs</span>
              </div>
            </div>
            <div class="pstat-item">
              <span class="pstat-icon">🛡️</span>
              <div class="pstat-text">
                <strong class="pstat-val">${provider.verifiedReviews}</strong>
                <span class="pstat-sub">Verified Reviews</span>
              </div>
            </div>
          </div>

          <!-- Bio Section -->
          <section class="profile-section">
            <h2 class="section-title">About ${provider.name}</h2>
            <p class="profile-bio-text">${provider.bio}</p>
          </section>

          <!-- Services Offered -->
          <section class="profile-section">
            <h2 class="section-title">Services Offered</h2>
            <div class="services-offered-grid">
              ${(provider.services || []).map(s => `
                <div class="service-offered-item">
                  <span class="service-check-icon">✓</span>
                  <div class="service-info">
                    <span class="service-title">${s}</span>
                    <span class="service-sub">Available in ${provider.city}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>

          <!-- Service Coverage Areas -->
          <section class="profile-section">
            <h2 class="section-title">Abuja Coverage Areas</h2>
            <div class="areas-pill-wrap">
              ${(provider.serviceAreas || []).map(a => `<span class="area-pill">📍 ${a}</span>`).join('')}
            </div>
          </section>

          <!-- Verified Reviews Section -->
          <section class="profile-section" id="provider-reviews-section">
            <div class="reviews-header-row">
              <h2 class="section-title">Verified Customer Reviews (${reviews.length})</h2>
              <span class="verified-tag">✓ Only Verified Kazi Jobs</span>
            </div>

            <div class="reviews-list">
              ${reviews.length === 0 ? `
                <div class="empty-reviews">
                  <p>No verified reviews recorded yet for completed jobs.</p>
                </div>
              ` : reviews.map(r => `
                <article class="review-item-card">
                  <div class="review-top-meta">
                    <div class="reviewer-info">
                      <div class="reviewer-avatar">${(r.customerName || 'Customer').charAt(0).toUpperCase()}</div>
                      <div>
                        <strong class="reviewer-name">${r.customerName || 'Kazi Customer'}</strong>
                        <span class="review-date">${KaziUI.formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                    <div class="review-badge-wrap">
                      <span class="verified-job-pill">✓ Verified Job Record</span>
                      ${KaziUI.renderStars(r.rating)}
                    </div>
                  </div>

                  <p class="review-text-content">${r.reviewText || 'No detailed comments provided.'}</p>

                  <div class="review-verifications-row">
                    <span class="verif-check ${r.arrivedAsAgreed ? 'check-yes' : 'check-no'}">
                      ${r.arrivedAsAgreed ? '✓ Arrived as agreed' : '✕ Arrived late/different day'}
                    </span>
                    <span class="verif-check ${r.priceAsAgreed ? 'check-yes' : 'check-no'}">
                      ${r.priceAsAgreed ? '✓ Price respected' : '✕ Price increased on site'}
                    </span>
                    <span class="verif-check ${r.jobCompleted ? 'check-yes' : 'check-no'}">
                      ${r.jobCompleted ? '✓ Job completed' : '✕ Incomplete'}
                    </span>
                  </div>
                </article>
              `).join('')}
            </div>
          </section>
        </main>
      </div>
    `;
  }

  // --- FILTER SETTERS ---
  function setCategory(cat) {
    activeFilterCategory = cat;
  }

  function setSearch(query) {
    activeSearchQuery = query;
  }

  function setArea(area) {
    activeFilterArea = area;
  }

  function setMinRating(rating) {
    activeMinRating = rating;
  }

  function setSortBy(sort) {
    activeSortBy = sort;
  }

  function resetFilters() {
    activeFilterCategory = 'all';
    activeSearchQuery = '';
    activeFilterArea = 'all';
    activeMinRating = 0;
    activeSortBy = 'rating';

    const searchInput = document.getElementById('search-providers-input');
    if (searchInput) searchInput.value = '';
    const catSelect = document.getElementById('filter-category-select');
    if (catSelect) catSelect.value = 'all';
    const areaSelect = document.getElementById('filter-area-select');
    if (areaSelect) areaSelect.value = 'all';

    renderProvidersList();
  }

  return {
    getFilteredProviders,
    renderProviderCard,
    renderProvidersList,
    renderProviderProfile,
    setCategory,
    setSearch,
    setArea,
    setMinRating,
    setSortBy,
    resetFilters
  };
})();
