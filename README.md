# KAZI — Trusted Local Services Platform

> **Find reliable people. Agree on the job. Track what happens.**  
> Built for Abuja, Nigeria.

---

## 1. Product Description

**Kazi** is a trust- and accountability-centered web platform that connects people in Nigerian cities with reliable local service providers (electricians, plumbers, mechanics, tailors, cleaners, barbers, carpenters, painters, and AC technicians).

Kazi is **not** an on-demand dispatcher or simple classifieds directory. Its primary mission is to solve the pervasive trust deficit in informal urban services by creating a verifiable digital record for every job agreement: locking in the agreed price, tracking lifecycle milestones, recording customer-reported issues without bias, and restricting reviews exclusively to verified, completed jobs.

---

## 2. The Problem Being Solved

In urban Nigeria (such as Abuja), hiring an artisan frequently results in:
* Endless delays with the ubiquitous promise *"I'm coming"*.
* Unclear, changing, or inflated prices once the artisan arrives.
* Ghosting, missed appointments, and zero accountability.
* Inability to differentiate true craftsmen from inexperienced handymen.
* Lack of formal records when repairs fail or property is compromised.

Kazi makes **reliability and accountability visible** through the core loop:
**Discover → Evaluate → Agree → Track → Complete → Review**.

---

## 3. Key Features

- **Abuja Provider Directory:** Browse and filter verified artisans across 9 major trade categories in key Abuja districts (Wuse II, Maitama, Garki, Jabi, Utako, Gwarinpa, Apo, Kubwa, Lokogoma).
- **Reputation Transparency:** Real statistics on completed jobs, verified reviews, punctuality, and typical price ranges in Nigerian Naira (`₦`).
- **Mutual Job Agreement Engine:** Customers create formal job records locking in the service, task description, agreed price, and agreed service date.
- **Job Lifecycle Tracking:** Real-time progression across `Requested` → `Agreed` → `In Progress` → `Completed` (or `Issue Reported` / `Cancelled`).
- **Immutable Agreed Price:** The initially agreed price remains prominently visible across all lifecycle states to prevent surprise price escalations.
- **Verified Reviews Only:** Ratings (1–5 stars) and reviews can strictly only be submitted against completed Kazi job records, with 3 key accountability questions:
  1. *Did the provider arrive as agreed?*
  2. *Was the agreed price respected?*
  3. *Was the job completed satisfactorily?*
- **Customer & Provider Dashboards:** Segregated view of active, completed, and disputed jobs, plus an artisan dashboard showing performance metrics and earnings.
- **Role Switcher:** Switch between customer persona (*Funke Adeyemi*) and provider persona (*Chinedu Okafor*) to preview both sides of the experience.
- **Zero-Dependency Offline Storage:** Powered by browser LocalStorage with comprehensive JSON export and import capabilities.

---

## 4. Technology Stack

- **Markup:** Semantic HTML5 (`<main>`, `<nav>`, `<header>`, `<section>`, `<article>`, `<dialog>`).
- **Styling:** Pure Vanilla CSS3 with direct declarations (strictly **zero CSS variables / custom properties** in compliance with architectural guidelines).
- **Scripting:** Modular, object-oriented Vanilla JavaScript (ES6+).
- **Libraries / Frameworks:** None. Zero build tools, zero npm dependencies, zero CSS frameworks.
- **Persistence:** Browser `window.localStorage`.

---

## 5. Project Structure

```text
kazi/
├── index.html            # Main single-page web application container
├── css/
│   └── styles.css        # Pure Vanilla CSS (direct declarations, responsive, clean design)
├── js/
│   ├── app.js            # App coordinator, routing, screen switching, role management
│   ├── data.js           # Realistic seed dataset for Abuja (24+ artisans across 6 categories)
│   ├── storage.js        # LocalStorage repository, state persistence, backup & restore
│   ├── providers.js      # Provider catalog, search, filter, card & profile UI
│   ├── jobs.js           # Job lifecycle state machine, creation, updates, issue reports
│   ├── reviews.js        # Review submission, verified job validation, rating calculations
│   └── ui.js             # Toast notifications, modal managers, currency/date formatters
├── assets/
│   └── avatars/          # SVG avatar portraits for realistic local representations
├── PRD.md                # Comprehensive Product Requirements Document
├── README.md             # This project documentation
└── Journal.md            # Detailed chronological engineering & design journal
```

---

## 6. How to Run Locally

Because Kazi is built with standard web technologies and no build tools, running it is instantaneous:

### Option A: Direct Browser Opening
Simply double-click `index.html` or open it directly in any modern browser (Chrome, Firefox, Safari, Edge).

### Option B: Local Static Server (Recommended)
If you prefer running via a local web server (e.g. for inspection or browser subagents):

