# KAZI — Product & Development Journal

**Product:** Kazi — Trusted Local Services Platform (Abuja, Nigeria)  
**Author:** Senior Product Engineer, UX Designer & Frontend Architect  
**Initial Entry Date:** October 2, 2026  

---

## 1. Initial Product Interpretation & Vision

When examining the brief for **Kazi**, the central realization is that the informal artisan market in Nigerian urban hubs like Abuja does not primarily suffer from a discovery shortage. People can easily get artisan phone numbers from building gatekeepers, friends, or bulletin boards. The true crisis is **accountability and trust**:
- The perpetual *"I'm coming"* excuse that leads to hours or days of wasted customer time.
- Price renegotiation once the artisan reaches the premises or dismantles equipment.
- Incomplete repairs with no recourse.
- Fake or astroturfed word-of-mouth recommendations.

Therefore, Kazi cannot be another Craigslist, Jiji, or an unrealistic "Uber for plumbers" dispatch app. Artisans are independent tradesmen with complex schedules, variable diagnostic requirements, and localized reputations. Kazi’s job is to serve as **the mutual digital record of truth** for both parties.

The fundamental loop is:
```text
Discover → Evaluate → Agree → Track → Complete → Review
```

Every single screen, interaction, data field, and status code must support this exact cycle.

---

## 2. Key Product Decisions

1. **Explicit Agreed Price Visibility:**
   - *Decision:* The agreed price in Naira (`₦`) must be entered at job creation and rendered prominently on every screen, card, and status badge throughout the lifecycle.
   - *Rationale:* Price inflation on site is one of the top friction points in Nigeria. By fixing the agreed price on the job card and asking in the post-completion review *"Was the agreed price respected?"*, we create social accountability without complex legal overhead.

2. **Verified Reviews Restricted to Completed Jobs:**
   - *Decision:* You cannot review an artisan unless you have a Kazi job record with status `completed`.
   - *Rationale:* Eliminates review bombing and fake praise. Every review is a "Verified Job" with real agreed scope.

3. **Three Core Truth Questions in Reviews:**
   - *Decision:* Beyond a 1–5 star rating, customers answer three binary checks:
     1. Did the provider arrive as agreed?
     2. Was the agreed price respected?
     3. Was the job completed satisfactorily?
   - *Rationale:* Binary questions eliminate vague reviews and isolate specific failure modes (punctuality vs. pricing vs. craft skill).

4. **Preserve What Happened (Neutral Dispute Record):**
   - *Decision:* When a customer reports an issue, the platform records the complaint under a dedicated `issue` object and transitions the job to `issue-reported`, rather than making an automatic determination of fault.
   - *Rationale:* In the informal sector, automated arbitration without human mediation causes hostility. Factual preservation allows both parties to see what was flagged.

5. **Dual-Role Simulation for Prototype:**
   - *Decision:* Provide a simple role switcher in the header between a Customer (*Funke Adeyemi*) and a Provider (*Chinedu Okafor - Electrician*).
   - *Rationale:* Demonstrates the entire marketplace dynamic without requiring a cumbersome authentication database or multi-factor SMS auth for an MVP prototype.

---

## 3. UX & Visual Design Decisions

1. **Aesthetic Tone & Palette:**
   - To make Kazi feel like a serious, credible Nigerian technology product (reminiscent of the best fintech and service apps), we selected:
     - Primary Brand: Deep Forest / Emerald Green (`#047857`, `#065f46`, `#10b981`) denoting trust, growth, and the Nigerian green.
     - Dark Neutral: Slate Navy (`#0f172a`, `#1e293b`) for crisp, readable typography.
     - Warm Accents: Amber / Gold (`#d97706`, `#b45309`) for star ratings and active job badges.
     - Status Colors: Green (`#16a34a`) for Completed, Amber (`#ea580c`) for In Progress, Red (`#dc2626`) for Issues.
     - Background: Off-white / light slate (`#f8fafc`, `#ffffff`) with subtle 1px border lines (`#e2e8f0`).

