# BurnoutX-AI System Architecture & Summary

**BurnoutX-AI** is a comprehensive, hybrid employee wellness and analytics platform engineered specifically to track, assess, and intuitively map both **daily work metrics** and **psychological stress vulnerabilities**.

The application enforces strict Role-Based Access Control (RBAC), segregating internal logic exclusively into two distinct domains: **Employees** and **HR Administrators**.

---

## Technology Stack

### Frontend Architecture
* **React 18** (Vite build system)
* **React Router v6** (Protected nested routing and authentication locking)
* **Tailwind CSS v3** (Utility-first styling, glassmorphism abstractions, dynamic gradients)
* **Framer Motion** (Spring-physics animations, staggered list rendering, exit-presence lifecycles)
* **Recharts** (SVG-based reactive data visualization modeling)
* **Axios** (JWT-intercepted HTTP orchestration)

### Backend Architecture
* **Node.js Environment**
* **Express.js API** (RESTful design principles, middleware request validation)
* **MongoDB & Mongoose** (NoSQL schema modeling, advanced aggregation pipelines)
* **JSON Web Tokens (JWT)** (Stateless cryptographic authentication)
* **Bcrypt.js** (Standardized cryptographic password hashing)

---

## Theming & Global CSS Styles

The user interface of BurnoutX-AI is built on a highly polished, unified design system heavily leveraging modern dark-mode paradigms, custom Tailwind extensions, and foundational CSS properties.

1. **Design Paradigm (Glassmorphism & Gradients)**
   - The application relies on frosted-glass paneled modals overlayed on deep, dark-mode gradient backgrounds.
   - Elements utilize calculated opacities (e.g., `bg-white/5` coupled with `border-white/10`) paired with Tailwind's `backdrop-blur` classes to create depth and spatial hierarchy without solid color boundaries.

2. **Custom Typography & Variables**
   - Implements native typography scaling heavily utilizing tracking values (`tracking-wider`, `tracking-widest`) to create a severe, modern corporate aesthetic.
   - Base themes are generated using custom root variables within `index.css`:
     - **Brand Colors**: Root variables spanning `--color-brand-50` to `--color-brand-900` define primary actionable elements seamlessly layered via `bg-gradient-to-r from-brand-X to-brand-Y`.
     - **Surface Gradients**: The background root properties `--color-surface-50` through `--color-surface-900` produce the extremely dark violet-black base canvas that emphasizes the brightly colored interactive metrics.

3. **Status Indicators (Dynamic Rendering)**
   - Color theory is strictly enforced based on logical output parameters:
     - `Low Stress / Optimal`: Associated with Emeralds (`#10b981` / `text-emerald-400`).
     - `Moderate Stress / Vulnerability`: Associated with Ambers (`#f59e0b` / `text-amber-400`).
     - `High Stress / Burnout`: Associated with Reds (`#ef4444` / `text-red-400`).

4. **Scrollbar & Transition Overrides**
   - The global `index.css` overrides default Chrome/Gecko scrollbars injecting a custom, slim profile `::-webkit-scrollbar` configured to blend invisibly into the glass containers.
   - Hover elements rely exclusively on standard CSS hardware-accelerated transitions via `transition-all duration-200`.

---

## Data Models

1. **User Model**: Encrypts passwords upon persistence, tracks authorization roles (`hr` or `employee`), registers department assignments, and maps unique relational identifiers.
2. **Metric Model**: Quantifies structured daily workflows—`screenTime`, `breakTime`, `meetingTime`, `workTime`, `afterHoursTime`, executing algorithmic correlations to mathematically compute a `stressScore` (1-100) and `stressLevel` categorization (Low/Medium/High).
3. **Assessment Model**: Maps a 15-question psychological survey. Generates a macro/micro diagnostic, assigns distinct psychological profiles (`Systemic Burnout`, `Personal Vulnerability`, `Environmental Stress`, `Optimal Functioning`), flags risk severity, and algorithmically outputs a synthesized concrete reasoning.

---

## API Routing System

All internal APIs (`/api/`) dynamically reject traffic unless standard JWT headers are safely passed and intercepted via the `protect` middleware. Human Resources endpoints are fundamentally locked behind the `authorizeRoles('hr')` security middleware.

### Authentication (`/api/auth`)
* `POST /login`: Validates user credentials, executes bcrypt validation hashes, and signs a persistent JWT.
* `POST /register`: Registers new organizational users to the ecosystem.
* `GET /me`: Decodes JWT payload headers to verify and fetch an actively authorized user session.

### Daily Shift Metrics (`/api/metrics`)
* `POST /`: Submits a daily shift log strictly tied to the logged-in employee token.
* `GET /mine`: Fetches all historical shift logs belonging exclusively to the active user.
* `PUT /:id` | `DELETE /:id`: Modifies or deletes specific granular log instances.
* `GET /all` **[HR ONLY]**: Fetches the entire organization's logging histories across all departments.
* `GET /stats` **[HR ONLY]**: Executes server-side Mongoose aggregations to calculate global averages, metric distributions, and active user density.

### Psychological Assessments (`/api/assessments`)
* `POST /`: Commits a new psychological evaluation encompassing raw Q1-15 diagnostic mappings.
* `GET /mine`: Pulls historical psychological assessments associated solely to the active user.
* `GET /all` **[HR ONLY]**: Fetches comprehensive assessment logs scoped globally company-wide.
* `GET /stats` **[HR ONLY]**: Aggregates categorical psychological profiles and Risk levels, mathematically evaluating general corporate workforce equilibrium.
* `GET /:id`: Retrieves a singular isolated assessment by its identifier.

---

## User Workflows & Core Functions

### Employee Architecture
1. **Wellness Overview**: Dual-threat personalized correlation mapping. Monitors how physical inputs (`Meeting Times`, `Screen Time`) inversely tie into psychological degeneration based on algorithmic thresholds.
2. **Daily Check-In**: A streamlined data portal to document daily quantitative workflows resulting in a localized daily stress output metric.
3. **Metric History**: A chronologically sorted, highly searchable footprint of every individual daily shift legally logged.
4. **Stress Assessment**: A customized 15-question diagnostic designed by clinical blueprints to evaluate holistic burnout points.
5. **Assessment History**: An interactive accordion architecture displaying complex previous diagnostics, mapped risk levels, generated explanations, and a complete breakdown of their exact Q1-Q15 numerical answers dynamically highlighted upon severity.

### HR / Organization Architecture
1. **Workforce Analytics (HR Dashboard)**: A powerful, high-level administrative interface structurally separating algorithmic quantitative shift logs from complex diagnostic assessment arrays.
   - Computes aggregate stress levels mathematically against organization-wide output vectors.
   - Dynamic visualization rendering via Recharts graphing the company's precise Psychological Matrix Profiles spanning across four distinct stress classifications.
2. **Employee Database**: A searchable ecosystem rendering all registered corporate employees featuring dynamic filtration by categorical Stress Tiers (`High`, `Medium`, `Low`).
   - Admins execute an **Export CSV** routine natively encoding the filtered dynamic matrix data instantly into local spreadsheets.
   - Features granular drill-down pathways where clicking into a particular individual strips away global metrics to open an isolated analytical profile pulling up their exact localized assessments and native chronological metric logs.
