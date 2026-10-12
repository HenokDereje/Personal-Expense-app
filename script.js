/**
 * ==========================================================================
 * ExpenseWise - Personal Expense Tracker
 * Senior Frontend Architecture with Pure Vanilla JavaScript
 * ==========================================================================
 *
 * Core Engineering Principles:
 *  1. Single Source of Truth: AppState is the authoritative store.
 *  2. Separation of Concerns: Clear separation between State, Storage, Logic, and DOM View.
 *  3. Resilient Persistence: LocalStorage wrapper with malformed data healing and fallback.
 *  4. Security (XSS Prevention): User strings are safely escaped via textContent.
 *  5. Accessibility (a11y): Accessible form labels, focus states, and aria-live status regions.
 */

'use strict';

/* --------------------------------------------------------------------------
   1. Configuration & Constants
   -------------------------------------------------------------------------- */
const STORAGE_KEY = 'expensewise_records_v1';

/**
 * Category metadata with emojis for consistent presentation.
 */
const CATEGORY_META = {
  'Food & Dining': { icon: '🍔', color: '#f59e0b' },
  'Transportation': { icon: '🚗', color: '#3b82f6' },
  'Housing & Utilities': { icon: '💡', color: '#10b981' },
  'Entertainment': { icon: '🎬', color: '#ec4899' },
  'Shopping': { icon: '🛍️', color: '#8b5cf6' },
  'Healthcare': { icon: '🩺', color: '#ef4444' },
  'Education': { icon: '📚', color: '#06b6d4' },
  'Personal Care': { icon: '✨', color: '#14b8a6' },
  'Other': { icon: '📦', color: '#64748b' },
};

/* --------------------------------------------------------------------------
   2. Application State (Single Source of Truth)
   -------------------------------------------------------------------------- */
const AppState = {
  expenses: [],
  filters: {
    search: '',
    category: 'all',
    dateStart: '',
    dateEnd: '',
    sortBy: 'date-desc',
  },
  editingId: null,
};

/* --------------------------------------------------------------------------
   3. DOM Elements Cache
   -------------------------------------------------------------------------- */
const DOM = {
  // Header Elements
  dateDisplay: document.getElementById('date-display'),
  appStatusText: document.getElementById('app-status-text'),

  // Summary Metrics
  totalSpending: document.getElementById('total-spending'),
  transactionCount: document.getElementById('transaction-count'),
  topCategory: document.getElementById('top-category'),
  topCategoryCaption: document.getElementById('top-category-caption'),
  averageExpense: document.getElementById('average-expense'),

  // Expense Form & Inputs
  expenseForm: document.getElementById('expense-form'),
  formCardTitle: document.getElementById('form-card-title'),
  formCardSubtitle: document.getElementById('form-card-subtitle'),
  formModeTag: document.getElementById('form-mode-tag'),
  descriptionInput: document.getElementById('expense-description'),
  amountInput: document.getElementById('expense-amount'),
  categorySelect: document.getElementById('expense-category'),
  dateInput: document.getElementById('expense-date'),
  submitBtn: document.getElementById('submit-expense-btn'),
  submitBtnText: document.getElementById('submit-btn-text'),
  submitBtnIcon: document.getElementById('submit-btn-icon'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  resetFormBtn: document.getElementById('reset-form-btn'),
  formNotification: document.getElementById('form-notification'),

  // Validation Error Elements
  descriptionError: document.getElementById('description-error'),
  amountError: document.getElementById('amount-error'),
  categoryError: document.getElementById('category-error'),
  dateError: document.getElementById('date-error'),

  // Spending Breakdown
  breakdownEmpty: document.getElementById('breakdown-empty'),
  breakdownList: document.getElementById('breakdown-list'),

  // Transactions Table & Toolbar
  searchInput: document.getElementById('search-input'),
  filterCategory: document.getElementById('filter-category'),
  filterDateStart: document.getElementById('filter-date-start'),
  filterDateEnd: document.getElementById('filter-date-end'),
  sortExpenses: document.getElementById('sort-expenses'),
  clearFiltersBtn: document.getElementById('clear-filters-btn'),
  transactionsTable: document.getElementById('transactions-table'),
  transactionsTableBody: document.getElementById('transactions-table-body'),
  transactionsCountBadge: document.getElementById('transactions-count-badge'),
  transactionsEmptyState: document.getElementById('transactions-empty-state'),
  noResultsState: document.getElementById('no-results-state'),
  emptyClearFiltersBtn: document.getElementById('empty-clear-filters-btn'),
};

/* --------------------------------------------------------------------------
   4. Storage Operations (with Malformed Data Healing)
   -------------------------------------------------------------------------- */

/**
 * Loads expenses from browser localStorage.
 * Automatically validates and heals corrupt records to ensure app stability.
 * @returns {Array<Object>}
 */
function loadExpensesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[Storage] Stored data is not an array. Resetting store.');
      return [];
    }

    // Sanitize and validate every stored item
    const sanitized = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.description === 'string' &&
        item.description.trim().length > 0 &&
        typeof item.amount === 'number' &&
        !isNaN(item.amount) &&
        item.amount > 0 &&
        typeof item.category === 'string' &&
        typeof item.date === 'string' &&
        !isNaN(Date.parse(item.date))
      ) {
        sanitized.push({
          id: item.id,
          description: item.description.trim(),
          amount: Math.round(item.amount * 100) / 100, // Normalize cents
          category: item.category,
          date: item.date,
          createdAt: item.createdAt || new Date().toISOString(),
        });
      }
    }

    return sanitized;
  } catch (error) {
    console.error('[Storage] Error reading or parsing localStorage:', error);
    showFormNotification('Notice: Saved data was reset due to formatting corruption.', 'error', 6000);
    return [];
  }
}

