# KAZI — Product Requirements Document (PRD)

**Document Version:** 1.0.0 (MVP Prototype)  
**Author:** Vivian Dike                                                                                                                        
**Target Market:** Abuja, Nigeria (Expanding Nationally Later)  
**Stack Constraint:** Vanilla HTML5, Vanilla CSS3 (No CSS Variables), Vanilla ES6 JavaScript, LocalStorage  

---

## 1. Product Overview

**Kazi** is a trust- and accountability-first local services platform designed for Nigerian cities, launching initially in **Abuja, Nigeria**. Kazi connects customers with verified local service providers—plumbers, electricians, auto mechanics, tailors, cleaners, barbers, carpenters, painters, and AC technicians.

Unlike traditional directory classifieds or on-demand dispatch apps ("Uber for artisans"), Kazi is built around explicit mutual agreements and verifiable service track records. It makes accountability visible by establishing a single source of truth for every job: the agreed scope, agreed price (in Nigerian Naira ₦), agreed service date, milestone status progression, problem reports, and verified post-completion reviews.

---

## 2. Problem Statement

Hiring informal artisans and service providers in Nigerian urban centers is fraught with pervasive friction and trust deficits:
- **"I'm coming" syndrome:** Providers promise to arrive immediately or tomorrow, yet delay for days without notice or accountability.
- **Arbitrary price gouging:** Quoted prices frequently escalate once the artisan arrives or mid-job ("Oga, materials cost more", unexpected fees).
- **Missed appointments & poor communication:** Ghosting after agreeing to an engagement.
- **Variable or shoddy craftsmanship:** Difficulty distinguishing skilled professionals from untrained handymen.
- **Zero recourse or accountability:** When a job goes wrong or property is damaged, customers have no formal record or recourse.
- **Fake/unreliable referrals:** Word-of-mouth is brittle and social media directory reviews are easy to astroturf.

**Core Problem:** People lack a reliable way to discover, evaluate, hire, and hold local service providers accountable after agreeing to a job.

---

## 3. Target Users

### Primary Persona: The Urban Customer (Tariq & Funke)
- **Profile:** Working professionals, homeowners, renters, and small business managers in Abuja (residing in areas like Wuse II, Maitama, Jabi, Gwarinpa, Garki, Apo, Utako).
- **Need:** Reliable, punctual, honest artisans who respect agreed prices and do high-quality work.
- **Behavior:** Values transparency, needs quick visibility into previous customer experiences, desires a clear job log to avoid verbal misunderstandings.

### Secondary Persona: The Professional Local Artisan (Chinedu & Amina)
- **Profile:** Skilled, honest tradespeople who take pride in their craft and want steady, reputable clientele.
- **Pain:** Losing out to unscrupulous artisans who underbid then abandon jobs; having no portable, credible portfolio showing years of reliable service.
- **Need:** A digital reputation engine that proves their punctuality, pricing integrity, and work completion rate.

---

## 4. User Pain Points

| Pain Point | Impact | Kazi Solution |
| :--- | :--- | :--- |
| Unpredictable arrival times | Hours wasted waiting at home or site | Arrival verification question in post-job review; explicit agreed date |
| Shifting pricing | Budget overruns, tense arguments | Immutable "Agreed Price" locked into the job record and visible throughout lifecycle |
| Unaccountable quality | Repeat repairs, abandoned work | Job lifecycle tracking (`Requested` → `Agreed` → `In Progress` → `Completed` / `Issue Reported`) |
| Unverified online reviews | Astroturfed 5-star ratings | Verified reviews locked exclusively to completed Kazi job records |
| He-said-she-said disputes | Mutual distrust and hostility | Customer report preservation of facts (e.g., late arrival, price changed, unfinished) without biased automated arbitration |

---

## 5. Value Proposition

- **For Customers:** *Find reliable people. Agree on the job. Track what happens.*
- **For Service Providers:** *Build a reputation that follows your work.*