```bash
# Using Python 3:
python -m http.server 3000

# Or using Node npx:
npx serve .
```
Then navigate to `http://localhost:3000` in your web browser.

---

## 7. How LocalStorage Works

All application data is maintained locally in the browser's `localStorage` under distinct keys:
* `kazi_storage_initialized`: Initialization flag.
* `kazi_providers`: Array of service provider records.
* `kazi_jobs`: Array of job records tracking status, agreed price, and issues.
* `kazi_reviews`: Array of verified customer reviews linked to job IDs.
* `kazi_users`: Registered customer and provider profile records.
* `kazi_current_role`: Currently active role (`customer` or `provider`).
* `kazi_current_user_id`: Current active user ID.

On first load, Kazi checks if storage is initialized. If not, it populates the database with realistic Abuja seed data from `js/data.js`. Subsequent updates, job creations, status transitions, and reviews immediately write through to LocalStorage.

---

## 8. How JSON Export & Import Works

### Export Data
1. Navigate to **Settings** in the top navigation or profile menu.
2. Under **Data Management**, click **"Export Data as JSON"**.
3. A timestamped file named `kazi-backup-[TIMESTAMP].json` is automatically generated and downloaded containing all providers, jobs, and reviews.

### Import Data
1. In **Settings**, click **"Restore from Backup"** and choose a valid Kazi `.json` backup file.
2. Kazi validates the structure (ensuring `providers`, `jobs`, and `reviews` arrays exist).
3. A modal asks for confirmation before replacing existing data.
4. On confirmation, the data is restored and the application state instantly refreshes.

### Reset to Seed Data
In **Settings**, click **"Reset to Demo Data"** to wipe current changes and re-seed the standard Abuja dataset.

---

## 9. Demo & Seed Data

The platform comes pre-populated with **24 realistic artisans** stationed across Abuja:
- **5 Electricians:** Chinedu Okafor (Wuse II), Tunde Bakare (Garki), Ibrahim Musa (Maitama), Emeka Nwosu (Gwarinpa), Sunday Adeleke (Jabi).
- **5 Plumbers:** Emeka Eze (Garki), Usman Garba (Utako), Babatunde Alabi (Wuse II), Jude Okeke (Apo), Mohammed Bello (Kubwa).
- **5 Mechanics:** Kelechi Amadi (Apo Mechanic Village), Yakubu Danladi (Utako), Rasheed Sanusi (Gudu), Kenneth Obi (Maitama/Jabi), Samuel Olatunji (Gwarinpa).
- **3 Tailors:** Amina Bello (Wuse II), Hadiza Yusuf (Maitama), Blessing Okon (Garki).
- **3 Cleaners:** Fatima Mohammed (Jabi), Ngozi Eze (Gwarinpa), Grace Danjuma (Wuse II).
- **3 Barbers:** Tayo Adeyemi (Wuse II), Collins Igwe (Gwarinpa), Ahmed Sani (Maitama).

Sample completed jobs and verified reviews are pre-attached so provider reputation statistics reflect realistic numbers.

---

## 10. Authentication & Demo Accounts

Kazi features a dedicated client-side authentication and session management system built on LocalStorage. It allows you to experience separate Customer and Artisan accounts without needing a backend server.

### Demo Credentials (1-Click Fill Available on Login)

| Account Role | Demo Email | Demo Password | Default Name | Permanent Kazi ID | Primary District / Trade |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer** | `customer@kazi.demo` | `demo123` | Vivian Dike | `KZ-CUS-000001` | Wuse II, Abuja |
| **Artisan** | `artisan@kazi.demo` | `demo123` | Chinedu Okafor | `KZ-ART-000001` | Electrician · Wuse II |

*(You can also register brand-new Customer and Artisan accounts via the Sign Up screen).*

---

## 11. Creating an Account & Login Flow

### Sign Up Flow
1. Click **Sign Up** in the top navigation header.
2. Select your account type:
   - **Customer:** For individuals and businesses looking to hire trusted local service providers.
   - **Artisan / Service Provider:** For skilled tradespeople offering professional services.
3. Fill out the registration fields:
   - *Customer:* Full Name, Email, Phone, City, Password, Confirm Password.
   - *Artisan:* Additionally specifies Primary Trade (Electrician, Plumber, Tailor, etc.), Years of Experience, Typical Price Range (Min/Max ₦), Service Areas in Abuja, and Professional Bio.
4. Click **Create Account**:
   - Generates a permanent, unique Kazi ID.
   - Automatically initializes your authenticated session in LocalStorage.
   - If registering as an artisan, automatically creates your public directory listing in the Abuja catalogue.
   - Immediately redirects to your role-specific dashboard.

### Login Flow
1. Click **Log In** in the top navigation header.
2. Enter your registered email or phone number and password.
3. Alternatively, click either of the **1-Click Demo Fill buttons**:
   - `👤 Customer Demo (Vivian)`
   - `🛠️ Artisan Demo (Chinedu)`