/**
 * Persists current state expenses to browser localStorage.
 */
function saveExpensesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.expenses));
  } catch (error) {
    console.error('[Storage] Error saving to localStorage:', error);
    showFormNotification('Warning: Could not save records to browser storage.', 'error', 5000);
  }
}

/* --------------------------------------------------------------------------
   5. Utility & Formatting Functions
   -------------------------------------------------------------------------- */

/**
 * Generates a unique identifier (RFC4122 UUID with fallback).
 * @returns {string}
 */
function generateUniqueId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'exp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
}

/**
 * Returns today's ISO date (YYYY-MM-DD) for HTML date pickers.
 * @returns {string}
 */
function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into readable format (e.g. "Oct 12, 2026").
 * @param {string} isoDateString
 * @returns {string}
 */
function formatDisplayDate(isoDateString) {
  if (!isoDateString) return '';
  const [year, month, day] = isoDateString.split('-').map(Number);
  if (!year || !month || !day) return isoDateString;

  const dateObj = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Formats a monetary number into standard USD currency ($0.00).
 * Prevents floating point artifacts.
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  const safeNumber = isNaN(value) ? 0 : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeNumber);
}

/**
 * Displays an accessible, non-blocking notification banner above the form.
 * @param {string} message
 * @param {'info'|'success'|'error'} [type='info']
 * @param {number} [durationMs=4000]
 */
function showFormNotification(message, type = 'info', durationMs = 4000) {
  if (!DOM.formNotification) return;

  DOM.formNotification.className = `notification-banner ${type}`;
  DOM.formNotification.textContent = message;
  DOM.formNotification.hidden = false;

  if (durationMs > 0) {
    clearTimeout(DOM.formNotification._timer);
    DOM.formNotification._timer = setTimeout(() => {
      DOM.formNotification.hidden = true;
    }, durationMs);
  }
}

/**
 * Clears field-level validation errors and styles.
 */
function clearValidationErrors() {
  [DOM.descriptionError, DOM.amountError, DOM.categoryError, DOM.dateError].forEach((span) => {
    if (span) span.textContent = '';
  });

  [DOM.descriptionInput, DOM.amountInput, DOM.categorySelect, DOM.dateInput].forEach((input) => {
    if (input) input.classList.remove('is-invalid');
  });
}

