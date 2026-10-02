/**
 * KAZI - App Module
 * Main application coordinator: router, authentication flows,
 * customer & artisan role experiences, profile management, and modals.
 */

const KaziApp = (function() {
  let currentScreen = 'home';
  let signupRole = 'customer';

  /**
   * Initializes the application on DOM ready
   */
  function init() {
    // 1. Initialize persistent storage and run data migrations
    KaziStorage.init();

    // 2. Setup modal dismiss and ESC handlers
    KaziUI.initModalDismissHandlers();

    // 3. Bind UI event listeners
    bindEvents();

    // 4. Update role and user navigation indicators
    updateRoleUI();

    // 5. Render initial views
    renderHomeComponents();
    renderCategoriesQuickGrid();

    // 6. Navigate to initial screen based on hash or default to home/dashboard
    handleHashNavigation();
    window.addEventListener('hashchange', handleHashNavigation);

    console.log('Kazi platform initialized with User Authentication & Permanent Kazi IDs for Abuja, Nigeria.');
  }

  /**
   * Screen Navigation & Route Protection Guard
   */
  function navigateTo(screenId, params = {}) {
    const currentUser = KaziStorage.getCurrentUser();
    const isAuthenticated = !!currentUser;
    const userRole = currentUser ? currentUser.role : 'guest';

    // 1. Protected routes: require authentication
    const protectedScreens = [
      'customer-dashboard',
      'artisan-dashboard',
      'my-jobs',
      'customer-profile',
      'artisan-profile',
      'settings'
    ];

    if (protectedScreens.includes(screenId) && !isAuthenticated) {
      KaziUI.toast('Please log in or sign up to access your account.', 'warning');
      window.location.hash = 'login';
      showScreen('login');
      return;
    }

    // 2. Role-based route enforcement
    if (isAuthenticated) {
      if (userRole === 'customer') {
        if (screenId === 'artisan-dashboard' || screenId === 'artisan-profile') {
          KaziUI.toast('Artisan dashboard is restricted to service provider accounts.', 'warning');
          window.location.hash = 'customer-dashboard';
          showScreen('customer-dashboard');
          return;
        }
      } else if (userRole === 'artisan') {
        if (screenId === 'customer-dashboard' || screenId === 'customer-profile') {
          KaziUI.toast('Customer dashboard is restricted to customer accounts.', 'warning');
          window.location.hash = 'artisan-dashboard';
          showScreen('artisan-dashboard');
          return;
        }
      }
    }

    // 3. Show requested screen
    showScreen(screenId, params);
  }

  function showScreen(screenId, params = {}) {
    const screens = document.querySelectorAll('.screen-section');
    screens.forEach(s => s.classList.remove('screen-active'));

    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
      target.classList.add('screen-active');
      currentScreen = screenId;
      window.scrollTo(0, 0);

      // Update active nav links
      document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-screen') === screenId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Screen-specific view triggers
      if (screenId === 'directory') {
        KaziProviders.renderProvidersList();
      } else if (screenId === 'my-jobs') {
        KaziJobs.renderJobsDashboard();
      } else if (screenId === 'customer-dashboard') {
        renderCustomerDashboard();
      } else if (screenId === 'artisan-dashboard') {
        renderArtisanDashboard();
      } else if (screenId === 'customer-profile') {
        renderCustomerProfile();
      } else if (screenId === 'artisan-profile') {
        renderArtisanProfile();
      } else if (screenId === 'home') {
        renderHomeComponents();
      } else if (screenId === 'settings') {
        renderSettingsView();
      } else if (screenId === 'login') {
        renderLoginView();
      } else if (screenId === 'signup') {
        renderSignupView();
      }
    }
  }

  function handleHashNavigation() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const [route, param] = hash.split('/');

    if (route === 'provider' && param) {
      showProviderProfile(param);
    } else if ([
      'home', 'directory', 'my-jobs', 'customer-dashboard', 'artisan-dashboard',
      'customer-profile', 'artisan-profile', 'settings', 'login', 'signup'
    ].includes(route)) {
      navigateTo(route);
    } else {
      navigateTo('home');
    }
  }

  /**
   * Updates Header Navigation based on authentication state and user role
   */
  function updateRoleUI() {
    const currentUser = KaziStorage.getCurrentUser();
    const isAuth = !!currentUser;
    const role = currentUser ? currentUser.role : 'guest';

    // Desktop nav items
    const navHome = document.getElementById('nav-link-home');
    const navDirectory = document.getElementById('nav-link-directory');
    const navCustomerDash = document.getElementById('nav-link-customer-dash');
    const navArtisanDash = document.getElementById('nav-link-artisan-dash');
    const navMyJobs = document.getElementById('nav-link-my-jobs');
    const navProfile = document.getElementById('nav-link-profile');
    const navSettings = document.getElementById('nav-link-settings');

    // Header actions
    const authLoggedOutGroup = document.getElementById('nav-logged-out-group');
    const authLoggedInGroup = document.getElementById('nav-logged-in-group');
    const userPill = document.getElementById('nav-user-pill');
    const userPillName = document.getElementById('nav-user-pill-name');
    const userPillId = document.getElementById('nav-user-pill-id');
    const userPillAvatar = document.getElementById('nav-user-pill-avatar');

    // Update active jobs count badge
    if (isAuth) {
      const allJobs = KaziJobs.getUserJobs();
      const activeCount = allJobs.filter(j => ['requested', 'agreed', 'in-progress'].includes(j.status)).length;
      const badgeEl = document.getElementById('nav-active-jobs-badge');
      if (badgeEl) {
        badgeEl.textContent = activeCount;
        badgeEl.style.display = activeCount > 0 ? 'inline-block' : 'none';
      }
    }

    if (!isAuth) {
      // Logged out
      if (navHome) navHome.style.display = 'inline-flex';
      if (navDirectory) {
        navDirectory.style.display = 'inline-flex';
        navDirectory.textContent = 'Find Artisans';
      }
      if (navCustomerDash) navCustomerDash.style.display = 'none';
      if (navArtisanDash) navArtisanDash.style.display = 'none';
      if (navMyJobs) navMyJobs.style.display = 'none';
      if (navProfile) navProfile.style.display = 'none';
      if (navSettings) navSettings.style.display = 'none';

      if (authLoggedOutGroup) authLoggedOutGroup.style.display = 'flex';
      if (authLoggedInGroup) authLoggedInGroup.style.display = 'none';
    } else if (role === 'customer') {
      // Customer navigation
      if (navHome) navHome.style.display = 'inline-flex';
      if (navDirectory) {
        navDirectory.style.display = 'inline-flex';
        navDirectory.textContent = 'Find Services';
      }
      if (navCustomerDash) navCustomerDash.style.display = 'inline-flex';
      if (navArtisanDash) navArtisanDash.style.display = 'none';
      if (navMyJobs) navMyJobs.style.display = 'inline-flex';
      if (navProfile) {
        navProfile.style.display = 'inline-flex';
        navProfile.setAttribute('data-screen', 'customer-profile');
        navProfile.setAttribute('href', '#customer-profile');
      }
      if (navSettings) navSettings.style.display = 'inline-flex';

      if (authLoggedOutGroup) authLoggedOutGroup.style.display = 'none';
      if (authLoggedInGroup) authLoggedInGroup.style.display = 'flex';

      if (userPillName) userPillName.textContent = currentUser.fullName;
      if (userPillId) userPillId.textContent = currentUser.kaziId;
      if (userPillAvatar) {
        userPillAvatar.textContent = currentUser.initials || 'VD';
        userPillAvatar.style.backgroundColor = currentUser.avatarBg || '#047857';
      }
      if (userPill) {
        userPill.setAttribute('onclick', "KaziApp.navigateTo('customer-profile')");
      }
    } else if (role === 'artisan') {
      // Artisan navigation
      if (navHome) navHome.style.display = 'inline-flex';
      if (navDirectory) {
        navDirectory.style.display = 'inline-flex';
        navDirectory.textContent = 'Directory';
      }
      if (navCustomerDash) navCustomerDash.style.display = 'none';
      if (navArtisanDash) navArtisanDash.style.display = 'inline-flex';
      if (navMyJobs) navMyJobs.style.display = 'inline-flex';
      if (navProfile) {
        navProfile.style.display = 'inline-flex';
        navProfile.setAttribute('data-screen', 'artisan-profile');
        navProfile.setAttribute('href', '#artisan-profile');
      }
      if (navSettings) navSettings.style.display = 'inline-flex';

      if (authLoggedOutGroup) authLoggedOutGroup.style.display = 'none';
      if (authLoggedInGroup) authLoggedInGroup.style.display = 'flex';

      if (userPillName) userPillName.textContent = currentUser.fullName;
      if (userPillId) userPillId.textContent = currentUser.kaziId;
      if (userPillAvatar) {
        userPillAvatar.textContent = currentUser.initials || 'CO';
        userPillAvatar.style.backgroundColor = currentUser.avatarBg || '#0f766e';
      }
      if (userPill) {
        userPill.setAttribute('onclick', "KaziApp.navigateTo('artisan-profile')");
      }
    }

    // Update Mobile Nav Links as well
    renderMobileNav();
  }

  function renderMobileNav() {
    const container = document.getElementById('mobile-nav-links-container');
    if (!container) return;

    const user = KaziStorage.getCurrentUser();
    if (!user) {
      container.innerHTML = `
        <a href="#home" class="mobile-nav-link" data-screen="home">🏠 Home</a>
        <a href="#directory" class="mobile-nav-link" data-screen="directory">🔍 Find Artisans in Abuja</a>
        <a href="#login" class="mobile-nav-link" data-screen="login">🔑 Log In</a>
        <a href="#signup" class="mobile-nav-link highlight" data-screen="signup">✨ Create Account</a>
      `;
    } else if (user.role === 'customer') {
      container.innerHTML = `
        <div class="mobile-nav-user-header">
          <strong>${user.fullName}</strong>
          <span>${user.kaziId}</span>
        </div>
        <a href="#customer-dashboard" class="mobile-nav-link" data-screen="customer-dashboard">📊 Customer Dashboard</a>
        <a href="#directory" class="mobile-nav-link" data-screen="directory">🔍 Find Services</a>
        <a href="#my-jobs" class="mobile-nav-link" data-screen="my-jobs">📋 My Jobs</a>
        <a href="#customer-profile" class="mobile-nav-link" data-screen="customer-profile">👤 My Profile</a>
        <a href="#settings" class="mobile-nav-link" data-screen="settings">⚙️ Settings & Backup</a>
        <button class="mobile-nav-logout-btn" onclick="KaziApp.handleLogout()">🚪 Log Out</button>
      `;
    } else {
      container.innerHTML = `
        <div class="mobile-nav-user-header">
          <strong>${user.fullName}</strong>
          <span>${user.kaziId} · ${user.primaryService || 'Artisan'}</span>
        </div>
        <a href="#artisan-dashboard" class="mobile-nav-link" data-screen="artisan-dashboard">🛠️ Artisan Dashboard</a>
        <a href="#my-jobs" class="mobile-nav-link" data-screen="my-jobs">📋 My Jobs</a>
        <a href="#artisan-profile" class="mobile-nav-link" data-screen="artisan-profile">👤 Professional Profile</a>
        <a href="#settings" class="mobile-nav-link" data-screen="settings">⚙️ Settings & Backup</a>
        <button class="mobile-nav-logout-btn" onclick="KaziApp.handleLogout()">🚪 Log Out</button>
      `;
    }

    container.querySelectorAll('[data-screen]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-screen');
        window.location.hash = target;
        navigateTo(target);
        const drawer = document.getElementById('mobile-nav-drawer');
        if (drawer) drawer.classList.remove('drawer-open');
      });
    });
  }

  /**
   * Home screen render
   */
  function renderHomeComponents() {
    const featuredContainer = document.getElementById('featured-providers-grid');
    if (featuredContainer) {
      const providers = KaziStorage.getProviders().slice(0, 3);
      featuredContainer.innerHTML = providers.map(p => KaziProviders.renderProviderCard(p)).join('');
    }

    const cityLabel = document.getElementById('current-city-label');
    if (cityLabel) {
      cityLabel.textContent = KaziStorage.getCurrentCity();
    }
  }

  function renderCategoriesQuickGrid() {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    const categories = KaziStorage.getCategories();
    container.innerHTML = categories.map(cat => `
      <div class="category-card" onclick="KaziApp.filterByCategoryAndNavigate('${cat.name}')">
        <div class="category-icon-box">
          ${getCategoryIcon(cat.id)}
        </div>
        <h4 class="category-name">${cat.name}</h4>
        <p class="category-meta">${cat.count} verified artisans</p>
      </div>
    `).join('');
  }

  function getCategoryIcon(id) {
    const icons = {
      'electrician': '⚡',
      'plumber': '🔧',
      'mechanic': '🚗',
      'tailor': '✂️',
      'cleaner': '✨',
      'barber': '💈',
      'ac-tech': '❄️',
      'painter': '🎨'
    };
    return icons[id] || '🛠️';
  }

  function filterByCategoryAndNavigate(categoryName) {
    KaziProviders.setCategory(categoryName);
    const catSelect = document.getElementById('filter-category-select');
    if (catSelect) catSelect.value = categoryName;
    window.location.hash = 'directory';
    navigateTo('directory');
  }

  function showProviderProfile(providerId) {
    KaziProviders.renderProviderProfile(providerId);
    showScreen('provider-profile');
    window.location.hash = `provider/${providerId}`;
  }

  function showDirectory() {
    window.location.hash = 'directory';
    navigateTo('directory');
  }

  function showMyJobs() {
    window.location.hash = 'my-jobs';
    navigateTo('my-jobs');
  }

  // --- 1. LOGIN & SIGNUP SCREENS ---

  function renderLoginView() {
    const errorEl = document.getElementById('login-error-alert');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
  }

  function renderSignupView() {
    setSignupRole(signupRole);
    const errorEl = document.getElementById('signup-error-alert');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
  }

  function setSignupRole(role) {
    signupRole = role === 'artisan' ? 'artisan' : 'customer';
    const cusBtn = document.getElementById('signup-role-cus');
    const artBtn = document.getElementById('signup-role-art');
    const artisanFields = document.getElementById('signup-artisan-fields');

    if (signupRole === 'customer') {
      if (cusBtn) cusBtn.classList.add('active');
      if (artBtn) artBtn.classList.remove('active');
      if (artisanFields) artisanFields.style.display = 'none';
    } else {
      if (cusBtn) cusBtn.classList.remove('active');
      if (artBtn) artBtn.classList.add('active');
      if (artisanFields) artisanFields.style.display = 'block';
    }
  }

  function handleLoginSubmit(e) {
    if (e) e.preventDefault();
    const identifier = document.getElementById('login-identifier-input').value.trim();
    const password = document.getElementById('login-password-input').value;
    const errorEl = document.getElementById('login-error-alert');

    if (!identifier || !password) {
      if (errorEl) {
        errorEl.textContent = 'Please enter both your email/phone and password.';
        errorEl.style.display = 'block';
      }
      return;
    }

    const res = KaziStorage.login(identifier, password);
    if (!res.success) {
      if (errorEl) {
        errorEl.textContent = res.message;
        errorEl.style.display = 'block';
      }
      return;
    }

    // Success
    updateRoleUI();
    KaziUI.toast(`Welcome back, ${res.user.fullName}!`, 'success');

    if (res.user.role === 'artisan') {
      window.location.hash = 'artisan-dashboard';
      navigateTo('artisan-dashboard');
    } else {
      window.location.hash = 'customer-dashboard';
      navigateTo('customer-dashboard');
    }
  }

  function handleSignupSubmit(e) {
    if (e) e.preventDefault();
    const errorEl = document.getElementById('signup-error-alert');
    const fullName = document.getElementById('signup-name-input').value.trim();
    const email = document.getElementById('signup-email-input').value.trim();
    const phone = document.getElementById('signup-phone-input').value.trim();
    const city = document.getElementById('signup-city-input').value.trim() || 'Abuja';
    const password = document.getElementById('signup-password-input').value;
    const confirmPassword = document.getElementById('signup-confirm-password-input').value;

    if (!fullName || !email || !phone || !password) {
      if (errorEl) {
        errorEl.textContent = 'Please fill out all required fields.';
        errorEl.style.display = 'block';
      }
      return;
    }

    if (password !== confirmPassword) {
      if (errorEl) {
        errorEl.textContent = 'Passwords do not match. Please re-enter.';
        errorEl.style.display = 'block';
      }
      return;
    }

    const payload = {
      fullName,
      email,
      phone,
      city,
      password,
      role: signupRole
    };

    if (signupRole === 'artisan') {
      const primaryService = document.getElementById('signup-primary-service-select').value;
      const experience = parseInt(document.getElementById('signup-experience-input').value, 10) || 3;
      const priceMin = parseInt(document.getElementById('signup-price-min-input').value, 10) || 15000;
      const priceMax = parseInt(document.getElementById('signup-price-max-input').value, 10) || 35000;
      const serviceAreas = document.getElementById('signup-areas-input').value.split(',').map(s => s.trim()).filter(Boolean);
      const bio = document.getElementById('signup-bio-input').value.trim();

      payload.primaryService = primaryService;
      payload.yearsOfExperience = experience;
      payload.typicalPriceMin = priceMin;
      payload.typicalPriceMax = priceMax;
      payload.serviceAreas = serviceAreas.length ? serviceAreas : ['Wuse II', 'Maitama', 'Garki'];
      payload.bio = bio;
    }

    const res = KaziStorage.register(payload);
    if (!res.success) {
      if (errorEl) {
        errorEl.textContent = res.message;
        errorEl.style.display = 'block';
      }
      return;
    }

    // Success
    updateRoleUI();
    KaziUI.toast(`Welcome to Kazi, ${res.user.fullName}! Your permanent Kazi ID is ${res.user.kaziId}.`, 'success');

    if (res.user.role === 'artisan') {
      window.location.hash = 'artisan-dashboard';
      navigateTo('artisan-dashboard');
    } else {
      window.location.hash = 'customer-dashboard';
      navigateTo('customer-dashboard');
    }
  }

  function handleLogout() {
    KaziStorage.logout();
    updateRoleUI();
    KaziUI.toast('You have successfully logged out of Kazi.', 'info');
    window.location.hash = 'home';
    navigateTo('home');
  }

  function fillDemoCustomer() {
    document.getElementById('login-identifier-input').value = 'customer@kazi.demo';
    document.getElementById('login-password-input').value = 'demo123';
    KaziUI.toast('Filled Vivian Dike (Customer Demo) credentials.', 'info');
  }

  function fillDemoArtisan() {
    document.getElementById('login-identifier-input').value = 'artisan@kazi.demo';
    document.getElementById('login-password-input').value = 'demo123';
    KaziUI.toast('Filled Chinedu Okafor (Artisan Demo) credentials.', 'info');
  }

  // --- 2. CUSTOMER DASHBOARD ---

  function renderCustomerDashboard() {
    const container = document.getElementById('customer-dashboard-content');
    if (!container) return;

    const user = KaziStorage.getCurrentUser();
    if (!user) return;

    const allJobs = KaziJobs.getUserJobs();
    const reviews = KaziStorage.getReviews();

    const activeJobs = allJobs.filter(j => ['requested', 'agreed', 'in-progress'].includes(j.status));
    const completedJobs = allJobs.filter(j => j.status === 'completed');
    
    // Find completed jobs that do NOT yet have a review submitted
    const awaitingReviewJobs = completedJobs.filter(job => !reviews.some(r => r.jobId === job.id));

    // Time-based greeting
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';

    container.innerHTML = `
      <div class="dash-hero-banner">
        <div class="dash-user-meta">
          <div class="dash-user-avatar" style="background-color: ${user.avatarBg || '#047857'};">
            ${user.initials || 'VD'}
          </div>
          <div>
            <h1 class="dash-greeting">${greeting}, ${user.fullName.split(' ')[0]}</h1>
            <div class="dash-kazi-id-row">
              <span class="badge-kazi-id badge-kazi-id-cus"><span class="kazi-id-label">CUSTOMER ID:</span> <strong>${user.kaziId}</strong></span>
              <span class="dash-city-tag">📍 ${user.city || 'Abuja'}</span>
            </div>
          </div>
        </div>

        <div class="dash-quick-cta">
          <button class="btn btn-primary" onclick="KaziApp.showDirectory()">+ Find a Service</button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="dash-stats-grid">
        <div class="dash-stat-card ${activeJobs.length > 0 ? 'highlight-active' : ''}">
          <span class="stat-card-label">Active Jobs</span>
          <strong class="stat-card-num">${activeJobs.length} Active Jobs</strong>
          <span class="stat-card-sub">In progress or agreed on</span>
        </div>

        <div class="dash-stat-card ${awaitingReviewJobs.length > 0 ? 'highlight-amber' : ''}">
          <span class="stat-card-label">Awaiting Your Review</span>
          <strong class="stat-card-num">${awaitingReviewJobs.length} Job${awaitingReviewJobs.length === 1 ? '' : 's'} Awaiting Review</strong>
          <span class="stat-card-sub">Help build trusted records</span>
        </div>

        <div class="dash-stat-card">
          <span class="stat-card-label">Total Completed</span>
          <strong class="stat-card-num">${completedJobs.length} Completed</strong>
          <span class="stat-card-sub">Verified service history</span>
        </div>
      </div>

      <!-- Awaiting Review Callout Banner -->
      ${awaitingReviewJobs.length > 0 ? `
        <div class="awaiting-review-alert-card">
          <div class="alert-icon">★</div>
          <div class="alert-content">
            <h4>You have completed work ready for review</h4>
            <p>Your review for <strong>${awaitingReviewJobs[0].providerName}</strong> (${awaitingReviewJobs[0].serviceName}) helps keep Abuja artisans accountable.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="KaziApp.openReviewModal('${awaitingReviewJobs[0].id}')">
            ★ Submit Review
          </button>
        </div>
      ` : ''}

      <!-- Current Active Jobs -->
      <section class="dash-section">
        <div class="section-header-row">
          <h2 class="dash-section-title">Your Active Agreements</h2>
          <a href="#my-jobs" class="link-more" onclick="KaziApp.showMyJobs()">View all jobs history →</a>
        </div>

        <div class="dash-jobs-list">
          ${activeJobs.length === 0 ? `
            <div class="empty-state-card">
              <p>You have no service agreements in progress right now.</p>
              <button class="btn btn-outline btn-sm" onclick="KaziApp.showDirectory()">Browse Abuja Artisans</button>
            </div>
          ` : activeJobs.map(job => KaziJobs.getTabJobs('active').filter(j => j.id === job.id).map(KaziJobs.renderJobCard || null)).join('') || activeJobs.map(renderMiniJobCard).join('')}
        </div>
      </section>

      <!-- Recently Completed Jobs -->
      ${completedJobs.length > 0 ? `
        <section class="dash-section">
          <h2 class="dash-section-title">Recently Completed Jobs</h2>
          <div class="dash-jobs-list">
            ${completedJobs.slice(0, 2).map(renderMiniJobCard).join('')}
          </div>
        </section>
      ` : ''}
    `;
  }

  function renderMiniJobCard(job) {
    const formattedPrice = KaziUI.formatNaira(job.agreedPrice);
    const formattedDate = KaziUI.formatDate(job.agreedDate);
    const reviews = KaziStorage.getReviews();
    const hasReview = reviews.some(r => r.jobId === job.id);

    return `
      <article class="job-card status-border-${job.status}">
        <div class="job-card-header">
          <div>
            <span class="job-category-tag">${job.category || 'Service'}</span>
            <h3 class="job-card-title">${job.providerName} — ${job.serviceName || 'Custom Service'}</h3>
            <span class="job-card-date">Agreed Date: <strong>${formattedDate}</strong> · Artisan ID: <strong>${job.providerKaziId || 'KZ-ART-000001'}</strong></span>
          </div>
          <div class="job-badge-column">
            ${KaziUI.renderStatusBadge(job.status)}
            <div class="job-agreed-price-box">
              <span class="agreed-label">Agreed Price</span>
              <strong class="agreed-amount">${formattedPrice}</strong>
            </div>
          </div>
        </div>
        <p class="job-card-description">${job.description || 'Agreed service scope.'}</p>
        <div class="job-card-footer">
          <button class="btn btn-text btn-sm" onclick="KaziJobs.viewJobDetails('${job.id}')">View Agreement Details →</button>
          <div class="job-actions-row">
            ${job.status === 'in-progress' ? `
              <button class="btn btn-success btn-sm" onclick="KaziJobs.transitionStatus('${job.id}', 'completed')">✓ Mark Completed</button>
            ` : ''}
            ${job.status === 'completed' && !hasReview ? `
              <button class="btn btn-primary btn-sm" onclick="KaziApp.openReviewModal('${job.id}')">★ Submit Review</button>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  }

  // --- 3. ARTISAN DASHBOARD ---

  function renderArtisanDashboard() {
    const container = document.getElementById('artisan-dashboard-content');
    if (!container) return;

    const user = KaziStorage.getCurrentUser();
    if (!user) return;

    const providerId = user.providerId || 'prv_001';
    const provider = KaziStorage.getProviderById(providerId) || user;
    const allJobs = KaziStorage.getJobs().filter(j => j.providerId === providerId || j.providerKaziId === user.kaziId);
    const reviews = KaziStorage.getReviewsForProvider(providerId);

    const completedJobs = allJobs.filter(j => j.status === 'completed');
    const activeJobs = allJobs.filter(j => ['requested', 'agreed', 'in-progress'].includes(j.status));
    
    // Sum tracked agreed earnings
    const totalEarnings = completedJobs.reduce((acc, j) => acc + (j.agreedPrice || 0), 0);

    // Time-based greeting
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';

    container.innerHTML = `
      <div class="dash-hero-banner">
        <div class="dash-user-meta">
          <div class="dash-user-avatar" style="background-color: ${user.avatarBg || '#0f766e'};">
            ${user.initials || 'CO'}
          </div>
          <div>
            <h1 class="dash-greeting">${greeting}, ${user.fullName.split(' ')[0]}</h1>
            <div class="dash-kazi-id-row">
              <span class="badge-kazi-id badge-kazi-id-art"><span class="kazi-id-label">ARTISAN ID:</span> <strong>${user.kaziId}</strong></span>
              <span class="dash-city-tag">${user.primaryService || provider.category} · ${user.city || 'Abuja'}</span>
            </div>
          </div>
        </div>

        <div class="dash-quick-cta">
          <button class="btn btn-outline" onclick="KaziApp.navigateTo('artisan-profile')">Edit Professional Profile</button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="dash-stats-grid">
        <div class="dash-stat-card">
          <span class="stat-card-label">Customer Rating</span>
          <strong class="stat-card-num">★ ${(provider.rating || 4.8).toFixed(1)} Rating</strong>
          <span class="stat-card-sub">${provider.verifiedReviews || reviews.length} Verified Reviews</span>
        </div>

        <div class="dash-stat-card">
          <span class="stat-card-label">Completed Jobs</span>
          <strong class="stat-card-num">${provider.completedJobs || 47} Completed Jobs</strong>
          <span class="stat-card-sub">Confirmed completions</span>
        </div>

        <div class="dash-stat-card">
          <span class="stat-card-label">Active Agreements</span>
          <strong class="stat-card-num">${activeJobs.length} Active</strong>
          <span class="stat-card-sub">In progress or scheduled</span>
        </div>

        <div class="dash-stat-card highlight-active">
          <span class="stat-card-label">Tracked Agreed Earnings</span>
          <strong class="stat-card-num">${KaziUI.formatNaira(totalEarnings)}</strong>
          <span class="stat-card-sub">Across verified jobs</span>
        </div>
      </div>

      <!-- Active / Scheduled Jobs -->
      <section class="dash-section">
        <div class="section-header-row">
          <h2 class="dash-section-title">Active & Scheduled Jobs</h2>
          <span class="dash-count-badge">${activeJobs.length} active</span>
        </div>

        <div class="dash-jobs-list">
          ${activeJobs.length === 0 ? `
            <div class="empty-state-card">
              <p>You have no active agreements at the moment.</p>
            </div>
          ` : activeJobs.map(job => `
            <article class="job-card status-border-${job.status}">
              <div class="job-card-header">
                <div>
                  <span class="job-category-tag">${job.serviceName || 'Custom Service'}</span>
                  <h3 class="job-card-title">Customer: ${job.customerName || 'Client'}</h3>
                  <div class="job-counterparty-meta">
                    <span class="job-kazi-id-tag">Customer ID: <strong>${job.customerKaziId || 'KZ-CUS-000001'}</strong></span> · 
                    <span class="job-card-date">Date: <strong>${KaziUI.formatDate(job.agreedDate)}</strong></span>
                  </div>
                </div>
                <div class="job-badge-column">
                  ${KaziUI.renderStatusBadge(job.status)}
                  <div class="job-agreed-price-box">
                    <span class="agreed-label">Agreed Price</span>
                    <strong class="agreed-amount">${KaziUI.formatNaira(job.agreedPrice)}</strong>
                  </div>
                </div>
              </div>
              <p class="job-card-description">${job.description || ''}</p>
              ${job.notes ? `<div class="job-notes-snip"><em>Client notes:</em> ${job.notes}</div>` : ''}
              <div class="job-card-footer">
                <button class="btn btn-outline btn-sm" onclick="KaziJobs.viewJobDetails('${job.id}')">View Agreement</button>
                <div class="job-actions-row">
                  ${job.status === 'agreed' ? `
                    <button class="btn btn-primary btn-sm" onclick="KaziJobs.transitionStatus('${job.id}', 'in-progress'); KaziApp.navigateTo('artisan-dashboard');">
                      Start Job
                    </button>
                  ` : ''}
                  ${job.status === 'in-progress' ? `
                    <button class="btn btn-success btn-sm" onclick="KaziJobs.transitionStatus('${job.id}', 'completed'); KaziApp.navigateTo('artisan-dashboard');">
                      ✓ Mark Completed
                    </button>
                  ` : ''}
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      <!-- Recent Customer Reviews -->
      <section class="dash-section">
        <h2 class="dash-section-title">Recent Customer Feedback</h2>
        <div class="dash-reviews-list">
          ${reviews.length === 0 ? `
            <p class="text-muted">No reviews recorded yet.</p>
          ` : reviews.slice(0, 3).map(r => `
            <div class="dash-review-item">
              <div class="dash-rev-header">
                <strong>${r.customerName} (${r.customerKaziId || 'Customer'})</strong>
                ${KaziUI.renderStars(r.rating)}
              </div>
              <p class="dash-rev-comment">"${r.reviewText}"</p>
              <div class="dash-rev-checks">
                <span>${r.arrivedAsAgreed ? '✓ Arrived as agreed' : '✕ Arrived late'}</span> · 
                <span>${r.priceAsAgreed ? '✓ Agreed price respected' : '✕ Price changed'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  // --- 4. CUSTOMER PROFILE (VIEW & EDIT) ---

  function renderCustomerProfile() {
    const user = KaziStorage.getCurrentUser();
    if (!user) return;

    document.getElementById('cus-profile-kazi-id').textContent = user.kaziId;
    document.getElementById('cus-profile-avatar').textContent = user.initials || 'VD';
    document.getElementById('cus-profile-header-name').textContent = user.fullName;
    document.getElementById('cus-profile-name-input').value = user.fullName;
    document.getElementById('cus-profile-email-input').value = user.email;
    document.getElementById('cus-profile-phone-input').value = user.phone;
    document.getElementById('cus-profile-city-input').value = user.city || 'Abuja';
    document.getElementById('cus-profile-address-input').value = user.address || '';
    document.getElementById('cus-profile-contact-select').value = user.preferredContact || 'Phone';
  }

  function handleCustomerProfileSubmit(e) {
    if (e) e.preventDefault();
    const user = KaziStorage.getCurrentUser();
    if (!user) return;

    const fullName = document.getElementById('cus-profile-name-input').value.trim();
    const email = document.getElementById('cus-profile-email-input').value.trim();
    const phone = document.getElementById('cus-profile-phone-input').value.trim();
    const city = document.getElementById('cus-profile-city-input').value.trim();
    const address = document.getElementById('cus-profile-address-input').value.trim();
    const preferredContact = document.getElementById('cus-profile-contact-select').value;

    if (!fullName || !email || !phone) {
      KaziUI.toast('Please provide your name, email, and phone number.', 'warning');
      return;
    }

    const updated = KaziStorage.updateUser(user.id, {
      fullName,
      email,
      phone,
      city,
      address,
      preferredContact
    });

    if (updated) {
      updateRoleUI();
      renderCustomerProfile();
      KaziUI.toast('Profile saved! Updated across your Kazi account.', 'success');
    }
  }

  // --- 5. ARTISAN PROFILE (VIEW & EDIT) ---

  function renderArtisanProfile() {
    const user = KaziStorage.getCurrentUser();
    if (!user) return;

    const providerId = user.providerId || 'prv_001';
    const provider = KaziStorage.getProviderById(providerId) || user;

    document.getElementById('art-profile-kazi-id').textContent = user.kaziId;
    document.getElementById('art-profile-avatar').textContent = user.initials || 'CO';
    document.getElementById('art-profile-header-name').textContent = user.fullName;
    document.getElementById('art-profile-header-trade').textContent = user.primaryService || provider.category;

    // Personal & Private Information
    document.getElementById('art-profile-name-input').value = user.fullName;
    document.getElementById('art-profile-email-input').value = user.email;
    document.getElementById('art-profile-phone-input').value = user.phone;
    document.getElementById('art-profile-city-input').value = user.city || 'Abuja';

    // Professional & Public Information
    document.getElementById('art-profile-trade-select').value = user.primaryService || provider.category || 'Electrician';
    document.getElementById('art-profile-exp-input').value = user.yearsOfExperience || provider.yearsOfExperience || 8;
    document.getElementById('art-profile-avail-select').value = user.availability || provider.availability || 'Available Today';
    document.getElementById('art-profile-min-price-input').value = user.typicalPriceMin || provider.typicalPriceMin || 25000;
    document.getElementById('art-profile-max-price-input').value = user.typicalPriceMax || provider.typicalPriceMax || 40000;
    document.getElementById('art-profile-areas-input').value = (user.serviceAreas || provider.serviceAreas || []).join(', ');
    document.getElementById('art-profile-services-input').value = (user.services || provider.services || []).join(', ');
    document.getElementById('art-profile-bio-input').value = user.bio || provider.bio || '';
  }

  function handleArtisanProfileSubmit(e) {
    if (e) e.preventDefault();
    const user = KaziStorage.getCurrentUser();
    if (!user) return;

    const fullName = document.getElementById('art-profile-name-input').value.trim();
    const email = document.getElementById('art-profile-email-input').value.trim();
    const phone = document.getElementById('art-profile-phone-input').value.trim();
    const city = document.getElementById('art-profile-city-input').value.trim();
    const primaryService = document.getElementById('art-profile-trade-select').value;
    const yearsOfExperience = parseInt(document.getElementById('art-profile-exp-input').value, 10) || 5;
    const availability = document.getElementById('art-profile-avail-select').value;
    const typicalPriceMin = parseInt(document.getElementById('art-profile-min-price-input').value, 10) || 20000;
    const typicalPriceMax = parseInt(document.getElementById('art-profile-max-price-input').value, 10) || 40000;
    const serviceAreas = document.getElementById('art-profile-areas-input').value.split(',').map(s => s.trim()).filter(Boolean);
    const services = document.getElementById('art-profile-services-input').value.split(',').map(s => s.trim()).filter(Boolean);
    const bio = document.getElementById('art-profile-bio-input').value.trim();

    if (!fullName || !email || !phone) {
      KaziUI.toast('Please provide your name, email, and phone.', 'warning');
      return;
    }

    const updated = KaziStorage.updateUser(user.id, {
      fullName,
      email,
      phone,
      city,
      primaryService,
      yearsOfExperience,
      availability,
      typicalPriceMin,
      typicalPriceMax,
      serviceAreas,
      services,
      bio
    });

    if (updated) {
      updateRoleUI();
      renderArtisanProfile();
      KaziUI.toast('Professional profile & public directory listing updated!', 'success');
    }
  }

  // --- 6. SETTINGS VIEW ---

  function renderSettingsView() {
    // Show current user info in settings
    const user = KaziStorage.getCurrentUser();
    const userSummaryEl = document.getElementById('settings-current-user-info');
    if (userSummaryEl && user) {
      userSummaryEl.innerHTML = `
        <div class="settings-user-badge">
          <div class="user-avatar-sm" style="background-color: ${user.avatarBg || '#047857'};">
            ${user.initials || 'VD'}
          </div>
          <div>
            <strong>${user.fullName}</strong>
            <span class="user-kazi-id">${user.kaziId} · ${user.role === 'artisan' ? 'Service Provider' : 'Customer'}</span>
          </div>
        </div>
      `;
    }
  }

  // --- 7. CREATE JOB MODAL WORKFLOW ---

  function openCreateJobModal(providerId = null) {
    if (!KaziStorage.isAuthenticated()) {
      KaziUI.toast('Please log in or create an account to agree on a job.', 'warning');
      window.location.hash = 'login';
      navigateTo('login');
      return;
    }

    const providers = KaziStorage.getProviders();
    const providerSelect = document.getElementById('job-provider-select');
    const modal = document.getElementById('create-job-modal');
    if (!modal) return;

    // Populate providers dropdown
    providerSelect.innerHTML = providers.map(p => 
      `<option value="${p.id}" ${p.id === providerId ? 'selected' : ''}>${p.name} (${p.category} · ${p.city} · ${p.kaziId || 'KZ-ART'})</option>`
    ).join('');

    const selectedId = providerId || providers[0]?.id;
    updateServiceOptions(selectedId);

    const dateInput = document.getElementById('job-date-input');
    if (dateInput && !dateInput.value) {
      dateInput.value = '2026-10-04'; // October 4 benchmark
    }

    const selectedProvider = KaziStorage.getProviderById(selectedId);
    const priceInput = document.getElementById('job-price-input');
    if (priceInput && selectedProvider) {
      if (selectedProvider.id === 'prv_001') {
        priceInput.value = '32000';
      } else {
        priceInput.value = selectedProvider.typicalPriceMin || '25000';
      }
    }

    KaziUI.openModal('create-job-modal');
  }

  function updateServiceOptions(providerId) {
    const provider = KaziStorage.getProviderById(providerId);
    const serviceSelect = document.getElementById('job-service-select');
    if (!serviceSelect || !provider) return;

    const services = provider.services || [provider.category + ' Service'];
    serviceSelect.innerHTML = services.map(s => 
      `<option value="${s}">${s}</option>`
    ).join('') + `<option value="Other / Custom Repair">Other / Custom Repair</option>`;
  }

  function handleCreateJobSubmit(e) {
    if (e) e.preventDefault();

    const providerId = document.getElementById('job-provider-select').value;
    const serviceName = document.getElementById('job-service-select').value;
    const agreedPrice = parseInt(document.getElementById('job-price-input').value, 10);
    const agreedDate = document.getElementById('job-date-input').value;
    const description = document.getElementById('job-description-input').value.trim();
    const notes = document.getElementById('job-notes-input').value.trim();

    if (!providerId) {
      KaziUI.toast('Please select a service provider.', 'warning');
      return;
    }
    if (isNaN(agreedPrice) || agreedPrice <= 0) {
      KaziUI.toast('Please enter a valid agreed price in Naira.', 'warning');
      return;
    }
    if (!agreedDate) {
      KaziUI.toast('Please specify the agreed service date.', 'warning');
      return;
    }
    if (!description) {
      KaziUI.toast('Please enter a brief description of the job.', 'warning');
      return;
    }

    const provider = KaziStorage.getProviderById(providerId);
    const currentUser = KaziStorage.getCurrentUser();

    KaziStorage.createJob({
      customerId: currentUser?.id || 'usr_customer_01',
      customerName: currentUser?.fullName || 'Vivian Dike',
      customerKaziId: currentUser?.kaziId || 'KZ-CUS-000001',
      providerId: provider.id,
      providerName: provider.name,
      providerKaziId: provider.kaziId || 'KZ-ART-000001',
      category: provider.category,
      serviceName: serviceName,
      description: description,
      agreedPrice: agreedPrice,
      agreedDate: agreedDate,
      status: 'agreed',
      notes: notes
    });

    KaziUI.closeModal('create-job-modal');
    KaziUI.toast(`Job agreement created with ${provider.name} for ${KaziUI.formatNaira(agreedPrice)} on ${KaziUI.formatDate(agreedDate)}.`, 'success');

    // Reset form fields
    document.getElementById('job-description-input').value = '';
    document.getElementById('job-notes-input').value = '';

    window.location.hash = 'my-jobs';
    navigateTo('my-jobs');
  }

  function openReviewModal(jobId) {
    if (!KaziStorage.isAuthenticated()) {
      KaziUI.toast('Please log in to submit a verified review.', 'warning');
      window.location.hash = 'login';
      navigateTo('login');
      return;
    }
    KaziReviews.openReviewModalForJob(jobId);
  }

  // --- 8. GLOBAL EVENT BINDINGS ---

  function bindEvents() {
    // Navigation links
    document.querySelectorAll('[data-screen]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetScreen = el.getAttribute('data-screen');
        window.location.hash = targetScreen;
        navigateTo(targetScreen);
      });
    });

    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Sign Up Form Submit
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', handleSignupSubmit);
    }

    // Customer Profile Form Submit
    const cusProfileForm = document.getElementById('customer-profile-form');
    if (cusProfileForm) {
      cusProfileForm.addEventListener('submit', handleCustomerProfileSubmit);
    }

    // Artisan Profile Form Submit
    const artProfileForm = document.getElementById('artisan-profile-form');
    if (artProfileForm) {
      artProfileForm.addEventListener('submit', handleArtisanProfileSubmit);
    }

    // Sign Up Role Toggle Buttons
    const cusRoleBtn = document.getElementById('signup-role-cus');
    const artRoleBtn = document.getElementById('signup-role-art');
    if (cusRoleBtn) cusRoleBtn.addEventListener('click', () => setSignupRole('customer'));
    if (artRoleBtn) artRoleBtn.addEventListener('click', () => setSignupRole('artisan'));

    // Create Job provider change listener
    const provSelect = document.getElementById('job-provider-select');
    if (provSelect) {
      provSelect.addEventListener('change', (e) => {
        updateServiceOptions(e.target.value);
        const p = KaziStorage.getProviderById(e.target.value);
        if (p) {
          const priceInput = document.getElementById('job-price-input');
          if (priceInput) priceInput.value = p.typicalPriceMin || 20000;
        }
      });
    }

    // Create Job submit
    const createJobForm = document.getElementById('create-job-form');
    if (createJobForm) {
      createJobForm.addEventListener('submit', handleCreateJobSubmit);
    }

    // Review submit
    const reviewForm = document.getElementById('submit-review-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        KaziReviews.submitReview();
      });
    }

    // Issue submit
    const issueForm = document.getElementById('report-issue-form');
    if (issueForm) {
      issueForm.addEventListener('submit', (e) => {
        e.preventDefault();
        KaziJobs.submitIssueReport();
      });
    }

    // Star picker buttons in review form
    document.querySelectorAll('.star-picker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-value');
        KaziReviews.setFormRating(val);
      });
    });

    // Search and filtering inputs in Directory
    const searchInput = document.getElementById('search-providers-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        KaziProviders.setSearch(e.target.value);
        KaziProviders.renderProvidersList();
      });
    }

    const catSelect = document.getElementById('filter-category-select');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        KaziProviders.setCategory(e.target.value);
        KaziProviders.renderProvidersList();
      });
    }

    const areaSelect = document.getElementById('filter-area-select');
    if (areaSelect) {
      areaSelect.addEventListener('change', (e) => {
        KaziProviders.setArea(e.target.value);
        KaziProviders.renderProvidersList();
      });
    }

    const sortSelect = document.getElementById('sort-providers-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        KaziProviders.setSortBy(e.target.value);
        KaziProviders.renderProvidersList();
      });
    }

    // Export Data Button
    const exportBtn = document.getElementById('btn-export-json');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const success = KaziStorage.exportData();
        if (success) {
          KaziUI.toast('Backup JSON exported successfully with user accounts & Kazi IDs.', 'success');
        } else {
          KaziUI.toast('Failed to export data.', 'error');
        }
      });
    }

    // Import Data File Input
    const importInput = document.getElementById('import-file-input');
    if (importInput) {
      importInput.addEventListener('change', handleImportFileSelected);
    }

    // Reset Data Button
    const resetBtn = document.getElementById('btn-reset-seed');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all jobs, reviews, and providers to default Abuja demo data? This cannot be undone.')) {
          KaziStorage.resetToSeed();
          KaziUI.toast('Application state reset to clean Abuja seed data.', 'info');
          setTimeout(() => {
            window.location.reload();
          }, 600);
        }
      });
    }

    // Mobile nav hamburger toggle
    const hamburgerBtn = document.getElementById('mobile-hamburger-btn');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    if (hamburgerBtn && mobileNavDrawer) {
      hamburgerBtn.addEventListener('click', () => {
        mobileNavDrawer.classList.toggle('drawer-open');
      });
    }
  }

  function handleImportFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const parsed = JSON.parse(event.target.result);
        const validation = KaziStorage.validateBackupData(parsed);

        if (!validation.valid) {
          KaziUI.toast(`Invalid backup file: ${validation.message}`, 'error');
          e.target.value = '';
          return;
        }

        const confirmRestore = confirm(
          `Valid Kazi backup found!\n\nContains:\n• ${parsed.providers.length} providers\n• ${parsed.jobs.length} jobs\n• ${parsed.reviews.length} reviews\n• ${parsed.users ? parsed.users.length : 'N/A'} user accounts\n\nDo you want to restore this data? Existing browser data will be replaced.`
        );

        if (confirmRestore) {
          const res = KaziStorage.importData(parsed);
          if (res.success) {
            KaziUI.toast('Data restored successfully from backup!', 'success');
            setTimeout(() => {
              window.location.reload();
            }, 600);
          } else {
            KaziUI.toast(`Restore failed: ${res.message}`, 'error');
          }
        }
      } catch (err) {
        KaziUI.toast('Could not parse JSON file. Please check file format.', 'error');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  return {
    init,
    navigateTo,
    showProviderProfile,
    showDirectory,
    showMyJobs,
    filterByCategoryAndNavigate,
    openCreateJobModal,
    openReviewModal,
    handleLogout,
    fillDemoCustomer,
    fillDemoArtisan,
    setSignupRole
  };
})();

// Bootstrap on DOM Content Loaded
document.addEventListener('DOMContentLoaded', KaziApp.init);
