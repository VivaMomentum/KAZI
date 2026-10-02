/**
 * Kazi Acceptance Test Suite (Node.js Environment Simulator)
 * Tests full product loop:
 * Discover -> Evaluate -> Agree -> Track -> Complete -> Review -> Export -> Import
 */

// 1. Mock LocalStorage and Browser DOM
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

global.document = {
  addEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: (id) => ({
    id,
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    setAttribute: () => {},
    getAttribute: () => null,
    innerHTML: '',
    textContent: '',
    value: '',
    addEventListener: () => {}
  }),
  body: {
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {}
  }
};
global.window = {
  location: { hash: '' },
  scrollTo: () => {},
  addEventListener: () => {}
};

// 2. Load application scripts into current context
const fs = require('fs');
const vm = require('vm');

vm.runInThisContext(fs.readFileSync('./js/data.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/storage.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/ui.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/providers.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/jobs.js', 'utf8'));
vm.runInThisContext(fs.readFileSync('./js/reviews.js', 'utf8'));

console.log('=== RUNNING KAZI END-TO-END ACCEPTANCE TESTS ===\n');

// Test 1: Storage Initialization & Seed Data Check
console.log('Test 1: Storage Initialization');
KaziStorage.init();
const providers = KaziStorage.getProviders();
console.log(`- Loaded ${providers.length} providers (Requirement: >= 24)`);
if (providers.length < 24) throw new Error(`Expected at least 24 providers, got ${providers.length}`);

// Category breakdown check
const electricians = providers.filter(p => p.category === 'Electrician');
const plumbers = providers.filter(p => p.category === 'Plumber');
const mechanics = providers.filter(p => p.category === 'Mechanic');
const tailors = providers.filter(p => p.category === 'Tailor');
const cleaners = providers.filter(p => p.category === 'Cleaner');
const barbers = providers.filter(p => p.category === 'Barber');

console.log(`- Breakdown: ${electricians.length} electricians, ${plumbers.length} plumbers, ${mechanics.length} mechanics, ${tailors.length} tailors, ${cleaners.length} cleaners, ${barbers.length} barbers`);
if (electricians.length < 5 || plumbers.length < 5 || mechanics.length < 5 || tailors.length < 3 || cleaners.length < 3 || barbers.length < 3) {
  throw new Error('Seed data does not meet minimum category quotas!');
}
console.log('✓ PASS: Seed data quotas verified\n');

// Test 2: Evaluate Chinedu Okafor Profile
console.log('Test 2: Evaluate Chinedu Okafor Profile');
const chinedu = KaziStorage.getProviderById('prv_001');
if (!chinedu) throw new Error('Chinedu Okafor not found in providers!');
console.log(`- Name: ${chinedu.name}`);
console.log(`- Category: ${chinedu.category}`);
console.log(`- Rating: ${chinedu.rating}`);
console.log(`- Completed Jobs: ${chinedu.completedJobs}`);
console.log(`- Verified Reviews: ${chinedu.verifiedReviews}`);
console.log(`- Typical Price Range: ${KaziUI.formatNaira(chinedu.typicalPriceMin)} – ${KaziUI.formatNaira(chinedu.typicalPriceMax)}`);
console.log(`- City & Areas: ${chinedu.city} · ${chinedu.serviceAreas.join(', ')}`);
console.log(`- Verified Identity: ${chinedu.isVerifiedIdentity}`);

if (chinedu.name !== 'Chinedu Okafor') throw new Error('Incorrect provider name');
if (chinedu.rating !== 4.8) throw new Error('Expected 4.8 rating for Chinedu');
if (chinedu.completedJobs !== 47) throw new Error('Expected 47 completed jobs');
if (chinedu.verifiedReviews !== 39) throw new Error('Expected 39 verified reviews');
console.log('✓ PASS: Chinedu profile details verified\n');

