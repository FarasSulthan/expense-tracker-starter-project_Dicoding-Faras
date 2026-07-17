/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Implementasi lengkap: DOM Manipulation, Web Storage, Custom Events,
 * Form Validation, Edit, Delete, Toggle Type, Search.
 */

// ─── DATA LAYER ──────────────────────────────────────────
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editingId = null; // ID transaksi yang sedang diedit (null = mode tambah)

function generateId() {
  return +new Date();
}

function saveToStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ─── CUSTOM EVENT ────────────────────────────────────────
// [Advanced] Setiap perubahan data memicu custom event 'transaction:updated'
function notifyDataChanged() {
  saveToStorage();
  document.dispatchEvent(new Event('transaction:updated'));
}

// ─── DOM REFERENCES ──────────────────────────────────────
const incomeListEl = document.getElementById('incomeList');
const expenseListEl = document.getElementById('expenseList');
const transactionForm = document.getElementById('transactionForm');
const titleInput = document.getElementById('transactionFormTitleInput');
const amountInput = document.getElementById('transactionFormAmountInput');
const dateInput = document.getElementById('transactionFormDateInput');
const typeSelect = document.getElementById('transactionFormTypeSelect');
const submitBtn = transactionForm.querySelector('[data-testid="transactionFormSubmitButton"]');

const searchForm = document.getElementById('searchTransactionForm');
const searchInput = document.getElementById('searchTransactionFormTitleInput');

const balanceAmountEl = document.querySelector('.tracker-summary__balance-amount');
const incomeAmountEl = document.querySelector('.tracker-summary__stat-amount--income');
const expenseAmountEl = document.querySelector('.tracker-summary__stat-amount--expense');

const formHeading = document.getElementById('form-heading');

// ─── FORMAT HELPER ───────────────────────────────────────
function formatRupiah(amount) {
  return 'Rp' + amount.toLocaleString('id-ID');
}

// ─── RENDER FUNCTIONS ────────────────────────────────────

/**
 * Membuat satu elemen kartu transaksi menggunakan document.createElement().
 * Struktur & data-testid sesuai rubrik.
 */
function createTransactionCard(tx) {
  // Wrapper div
  const card = document.createElement('div');
  card.setAttribute('data-testid', 'transactionItem');
  card.className = 'tracker-transaction-item';

  // Icon
  const iconEl = document.createElement('div');
  iconEl.className = `tracker-transaction-item__icon tracker-transaction-item__icon--${tx.type}`;
  iconEl.textContent = tx.type === 'income' ? '↗' : '↙';
  card.appendChild(iconEl);

  // Detail container
  const detailEl = document.createElement('div');
  detailEl.className = 'tracker-transaction-item__detail';

  const titleEl = document.createElement('h3');
  titleEl.setAttribute('data-testid', 'transactionItemTitle');
  titleEl.className = 'tracker-transaction-item__title';
  titleEl.textContent = tx.title;
  detailEl.appendChild(titleEl);

  const dateEl = document.createElement('p');
  dateEl.setAttribute('data-testid', 'transactionItemDate');
  dateEl.className = 'tracker-transaction-item__date';
  dateEl.textContent = `Tanggal: ${tx.date}`;
  detailEl.appendChild(dateEl);

  card.appendChild(detailEl);

  // Right side (amount + actions)
  const rightEl = document.createElement('div');
  rightEl.className = 'tracker-transaction-item__right';

  const amountEl = document.createElement('p');
  amountEl.setAttribute('data-testid', 'transactionItemAmount');
  amountEl.className = `tracker-transaction-item__amount tracker-transaction-item__amount--${tx.type}`;
  amountEl.textContent = `Nominal: ${formatRupiah(tx.amount)}`;
  rightEl.appendChild(amountEl);

  // Type badge
  const typeEl = document.createElement('p');
  typeEl.setAttribute('data-testid', 'transactionItemType');
  typeEl.className = 'tracker-transaction-item__type-badge';
  typeEl.textContent = `Tipe: ${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`;
  rightEl.appendChild(typeEl);

  // Actions
  const actionsEl = document.createElement('div');
  actionsEl.className = 'tracker-transaction-item__actions';

  // Ubah Tipe button
  const toggleBtn = document.createElement('button');
  toggleBtn.setAttribute('data-testid', 'transactionItemEditTypeButton');
  toggleBtn.className = 'tracker-transaction-item__btn tracker-transaction-item__btn--toggle';
  toggleBtn.textContent = 'Ubah Tipe';
  toggleBtn.addEventListener('click', () => toggleType(tx.id));
  actionsEl.appendChild(toggleBtn);

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.setAttribute('data-testid', 'transactionItemEditButton');
  editBtn.className = 'tracker-transaction-item__btn tracker-transaction-item__btn--edit';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => startEdit(tx.id));
  actionsEl.appendChild(editBtn);

  // Hapus button
  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('data-testid', 'transactionItemDeleteButton');
  deleteBtn.className = 'tracker-transaction-item__btn tracker-transaction-item__btn--delete';
  deleteBtn.textContent = 'Hapus';
  deleteBtn.addEventListener('click', () => deleteTransaction(tx.id));
  actionsEl.appendChild(deleteBtn);

  rightEl.appendChild(actionsEl);
  card.appendChild(rightEl);

  return card;
}