/* --------------------------------------------------------------------------
   6. Form Validation & Submissions (Add / Edit)
   -------------------------------------------------------------------------- */

/**
 * Validates form inputs and returns validated data or null.
 * @returns {{ description: string, amount: number, category: string, date: string } | null}
 */
function validateFormData() {
  clearValidationErrors();
  let hasErrors = false;

  // 1. Description validation (2 to 100 characters)
  const description = DOM.descriptionInput.value.trim();
  if (!description) {
    DOM.descriptionError.textContent = 'Description is required.';
    DOM.descriptionInput.classList.add('is-invalid');
    hasErrors = true;
  } else if (description.length < 2) {
    DOM.descriptionError.textContent = 'Description must be at least 2 characters.';
    DOM.descriptionInput.classList.add('is-invalid');
    hasErrors = true;
  } else if (description.length > 100) {
    DOM.descriptionError.textContent = 'Description cannot exceed 100 characters.';
    DOM.descriptionInput.classList.add('is-invalid');
    hasErrors = true;
  }

  // 2. Amount validation (must be positive number > 0)
  const amountStr = DOM.amountInput.value.trim();
  const amountNum = parseFloat(amountStr);
  if (!amountStr || isNaN(amountNum) || amountNum <= 0) {
    DOM.amountError.textContent = 'Please enter a valid amount greater than $0.00.';
    DOM.amountInput.classList.add('is-invalid');
    hasErrors = true;
  }

  // 3. Category validation
  const category = DOM.categorySelect.value;
  if (!category || !CATEGORY_META[category]) {
    DOM.categoryError.textContent = 'Please select a valid spending category.';
    DOM.categorySelect.classList.add('is-invalid');
    hasErrors = true;
  }

  // 4. Date validation
  const date = DOM.dateInput.value.trim();
  if (!date || isNaN(Date.parse(date))) {
    DOM.dateError.textContent = 'Please select a valid transaction date.';
    DOM.dateInput.classList.add('is-invalid');
    hasErrors = true;
  }

  if (hasErrors) {
    showFormNotification('Please fix the highlighted errors before submitting.', 'error');
    return null;
  }

  return {
    description,
    amount: Math.round(amountNum * 100) / 100, // Normalize to two decimal places
    category,
    date,
  };
}

/**
 * Handles form submission for both creating and updating expenses.
 * @param {SubmitEvent} event
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const validatedData = validateFormData();
  if (!validatedData) return;

  if (AppState.editingId) {
    // ---- Edit Mode ----
    const index = AppState.expenses.findIndex((e) => e.id === AppState.editingId);
    if (index === -1) {
      showFormNotification('Error: The record being edited was not found.', 'error');
      cancelEditing();
      return;
    }

    // Preserve original id and creation timestamp
    AppState.expenses[index] = {
      ...AppState.expenses[index],
      description: validatedData.description,
      amount: validatedData.amount,
      category: validatedData.category,
      date: validatedData.date,
      updatedAt: new Date().toISOString(),
    };

    saveExpensesToStorage();
    cancelEditing();
    renderApp();
    showFormNotification('Expense updated successfully!', 'success');
  } else {
    // ---- Add Mode ----
    const newExpense = {
      id: generateUniqueId(),
      description: validatedData.description,
      amount: validatedData.amount,
      category: validatedData.category,
      date: validatedData.date,
      createdAt: new Date().toISOString(),
    };

    // Prepend new expense so it appears prominently
    AppState.expenses.unshift(newExpense);
    saveExpensesToStorage();

    // Reset form fields
    DOM.expenseForm.reset();
    DOM.dateInput.value = getTodayIsoDate();
    clearValidationErrors();

    renderApp();
    showFormNotification('Expense added successfully!', 'success');
  }
}

/**
 * Enters "Edit Mode" for a given expense ID.
 * @param {string} id
 */
