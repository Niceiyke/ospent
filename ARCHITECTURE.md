# Architecture & Engineering Plan: Ospent (Budgeting App)

## 1. Vision & Core Philosophy
**Goal:** Transform a static Google Sheet into a dynamic, "Local-First" modern web application for budgeting and expense tracking.
**Philosophy:** "Data Ownership & Speed." The app will start as a secure, browser-based tool (zero-setup) with the capability to sync to a backend in V2.

### Killer Features (Proposed)
1.  **CSV Import/Smart-Sync:** Drag-and-drop your Google Sheet exports directly to populate the app instantly.
2.  **"Privacy Mode":** A toggle to blur all monetary values (useful for working in public).
3.  **Recurring Detective:** Automatically identifies potential subscriptions from transaction patterns.
4.  **Forecast Engine:** Simple linear projection of "End of Month Balance" based on current spending velocity.

## 2. Risk Assessment (The "Devil's Advocate")
1.  **Data Loss (Critical):** Users clearing browser cache could lose data in a local-only app.
    *   *Antidote:* Auto-backup to JSON file on every 10th change, or prominent "Export Backup" button. Implement `IndexedDB` for robust local storage over `localStorage`.
2.  **Performance with Large Sheets:** Rendering 10,000+ rows from years of history.
    *   *Antidote:* Virtualized lists (windowing) for the transaction table.
3.  **Complex Categorization:** Users hate manual tagging.
    *   *Antidote:* Rule-based auto-categorization (e.g., "If description contains 'Netflix', category = 'Entertainment'").

## 3. The "Holy Trinity" Architecture
### Frontend (The Core)
-   **Framework:** React 18 + Vite (Current Setup).
-   **Language:** TypeScript (Strict Mode).
-   **State Management:** React Context + Hooks (for MVP) or Zustand (for V2 if complex).
-   **Persistence:** `idb` (IndexedDB wrapper) for storing transactions/settings locally.
-   **Styling:** Tailwind CSS + `clsx`/`tailwind-merge`.
-   **Charts:** Recharts (already installed) for "Spend by Category" and "Trend over Time".
-   **Icons:** Lucide React.

### Data Model (Inferred from "Budget Sheet" context)
*   **Transaction:** `{ id, date, amount, type (income/expense), category, description, tags[] }`
*   **Category:** `{ id, name, color, budgetLimit }`
*   **Settings:** `{ currency, theme, rules[] }`

## 4. Aesthetic Identity
**Theme:** "Neo-Fintech Clean"
-   **Vibe:** Professional, distraction-free, high-contrast for data readability.
-   **Primary Color:** `Emerald-600` (Money/Growth positive) or `Slate-900` (Professional).
-   **Font:** System sans-serif (Inter-like) for UI, Monospace for numbers (tabular nums).
-   **Radius:** `rounded-lg` (Modern but not overly playful).

## 5. Execution Plan (Next Steps)
1.  **Scaffold Layout:** Sidebar navigation, Dashboard shell, Responsive container.
2.  **Data Layer:** Create `useTransactions` hook with `IndexedDB` integration.
3.  **Feature - Transactions:** Data table with sorting/filtering.
4.  **Feature - Dashboard:** Summary cards (Total Balance, Income, Expense) + Charts.
5.  **Feature - Import:** CSV parser for Google Sheet ingestion.

---

**❓ Question for User:**
Since I cannot visually interpret the specific columns in your screenshots (`02.png` - `06.png`), could you please confirm:
1.  **Columns:** Does your sheet track *just* Date, Description, Amount, Category? Or do you have extra columns like "Payment Method", "Sub-category", or "Status"?
2.  **Charts:** What is the *most important* chart you use? (e.g., "Monthly Spending vs Budget" or "Category Pie Chart")?