Kazi elevates reliable artisans by making their consistency tangible through verifiable metrics: completed jobs, verified reviews, price consistency rating, and punctuality scores.

---

## 6. Product Principles

1. **Accountability over Aggregation:** We do not strive to be an endless phonebook. We strive to be the definitive record of completed work.
2. **Preserve What Happened:** Record factual events rather than algorithmically declaring winners or losers in human conflicts.
3. **Price Integrity:** The agreed price must remain visible at all times.
4. **No Artificial Friction:** Avoid over-engineering dispatch algorithms or mandatory payment escrow before trust and utility are proven.
5. **Authentic Verification:** Never claim a provider is "certified" or "vetted" unless a rigorous verification process genuinely exists. Distinguish between *Listed* and *Verified*.

---

## 7. MVP Goals

1. Deliver a fully working client-side MVP prototype adhering to pure HTML5/CSS3/JS without build tools or external frameworks.
2. Provide a seamless end-to-end journey for Abuja across 6+ service categories with rich, realistic seed data (24+ providers).
3. Implement the complete core product loop: **Discover → Evaluate → Agree → Track → Complete → Review**.
4. Offer zero-latency offline persistence via LocalStorage with full JSON export, import, and reset capabilities.
5. Deliver an intuitive role-switcher (Customer view vs. Provider view) to demonstrate the dual-sided platform experience without requiring backend authentication.

---

## 8. MVP Features

### A. Discovery & Search
- Location selector fixed to **Abuja, Nigeria** (expandable schema for Lagos, Port Harcourt, Ibadan in subsequent phases).
- Filter by Category (Electrician, Plumber, Mechanic, Tailor, Cleaner, Barber, Painter, AC Technician, Carpenter).
- Multi-parameter search: Search by artisan name, keyword, or Abuja neighborhood (e.g., Maitama, Wuse II, Gwarinpa, Jabi, Utako, Garki, Apo, Kubwa).
- Filter by rating (4.0+, 4.5+), price range, and service area.

### B. Provider Evaluation
- Clean provider cards showing name, category, rating, completed jobs count, verified reviews count, typical price range in ₦, and neighborhood.
- Comprehensive provider profile featuring:
  - Header with avatar, badge (*Listed* vs. *Verified Identity*), location, and availability badge.
  - Bio and services catalogue with indicative pricing.
  - Performance statistics (total completed jobs, verified reviews, punctuality record).
  - Customer review list with sub-ratings: Arrived as agreed? Price as agreed? Job completed?

### C. Job Agreement & Tracking (Core Engine)
- **Create Job modal/flow:**
  - Select provider and specific service.
  - Define task description and notes.
  - Agree on explicit price in Naira (`₦`).
  - Set agreed service date.
- **Job Status State Machine:**
  - `requested` → `agreed` → `in-progress` → `completed`
  - Fallback branch: `cancelled`
  - Conflict branch: `issue-reported`
- Original agreed price locked and clearly highlighted alongside current status.
- Issue reporting modal with category tags (Late arrival, Price dispute, Incomplete work, Quality dissatisfaction) and customer notes.

### D. Verified Post-Job Reviews
- Review form unlocked only when job status reaches `completed`.
- Metrics collected:
  - 1–5 Star overall rating.
  - Written testimony.
  - Binary accountability checklist:
    - *Did the provider arrive as agreed?* (Yes/No)
    - *Was the agreed price respected?* (Yes/No)
    - *Was the job completed satisfactorily?* (Yes/No)
- Review instantly updates the provider's aggregate rating, completed job tally, and review count in LocalStorage.

### E. Customer & Provider Dashboards
- **Customer Dashboard ("My Jobs"):** Segregated into *Active*, *Completed*, and *Issues* for instant oversight.
- **Provider Dashboard:** Simulates the artisan's view showing pending requests, ongoing work, completed jobs, earnings summary (sum of completed agreed prices), and customer feedback.
- Seamless Role Toggle in top navigation (`Customer` ↔ `Provider: Chinedu Okafor`).