// Test 3: Agree on Job (Create Job)
console.log('Test 3: Agree on Job (Create Job with ₦32,000 on October 4)');
const initialJobCount = KaziStorage.getJobs().length;
const newJob = KaziStorage.createJob({
  customerId: 'usr_customer_01',
  customerName: 'Funke Adeyemi',
  providerId: chinedu.id,
  providerName: chinedu.name,
  category: chinedu.category,
  serviceName: 'Distribution Board Upgrades',
  description: 'Fix tripping breaker board & install 63A surge isolator.',
  agreedPrice: 32000,
  agreedDate: '2026-10-04',
  status: 'agreed',
  notes: 'Wuse II, Banex plaza axis. Call gate security.'
});

console.log(`- Created Job ID: ${newJob.id}`);
console.log(`- Agreed Price: ${KaziUI.formatNaira(newJob.agreedPrice)} (Locked)`);
console.log(`- Agreed Date: ${newJob.agreedDate}`);
console.log(`- Initial Status: ${newJob.status}`);

if (newJob.agreedPrice !== 32000) throw new Error('Agreed price not preserved');
if (newJob.agreedDate !== '2026-10-04') throw new Error('Agreed date mismatch');
if (KaziStorage.getJobs().length !== initialJobCount + 1) throw new Error('Job list not incremented in storage');
console.log('✓ PASS: Job created with locked agreed price\n');

// Test 4: Track Job Milestones: Agreed -> In Progress -> Completed
console.log('Test 4: Track Job Lifecycle Milestones');
const inProgressJob = KaziStorage.updateJob(newJob.id, { status: 'in-progress' });
console.log(`- Status updated to: ${inProgressJob.status}`);
if (inProgressJob.status !== 'in-progress') throw new Error('Failed to update status to in-progress');
if (inProgressJob.agreedPrice !== 32000) throw new Error('Agreed price modified during status transition!');

const completedJob = KaziStorage.updateJob(newJob.id, {
  status: 'completed',
  completedAt: new Date().toISOString()
});
console.log(`- Status updated to: ${completedJob.status}`);
console.log(`- Completed At: ${completedJob.completedAt}`);
console.log(`- Agreed Price preserved: ${KaziUI.formatNaira(completedJob.agreedPrice)}`);
if (completedJob.status !== 'completed') throw new Error('Failed to update status to completed');
console.log('✓ PASS: Lifecycle transitions verified with price locked\n');

// Test 5: Submit Verified Review (Accountability Checklist)
console.log('Test 5: Submit Verified Review for Completed Job');
const initialReviewsCount = KaziStorage.getReviewsForProvider(chinedu.id).length;
const review = KaziStorage.createReview({
  jobId: completedJob.id,
  customerId: 'usr_customer_01',
  customerName: 'Funke Adeyemi',
  providerId: chinedu.id,
  rating: 5,
  reviewText: 'Chinedu arrived on time and resolved the breaker issue cleanly at the agreed ₦32,000 price. Excellent work.',
  arrivedAsAgreed: true,
  priceAsAgreed: true,
  jobCompleted: true
});

console.log(`- Review ID: ${review.id}`);
console.log(`- Rating: ${review.rating} stars`);
console.log(`- Arrived as agreed: ${review.arrivedAsAgreed}`);
console.log(`- Price as agreed: ${review.priceAsAgreed}`);
console.log(`- Job completed: ${review.jobCompleted}`);
console.log(`- Verified Job Flag: ${review.verified}`);

// Check that provider stats updated
const updatedChinedu = KaziStorage.getProviderById(chinedu.id);
console.log(`- Chinedu Updated Rating: ${updatedChinedu.rating}`);
console.log(`- Chinedu Updated Verified Reviews: ${updatedChinedu.verifiedReviews}`);
console.log(`- Chinedu Updated Completed Jobs: ${updatedChinedu.completedJobs}`);

if (updatedChinedu.verifiedReviews !== initialReviewsCount + 1) {
  throw new Error('Provider verifiedReviews count did not increment!');
}
console.log('✓ PASS: Verified review submitted and provider profile recalculated\n');