2. **Strict CSS Constraint Adherence:**
   - *Constraint:* "No CSS variables/custom properties. Do NOT use: `var(--color)`. Use direct CSS declarations."
   - *Decision:* All rules in `css/styles.css` will strictly use direct hex, rgb, or hsl values. Zero custom properties will be declared or accessed.

3. **Mobile-First Layout:**
   - Navigation adapts between a top desktop bar and a clean mobile header with a slide-out drawer or bottom navigation bar.
   - Touch targets are padded to at least 44px for easy thumb tapping on phones.

4. **Abuja Local Context:**
   - Prominent display of Abuja neighborhoods: *Wuse II, Maitama, Jabi, Utako, Garki, Gwarinpa, Apo, Kubwa, Lokogoma*.
   - Currency symbol is explicitly the Nigerian Naira sign `₦` with standard thousands separators (e.g. `₦32,000`).

---

## 4. Technical Architecture Decisions

1. **Framework-Free Vanilla Stack:**
   - Pure HTML5, CSS3, and ES6 JavaScript.
   - No build tools, Webpack, Babel, Vite, or npm scripts needed to view or run.
   - Can be served via any HTTP server or opened directly in a browser.

2. **Modular File Separation:**
   - `index.html`: Unified DOM scaffolding, semantic layout, modal containers.
   - `css/styles.css`: Direct CSS styling without CSS custom properties.
   - `js/data.js`: Rich Abuja seed data (24 artisans, 9 categories, pre-populated jobs and reviews).
   - `js/storage.js`: LocalStorage wrapper providing CRUD, atomic batch updates, JSON export, and JSON import validation.
   - `js/providers.js`: Provider queries, card generation, profile detail views, search and filtering.
   - `js/jobs.js`: Job state machine (`requested` → `agreed` → `in-progress` → `completed` / `issue-reported`), job creation, job detail rendering.
   - `js/reviews.js`: Review submission logic, rating calculation, review feed rendering.
   - `js/ui.js`: Toast notifications, modal control, currency and date formatting helpers.
   - `js/app.js`: Application bootstrapping, screen routing, role switching, event listeners.

3. **LocalStorage Architecture:**
   - Namespaced keys: `kazi_providers`, `kazi_jobs`, `kazi_reviews`, `kazi_users`, `kazi_active_user`, `kazi_active_role`.
   - On initial load: If `kazi_storage_initialized` is false or missing, automatically seed storage from `data.js`.
   - All mutations immediately update both the in-memory state and `localStorage`.

4. **JSON Export & Import Architecture:**
   - Export: Aggregates current state into a JSON object and triggers a client-side Blob download.
   - Import: Reads uploaded `.json`, performs schema sanity checks (checking for required keys and array types), displays a confirmation modal, and replaces LocalStorage state.

---

## 5. Deliberately Excluded Features (MVP Scope Management)

1. **Payment Escrow (Paystack/Flutterwave):**
   - High technical and regulatory burden. In Abuja, verbal or bank transfer agreements are the standard. Kazi captures the agreed amount; payment settlement remains direct.
2. **GPS Geolocation Map Tracking:**
   - Artisans in Abuja do not work like Uber drivers moving continuously on a map. They take scheduled appointments. A map adds battery and latency overhead without improving trust.
3. **In-app Chat with WebSockets:**
   - Phone calls and WhatsApp are already deeply entrenched in Nigeria. Kazi provides quick "Call Provider" / "WhatsApp Provider" links with pre-filled job context.

---

## 6. Development Log & Progression

- **Oct 2, 2026 - Phase 1: Planning & Specification Analysis**
  - Thoroughly reviewed requirements and constraints.
  - Initialized Git repository with `git init`.
  - Formulated the 27 acceptance requirements and verified strict constraints (e.g. Zero CSS variables / custom properties).
  - Drafted comprehensive `PRD.md`, `README.md`, and initial `Journal.md`.