### F. Data Governance & Backup
- JSON Export: Instant download of current application state (providers, jobs, reviews, settings).
- JSON Import: Schema-validated upload restoring state safely with confirmation modal.
- Reset to Seed Data: One-click restore to pristine Abuja demo dataset.

---

## 9. Explicitly Excluded Features (Out of MVP Scope)

- In-app payment escrow / gateway integrations (Paystack/Flutterwave) — cash or direct bank transfer remains standard.
- Real-time GPS driver tracking / live map beacons ("Uber for artisans").
- Native smartphone push notification infrastructure (relies on clear status badges and dashboard UI).
- Real SMS OTP verification / SMS gateways.
- Legal arbitration or monetary refund dispute resolution.
- Complex artisan background check integrations with government NIMC/BVN databases.

---

## 10. User Flows

### Flow 1: Customer Hiring & Review Loop
1. User lands on Home or Provider Directory.
2. Selects category (e.g. "Electrician") or searches "generator repair" in "Wuse II".
3. Clicks on Chinedu Okafor's card; reviews his 4.8-star rating, 47 completed jobs, and verified feedback.
4. Clicks "Hire / Agree on Job".
5. Enters Description ("Fix tripping breaker board & test inverter lines"), Agreed Price (`₦32,000`), Agreed Date (`October 4`).
6. Submits job → Record created with status `agreed` (or `requested`).
7. Navigates to "My Jobs" → Sees job in Active tab.
8. When provider starts, status is updated to `in-progress`.
9. When work is done, status is updated to `completed`.
10. System prompts "Review Chinedu". Customer answers 3 accountability checks and gives 5 stars.
11. Review publishes with "Verified Job" badge and updates Chinedu's public profile.

### Flow 2: Reporting an Issue
1. Customer has an active job with an artisan who failed to show up or increased the price.
2. Customer navigates to Job Details.
3. Clicks "Report Issue".
4. Selects problem type (e.g., "Price Changed on Site" or "Provider Did Not Arrive") and submits details.
5. Job status transitions to `issue-reported`.
6. Issue is stored on the job record with timestamp, customer note, and preservation of the original agreed price.

---

## 11. Screen Requirements

1. **Home / Landing:** Hero search, city indicator (Abuja), category quick-links, trust value pillars, featured trusted providers, recent verified job ticker.
2. **Service Categories:** Grid of 9 core categories with active artisan counts.
3. **Provider Directory & Search Results:** Split layout / responsive list with filter sidebar (neighborhood, min rating, price range, sorting).
4. **Provider Profile:** Comprehensive reputation dossier, services list, past verified jobs, and customer reviews.
5. **Create Job Modal / Screen:** Clean, focused form capturing provider, service, description, agreed price, agreed date, and notes.
6. **My Jobs (Customer):** Tabbed interface (`Active`, `Completed`, `Issues`) with rich cards detailing provider, service, agreed price, date, and status badges.
7. **Job Details:** Detailed timeline of the job, status progression actions, notes log, and review prompt/issue report actions.
8. **Review Modal:** Verified review submission with 1-5 stars and 3 binary truth questions.
9. **Provider Dashboard:** Artisan-centric view with key performance indicators (total earnings, active jobs, customer rating, punctuality score) and incoming jobs list.
10. **Customer Profile:** Simple customer identity overview and activity stats.
11. **Settings:** Data management (Export JSON, Import JSON, Reset Data), city selection, and role switcher.

---

## 12. Data Model

### User Entity
```json
{
  "id": "usr_001",
  "name": "Funke Adeyemi",
  "phone": "+234 803 123 4567",
  "email": "funke.adeyemi@example.com",
  "city": "Abuja",
  "role": "customer",
  "createdAt": "2026-09-15T08:00:00.000Z"
}
```

