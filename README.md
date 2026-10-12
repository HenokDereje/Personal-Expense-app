# Personal Expense Tracker

A clean, responsive, and accessible personal finance dashboard built with **HTML5, CSS3, and Vanilla JavaScript**. The application enables users to record, organize, edit, and analyze daily expenses with instant metric calculations and reliable client-side persistence using browser `localStorage`.

---

## 🎯 Project Overview

Managing everyday finances is often complicated by bloated spreadsheet templates or web services requiring account creation, third-party tracking, and persistent internet access.

**Personal Expense Tracker** solves this problem by offering a lightweight, private, and instantaneous browser-based expense ledger. Users can:
- Track expenses with descriptions, dollar amounts, spending categories, and dates.
- Keep records accurate by editing previous entries or deleting outdated items.
- View real-time spending summaries (Total Spending, Total Transactions, Top Spending Category, and Average Expense).
- Inspect spending distribution by category with visual progress indicators.
- Locate specific entries quickly using simultaneous keyword search, category filtering, and date-range filtering.
- Retain all transaction records locally across browser refreshes.

---

## ✨ Features

All features listed below are fully implemented and verified in the codebase:

- **Add Expenses:** Log new transactions with description, monetary amount, category, and date.
- **Input Validation:** Clear, accessible validation ensuring valid descriptions (2–100 characters), positive numeric amounts ($> 0.00$), valid categories, and valid dates before saving.
- **Edit Expenses:** Edit existing entries in-place. The form switches to an "Editing Entry" mode, pre-fills the expense details, allows updating, and provides a "Cancel Edit" button to safely abort.
- **Delete Expenses:** Remove individual expenses with a safety confirmation prompt to prevent accidental data loss.
- **Spending Summary Metrics:** Real-time calculation of:
  - **Total Spending:** Cumulative expenditure formatted as USD currency with cent-level integer rounding to prevent floating-point bugs.
  - **Total Transactions:** Accurate count of logged records.
  - **Top Category:** Identifies the highest spending category and shows its cumulative total.
  - **Average Expense:** Computes the average cost per logged transaction.
- **Category Breakdown:** Visual distribution bars displaying each active category with its emoji, cumulative dollar total, and percentage of overall spending.
- **Multi-Criteria Search & Filtering:**
  - Real-time text search on expense descriptions.
  - Filter by category via dropdown.
  - Filter by date range (From Date and To Date).
  - Multi-directional sorting (Newest Date, Oldest Date, Highest Amount, Lowest Amount, Description A–Z).
  - Clear Filters button to reset all filters in a single click.
- **Contextual Empty States:**
  - Friendly onboarding state when no expenses have been recorded yet.
  - Dedicated "No matching transactions found" state with a quick reset button when filters return zero results.
- **Browser LocalStorage Persistence:** Automatically saves all transactions to the browser's `localStorage` so data remains available after closing or refreshing the tab.
- **Defensive Storage Parsing:** Gracefully validates stored data upon application startup, dropping or healing corrupted entries without throwing fatal errors.
- **Responsive Layout:** Adapts smoothly across mobile devices (375px), tablets (768px), and desktop viewports (1440px).
- **Accessibility & Security:** Semantic HTML elements, explicit `<label>` bindings, keyboard navigability with visible focus outlines (`:focus-visible`), and strict XSS defense using `textContent` for all user-provided strings.

---

## 📸 Screenshot

<!-- Once you take a screenshot of the running app, create a 'screenshots/' folder in the repository root, save your image as 'screenshots/dashboard.png', and uncomment the line below: -->
<!-- ![Personal Expense Tracker Dashboard](screenshots/dashboard.png) -->