function startEditing(id) {
  const expense = AppState.expenses.find((e) => e.id === id);
  if (!expense) return;

  AppState.editingId = id;

  // Populate form controls
  DOM.descriptionInput.value = expense.description;
  DOM.amountInput.value = expense.amount.toFixed(2);
  DOM.categorySelect.value = expense.category;
  DOM.dateInput.value = expense.date;

  // Update form header and button state
  DOM.formCardTitle.textContent = 'Edit Expense';
  DOM.formCardSubtitle.textContent = 'Update transaction details and save changes';
  DOM.formModeTag.textContent = 'Editing Entry';
  DOM.formModeTag.classList.add('editing-mode');
  DOM.submitBtnText.textContent = 'Update Expense';
  DOM.submitBtnIcon.textContent = '💾';
  DOM.cancelEditBtn.hidden = false;

  clearValidationErrors();

  // Scroll smoothly to form for mobile & small screens
  DOM.expenseForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  DOM.descriptionInput.focus();
}

/**
 * Exits "Edit Mode" and restores default "Add Mode".
 */
function cancelEditing() {
  AppState.editingId = null;

  DOM.expenseForm.reset();
  DOM.dateInput.value = getTodayIsoDate();

  DOM.formCardTitle.textContent = 'Add New Expense';
  DOM.formCardSubtitle.textContent = 'Log your daily transactions to keep your budget accurate';
  DOM.formModeTag.textContent = 'New Entry';
  DOM.formModeTag.classList.remove('editing-mode');
  DOM.submitBtnText.textContent = 'Add Expense';
  DOM.submitBtnIcon.textContent = '➕';
  DOM.cancelEditBtn.hidden = true;

  clearValidationErrors();
}

/**
 * Confirms and removes an expense by ID.
 * @param {string} id
 */
function deleteExpense(id) {
  const expense = AppState.expenses.find((e) => e.id === id);
  if (!expense) return;

  const isConfirmed = window.confirm(
    `Are you sure you want to delete "${expense.description}" (${formatCurrency(expense.amount)})?`
  );

  if (!isConfirmed) return;

  AppState.expenses = AppState.expenses.filter((e) => e.id !== id);

  // If the currently edited item was deleted, cancel edit mode
  if (AppState.editingId === id) {
    cancelEditing();
  }

  saveExpensesToStorage();
  renderApp();
  showFormNotification('Expense deleted.', 'info');
}

/* --------------------------------------------------------------------------
   7. Calculations & Metric Summaries
   -------------------------------------------------------------------------- */

/**
 * Calculates financial aggregates and updates the summary cards.
 */
function updateSummaryCards() {
  const totalCount = AppState.expenses.length;

  if (totalCount === 0) {
    DOM.totalSpending.textContent = '$0.00';
    DOM.transactionCount.textContent = '0';
    DOM.topCategory.textContent = '—';
    DOM.topCategoryCaption.textContent = 'Highest cumulative expense';
    DOM.averageExpense.textContent = '$0.00';
    return;
  }

  // Calculate total spending using integer cents to prevent floating point inaccuracies
  const totalCents = AppState.expenses.reduce((sum, item) => {
    return sum + Math.round(item.amount * 100);
  }, 0);
  const totalSpending = totalCents / 100;

  // Calculate spending per category to determine top category
  const categoryTotals = {};
  for (const item of AppState.expenses) {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
  }

  let topCategoryName = '—';
  let topCategoryAmount = 0;
  for (const [category, amount] of Object.entries(categoryTotals)) {
    if (amount > topCategoryAmount) {
      topCategoryAmount = amount;
      topCategoryName = category;
    }
  }

  const averageExpense = totalSpending / totalCount;

  // Update DOM Summary Metrics
  DOM.totalSpending.textContent = formatCurrency(totalSpending);
  DOM.transactionCount.textContent = totalCount.toLocaleString();

  const meta = CATEGORY_META[topCategoryName];
  const icon = meta ? meta.icon + ' ' : '';
  DOM.topCategory.textContent = `${icon}${topCategoryName}`;
  DOM.topCategoryCaption.textContent = `${formatCurrency(topCategoryAmount)} spent`;

  DOM.averageExpense.textContent = formatCurrency(averageExpense);
}