### Provider Entity
```json
{
  "id": "prv_001",
  "userId": "usr_p01",
  "name": "Chinedu Okafor",
  "category": "Electrician",
  "services": ["Breaker Panel Upgrades", "Inverter Installation", "House Conduit Wiring", "Fault Finding"],
  "city": "Abuja",
  "serviceAreas": ["Wuse II", "Maitama", "Garki", "Jabi", "Utako"],
  "bio": "Licensed residential and light commercial electrician with 9 years experience in Abuja...",
  "phone": "+234 802 987 6543",
  "rating": 4.8,
  "completedJobs": 47,
  "verifiedReviews": 39,
  "typicalPriceMin": 25000,
  "typicalPriceMax": 45000,
  "availability": "Available Today",
  "profileImage": "assets/avatars/chinedu.jpg",
  "isVerifiedIdentity": true,
  "createdAt": "2026-01-10T10:00:00.000Z"
}
```

### Service Entity
```json
{
  "id": "srv_elec_01",
  "name": "Electrical Fault Finding & Inverter Repair",
  "category": "Electrician",
  "description": "Comprehensive troubleshooting for electrical trips, inverter switch issues, and short circuits."
}
```

### Job Entity
```json
{
  "id": "job_101",
  "customerId": "usr_001",
  "providerId": "prv_001",
  "serviceName": "Breaker Panel & Inverter Diagnostic",
  "description": "Diagnose intermittent tripping on main distribution box and test battery charge controller.",
  "agreedPrice": 32000,
  "agreedDate": "2026-10-04",
  "createdAt": "2026-10-01T14:30:00.000Z",
  "status": "in-progress",
  "notes": "Gate security code will be provided via SMS. Come with multimeter.",
  "issue": null,
  "completedAt": null
}
```

*Status enum values:* `"requested" | "agreed" | "in-progress" | "completed" | "cancelled" | "issue-reported"`

### Review Entity
```json
{
  "id": "rev_501",
  "jobId": "job_101",
  "customerId": "usr_001",
  "customerName": "Funke Adeyemi",
  "providerId": "prv_001",
  "rating": 5,
  "reviewText": "Chinedu was punctual and identified the short circuit within 30 minutes. Respected the agreed ₦32,000 price without asking for 'fuel money'.",
  "arrivedAsAgreed": true,
  "priceAsAgreed": true,
  "jobCompleted": true,
  "createdAt": "2026-10-04T17:15:00.000Z",
  "verified": true
}
```

---

## 13. Trust & Verification Model

1. **Clear Status Badges:**
   - `Verified Identity`: Provider has verified their government identification and local business workshop location.
   - `Listed`: Provider is registered on the platform with verified phone contact, pending full identity review.
2. **Verified Job Badge:** Reviews can strictly only be submitted against a completed `jobId`. Unverified or unsolicited reviews are impossible by design.
3. **No False Certification Claims:** Kazi explicitly informs users: *"Reviews are submitted by customers upon job completion. Kazi does not independently guarantee the outcome or act as an insurer."*

---

## 14. Abuse & Fraud Considerations

- **Review Astroturfing:** Prevented because reviews require a pre-existing job record transition to `completed`.
- **Duplicate Job Throttling:** Prevent rapid spam submissions for identical service provider/date combinations.
- **Price Tampering:** `agreedPrice` is stored in the initial job creation and cannot be silently mutated by either party. Any deviation is captured as an issue or review flag.
- **Biased Accusations:** Issue reports are styled as *Customer Reports* with neutral language rather than punitive automated verdicts.

---

## 15. UX Requirements

