/**
 * KAZI - Storage Module
 * Manages LocalStorage persistence, seed data initialization,
 * user authentication, permanent Kazi IDs, non-destructive migration,
 * profile synchronization, and JSON import/export.
 */

const KaziStorage = (function() {
  const PREFIX = 'kazi_';
  const KEYS = {
    INITIALIZED: PREFIX + 'initialized_v2',
    PROVIDERS: PREFIX + 'providers',
    JOBS: PREFIX + 'jobs',
    REVIEWS: PREFIX + 'reviews',
    USERS: PREFIX + 'users',
    CATEGORIES: PREFIX + 'categories',
    CITIES: PREFIX + 'cities',
    CURRENT_CITY: PREFIX + 'current_city',
    ACTIVE_USER_ID: PREFIX + 'active_user_id',
    COUNTER_CUS: PREFIX + 'counter_cus',
    COUNTER_ART: PREFIX + 'counter_art',
    ID_REGISTRY: PREFIX + 'id_registry'
  };

  /**
   * Initializes storage with default seed data and runs data migration if needed.
   */
  function init() {
    try {
      const isInitialized = localStorage.getItem(KEYS.INITIALIZED);
      if (!isInitialized) {
        resetToSeed();
      } else {
        runMigration();
      }
    } catch (e) {
      console.error('LocalStorage unavailable or quota exceeded:', e);
    }
  }

  /**
   * Non-destructive migration to ensure all existing records have permanent Kazi IDs,
   * proper authentication roles, and synchronized accounts.
   */
  function runMigration() {
    try {
      let users = get(KEYS.USERS, []);
      let providers = get(KEYS.PROVIDERS, []);
      let registry = get(KEYS.ID_REGISTRY, []);
      let cusCounter = get(KEYS.COUNTER_CUS, 1);
      let artCounter = get(KEYS.COUNTER_ART, 24);

      let usersModified = false;
      let providersModified = false;

      // Ensure demo customer Vivian Dike exists
      let demoCustomer = users.find(u => u.email === 'customer@kazi.demo' || u.id === 'usr_customer_01');
      if (!demoCustomer) {
        users.push(KAZI_SEED_DATA.users[0]);
        usersModified = true;
      } else {
        if (!demoCustomer.kaziId) {
          demoCustomer.kaziId = 'KZ-CUS-000001';
          usersModified = true;
        }
        if (!demoCustomer.password) {
          demoCustomer.password = 'demo123';
          usersModified = true;
        }
      }

      // Ensure demo artisan Chinedu Okafor exists
      let demoArtisan = users.find(u => u.email === 'artisan@kazi.demo' || u.id === 'usr_provider_01');
      if (!demoArtisan) {
        users.push(KAZI_SEED_DATA.users[1]);
        usersModified = true;
      } else {
        if (!demoArtisan.kaziId) {
          demoArtisan.kaziId = 'KZ-ART-000001';
          usersModified = true;
        }
        if (!demoArtisan.password) {
          demoArtisan.password = 'demo123';
          usersModified = true;
        }
      }

      // Ensure all users have a kaziId and register it
      users.forEach(u => {
        if (!u.role) u.role = 'customer';
        if (!u.kaziId) {
          if (u.role === 'artisan') {
            artCounter++;
            u.kaziId = `KZ-ART-${String(artCounter).padStart(6, '0')}`;
          } else {
            cusCounter++;
            u.kaziId = `KZ-CUS-${String(cusCounter).padStart(6, '0')}`;
          }
          usersModified = true;
        }
        if (!registry.includes(u.kaziId)) {
          registry.push(u.kaziId);
        }
      });

      // Ensure all providers have a kaziId matching their profile
      providers.forEach((p, idx) => {
        if (!p.kaziId) {
          const num = idx + 1;
          p.kaziId = `KZ-ART-${String(num).padStart(6, '0')}`;
          providersModified = true;
        }
        if (!p.yearsOfExperience) {
          p.yearsOfExperience = 7;
          providersModified = true;
        }
        if (!registry.includes(p.kaziId)) {
          registry.push(p.kaziId);
        }
      });

      if (usersModified) set(KEYS.USERS, users);
      if (providersModified) set(KEYS.PROVIDERS, providers);
      set(KEYS.ID_REGISTRY, registry);
      set(KEYS.COUNTER_CUS, Math.max(cusCounter, 1));
      set(KEYS.COUNTER_ART, Math.max(artCounter, 24));

      // If active user is missing or invalid, default to demo customer Vivian
      const activeId = get(KEYS.ACTIVE_USER_ID, null);
      if (activeId && !users.find(u => u.id === activeId)) {
        set(KEYS.ACTIVE_USER_ID, 'usr_customer_01');
      }
    } catch (e) {
      console.error('Migration error:', e);
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
      localStorage.setItem(KEYS.CURRENT_CITY, JSON.stringify('Abuja'));
      localStorage.setItem(KEYS.ACTIVE_USER_ID, JSON.stringify('usr_customer_01')); // Default logged in as Vivian Dike
      localStorage.setItem(KEYS.COUNTER_CUS, JSON.stringify(1));
      localStorage.setItem(KEYS.COUNTER_ART, JSON.stringify(24));

      // Initialize registry with all seed IDs
      const seedIds = ['KZ-CUS-000001'];
      for (let i = 1; i <= 24; i++) {
        seedIds.push(`KZ-ART-${String(i).padStart(6, '0')}`);
      }
      localStorage.setItem(KEYS.ID_REGISTRY, JSON.stringify(seedIds));
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
      if (item === null || item === undefined) return defaultValue;
      try {
        return JSON.parse(item);
      } catch (err) {
        // Fallback for unquoted raw string values
        return item;
      }
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

  // --- UNIQUE PERMANENT KAZI ID GENERATOR ---
  /**
   * Generates a permanent unique Kazi ID:
   * Customer: KZ-CUS-000001
   * Artisan: KZ-ART-000001
   * IDs are tracked in a persistent registry and never reused even if accounts are removed.
   */
  function generateKaziId(role = 'customer') {
    const isArtisan = role === 'artisan';
    const counterKey = isArtisan ? KEYS.COUNTER_ART : KEYS.COUNTER_CUS;
    const prefix = isArtisan ? 'KZ-ART-' : 'KZ-CUS-';

    let counter = get(counterKey, isArtisan ? 24 : 1);
    let registry = get(KEYS.ID_REGISTRY, []);

    let nextId = '';
    do {
      counter++;
      nextId = `${prefix}${String(counter).padStart(6, '0')}`;
    } while (registry.includes(nextId));

    // Update persistent counter and registry
    registry.push(nextId);
    set(counterKey, counter);
    set(KEYS.ID_REGISTRY, registry);

    return nextId;
  }

  // --- AUTHENTICATION & USER MANAGEMENT ---

  function getUsers() {
    return get(KEYS.USERS, []);
  }

  function setUsers(users) {
    return set(KEYS.USERS, users);
  }

  function getUserById(id) {
    if (!id) return null;
    const list = getUsers();
    return list.find(u => u.id === id) || null;
  }

  function getUserByKaziId(kaziId) {
    if (!kaziId) return null;
    const list = getUsers();
    return list.find(u => u.kaziId === kaziId) || null;
  }

  function getUserByEmailOrPhone(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const list = getUsers();
    return list.find(u => 
      (u.email && u.email.toLowerCase() === clean) ||
      (u.phone && u.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, ''))
    ) || null;
  }

  function getCurrentUser() {
    const activeId = get(KEYS.ACTIVE_USER_ID, null);
    if (!activeId) return null;
    return getUserById(activeId);
  }

  function isAuthenticated() {
    return getCurrentUser() !== null;
  }

  function getCurrentRole() {
    const user = getCurrentUser();
    return user ? user.role : 'guest';
  }

  /**
   * Logs in a user with email/phone and password
   */
  function login(identifier, password) {
    const user = getUserByEmailOrPhone(identifier);
    if (!user) {
      return { success: false, message: 'No account found with this email or phone number.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    // Set active session
    set(KEYS.ACTIVE_USER_ID, user.id);
    return { success: true, user };
  }

  /**
   * Registers a new Customer or Artisan account
   */
  function register(userData) {
    const { fullName, email, phone, password, role } = userData;

    // Check uniqueness
    if (getUserByEmailOrPhone(email)) {
      return { success: false, message: 'An account with this email address already exists.' };
    }
    if (phone && getUserByEmailOrPhone(phone)) {
      return { success: false, message: 'An account with this phone number already exists.' };
    }

    const assignedRole = role === 'artisan' ? 'artisan' : 'customer';
    const newKaziId = generateKaziId(assignedRole);
    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);

    const newUser = {
      id: userId,
      kaziId: newKaziId,
      role: assignedRole,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      password: password,
      city: userData.city || 'Abuja',
      address: userData.address || '',
      preferredContact: userData.preferredContact || 'Phone',
      avatarBg: assignedRole === 'artisan' ? '#0f766e' : '#047857',
      initials: fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (assignedRole === 'artisan') {
      const providerId = 'prv_' + Date.now().toString(36);
      newUser.providerId = providerId;
      newUser.primaryService = userData.primaryService || 'General Repair';
      newUser.services = Array.isArray(userData.services) ? userData.services : [newUser.primaryService];
      newUser.serviceAreas = Array.isArray(userData.serviceAreas) ? userData.serviceAreas : ['Wuse II', 'Maitama', 'Garki'];
      newUser.bio = userData.bio || `Professional ${newUser.primaryService} in Abuja. Committed to quality service and agreed pricing.`;
      newUser.yearsOfExperience = Number(userData.yearsOfExperience) || 1;
      newUser.typicalPriceMin = Number(userData.typicalPriceMin) || 15000;
      newUser.typicalPriceMax = Number(userData.typicalPriceMax) || 35000;
      newUser.availability = userData.availability || 'Available Today';
      newUser.rating = 5.0;
      newUser.completedJobs = 0;
      newUser.verifiedReviews = 0;
      newUser.isVerifiedIdentity = false;

      // Add corresponding public provider entry
      const providers = getProviders();
      providers.unshift({
        id: providerId,
        kaziId: newKaziId,
        userId: userId,
        name: newUser.fullName,
        category: newUser.primaryService,
        city: newUser.city,
        serviceAreas: newUser.serviceAreas,
        bio: newUser.bio,
        phone: newUser.phone,
        rating: 5.0,
        completedJobs: 0,
        verifiedReviews: 0,
        yearsOfExperience: newUser.yearsOfExperience,
        typicalPriceMin: newUser.typicalPriceMin,
        typicalPriceMax: newUser.typicalPriceMax,
        availability: newUser.availability,
        isVerifiedIdentity: false,
        initials: newUser.initials,
        avatarBg: newUser.avatarBg,
        services: newUser.services,
        createdAt: newUser.createdAt
      });
      setProviders(providers);
    }

    const users = getUsers();
    users.push(newUser);
    setUsers(users);

    // Automatically set as active session
    set(KEYS.ACTIVE_USER_ID, newUser.id);
    return { success: true, user: newUser };
  }

  function logout() {
    set(KEYS.ACTIVE_USER_ID, null);
    return { success: true };
  }

  /**
   * Updates an existing user's profile and synchronizes changes across provider
   * listings and job records. Preserves immutable permanent Kazi ID and created date.
   */
  function updateUser(userId, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;

    const existing = users[idx];

    // Protect permanent fields
    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      kaziId: existing.kaziId, // NEVER MUTATE PERMANENT KAZI ID
      role: existing.role,     // Role remains fixed
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };

    if (updates.fullName) {
      updated.initials = updates.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }

    users[idx] = updated;
    setUsers(users);

    // If artisan, synchronize with public provider catalog
    if (existing.role === 'artisan') {
      const providers = getProviders();
      const pIdx = providers.findIndex(p => p.userId === userId || p.id === existing.providerId);
      if (pIdx !== -1) {
        providers[pIdx] = {
          ...providers[pIdx],
          name: updated.fullName,
          phone: updated.phone,
          city: updated.city,
          category: updated.primaryService || providers[pIdx].category,
          services: updated.services || providers[pIdx].services,
          serviceAreas: updated.serviceAreas || providers[pIdx].serviceAreas,
          bio: updated.bio || providers[pIdx].bio,
          yearsOfExperience: updated.yearsOfExperience || providers[pIdx].yearsOfExperience,
          typicalPriceMin: updated.typicalPriceMin || providers[pIdx].typicalPriceMin,
          typicalPriceMax: updated.typicalPriceMax || providers[pIdx].typicalPriceMax,
          availability: updated.availability || providers[pIdx].availability,
          initials: updated.initials
        };
        setProviders(providers);

        // Propagate provider name update to active jobs
        const jobs = getJobs();
        let jobsChanged = false;
        jobs.forEach(j => {
          if (j.providerId === providers[pIdx].id) {
            j.providerName = updated.fullName;
            jobsChanged = true;
          }
        });
        if (jobsChanged) setJobs(jobs);
      }
    } else {
      // If customer, propagate customerName update to jobs
      const jobs = getJobs();
      let jobsChanged = false;
      jobs.forEach(j => {
        if (j.customerId === userId) {
          j.customerName = updated.fullName;
          jobsChanged = true;
        }
      });
      if (jobsChanged) setJobs(jobs);
    }

    return updated;
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
    return list.find(p => p.id === id || p.kaziId === id) || null;
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
    const currentUser = getCurrentUser();

    const newJob = {
      id: 'job_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      status: 'agreed', // standard flow: agreed upon creation
      issue: null,
      completedAt: null,
      customerId: currentUser?.id || 'usr_customer_01',
      customerName: currentUser?.fullName || 'Vivian Dike',
      customerKaziId: currentUser?.kaziId || 'KZ-CUS-000001',
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
    const currentUser = getCurrentUser();

    const newReview = {
      id: 'rev_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      verified: true, // only created for completed Kazi jobs
      customerId: currentUser?.id || 'usr_customer_01',
      customerName: currentUser?.fullName || 'Vivian Dike',
      customerKaziId: currentUser?.kaziId || 'KZ-CUS-000001',
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
      
      const newRating = parseFloat(avg);
      const newReviewsCount = providerReviews.length;
      const newCompletedCount = Math.max(provider.completedJobs || 0, providerReviews.length);

      updateProvider(provider.id, {
        rating: newRating,
        verifiedReviews: newReviewsCount,
        completedJobs: newCompletedCount
      });

      // Synchronize with user record if provider has matching user account
      if (provider.userId) {
        updateUser(provider.userId, {
          rating: newRating,
          verifiedReviews: newReviewsCount,
          completedJobs: newCompletedCount
        });
      }
    }

    return newReview;
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
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        currentCity: getCurrentCity(),
        activeUserId: get(KEYS.ACTIVE_USER_ID),
        counterCus: get(KEYS.COUNTER_CUS),
        counterArt: get(KEYS.COUNTER_ART),
        idRegistry: get(KEYS.ID_REGISTRY),
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
      if (data.activeUserId) set(KEYS.ACTIVE_USER_ID, data.activeUserId);
      if (data.counterCus) set(KEYS.COUNTER_CUS, data.counterCus);
      if (data.counterArt) set(KEYS.COUNTER_ART, data.counterArt);
      if (data.idRegistry && Array.isArray(data.idRegistry)) set(KEYS.ID_REGISTRY, data.idRegistry);
      return { success: true };
    } catch (e) {
      console.error('Error during data import:', e);
      return { success: false, message: 'An error occurred while writing data to LocalStorage.' };
    }
  }

  return {
    init,
    resetToSeed,
    generateKaziId,
    getUsers,
    getUserById,
    getUserByKaziId,
    getUserByEmailOrPhone,
    getCurrentUser,
    isAuthenticated,
    getCurrentRole,
    login,
    register,
    logout,
    updateUser,
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
    getCurrentCity,
    setCurrentCity,
    getCategories,
    getCities,
    exportData,
    validateBackupData,
    importData
  };
})();