/* --------------------------------------------------------------------------
   8. Category Breakdown Rendering
   -------------------------------------------------------------------------- */

/**
 * Computes category breakdown and renders progress bars.
 */
function renderCategoryBreakdown() {
  const totalCount = AppState.expenses.length;

  if (totalCount === 0) {
    DOM.breakdownEmpty.hidden = false;
    DOM.breakdownList.hidden = true;
    DOM.breakdownList.innerHTML = '';
    return;
  }

  DOM.breakdownEmpty.hidden = true;
  DOM.breakdownList.hidden = false;
  DOM.breakdownList.innerHTML = '';

  // Aggregate totals
  const categoryTotals = {};
  let totalSpending = 0;

  for (const item of AppState.expenses) {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    totalSpending += item.amount;
  }

  // Sort categories by expenditure descending
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  sortedCategories.forEach(([category, amount]) => {
    const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
    const meta = CATEGORY_META[category] || { icon: '📦', color: '#2563eb' };

    const itemEl = document.createElement('div');
    itemEl.className = 'breakdown-item';

    const infoEl = document.createElement('div');
    infoEl.className = 'breakdown-info';

    const labelEl = document.createElement('span');
    labelEl.className = 'breakdown-category-label';
    labelEl.textContent = `${meta.icon} ${category}`;

    const metricsEl = document.createElement('div');
    metricsEl.className = 'breakdown-metrics';

    const amountEl = document.createElement('span');
    amountEl.className = 'breakdown-amount';
    amountEl.textContent = formatCurrency(amount);

    const percentEl = document.createElement('span');
    percentEl.className = 'breakdown-percentage';
    percentEl.textContent = `${percentage.toFixed(1)}%`;

    metricsEl.appendChild(amountEl);
    metricsEl.appendChild(percentEl);
    infoEl.appendChild(labelEl);
    infoEl.appendChild(metricsEl);

    // Progress Bar Track & Fill
    const barBgEl = document.createElement('div');
    barBgEl.className = 'breakdown-bar-bg';
    barBgEl.setAttribute('role', 'progressbar');
    barBgEl.setAttribute('aria-valuenow', Math.round(percentage));
    barBgEl.setAttribute('aria-valuemin', '0');
    barBgEl.setAttribute('aria-valuemax', '100');
    barBgEl.setAttribute('aria-label', `${category} represents ${percentage.toFixed(1)}% of spending`);

    const barFillEl = document.createElement('div');
    barFillEl.className = 'breakdown-bar-fill';
    barFillEl.style.width = `${Math.min(100, percentage)}%`;
    barFillEl.style.backgroundColor = meta.color;

    barBgEl.appendChild(barFillEl);
    itemEl.appendChild(infoEl);
    itemEl.appendChild(barBgEl);

    DOM.breakdownList.appendChild(itemEl);
  });
}

/* --------------------------------------------------------------------------
   9. Filtering, Sorting & Table Rendering (XSS Safe)
   -------------------------------------------------------------------------- */

/**
 * Returns filtered and sorted expenses based on active criteria.
 * @returns {Array<Object>}
 */
function getFilteredAndSortedExpenses() {
  const { search, category, dateStart, dateEnd, sortBy } = AppState.filters;

  const normalizedSearch = search.toLowerCase().trim();

  // 1. Filter pipeline
  let result = AppState.expenses.filter((item) => {
    // Description search match
    if (normalizedSearch && !item.description.toLowerCase().includes(normalizedSearch)) {
      return false;
    }

    // Category match
    if (category !== 'all' && item.category !== category) {
      return false;
    }

    // Date range start
    if (dateStart && item.date < dateStart) {
      return false;
    }

    // Date range end
    if (dateEnd && item.date > dateEnd) {
      return false;
    }

    return true;
  });

  // 2. Sort pipeline
  result.sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      case 'desc-asc':
        return a.description.localeCompare(b.description, undefined, { sensitivity: 'base' });
      case 'date-desc':
      default:
        return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
    }
  });

  return result;
}