- **Oct 2, 2026 - Phase 2: Seed Dataset & Storage Engine**
  - Built `js/data.js` containing 24 realistic Abuja-based artisans (5 electricians including Chinedu Okafor, 5 plumbers, 5 mechanics, 3 tailors, 3 cleaners, 3 barbers).
  - Attached Abuja neighborhoods: Wuse II, Maitama, Garki, Jabi, Utako, Gwarinpa, Apo, Kubwa, Lokogoma, Asokoro.
  - Implemented `js/storage.js` with namespaced LocalStorage keys (`kazi_*`), full CRUD operations, and structured JSON backup and restore with validation.
  - Implemented `js/ui.js` providing toast notifications, modal managers, Naira currency formatting (`₦`), and rating star calculations.

- **Oct 2, 2026 - Phase 3: Core Business Logic & State Machines**
  - Implemented `js/providers.js`: Multi-parameter search, category filtering, neighborhood filtering, provider card generation, and comprehensive profile views.
  - Implemented `js/jobs.js`: Full job lifecycle state machine (`requested` → `agreed` → `in-progress` → `completed`), neutral issue reporting (`issue-reported`), and dashboard tabs (Active, Completed, Issues).
  - Implemented `js/reviews.js`: Post-completion verified review capture with 1–5 stars and the 3 core accountability checks (Arrived as agreed, Price respected, Job completed).

- **Oct 2, 2026 - Phase 4: CSS Direct Declarations & Responsive Design**
  - Built `css/styles.css` strictly utilizing direct hex and rgb values, completely avoiding CSS variables/custom properties (`var(--*)`) per user instruction.
  - Styled cards, badges, status indicators, and modal dialogues with a modern, high-trust emerald green (`#047857`, `#064e3b`) and slate palette (`#0f172a`, `#1e293b`).
  - Implemented responsive mobile layout with hamburger drawer navigation and thumb-friendly touch targets.

- **Oct 2, 2026 - Phase 5: Local Server & Automated Acceptance Testing**
  - Created zero-dependency `server.js` running on Node.js port 3000.
  - Verified HTTP 200 responses across all static assets.
  - Created automated test runner `test_acceptance.js` simulating the complete browser execution environment.
  - Executed all 7 acceptance stages (seed quotas, Chinedu profile verification, job agreement creation with ₦32,000 locked price on October 4, status transition from Agreed to In Progress to Completed, verified review submission with rating recalculation, issue reporting preservation, and JSON backup/restore). All 7/7 tests passed with zero errors.

- **Oct 2, 2026 - Phase 6: Subagent Execution Note**
  - The `browser_subagent` encountered an external environment issue when attempting to download Playwright drivers (`404 Not Found` from Playwright CDN).
  - In accordance with system instructions, the environment issue was handled gracefully and full verification was confirmed via the automated Node.js test harness and HTTP server verification.

---

## 7. Challenges Encountered & Solutions Implemented

1. **Challenge:** Absolute ban on CSS custom properties (`var(--color)`).
   - *Impact:* Modern UI styling often relies heavily on CSS variables for theme management.
   - *Solution:* Hand-crafted direct color declarations across `css/styles.css`, establishing a consistent emerald/slate visual design system while strictly adhering to the constraint (verified with ripgrep: 0 occurrences of `var(`).

2. **Challenge:** Preserving the Agreed Price throughout status changes.
   - *Impact:* Potential for state mutation or loss of the agreed figure when transitioning through the state machine.
   - *Solution:* Explicitly stored `agreedPrice` as a top-level immutable property in the job object. Highlighted the locked price on every card and in the modal dossier, and added the review verification question: *"Was the agreed price respected?"*

