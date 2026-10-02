/**
 * KAZI - Storage Module
 * Manages LocalStorage persistence, seed data initialization,
 * and JSON import/export with structural validation.
 */

const KaziStorage = (function() {
  const PREFIX = 'kazi_';
  const KEYS = {
    INITIALIZED: PREFIX + 'initialized_v1',
    PROVIDERS: PREFIX + 'providers',
    JOBS: PREFIX + 'jobs',
    REVIEWS: PREFIX + 'reviews',
    USERS: PREFIX + 'users',
    CATEGORIES: PREFIX + 'categories',
    CITIES: PREFIX + 'cities',
    CURRENT_CITY: PREFIX + 'current_city',
    CURRENT_ROLE: PREFIX + 'current_role', // 'customer' or 'provider'
    CURRENT_USER_ID: PREFIX + 'current_user_id'
  };

  /**
   * Initializes storage with default seed data if not yet initialized.
   */
  function init() {
    try {
      const isInitialized = localStorage.getItem(KEYS.INITIALIZED);
      if (!isInitialized) {
        resetToSeed();
      }
    } catch (e) {
      console.error('LocalStorage unavailable or quota exceeded:', e);
    }
  }

  /**
   * Hard reset back to clean Abuja seed data
   */
  function resetToSeed() {
    try {
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      localStorage.setItem(KEYS.PROVIDERS, JSON.stringify(KAZI_SEED_DATA.providers));
      localStorage.setItem(KEYS.JOBS, JSON.stringify(KAZI_SEED_DATA.jobs));
      localStorage.setItem(KEYS.REVIEWS, JSON.stringify(KAZI_SEED_DATA.reviews));
      localStorage.setItem(KEYS.USERS, JSON.stringify(KAZI_SEED_DATA.users));
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(KAZI_SEED_DATA.categories));
      localStorage.setItem(KEYS.CITIES, JSON.stringify(KAZI_SEED_DATA.cities));
      localStorage.setItem(KEYS.CURRENT_CITY, 'Abuja');
      localStorage.setItem(KEYS.CURRENT_ROLE, 'customer');
      localStorage.setItem(KEYS.CURRENT_USER_ID, 'usr_customer_01');
      return true;
    } catch (e) {
      console.error('Failed to reset to seed data:', e);
      return false;
    }
  }

  // --- GENERIC GET / SET HELPERS ---
  function get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
      return false;
    }
  }

  // --- ENTITY SPECIFIC ACCESSORS ---
  function getProviders() {
    return get(KEYS.PROVIDERS, []);
  }

  function setProviders(providers) {
    return set(KEYS.PROVIDERS, providers);
  }

  function getProviderById(id) {
    const list = getProviders();
    return list.find(p => p.id === id) || null;
  }

  function updateProvider(id, updates) {
    const list = getProviders();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      setProviders(list);
      return list[idx];
    }
    return null;
  }

  function getJobs() {
    return get(KEYS.JOBS, []);
  }

  function setJobs(jobs) {
    return set(KEYS.JOBS, jobs);
  }

  function getJobById(id) {
    const list = getJobs();
    return list.find(j => j.id === id) || null;
  }

  function createJob(jobData) {
    const list = getJobs();
    const newJob = {
      id: 'job_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      status: 'agreed', // standard flow: agreed upon creation
      issue: null,
      completedAt: null,
      ...jobData
    };
    list.unshift(newJob);
    setJobs(list);
    return newJob;
  }

  function updateJob(id, updates) {
    const list = getJobs();
    const idx = list.findIndex(j => j.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      setJobs(list);
      return list[idx];
    }
    return null;
  }

  function getReviews() {
    return get(KEYS.REVIEWS, []);
  }

  function setReviews(reviews) {
    return set(KEYS.REVIEWS, reviews);
  }

  function getReviewsForProvider(providerId) {
    const list = getReviews();
    return list.filter(r => r.providerId === providerId);
  }

  function createReview(reviewData) {
    const reviews = getReviews();
    const newReview = {
      id: 'rev_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      verified: true, // only created for completed Kazi jobs
      ...reviewData
    };
    reviews.unshift(newReview);
    setReviews(reviews);

    // Recalculate provider rating and review/completed counts
    const provider = getProviderById(reviewData.providerId);
    if (provider) {
      const providerReviews = reviews.filter(r => r.providerId === reviewData.providerId);
      const sum = providerReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
      const avg = (sum / providerReviews.length).toFixed(1);
      
      updateProvider(provider.id, {
        rating: parseFloat(avg),
        verifiedReviews: providerReviews.length,
        completedJobs: Math.max(provider.completedJobs || 0, providerReviews.length)
      });
    }

    return newReview;
  }

  function getUsers() {
    return get(KEYS.USERS, []);
  }

  function getUserById(id) {
    const list = getUsers();
    return list.find(u => u.id === id) || null;
  }

  function getCurrentUser() {
    const userId = get(KEYS.CURRENT_USER_ID, 'usr_customer_01');
    return getUserById(userId) || (getUsers()[0] || null);
  }

  function getCurrentRole() {
    return get(KEYS.CURRENT_ROLE, 'customer');
  }

  function setCurrentRole(role, userId) {
    set(KEYS.CURRENT_ROLE, role);
    if (userId) {
      set(KEYS.CURRENT_USER_ID, userId);
    }
  }

  function getCurrentCity() {
    return get(KEYS.CURRENT_CITY, 'Abuja');
  }

  function setCurrentCity(cityName) {
    set(KEYS.CURRENT_CITY, cityName);
  }

  function getCategories() {
    return get(KEYS.CATEGORIES, KAZI_SEED_DATA.categories);
  }

  function getCities() {
    return get(KEYS.CITIES, KAZI_SEED_DATA.cities);
  }

  // --- JSON BACKUP & RESTORE ---

  /**
   * Generates a downloadable JSON file containing all application data
   */
  function exportData() {
    try {
      const payload = {
        app: 'Kazi',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        currentCity: getCurrentCity(),
        currentRole: getCurrentRole(),
        currentUserId: get(KEYS.CURRENT_USER_ID),
        providers: getProviders(),
        jobs: getJobs(),
        reviews: getReviews(),
        users: getUsers(),
        categories: getCategories()
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `kazi-backup-${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    } catch (e) {
      console.error('Failed to export data:', e);
      return false;
    }
  }

  /**
   * Validates structure of candidate imported JSON
   */
  function validateBackupData(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, message: 'Invalid JSON file content.' };
    }
    if (!Array.isArray(data.providers) || data.providers.length === 0) {
      return { valid: false, message: 'Missing or empty "providers" array in backup file.' };
    }
    if (!Array.isArray(data.jobs)) {
      return { valid: false, message: 'Missing "jobs" array in backup file.' };
    }
    if (!Array.isArray(data.reviews)) {
      return { valid: false, message: 'Missing "reviews" array in backup file.' };
    }
    // Check at least one provider has required fields
    const p1 = data.providers[0];
    if (!p1.id || !p1.name || !p1.category) {
      return { valid: false, message: 'Providers list format is incompatible.' };
    }
    return { valid: true };
  }

  /**
   * Restores data from validated JSON object
   */
  function importData(data) {
    const validation = validateBackupData(data);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    try {
      set(KEYS.INITIALIZED, 'true');
      set(KEYS.PROVIDERS, data.providers);
      set(KEYS.JOBS, data.jobs);
      set(KEYS.REVIEWS, data.reviews);
      if (data.users && Array.isArray(data.users)) set(KEYS.USERS, data.users);
      if (data.categories && Array.isArray(data.categories)) set(KEYS.CATEGORIES, data.categories);
      if (data.currentCity) set(KEYS.CURRENT_CITY, data.currentCity);
      if (data.currentRole) set(KEYS.CURRENT_ROLE, data.currentRole);
      if (data.currentUserId) set(KEYS.CURRENT_USER_ID, data.currentUserId);
      return { success: true };
    } catch (e) {
      console.error('Error during data import:', e);
      return { success: false, message: 'An error occurred while writing data to LocalStorage.' };
    }
  }

  return {
    init,
    resetToSeed,
    getProviders,
    setProviders,
    getProviderById,
    updateProvider,
    getJobs,
    setJobs,
    getJobById,
    createJob,
    updateJob,
    getReviews,
    setReviews,
    getReviewsForProvider,
    createReview,
    getUsers,
    getUserById,
    getCurrentUser,
    getCurrentRole,
    setCurrentRole,
    getCurrentCity,
    setCurrentCity,
    getCategories,
    getCities,
    exportData,
    validateBackupData,
    importData
  };
})();