> **How to add a screenshot to this repository:**
> 1. Run the application locally in your browser (see [Getting Started](#-getting-started) below).
> 2. Add a few sample expenses (e.g., Groceries, Transport, Bills) so the summary cards and breakdown bars are visible.
> 3. Take a screenshot of the dashboard using your operating system's screenshot tool:
>    - **Windows:** `Windows + Shift + S`
>    - **Mac:** `Cmd + Shift + 4`
> 4. Create a folder named `screenshots` in the project root directory.
> 5. Save the image file as `dashboard.png` inside the `screenshots/` folder.
> 6. Uncomment the Markdown image line in this section of `README.md`.

---

## 🛠️ Technologies Used

- **HTML5:** Provides semantic structure using accessible landmarks (`<header>`, `<main>`, `<section>`, `<article>`, `<table>`, `<footer>`), native form inputs, and explicit ARIA labels.
- **CSS3:** Built using custom properties (CSS variables for design tokens), CSS Grid and Flexbox for responsive layouts, accessible focus states, and custom styled empty states. No external CSS libraries or frameworks were used.
- **Vanilla JavaScript (ES6+):** Powers application state management, event listeners, form validation, dynamic DOM manipulation, array operations (`filter`, `reduce`, `sort`, `map`), and debounce utilities without any runtime dependencies.
- **Browser `localStorage` API:** Handles client-side persistence by serializing and deserializing JSON records directly in the user's browser.

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine:

### 1. Clone the Repository
Open your terminal or command prompt and clone the repository:
```bash
git clone https://github.com/HenokDereje/Personal-Expense-app.git
```

### 2. Navigate to the Project Folder
```bash
cd Personal-Expense-app
```

### 3. Open in Your Browser
Choose any of the following methods to view the application:

- **Method A: VS Code Live Server (Recommended)**
  1. Open the project folder in Visual Studio Code.
  2. Install the **Live Server** extension (by Ritwick Dey).
  3. Right-click `index.html` in the file explorer and select **Open with Live Server**.

- **Method B: Python Built-in HTTP Server**
  If you have Python installed, run:
  ```bash
  python -m http.server 8000
  ```
  Then open `http://localhost:8000` in your browser.

- **Method C: Direct File Execution**
  Double-click `index.html` in Windows File Explorer or macOS Finder to open it directly in Chrome, Edge, Safari, or Firefox.

---

## 📖 How to Use

1. **Adding an Expense:**
   - In the **Add New Expense** form on the left, enter a description (e.g., "Weekly Groceries").
   - Enter a dollar amount (e.g., `45.50`).
   - Select a spending category from the dropdown (e.g., "Food & Dining").
   - Select the date the expense occurred (defaults to today).
   - Click **Add Expense**. The summary cards, breakdown, and transaction table will immediately update.

2. **Editing an Expense:**
   - In the **Transaction History** table, click the blue **Edit** button next to any transaction.
   - The form fields will populate with the selected transaction's details, the heading will change to **Edit Expense**, and a **Cancel Edit** button will appear.
   - Modify the desired fields and click **Update Expense** to save changes in-place.
   - Click **Cancel Edit** at any time to discard changes and return to adding new expenses.

3. **Deleting an Expense:**
   - Click the red **Delete** button on any transaction row.
   - Confirm the deletion prompt when asked. The expense will be permanently removed from state and storage.

4. **Searching and Filtering:**
   - **Search:** Type into the "Search description..." box to filter transactions in real time.
   - **Category Filter:** Select a category to isolate specific expenses.
   - **Date Range:** Use the **From** and **To** date pickers to view expenses within a specific timeframe.
   - **Sort:** Change the sort dropdown to order by date, amount, or description alphabetically.
   - **Clear Filters:** Click **Clear Filters** (or **Reset All Filters**) to restore the full transaction list.

5. **Reading Spending Summaries:**
   - The top metric cards show your total amount spent, total transaction count, top category, and average expense.
   - The **Spending Breakdown** card displays the percentage distribution of your expenditures across all active categories.

---

## 💾 Data Storage and Limitations

- **Browser-Only Storage:** All expenses are saved exclusively in the current browser's `localStorage` under the key `expensewise_records_v1`.
- **No Cloud Synchronization:** Data is stored locally on your device. Expenses will not sync automatically across different browsers, private browsing sessions, or other devices.
- **Storage Clearing:** Clearing your browser's browsing data, cookies, or site storage will delete all saved expenses.
- **Educational Scope:** This application was developed as a portfolio and learning project. It is intended for personal budgeting practice and should not be used as a regulated or legally certified accounting system.

---

## 📁 Project Structure

The project maintains a strict separation of concerns across native web files:

```text
Personal-Expense-app/
├── .gitignore          # Ignores OS files, editor configs, and temporary logs
├── index.html          # Semantic dashboard markup, forms, cards, and table
├── style.css           # Design tokens, layout grids, responsive breakpoints, and styling
├── script.js           # State management, calculations, filtering, and storage logic
└── README.md           # Project documentation, usage guide, and technical details
```

---

## 🧠 Learning Outcomes

Building this project reinforced fundamental software engineering and frontend principles:

1. **State-Driven Architecture:** Maintaining `AppState` as a single source of truth and writing declarative render functions (`renderApp()`) rather than directly manipulating HTML table rows.
2. **Safe DOM Manipulation & XSS Prevention:** Using `document.createElement()` and `textContent` rather than `innerHTML` to ensure user inputs cannot execute arbitrary scripts.
3. **Form Validation & Accessibility (a11y):** Connecting inputs to explicit `<label>` elements, displaying descriptive error text, and implementing accessible live regions (`aria-live="polite"`).
4. **Array Operations & Pure Functions:** Leveraging `filter()`, `reduce()`, `sort()`, and `map()` to process and transform financial data cleanly.
5. **Precision Arithmetic:** Preventing JavaScript floating-point errors by converting currency values into integer cents before performing sums and calculations.
6. **Defensive Programming:** Wrapping `localStorage` reads and writes in `try...catch` blocks and sanitizing parsed JSON to prevent crashes from malformed data.
7. **Responsive CSS Design:** Implementing CSS Custom Properties (`:root`), CSS Grid, and Flexbox to build interfaces that adapt fluidly across mobile, tablet, and desktop screens without third-party frameworks.

---

## 🔮 Future Improvements

The following features are planned as potential future enhancements:

- **Data Export & Import:** Allow users to export their transaction history to a CSV or JSON file and import previous backups.
- **Configurable Currency:** Provide a settings toggle to select currency formats (e.g., EUR, GBP, JPY) instead of USD default.
- **Interactive Visual Charts:** Integrate an SVG or Canvas chart (such as a donut chart or monthly bar chart) to supplement the category progress bars.
- **Automated Testing Suite:** Introduce automated unit and end-to-end tests using a modern test framework (such as Vitest or Playwright).
- **Monthly Budget Targets:** Allow users to set spending limits per category and receive visual alerts when nearing their threshold.

---

## 👤 Author

Developed by **Henok Dereje** as a portfolio project for software engineering bootcamp applications.