- **Design Tone:** Modern, trustworthy, clean, utilitarian, and distinctly Nigerian. Emerald greens (`#0e766e`, `#047857`), deep slates (`#0f172a`, `#1e293b`), crisp whites, and amber accents (`#d97706`).
- **Currency Display:** All currency values must use the Nigerian Naira symbol (`₦`) and standard comma groupings (e.g. `₦32,000`).
- **No CSS Variables Rule:** To satisfy system constraints, pure direct CSS declarations (`#047857`, `16px`, `8px`) must be used without `var(--...)`.
- **Mobile First:** Touch-friendly tap targets (minimum 44x44px), thumb-friendly navigation bar, fluid responsive cards, and clean slide-over modals.

---

## 16. Accessibility Requirements

- Valid, semantic HTML5 tags (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`, `<article>`).
- Explicit `<label>` associations for all form controls.
- Contrast ratio meeting WCAG 2.1 AA standards (> 4.5:1 for normal text).
- Visible `:focus-visible` outlines for keyboard navigability.
- Clear `aria-live` announcements for dynamic status changes and modal transitions.

---

## 17. Technical Architecture

- **Format:** Single-page dynamic architecture using modular vanilla JavaScript without bundlers or compilers.
- **Structure:**
  ```text
  /
  ├── index.html
  ├── css/
  │   └── styles.css
  ├── js/
  │   ├── app.js         (Router, screen coordinator, role management)
  │   ├── data.js        (Realistic seed data for Abuja)
  │   ├── storage.js     (LocalStorage engine, CRUD, import/export)
  │   ├── providers.js   (Provider queries, filtering, card/profile rendering)
  │   ├── jobs.js        (Job state machine, creation, updates, issue logging)
  │   ├── reviews.js     (Review validation, submission, score recalculation)
  │   └── ui.js          (Modals, toast alerts, formatters, dropdowns)
  ├── assets/
  ├── PRD.md
  ├── README.md
  └── Journal.md
  ```

---

## 18. LocalStorage Architecture

- **Keyspace:**
  - `kazi_storage_initialized`: boolean flag.
  - `kazi_users`: List of user records.
  - `kazi_active_user`: Active session user ID.
  - `kazi_providers`: Array of provider profiles.
  - `kazi_jobs`: Array of jobs.
  - `kazi_reviews`: Array of reviews.
  - `kazi_services`: Category and service catalogue.
- **Transaction Safety:** Reads and writes wrapped in `try...catch` with automatic fallback to seed data if corruption or quota issues arise.

---

## 19. JSON Import/Export Requirements

- **Export:** Downloads a timestamped JSON file (`kazi-backup-YYYY-MM-DD.json`) containing all providers, jobs, reviews, and active configuration.
- **Import:**
  - Validates that imported data is valid JSON.
  - Checks for required root arrays (`providers`, `jobs`, `reviews`).
  - Confirms replacement with the user via a modal prompt before overwriting.
  - Re-initializes UI seamlessly upon successful restore.

---

## 20. Seed Data Requirements

Must provide at least 24 realistic Abuja-based artisans:
- 5 Electricians (e.g., Chinedu Okafor, Tunde Bakare, Ibrahim Musa, Emeka Nwosu, Sunday Adeleke)
- 5 Plumbers (e.g., Emeka Eze, Usman Garba, Babatunde Alabi, Jude Okeke, Mohammed Bello)
- 5 Mechanics (e.g., Kelechi Amadi, Yakubu Danladi, Rasheed Sanusi, Kenneth Obi, Samuel Olatunji)
- 3 Tailors (e.g., Amina Bello, Hadiza Yusuf, Blessing Okon)
- 3 Cleaners (e.g., Fatima Mohammed, Ngozi Eze, Grace Danjuma)
- 3 Barbers (e.g., Tayo Adeyemi, Collins Igwe, Ahmed Sani)

Each artisan must include realistic Abuja neighborhoods (Wuse II, Maitama, Jabi, Gwarinpa, Garki, Utako, Apo, Kubwa, Lokogoma), realistic pricing, past jobs, and verified reviews.

---

## 21. Success Metrics

1. User can navigate from landing page to Chinedu's profile and create a job in under 60 seconds.
2. 100% of jobs retain their initial agreed price after multiple status transitions.
3. 100% of submitted reviews correctly calculate aggregate ratings and attach exclusively to verified job IDs.
4. Seamless offline state persistence across browser refreshes and tab closures.
5. Exported JSON file can be restored onto a fresh session without loss of integrity.

---

## 22. Assumptions

- Users have modern desktop or mobile browsers supporting ES6 and LocalStorage.
- Initial jobs are created by agreement between customer and artisan offline or through direct telephone communication, with Kazi acting as the agreed digital record of truth.
- Currency is Nigerian Naira (₦).

---

## 23. Risks & Mitigations

- **Risk:** LocalStorage quota exhaustion or browser cache clear.  
  *Mitigation:* Compact data structures and prominent JSON backup/export prompts in settings.
- **Risk:** Users assuming Kazi guarantees insurance or physical security.  
  *Mitigation:* Clear, unambiguous trust copy emphasizing Kazi's role as a mutual accountability record, not an employer or insurer.

---

## 24. Future Possibilities (Post-MVP)

- Direct SMS/WhatsApp status notification webhooks.
- Multi-city expansion (Lagos, Port Harcourt, Ibadan, Kano).
- Escrow milestone payments via Central Bank of Nigeria licensed payment providers.
- Provider verification portal for artisan guild certificates and identity verification.

---

## 25. Acceptance Criteria

The MVP is complete when the following end-to-end user verification scenario executes flawlessly:
1. Open Kazi.
2. Verify city indicator is Abuja.
3. Select "Electrician" category.
4. Browse electricians list and click Chinedu Okafor.
5. Review Chinedu's 4.8 rating, 47 completed jobs, and verified reviews.
6. Click "Create Job" / "Hire Chinedu".
7. Enter `₦32,000` agreed price, select `October 4`, and submit.
8. Verify job appears immediately under "My Jobs" (Active tab).
9. Transition status: `Agreed` → `In Progress` → `Completed`.
10. Submit a verified review answering all 3 accountability questions.
11. Verify the review immediately appears on Chinedu's profile, updating his review count and rating.
12. Refresh browser → confirm all data persists.
13. Export JSON backup → clear data → Import JSON backup → confirm complete data restoration.

---

## 26. Authentication, User Profiles & Unique Kazi IDs (MVP Specification)

### 26.1 Authentication Architecture (Frontend MVP LocalStorage)
- **Zero Backend Constraint:** Authentication is implemented as an offline client-side system using LocalStorage. It serves as an MVP prototype for user identity and role simulation.
- **Session State:** Stored under key `kazi_active_user_id`. When logged in, this points to a valid user `id` in `kazi_users`. When logged out, the key is removed.
- **Sign Up Flow:**
  - Role selection: **Customer** or **Artisan / Service Provider**.
  - Common fields: `fullName`, `email`, `phone`, `city` (default Abuja), `password`, `confirmPassword`.
  - Artisan additional fields: `primaryService`, `yearsOfExperience`, `typicalPriceMin`, `typicalPriceMax`, `serviceAreas`, `bio`.
  - Validates duplicate email/phone and password matching.
  - Automatically signs in and navigates to the respective dashboard.
- **Login Flow:**
  - Accepts registered email or phone with password.
  - Validates credentials against `kazi_users`.
  - 1-click Demo Quick Fill buttons provided for rapid testing:
    - Customer Demo: `customer@kazi.demo` / `demo123` (Vivian Dike)
    - Artisan Demo: `artisan@kazi.demo` / `demo123` (Chinedu Okafor)
- **Logout Flow:**
  - Clears `kazi_active_user_id` and redirects to the landing page (`#home`).

### 26.2 Permanent Unique Kazi ID System
Every registered user receives a permanent, immutable Kazi ID upon account creation:
- **Customer Format:** `KZ-CUS-000001`, `KZ-CUS-000002`, ...
- **Artisan Format:** `KZ-ART-000001`, `KZ-ART-000002`, ..., `KZ-ART-000024`, ...
- **Immutability Guarantee:** The numerical ID is generated once and is never altered when a user edits their name, phone, email, or trade profile.
- **Persistence & Anti-Reuse:** An ID registry key `kazi_id_registry` tracks all issued IDs alongside persistent counters (`kazi_counter_cus`, `kazi_counter_art`) to guarantee that IDs cannot be reused if an account is deleted.

### 26.3 Role Separation & Dashboards
Clear visual and functional separation between roles:

#### Customer Experience:
- **Navigation:** Home, Find Services, My Jobs, My Profile, Settings, Logout.
- **Dashboard:**
  - Personalized greeting with permanent Customer Kazi ID badge.
  - KPI Cards: Active Jobs count, Jobs Awaiting Review count, Completed Jobs count.
  - Quick action: "+ Find a Service".
  - Awaiting Review Banner: Prompts customer to review completed jobs to enforce the accountability loop.
  - Active Agreements cards with direct action to mark completed or view agreement records.
- **Access Guard:** Customers cannot navigate to `#artisan-dashboard` or `#artisan-profile`.

#### Artisan / Service Provider Experience:
- **Navigation:** Home, Directory, Artisan Dashboard, My Jobs, Professional Profile, Settings, Logout.
- **Dashboard:**
  - Personalized greeting with permanent Artisan Kazi ID badge.
  - Trade & city indicator (e.g. Electrician · Abuja).
  - KPI Cards: Average customer star rating, verified reviews count, completed jobs count, active agreements, tracked agreed earnings.
  - Active & Scheduled jobs list with client name, customer Kazi ID, date, locked agreed price, and status progression buttons (`Start Job`, `Mark Completed`).
  - Recent verified customer feedback stream with accountability checklist indicators (punctuality, price integrity).
- **Access Guard:** Artisans cannot navigate to `#customer-dashboard` or `#customer-profile`.

### 26.4 Profile Management & Synchronization
- **Customer Profile:**
  - View & Edit: Full Name, Email, Phone, City, Delivery Address/Landmark, Preferred Contact Method.
  - Permanent Kazi ID is displayed prominently in a locked state.
  - Edits persist to `kazi_users` and automatically synchronize `customerName` across counterparty job records without creating duplicate records.
- **Artisan Professional Profile:**
  - Private Account Info: Full Name, Email, Phone, City (kept private from the public directory).
  - Public Trade Info: Primary trade, services catalogue, service areas in Abuja, years of experience, typical price range (min/max ₦), availability status, professional bio.
  - Edits update `kazi_users`, automatically synchronize `kazi_providers` catalog entries, and update `providerName` across counterparty job cards.

### 26.5 Public vs. Private Information Boundaries
- **Public Artisan Directory:** Displays trade credentials, verified review scores, completed job counts, years of experience, and permanent Kazi ID (`KZ-ART-XXXXXX`). Does NOT expose personal email or password.
- **Customer Privacy:** Customers do not have a public marketplace profile and cannot be browsed by other users in any directory. Customer Kazi IDs (`KZ-CUS-XXXXXX`) are only displayed within their private account and mutual job agreement records.

### 26.6 Non-Destructive Data Migration
- On initialization, `KaziStorage.runMigration()` inspects existing browser LocalStorage:
  1. Detects users or seed providers lacking a `kaziId`.
  2. Generates permanent sequential IDs without overwriting existing jobs, notes, or reviews.
  3. Ensures demo accounts (`customer@kazi.demo`, `artisan@kazi.demo`) exist with matching credentials.
  4. Preserves all 24 Abuja seed artisans, existing jobs, and reviews intact.