/**
 * Render daftar transaksi ke DOM.
 * Menerima array transaksi (bisa filtered dari pencarian).
 */
function renderTransactions(data) {
  const list = data || transactions;

  // Kosongkan kontainer
  incomeListEl.innerHTML = '';
  expenseListEl.innerHTML = '';

  list.forEach((tx) => {
    const card = createTransactionCard(tx);
    if (tx.type === 'income') {
      incomeListEl.appendChild(card);
    } else {
      expenseListEl.appendChild(card);
    }
  });

  // Empty state
  if (!incomeListEl.hasChildNodes()) {
    const empty = document.createElement('p');
    empty.className = 'tracker-transaction-list__empty';
    empty.textContent = 'Belum ada pemasukan.';
    incomeListEl.appendChild(empty);
  }
  if (!expenseListEl.hasChildNodes()) {
    const empty = document.createElement('p');
    empty.className = 'tracker-transaction-list__empty';
    empty.textContent = 'Belum ada pengeluaran.';
    expenseListEl.appendChild(empty);
  }
}

/**
 * [Advanced] Update panel dasbor: total saldo, pemasukan, pengeluaran.
 */
function updateDashboard() {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  balanceAmountEl.textContent = formatRupiah(balance);
  incomeAmountEl.textContent = formatRupiah(totalIncome);
  expenseAmountEl.textContent = formatRupiah(totalExpense);
}

// ─── FORM HANDLING ───────────────────────────────────────

/**
 * [Skilled] Validasi input sebelum menyimpan.
 * @returns {boolean}
 */
function validateForm(title, amount) {
  if (!title || title.trim() === '') {
    alert('Judul transaksi tidak boleh kosong!');
    return false;
  }
  if (amount < 1) {
    alert('Nominal uang harus minimal Rp 1!');
    return false;
  }
  return true;
}

transactionForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const type = typeSelect.value;

  // Validasi
  if (!validateForm(title, amount)) return;

  if (editingId !== null) {
    // ─── MODE EDIT ─────────────────────────
    const idx = transactions.findIndex((t) => t.id === editingId);
    if (idx !== -1) {
      transactions[idx] = {
        ...transactions[idx],
        title,
        amount,
        date,
        type,
      };
    }
    editingId = null;
    submitBtn.textContent = 'Catat Sekarang';
    formHeading.textContent = ' Tambah Pencatatan Baru';
    submitBtn.classList.remove('tracker-form__submit--editing');
  } else {
    // ─── MODE TAMBAH ───────────────────────
    const newTransaction = {
      id: generateId(),
      title,
      amount,
      date,
      type,
    };
    transactions.push(newTransaction);
  }

  // Reset form
  transactionForm.reset();

  // Dispatch custom event
  notifyDataChanged();
});

// ─── CRUD OPERATIONS ─────────────────────────────────────

function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  notifyDataChanged();
}

/**
 * [Skilled] Isi form dengan data transaksi yang dipilih untuk diedit.
 */
function startEdit(id) {
  const tx = transactions.find((t) => t.id === id);
  if (!tx) return;

  editingId = tx.id;
  titleInput.value = tx.title;
  amountInput.value = tx.amount;
  dateInput.value = tx.date;
  typeSelect.value = tx.type;

  submitBtn.textContent = 'Perbarui';
  formHeading.textContent = ' Edit Pencatatan';
  submitBtn.classList.add('tracker-form__submit--editing');

  // Scroll ke form
  transactionForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * [Basic] Toggle tipe transaksi (income ↔ expense).
 */
function toggleType(id) {
  const tx = transactions.find((t) => t.id === id);
  if (!tx) return;
  tx.type = tx.type === 'income' ? 'expense' : 'income';
  notifyDataChanged();
}

// ─── SEARCH ──────────────────────────────────────────────

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  performSearch();
});

searchInput.addEventListener('input', () => {
  performSearch();
});

function performSearch() {
  const keyword = searchInput.value.trim().toLowerCase();

  if (keyword === '') {
    // [Advanced] Kolom pencarian kosong → tampilkan semua
    renderTransactions(transactions);
    return;
  }

  const filtered = transactions.filter((t) =>
    t.title.toLowerCase().includes(keyword)
  );
  renderTransactions(filtered);
}

// ─── CUSTOM EVENT LISTENER ───────────────────────────────
// [Advanced] Satu listener merespons sinyal 'transaction:updated'
document.addEventListener('transaction:updated', () => {
  renderTransactions(transactions);
  updateDashboard();
});

// ─── INITIALISATION ──────────────────────────────────────
// Set tanggal default ke hari ini
dateInput.value = new Date().toISOString().split('T')[0];

// Render data dari localStorage saat halaman dimuat
renderTransactions(transactions);
updateDashboard();