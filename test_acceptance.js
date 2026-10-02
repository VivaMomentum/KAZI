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

console.log('========================================================');
console.log('ALL ACCEPTANCE CRITERIA PASSED SUCCESSFULLY! (7/7)');
console.log('========================================================');