// Test 6: Dispute / Issue Reporting Preservation
console.log('Test 6: Report Problem & Factual Record Preservation');
const issueJob = KaziStorage.createJob({
  customerId: 'usr_customer_01',
  customerName: 'Funke Adeyemi',
  providerId: 'prv_007',
  providerName: 'Usman Garba',
  category: 'Plumber',
  serviceName: 'Drainage Repair',
  description: 'Unclog main kitchen drain stack.',
  agreedPrice: 20000,
  agreedDate: '2026-10-02',
  status: 'agreed'
});

const reportedJob = KaziStorage.updateJob(issueJob.id, {
  status: 'issue-reported',
  issue: {
    type: 'Price Changed on Site',
    reportedAt: new Date().toISOString(),
    reportedBy: 'Funke Adeyemi',
    customerNote: 'Artisan requested extra ₦10,000 transport fee after arriving.'
  }
});

console.log(`- Issue Job Status: ${reportedJob.status}`);
console.log(`- Issue Type: ${reportedJob.issue.type}`);
console.log(`- Customer Note: "${reportedJob.issue.customerNote}"`);
console.log(`- Original Agreed Price Preserved: ${KaziUI.formatNaira(reportedJob.agreedPrice)}`);
if (reportedJob.status !== 'issue-reported') throw new Error('Status not issue-reported');
if (reportedJob.agreedPrice !== 20000) throw new Error('Agreed price corrupted in issue report');
console.log('✓ PASS: Issue reported with immutable agreed price\n');

// Test 7: JSON Backup Validation & Restore
console.log('Test 7: JSON Backup Validation & Restore');
const backupPayload = {
  app: 'Kazi',
  version: '1.0.0',
  currentCity: 'Abuja',
  providers: KaziStorage.getProviders(),
  jobs: KaziStorage.getJobs(),
  reviews: KaziStorage.getReviews()
};

const validation = KaziStorage.validateBackupData(backupPayload);
console.log(`- Backup Validation Result: valid = ${validation.valid}`);
if (!validation.valid) throw new Error(`Backup failed validation: ${validation.message}`);

// Test corrupted backup rejection
const corruptedValidation = KaziStorage.validateBackupData({ app: 'Kazi', providers: 'not-an-array' });
console.log(`- Corrupted Backup Rejected: valid = ${corruptedValidation.valid} ("${corruptedValidation.message}")`);
if (corruptedValidation.valid) throw new Error('Corrupted backup was unexpectedly accepted!');

// Test restore
const restoreRes = KaziStorage.importData(backupPayload);
console.log(`- Restore Execution Result: success = ${restoreRes.success}`);
if (!restoreRes.success) throw new Error('Restore execution failed');

console.log('✓ PASS: JSON Export, Validation, and Import restoration verified\n');

// Test 8: Data Migration & Permanent Kazi IDs
console.log('Test 8: Data Migration & Unique Kazi IDs');
const users = KaziStorage.getUsers();
console.log(`- Loaded ${users.length} registered users`);
const allHaveKaziId = users.every(u => u.kaziId && (u.kaziId.startsWith('KZ-CUS-') || u.kaziId.startsWith('KZ-ART-')));
if (!allHaveKaziId) throw new Error('Not all users have a valid Kazi ID!');

const customerUser = users.find(u => u.role === 'customer');
const artisanUser = users.find(u => u.role === 'artisan' && u.email === 'artisan@kazi.demo');
console.log(`- Customer Demo: ${customerUser.fullName} (${customerUser.kaziId})`);
console.log(`- Artisan Demo: ${artisanUser.fullName} (${artisanUser.kaziId})`);

if (customerUser.kaziId !== 'KZ-CUS-000001') throw new Error(`Expected KZ-CUS-000001 for customer demo, got ${customerUser.kaziId}`);
if (artisanUser.kaziId !== 'KZ-ART-000001') throw new Error(`Expected KZ-ART-000001 for artisan demo, got ${artisanUser.kaziId}`);

