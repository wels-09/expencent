const links = document.querySelectorAll("[data-view]");
const views = document.querySelectorAll(".view-panel");
const currencyLocales = { USD: "en-US", NGN: "en-NG" };
const settingsForm = document.getElementById("settingsForm");
const settingsStatus = document.getElementById("settingsStatus");
const currencySetting = document.getElementById("currencySetting");
const emailUpdatesSetting = document.getElementById("emailUpdatesSetting");
const weeklyReportSetting = document.getElementById("weeklyReportSetting");
let currencyFormatter;
const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1
});

let savedSettings = {};
try {
  const parsedSettings = JSON.parse(localStorage.getItem("dashboardSettings") || "{}");
  if (parsedSettings && typeof parsedSettings === "object" && !Array.isArray(parsedSettings)) {
    savedSettings = parsedSettings;
  }
} catch (error) {
  console.error("Could not read saved dashboard settings.", error);
}

const selectedCurrency = Object.hasOwn(currencyLocales, savedSettings.currency)
  ? savedSettings.currency
  : "USD";
currencySetting.value = selectedCurrency;
emailUpdatesSetting.checked = typeof savedSettings.emailUpdates === "boolean"
  ? savedSettings.emailUpdates
  : true;
weeklyReportSetting.checked = typeof savedSettings.weeklyReport === "boolean"
  ? savedSettings.weeklyReport
  : false;

function updateCurrencyFormatter() {
  const currency = currencySetting.value;
  currencyFormatter = new Intl.NumberFormat(currencyLocales[currency], {
    style: "currency",
    currency
  });
}

updateCurrencyFormatter();

let transactions = [];
try {
  const storedTransactions = JSON.parse(localStorage.getItem("dashboardTransactions") || "[]");
  if (Array.isArray(storedTransactions)) {
    transactions = storedTransactions.filter((transaction) =>
      transaction &&
      (transaction.type === "income" || transaction.type === "expense") &&
      Number.isFinite(Number(transaction.amount)) &&
      Number(transaction.amount) > 0 &&
      typeof transaction.category === "string" &&
      typeof transaction.description === "string" &&
      typeof transaction.date === "string"
    );
  }
} catch {
  transactions = [];
}

const transactionForm = document.getElementById("transactionForm");
const transactionStatus = document.getElementById("transactionStatus");
const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
transactionForm.elements.date.value = today.toISOString().slice(0, 10);

function renderTransactionList(list, items, emptyMessage) {
  list.replaceChildren();
  if (items.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = emptyMessage;
    list.append(emptyItem);
    return;
  }

  items.forEach((transaction) => {
    const item = document.createElement("li");
    const details = document.createElement("div");
    const title = document.createElement("strong");
    const metadata = document.createElement("span");
    const amount = document.createElement("strong");
    const signedAmount = Number(transaction.amount) * (transaction.type === "income" ? 1 : -1);

    details.className = "transaction-details";
    title.className = "transaction-title";
    title.textContent = transaction.description;
    metadata.className = "transaction-meta";
    metadata.textContent = `${transaction.category} · ${new Date(`${transaction.date}T00:00:00`).toLocaleDateString()}`;
    amount.className = `transaction-amount ${transaction.type}`;
    amount.textContent = `${signedAmount > 0 ? "+" : "−"}${currencyFormatter.format(Math.abs(signedAmount))}`;
    details.append(title, metadata);
    item.append(details, amount);
    list.append(item);
  });
}