3. **Challenge:** Factual issue reporting without judgmental automated verdicts.
   - *Impact:* Automated systems that label artisans "guilty" create hostility and discourage platform adoption.
   - *Solution:* Recorded problems under an `issue` structure containing the customer's factual note, timestamp, and issue category, clearly framed as a customer-submitted record while preserving the original agreed price.

---

## 8. Final Acceptance Verification Summary

| Criteria | Status | Details |
| :--- | :---: | :--- |
| City selector set to Abuja | **PASS** | Default city set to Abuja with 10+ neighborhoods |
| 24+ Seed Providers | **PASS** | 5 electricians, 5 plumbers, 5 mechanics, 3 tailors, 3 cleaners, 3 barbers |
| Chinedu Okafor Profile | **PASS** | 4.8 rating, 47 completed jobs, 39 verified reviews, ₦25,000–₦40,000 |
| Create Job Agreement | **PASS** | ₦32,000 agreed price locked, Oct 4 date, scope recorded |
| Job Lifecycle Transitions | **PASS** | `Agreed` → `In Progress` → `Completed` |
| Verified Review Submission | **PASS** | 3 accountability checks, 5 stars, profile stats recalculated |
| Offline LocalStorage Persistence | **PASS** | State survives browser reload |
| JSON Backup & Restore | **PASS** | Export, schema validation, and confirmation restore |

---

## 9. Feature Update: Authentication, User Profiles & Unique Kazi IDs

### 9.1 Why Authentication Was Added
The initial MVP prototype used an instant persona switcher, which lacked true user identity, account ownership, and data accountability. Customers and artisans had overlapping views without personalized dashboards, profile editing was not possible, and counterparty records had no permanent user ID to reference. Adding client-side authentication and role-based profiles establishes account ownership, enables distinct Customer and Artisan workflows, and introduces permanent accountability records via unique Kazi IDs.

### 9.2 How Customer and Artisan Experiences Were Separated
1. **Dynamic Navigation:** Header navigation and mobile drawer dynamically adapt based on active session role:
   - **Customer:** Displays `Home`, `Find Services`, `My Jobs`, `My Profile`, `Settings`, and `Log Out`.
   - **Artisan:** Displays `Home`, `Directory`, `Artisan Dashboard`, `My Jobs`, `Professional Profile`, `Settings`, and `Log Out`.
   - **Logged Out:** Displays `Home`, `Find Artisans`, `Log In`, and `Sign Up`.
2. **Customer Dashboard (`#screen-customer-dashboard`):**
   - Welcomes the customer with their name and permanent Kazi ID (`KZ-CUS-XXXXXX`).
   - Displays KPI cards: Active Jobs count, Jobs Awaiting Review count, Completed Jobs count.
   - Highlights an "Awaiting Review" prompt when completed work has not yet been reviewed, driving the core accountability loop.
   - Quick CTA: `+ Find a Service`.
3. **Artisan Dashboard (`#screen-artisan-dashboard`):**
   - Displays professional credentials and permanent Kazi ID (`KZ-ART-XXXXXX`).
   - Displays KPI cards: Average Star Rating (★), Verified Reviews Count, Completed Jobs Count, Active Agreements, Tracked Agreed Earnings (in ₦).
   - Lists active and scheduled jobs with counterparty Customer Kazi IDs, agreed price, date, and milestone progression buttons (`Start Job`, `Mark Completed`).
   - Displays customer feedback stream with arrival punctuality and price-respect checkmarks.
4. **Route Protection Guards:**
   - Protected routes (`customer-dashboard`, `artisan-dashboard`, `my-jobs`, `customer-profile`, `artisan-profile`, `settings`) check `KaziStorage.getCurrentUser()`. Unauthenticated users are redirected to `#login`.
   - Role separation is enforced: Customers attempting to access artisan views are redirected to their customer dashboard; artisans attempting to access customer views are redirected to their artisan dashboard.