// Verify all 24 providers have permanent Kazi IDs
const allProvidersHaveId = KaziStorage.getProviders().every(p => p.kaziId && p.kaziId.startsWith('KZ-ART-'));
if (!allProvidersHaveId) throw new Error('Not all providers have permanent Kazi IDs!');
console.log('✓ PASS: All users and providers have valid permanent Kazi IDs\n');

// Test 9: Authentication & Session Management
console.log('Test 9: Authentication & Demo Accounts');
// Invalid login
const badLogin = KaziStorage.login('customer@kazi.demo', 'wrongpassword');
if (badLogin.success) throw new Error('Invalid login unexpectedly succeeded');
console.log('- Invalid password correctly rejected');

// Valid customer login
const customerLogin = KaziStorage.login('customer@kazi.demo', 'demo123');
if (!customerLogin.success || customerLogin.user.role !== 'customer') {
  throw new Error('Customer login failed with demo credentials');
}
console.log(`- Customer login succeeded: Active user = ${KaziStorage.getCurrentUser().fullName} (${KaziStorage.getCurrentUser().kaziId})`);

// Logout
KaziStorage.logout();
if (KaziStorage.getCurrentUser() !== null || KaziStorage.isAuthenticated()) {
  throw new Error('Logout failed to clear active session');
}
console.log('- Logout successfully cleared active session');

// Valid artisan login
const artisanLogin = KaziStorage.login('artisan@kazi.demo', 'demo123');
if (!artisanLogin.success || artisanLogin.user.role !== 'artisan') {
  throw new Error('Artisan login failed with demo credentials');
}
console.log(`- Artisan login succeeded: Active user = ${KaziStorage.getCurrentUser().fullName} (${KaziStorage.getCurrentUser().kaziId})`);
console.log('✓ PASS: Authentication and session management verified\n');

// Test 10: New Customer Registration & Sequential Kazi ID
console.log('Test 10: Customer Registration & Sequential Kazi ID');
const newCustomerRes = KaziStorage.register({
  fullName: 'Emeka Nwosu',
  email: 'emeka@example.com',
  phone: '08023456789',
  city: 'Abuja',
  password: 'password123',
  role: 'customer'
});

if (!newCustomerRes.success) throw new Error(`Customer registration failed: ${newCustomerRes.message}`);
console.log(`- Registered New Customer: ${newCustomerRes.user.fullName}`);
console.log(`- Generated Permanent Kazi ID: ${newCustomerRes.user.kaziId}`);
if (newCustomerRes.user.kaziId !== 'KZ-CUS-000002') {
  throw new Error(`Expected KZ-CUS-000002 for 2nd customer, got ${newCustomerRes.user.kaziId}`);
}
console.log('✓ PASS: Customer received unique sequential permanent Kazi ID\n');

// Test 11: New Artisan Registration & Sequential Kazi ID + Catalog Sync
console.log('Test 11: Artisan Registration & Catalog Synchronization');
const newArtisanRes = KaziStorage.register({
  fullName: 'Aisha Bello',
  email: 'aisha@example.com',
  phone: '08098765432',
  city: 'Abuja',
  password: 'password123',
  role: 'artisan',
  primaryService: 'Tailor',
  yearsOfExperience: 6,
  typicalPriceMin: 18000,
  typicalPriceMax: 45000,
  serviceAreas: ['Maitama', 'Wuse II', 'Asokoro'],
  bio: 'Specialist in contemporary unisex native wear and bespoke corporate fits.'
});

if (!newArtisanRes.success) throw new Error(`Artisan registration failed: ${newArtisanRes.message}`);
console.log(`- Registered New Artisan: ${newArtisanRes.user.fullName}`);
console.log(`- Generated Permanent Kazi ID: ${newArtisanRes.user.kaziId}`);
if (newArtisanRes.user.kaziId !== 'KZ-ART-000025') {
  throw new Error(`Expected KZ-ART-000025 for 25th artisan, got ${newArtisanRes.user.kaziId}`);
}