function renderDashboard() {
  const totals = transactions.reduce((result, transaction) => {
    result[transaction.type] += Number(transaction.amount);
    return result;
  }, { income: 0, expense: 0 });

  document.getElementById("balanceTotal").textContent = currencyFormatter.format(totals.income - totals.expense);
  document.getElementById("incomeTotal").textContent = currencyFormatter.format(totals.income);
  document.getElementById("expenseTotal").textContent = currencyFormatter.format(totals.expense);

  const newestFirst = [...transactions].sort((first, second) => second.createdAt - first.createdAt);
  renderTransactionList(document.getElementById("recentTransactions"), newestFirst.slice(0, 5), "No transactions yet. Add your first income or expense above.");
  renderTransactionList(document.getElementById("transactionHistory"), newestFirst, "Your saved transactions will appear here.");
  document.getElementById("historyCount").textContent = `${transactions.length} ${transactions.length === 1 ? "transaction" : "transactions"}`;

  const categoryTotals = new Map();
  transactions.forEach((transaction) => {
    const key = `${transaction.type}:${transaction.category.toLowerCase()}`;
    const categoryTotal = categoryTotals.get(key) || {
      category: transaction.category,
      type: transaction.type,
      amount: 0
    };
    categoryTotal.amount += Number(transaction.amount);
    categoryTotals.set(key, categoryTotal);
  });

  document.getElementById("analyticsTotals").textContent =
    `Total spent: ${currencyFormatter.format(totals.expense)} · Total income: ${currencyFormatter.format(totals.income)}`;

  const categoryRows = [...categoryTotals.values()]
    .sort((first, second) => first.type === second.type
      ? second.amount - first.amount
      : first.type === "expense" ? -1 : 1);
  const categoryList = document.getElementById("categorySummary");
  categoryList.replaceChildren();
  if (categoryRows.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "Income and expense categories will appear after you add a transaction.";
    categoryList.append(emptyItem);
  } else {
    categoryRows.forEach((category) => {
      const item = document.createElement("li");
      const details = document.createElement("div");
      const heading = document.createElement("div");
      const label = document.createElement("strong");
      const amount = document.createElement("strong");
      const share = category.amount / totals[category.type];
      const percentage = document.createElement("span");
      const progress = document.createElement("div");
      const progressFill = document.createElement("span");

      item.className = "category-summary-item";
      details.className = "category-summary-details";
      heading.className = "category-summary-heading";
      label.textContent = `${category.category} (${category.type})`;
      amount.className = `transaction-amount ${category.type}`;
      amount.textContent = `${category.type === "income" ? "+" : "−"}${currencyFormatter.format(category.amount)}`;
      percentage.className = "category-summary-percentage";
      percentage.textContent = `${percentageFormatter.format(share)} of ${category.type === "expense" ? "expenses" : "income"}`;
      progress.className = `category-summary-progress ${category.type}`;
      progress.setAttribute("role", "progressbar");
      progress.setAttribute("aria-label", `${category.category} share of total ${category.type === "expense" ? "expenses" : "income"}`);
      progress.setAttribute("aria-valuemin", "0");
      progress.setAttribute("aria-valuemax", "100");
      progress.setAttribute("aria-valuenow", String((share * 100).toFixed(1)));
      progressFill.style.width = `${share * 100}%`;

      heading.append(label, amount, percentage);
      progress.append(progressFill);
      details.append(heading, progress);
      item.append(details);
      categoryList.append(item);
    });
  }
}

transactionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(transactionForm);
  const amount = Number(formData.get("amount"));
  if (!Number.isFinite(amount) || amount <= 0) return;

  transactions.push({
    type: String(formData.get("type")),
    amount,
    category: String(formData.get("category")).trim(),
    description: String(formData.get("description")).trim(),
    date: String(formData.get("date")),
    createdAt: Date.now()
  });
  localStorage.setItem("dashboardTransactions", JSON.stringify(transactions));
  renderDashboard();
  transactionStatus.textContent = "Transaction saved and totals updated.";
  transactionForm.reset();
  transactionForm.elements.date.value = today.toISOString().slice(0, 10);
});

renderDashboard();

links.forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  const view = document.getElementById(`${link.dataset.view}View`);
  views.forEach((panel) => panel.hidden = panel !== view);
  links.forEach((item) => item.classList.toggle("active", item === link));
  document.getElementById("pageTitle").textContent = view.dataset.title;
  document.getElementById("dashboardSubtitle").textContent = view.dataset.subtitle;
}));

settingsForm.addEventListener("change", () => {
  updateCurrencyFormatter();
  localStorage.setItem("dashboardSettings", JSON.stringify({
    currency: currencySetting.value,
    emailUpdates: emailUpdatesSetting.checked,
    weeklyReport: weeklyReportSetting.checked
  }));
  renderDashboard();
  settingsStatus.textContent = "Settings saved.";
});

const userInfoForm = document.getElementById("userInfoForm");
const userInfoStatus = document.getElementById("userInfoStatus");
const savedUserInfo = JSON.parse(localStorage.getItem("dashboardUserInfo") || "{}");

Object.entries(savedUserInfo).forEach(([name, value]) => {
  const field = userInfoForm.elements.namedItem(name);
  if (field) field.value = value;
});

userInfoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const userInfo = Object.fromEntries(new FormData(userInfoForm).entries());
  localStorage.setItem("dashboardUserInfo", JSON.stringify(userInfo));
  userInfoStatus.textContent = "Your information has been saved.";
});