/**
 * Renders the transaction history table and updates empty states.
 * Safely constructs DOM nodes to prevent XSS injection.
 */
function renderTransactionsTable() {
  const filtered = getFilteredAndSortedExpenses();
  const totalExpensesCount = AppState.expenses.length;

  DOM.transactionsTableBody.innerHTML = '';

  // Case 1: No expenses exist at all
  if (totalExpensesCount === 0) {
    DOM.transactionsTable.hidden = true;
    DOM.transactionsEmptyState.hidden = false;
    DOM.noResultsState.hidden = true;
    DOM.transactionsCountBadge.textContent = '0 records';
    return;
  }

  // Case 2: Expenses exist, but filters yield zero matches
  if (filtered.length === 0) {
    DOM.transactionsTable.hidden = true;
    DOM.transactionsEmptyState.hidden = true;
    DOM.noResultsState.hidden = false;
    DOM.transactionsCountBadge.textContent = `0 of ${totalExpensesCount} records`;
    return;
  }

  // Case 3: Filtered expenses present
  DOM.transactionsTable.hidden = false;
  DOM.transactionsEmptyState.hidden = true;
  DOM.noResultsState.hidden = true;

  if (filtered.length === totalExpensesCount) {
    DOM.transactionsCountBadge.textContent = `${totalExpensesCount} records`;
  } else {
    DOM.transactionsCountBadge.textContent = `${filtered.length} of ${totalExpensesCount} records`;
  }

  // Build table rows safely with textContent (XSS Prevention)
  filtered.forEach((expense) => {
    const tr = document.createElement('tr');
    tr.id = `expense-row-${expense.id}`;

    // Date cell
    const tdDate = document.createElement('td');
    tdDate.className = 'td-date';
    tdDate.textContent = formatDisplayDate(expense.date);

    // Description cell (Safely encoded via textContent)
    const tdDesc = document.createElement('td');
    tdDesc.className = 'td-desc';
    tdDesc.textContent = expense.description;

    // Category cell
    const tdCat = document.createElement('td');
    tdCat.className = 'td-cat';
    const catBadge = document.createElement('span');
    catBadge.className = 'category-badge';
    const catMeta = CATEGORY_META[expense.category];
    const catIcon = catMeta ? catMeta.icon + ' ' : '';
    catBadge.textContent = `${catIcon}${expense.category}`;
    tdCat.appendChild(catBadge);

    // Amount cell
    const tdAmount = document.createElement('td');
    tdAmount.className = 'td-amount text-right';
    tdAmount.textContent = formatCurrency(expense.amount);

    // Actions cell
    const tdActions = document.createElement('td');
    tdActions.className = 'td-actions text-center';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-action btn-action-edit';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('aria-label', `Edit expense: ${expense.description}`);
    editBtn.addEventListener('click', () => startEditing(expense.id));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-action btn-action-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', `Delete expense: ${expense.description}`);
    deleteBtn.addEventListener('click', () => deleteExpense(expense.id));

    tdActions.appendChild(editBtn);
    tdActions.appendChild(deleteBtn);

    tr.appendChild(tdDate);
    tr.appendChild(tdDesc);
    tr.appendChild(tdCat);
    tr.appendChild(tdAmount);
    tr.appendChild(tdActions);

    DOM.transactionsTableBody.appendChild(tr);
  });
}

/**
 * Full UI synchronization: updates metrics, category breakdown, and transaction table.
 */
function renderApp() {
  updateSummaryCards();
  renderCategoryBreakdown();
  renderTransactionsTable();
}

/**
 * Resets all toolbar filters to default values.
 */