4. Click **Log In**: Your active session is saved to `kazi_active_user_id` and your role-appropriate dashboard loads.

---

## 12. Customer vs. Artisan Experience

### Customer Journey
* **Navigation:** Home · Find Services · My Jobs · My Profile · Settings · Log Out.
* **Customer Dashboard:**
  * Greeting with permanent Customer Kazi ID badge.
  * KPI summary cards: Active Jobs, Jobs Awaiting Review, Total Completed.
  * Awaiting Review Alert Banner: Prompts customer to review completed jobs to enforce the accountability loop.
  * Quick Action: `+ Find a Service`.
  * Active service agreements cards with direct link to view agreement records.
* **Customer Profile:** View and edit personal contact details (Full Name, Email, Phone, City, Delivery Address, Preferred Contact Method). Changes instantly propagate to active and historical job cards without creating duplicate user records.
* **Privacy:** Customers do not have a public marketplace profile and cannot be browsed by other users in any directory.

### Artisan / Service Provider Journey
* **Navigation:** Home · Directory · Artisan Dashboard · My Jobs · Professional Profile · Settings · Log Out.
* **Artisan Dashboard:**
  * Greeting with permanent Artisan Kazi ID badge and trade indicator.
  * KPI summary cards: Customer Rating (★), Verified Reviews Count, Completed Jobs Count, Active Agreements, Tracked Agreed Earnings (in ₦).
  * Active & Scheduled Jobs list showing counterparty customer name, Customer Kazi ID, agreed arrival date, locked agreed price, and milestone progression buttons (`Start Job`, `Mark Completed`).
  * Recent customer review feedback feed with arrival and price-respect checkmarks.
* **Professional Profile:**
  * *Private Account Info:* Full Name, Email, Phone, City (kept private).
  * *Public Trade Info:* Primary Trade, Experience Years, Typical Price Range, Service Areas, Services Offered, Bio.
  * Profile edits update the user account, synchronize the public Abuja directory listing, and update provider names across all counterparty job records.
* **Public Profile:** Customers can view the artisan's public profile on the directory displaying their trade credentials, completed jobs, verified reviews, and permanent Kazi ID (`KZ-ART-XXXXXX`) without exposing private account credentials.

### Access Protection & Route Guards
* Logged-out guests cannot access protected screens (`My Jobs`, `My Profile`, `Customer Dashboard`, `Artisan Dashboard`, `Settings`) and are redirected to `#login`.
* Logged-in customers attempting to access `#artisan-dashboard` or `#artisan-profile` are automatically redirected to `#customer-dashboard`.
* Logged-in artisans attempting to access `#customer-dashboard` or `#customer-profile` are automatically redirected to `#artisan-dashboard`.

---

## 13. Permanent Unique Kazi ID System

Every registered user on Kazi receives a permanent, unique Kazi ID:
* **Customer Prefix:** `KZ-CUS-000001`, `KZ-CUS-000002`, ...
* **Artisan Prefix:** `KZ-ART-000001`, `KZ-ART-000002`, ..., `KZ-ART-000024`, ...

### Guarantees:
1. **Generated Once at Creation:** Issued sequentially upon registration.
2. **Permanent & Immutable:** Never changes when a user edits their name, phone, email, or trade profile.
3. **Persistently Registered:** Tracked in a persistent registry (`kazi_id_registry`) in LocalStorage to ensure IDs are never reused even if an account is deleted.
4. **Counterparty Accountability:** The customer's Kazi ID is attached to job records and verified reviews; the artisan's Kazi ID is displayed on public cards, directory profiles, and job agreements.

---

## 14. Authentication Limitations (MVP Prototype)

* **Client-Side Prototype:** This is a frontend demo authentication system using browser LocalStorage. Passwords are saved in LocalStorage for demo credential verification and are not cryptographically hashed with salting or bcrypt.
* **No Server Sessions or JWTs:** Intended for prototyping, user testing, and architectural validation. Do not use production sensitive credentials.
* **Browser Isolation:** User sessions and data are bound to the specific browser instance unless backed up and restored via JSON export/import.

---

## 12. Future Improvements

- Backend API integration with Node.js/PostgreSQL.
- SMS and WhatsApp milestone notifications via Twilio/Africa's Talking.
- Payment escrow integration with Paystack or Flutterwave.
- Artisan Guild verification badges and national ID verification (NIN).
- Expansion to Lagos, Port Harcourt, Ibadan, and Kano.


Future features includes but not limited to:
In-app payments
Escrow
Commission processing
Live GPS tracking
Real-time messaging
Video calls
Complex provider scheduling
Automated price negotiation
AI matching
Background checks
Government ID verification
Insurance
Financing
Provider subscriptions
Complex dispute resolution
Multi-city logistics
Native mobile apps