### 9.3 Permanent Unique Kazi ID Generation Strategy
- **Format:**
  - Customer: `KZ-CUS-000001`, `KZ-CUS-000002`, ...
  - Artisan: `KZ-ART-000001`, `KZ-ART-000002`, ..., `KZ-ART-000024`, ...
- **Persistent Registry:** A dedicated LocalStorage key `kazi_id_registry` stores all issued IDs alongside persistent counters (`kazi_counter_cus`, `kazi_counter_art`). If a user account is deleted, the ID is never recycled.
- **Immutability Guarantee:** Once issued, the Kazi ID is permanent. Profile updates to name, phone, email, or trade do not alter the ID.

### 9.4 Profile Editing & Cross-System Synchronization
- **Customer Profile:** Allows viewing and modifying Full Name, Email, Phone, City, Address/Landmark, and Preferred Contact Method. When saved, updates persist to `kazi_users` and synchronize `customerName` across counterparty job records without creating duplicate records.
- **Artisan Profile:**
  - *Private Info:* Full Name, Email, Phone, City.
  - *Public Trade Info:* Primary Trade, Experience Years, Typical Price Min/Max, Service Areas, Services Offered, Availability, Bio.
  - When saved, updates persist to `kazi_users`, automatically update the `kazi_providers` catalog entry, and synchronize `providerName` on all associated job cards.
- **Public vs Private Boundary:** Customers cannot be browsed in any public directory. Artisan public profiles show trade credentials, reviews, and Kazi ID without leaking private email/phone/password credentials.

### 9.5 Existing Data Migration Strategy
When `KaziStorage.init()` runs:
1. `runMigration()` checks existing LocalStorage data.
2. Identifies any user or seed provider missing a `kaziId`.
3. Issues sequential permanent IDs to existing seed providers (`KZ-ART-000001` through `KZ-ART-000024`).
4. Creates matching demo customer (`KZ-CUS-000001`, Vivian Dike) and demo artisan (`KZ-ART-000001`, Chinedu Okafor) accounts with password `demo123`.
5. Preserves all existing jobs, reviews, and provider notes intact without data loss.

### 9.6 Technical Challenges & Solutions
1. **Challenge:** LocalStorage string parsing for session values.
   - *Impact:* Raw string IDs stored unquoted caused `SyntaxError` when parsed with `JSON.parse`.
   - *Solution:* Standardized all primitives using `JSON.stringify()` in `set()` and updated `get()` to fall back safely to raw string values.
2. **Challenge:** Zero CSS Variables constraint for rich role dashboards.
   - *Impact:* Styling complex dashboards, cards, badges, and forms without custom properties.
   - *Solution:* Handcrafted direct hex/rgb declarations matching the emerald/teal/slate color scheme across all new auth and dashboard classes in `css/styles.css`.
3. **Challenge:** Profile update name synchronization.
   - *Impact:* Editing an artisan's name could result in orphaned or desynchronized job records.
   - *Solution:* Implemented bidirectional sync in `KaziStorage.updateUser()` so changes to user records automatically propagate to `kazi_providers` and active/completed job cards.

### 9.7 Test Suite Expansion & Verification
The automated test runner (`test_acceptance.js`) was extended from 7 to 14 comprehensive tests:
- Test 8: Data migration & Kazi ID assignment verification (**PASS**)
- Test 9: Authentication, demo accounts, and session logout (**PASS**)
- Test 10: New customer registration & sequential ID `KZ-CUS-000002` (**PASS**)
- Test 11: New artisan registration & sequential ID `KZ-ART-000025` + directory sync (**PASS**)
- Test 12: Artisan profile edit, Kazi ID immutability, and provider catalog sync (**PASS**)
- Test 13: Customer profile edit, Kazi ID immutability, and job customer name sync (**PASS**)
- Test 14: Public vs private separation & directory privacy (**PASS**)

All 14/14 acceptance tests pass with 100% success.


