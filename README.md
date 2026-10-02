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

## 10. Available User Roles

1. **Customer View (Default — Funke Adeyemi):**
   - Search & filter providers.
   - View provider ratings and verified customer reviews.
   - Hire provider / Agree on a job (price, date, scope).
   - Track active jobs in "My Jobs".
   - Progress job status (`Agreed` → `In Progress` → `Completed`).
   - Report issues (late arrival, price changed, poor quality).
   - Submit verified reviews upon completion.

2. **Provider View (Chinedu Okafor — Electrician):**
   - Access the Provider Dashboard.
   - View assigned customer requests and ongoing jobs.
   - View cumulative earnings based on completed agreed prices.
   - Review incoming verified reviews and reputation rating.

Toggle seamlessly between roles via the role selector in the top navigation header.

---

## 11. Known Limitations

- **Client-Side Prototype:** Data is stored in browser LocalStorage. Data is isolated to the specific browser instance unless exported/imported via JSON.
- **No Payment Gateway:** Escrow and online payments are simulated through clear agreement records; actual funds exchange happens offline via cash/transfer.
- **Prototype Auth:** Authentication is simulated via an instant persona switcher rather than email/password tokens.

---

## 12. Future Improvements

- Backend API integration with Node.js/PostgreSQL.
- SMS and WhatsApp milestone notifications via Twilio/Africa's Talking.
- Payment escrow integration with Paystack or Flutterwave.
- Artisan Guild verification badges and national ID verification (NIN).
- Expansion to Lagos, Port Harcourt, Ibadan, and Kano.