// Verify new artisan is listed in the provider directory immediately
const registeredProvider = KaziStorage.getProviderById(newArtisanRes.user.providerId);
if (!registeredProvider) throw new Error('New artisan was not synced into kazi_providers!');
console.log(`- Synced into public directory: ${registeredProvider.name} (${registeredProvider.category} · ${registeredProvider.kaziId})`);
console.log('✓ PASS: Artisan registered, received KZ-ART-000025, and added to directory\n');

// Test 12: Permanent Kazi ID Immutability & Profile Update Sync
console.log('Test 12: Profile Editing & Kazi ID Immutability (Artisan)');
const originalChineduId = artisanUser.kaziId; // KZ-ART-000001
const userCountBefore = KaziStorage.getUsers().length;

const updatedArtisan = KaziStorage.updateUser(artisanUser.id, {
  fullName: 'Chinedu C. Okafor',
  bio: 'Master Electrician with 12+ years of verified residential fault resolution.'
});

console.log(`- Updated Name: ${updatedArtisan.fullName}`);
console.log(`- Permanent Kazi ID: ${updatedArtisan.kaziId} (Unchanged)`);

if (updatedArtisan.kaziId !== originalChineduId) {
  throw new Error('CRITICAL: Kazi ID changed during profile edit!');
}

const userCountAfter = KaziStorage.getUsers().length;
if (userCountBefore !== userCountAfter) {
  throw new Error('CRITICAL: Duplicate user record created during profile edit!');
}

// Check sync to kazi_providers
const syncedChineduProvider = KaziStorage.getProviderById('prv_001');
console.log(`- Directory Provider Name synced: ${syncedChineduProvider.name}`);
if (syncedChineduProvider.name !== 'Chinedu C. Okafor') {
  throw new Error('Profile update did not synchronize to kazi_providers directory!');
}
console.log('✓ PASS: Profile edit persisted without changing Kazi ID or duplicating user records\n');

// Test 13: Customer Profile Editing & Sync
console.log('Test 13: Customer Profile Editing & Name Sync');
const updatedCustomer = KaziStorage.updateUser(customerUser.id, {
  fullName: 'Vivian A. Dike',
  phone: '08039998877'
});

console.log(`- Updated Customer Name: ${updatedCustomer.fullName}`);
console.log(`- Customer Permanent Kazi ID: ${updatedCustomer.kaziId} (Unchanged)`);
if (updatedCustomer.kaziId !== 'KZ-CUS-000001') {
  throw new Error('Customer Kazi ID changed during profile edit!');
}

// Check that jobs with this customer were synced
const vivianJobs = KaziStorage.getJobs().filter(j => j.customerId === customerUser.id);
const allVivianJobsSynced = vivianJobs.every(j => j.customerName === 'Vivian A. Dike');
if (!allVivianJobsSynced) {
  throw new Error('Job counterparty customer name was not synced upon customer profile edit!');
}
console.log(`- Synced ${vivianJobs.length} active/completed jobs with updated customer name`);
console.log('✓ PASS: Customer profile saved and counterparty job records updated\n');

// Test 14: Public vs Private Information Separation
console.log('Test 14: Public vs Private Information Separation');
const publicDirectoryProviders = KaziStorage.getProviders();
// Verify no customer is present in public directory
const customersInDirectory = publicDirectoryProviders.filter(p => p.role === 'customer' || p.id.startsWith('usr_customer'));
if (customersInDirectory.length > 0) {
  throw new Error('Customers found in public provider directory!');
}
console.log(`- Verified: 0 customers in public artisan directory (${publicDirectoryProviders.length} total artisans)`);

// Verify artisan public profile cards include Kazi ID & experience
const cardHtml = KaziProviders.renderProviderCard(syncedChineduProvider);
if (!cardHtml.includes('KZ-ART-000001')) {
  throw new Error('Provider card does not display permanent Kazi ID!');
}
if (!cardHtml.includes('Chinedu C. Okafor')) {
  throw new Error('Provider card does not display updated artisan name!');
}
console.log('✓ PASS: Directory privacy and public trade credential badges verified\n');

console.log('========================================================');
console.log('ALL ACCEPTANCE CRITERIA PASSED SUCCESSFULLY! (14/14)');
console.log('========================================================');