function resetAllFilters() {
  AppState.filters.search = '';
  AppState.filters.category = 'all';
  AppState.filters.dateStart = '';
  AppState.filters.dateEnd = '';
  AppState.filters.sortBy = 'date-desc';

  if (DOM.searchInput) DOM.searchInput.value = '';
  if (DOM.filterCategory) DOM.filterCategory.value = 'all';
  if (DOM.filterDateStart) DOM.filterDateStart.value = '';
  if (DOM.filterDateEnd) DOM.filterDateEnd.value = '';
  if (DOM.sortExpenses) DOM.sortExpenses.value = 'date-desc';

  renderTransactionsTable();
  showFormNotification('All filters have been reset.', 'info', 2000);
}

/* --------------------------------------------------------------------------
   10. Event Listeners Setup
   -------------------------------------------------------------------------- */
function setupEventListeners() {
  // 1. Form Submit & Cancel
  if (DOM.expenseForm) {
    DOM.expenseForm.addEventListener('submit', handleFormSubmit);
    DOM.expenseForm.addEventListener('reset', () => {
      clearValidationErrors();
      setTimeout(() => {
        if (DOM.dateInput) DOM.dateInput.value = getTodayIsoDate();
      }, 0);
    });
  }

  if (DOM.cancelEditBtn) {
    DOM.cancelEditBtn.addEventListener('click', cancelEditing);
  }

  // 2. Clear inline errors on input
  [DOM.descriptionInput, DOM.amountInput, DOM.categorySelect, DOM.dateInput].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
        const errSpan = document.getElementById(`${input.name}-error`);
        if (errSpan) errSpan.textContent = '';
      });
    }
  });

  // 3. Search Filter (Real-time with debounce)
  if (DOM.searchInput) {
    let searchDebounce;
    DOM.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        AppState.filters.search = e.target.value;
        renderTransactionsTable();
      }, 150);
    });
  }

  // 4. Category Filter
  if (DOM.filterCategory) {
    DOM.filterCategory.addEventListener('change', (e) => {
      AppState.filters.category = e.target.value;
      renderTransactionsTable();
    });
  }

  // 5. Date Range Filters
  if (DOM.filterDateStart) {
    DOM.filterDateStart.addEventListener('change', (e) => {
      AppState.filters.dateStart = e.target.value;
      renderTransactionsTable();
    });
  }

  if (DOM.filterDateEnd) {
    DOM.filterDateEnd.addEventListener('change', (e) => {
      AppState.filters.dateEnd = e.target.value;
      renderTransactionsTable();
    });
  }

  // 6. Sort Selector
  if (DOM.sortExpenses) {
    DOM.sortExpenses.addEventListener('change', (e) => {
      AppState.filters.sortBy = e.target.value;
      renderTransactionsTable();
    });
  }

  // 7. Clear Filters Buttons
  if (DOM.clearFiltersBtn) {
    DOM.clearFiltersBtn.addEventListener('click', resetAllFilters);
  }

  if (DOM.emptyClearFiltersBtn) {
    DOM.emptyClearFiltersBtn.addEventListener('click', resetAllFilters);
  }
}

/* --------------------------------------------------------------------------
   11. Application Lifecycle Initialization
   -------------------------------------------------------------------------- */
function initApp() {
  // 1. Populate current date in header and form input
  if (DOM.dateDisplay) {
    DOM.dateDisplay.textContent = formatDisplayDate(getTodayIsoDate());
  }

  if (DOM.dateInput) {
    DOM.dateInput.value = getTodayIsoDate();
  }

  // 2. Load data from localStorage (with auto-healing)
  AppState.expenses = loadExpensesFromStorage();

  // 3. Attach all DOM event handlers
  setupEventListeners();

  // 4. Initial complete render
  renderApp();

  console.log(
    '%c📊 ExpenseWise Ready',
    'color: #1d4ed8; font-weight: bold; font-size: 14px;'
  );
  console.info(
    `Loaded ${AppState.expenses.length} records from localStorage.\n` +
    'Full CRUD operations, multi-criteria filtering, and resilient state active.'
  );
}

// Execute when DOM is fully parsed
document.addEventListener('DOMContentLoaded', initApp);
