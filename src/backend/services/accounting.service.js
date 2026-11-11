/**
 * Map nama akun ke tipe akunnya
 */
export function buildAccountTypeMap(accounts) {
  const map = {};
  for (const acc of accounts) {
    map[acc.account] = acc.type;
  }
  return map;
}

/**
 * 1. Kalkulasi Data Dashboard Finansial
 */
export function calculateDashboardData(transactions, accounts) {
  if (!transactions.length || !accounts.length) {
    return { empty: true, message: 'Belum ada data keuangan.' };
  }

  const accTypes = buildAccountTypeMap(accounts);
  const monthlyData = {};

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const mStr = d.toLocaleString('en-US', { month: 'short' }) + '-' + d.getFullYear();
    const sortKey = tx.date.substring(0, 7); // YYYY-MM

    if (!monthlyData[mStr]) {
      monthlyData[mStr] = {
        Month: mStr, Revenue: 0, COGS: 0, Expense: 0,
        CashIn: 0, CashOut: 0, sortKey
      };
    }

    const amt = tx.amount;
    if (accTypes[tx.credit] === 'Revenue') monthlyData[mStr].Revenue += amt;
    if (accTypes[tx.debit] === 'COGS') monthlyData[mStr].COGS += amt;
    if (accTypes[tx.debit] === 'Expense') monthlyData[mStr].Expense += amt;
    if (accTypes[tx.debit] === 'Asset') monthlyData[mStr].CashIn += amt;
    if (accTypes[tx.credit] === 'Asset') monthlyData[mStr].CashOut += amt;
  }

  const sorted = Object.values(monthlyData).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i];
    m.GrossProfit = m.Revenue - m.COGS;
    m.NetProfit = m.GrossProfit - m.Expense;
    m.Growth = i === 0 ? 0 : (sorted[i - 1].Revenue > 0
      ? ((m.Revenue - sorted[i - 1].Revenue) / sorted[i - 1].Revenue * 100) : 0);
    m.GrossMargin = m.Revenue > 0 ? (m.GrossProfit / m.Revenue * 100) : 0;
    m.NetMargin = m.Revenue > 0 ? (m.NetProfit / m.Revenue * 100) : 0;
  }

  // Alokasi beban (Expense Breakdown)
  const expenseDetails = {};
  for (const tx of transactions) {
    if (accTypes[tx.debit] === 'Expense') {
      expenseDetails[tx.debit] = (expenseDetails[tx.debit] || 0) + tx.amount;
    }
  }
  const expenseBreakdown = Object.entries(expenseDetails).map(([account, amount]) => ({ account, amount }));

  return { empty: false, monthly_data: sorted, expense_breakdown: expenseBreakdown };
}

/**
 * 2. Kalkulasi Buku Besar (General Ledger)
 */
export function calculateLedgerData(transactions, accounts, accountName) {
  const acc = accounts.find(a => a.account === accountName);
  if (!acc) return { error: 'Akun tidak ditemukan' };

  const accType = acc.type;
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  const entries = [];
  let balance = 0;

  for (const tx of sorted) {
    let debitVal = 0, creditVal = 0, isRelevant = false;

    if (tx.debit === accountName) {
      debitVal = tx.amount;
      isRelevant = true;
      balance += ['Asset', 'Expense', 'COGS'].includes(accType) ? debitVal : -debitVal;
    } else if (tx.credit === accountName) {
      creditVal = tx.amount;
      isRelevant = true;
      balance += ['Asset', 'Expense', 'COGS'].includes(accType) ? -creditVal : creditVal;
    }

    if (isRelevant) {
      entries.push({
        id: tx.id, date: tx.date, description: tx.description,
        debit: debitVal, credit: creditVal, balance
      });
    }
  }

  return { account: accountName, type: accType, entries };
}

/**
 * 3. Kalkulasi Neraca Saldo (Trial Balance)
 */
export function calculateTrialBalanceData(transactions, accounts) {
  if (!transactions.length || !accounts.length) {
    return { empty: true, entries: [], total_debit: 0, total_credit: 0, balanced: true };
  }

  const entries = [];
  let totalDebit = 0, totalCredit = 0;

  for (const acc of accounts) {
    const sumDebit = transactions.filter(tx => tx.debit === acc.account).reduce((s, tx) => s + tx.amount, 0);
    const sumCredit = transactions.filter(tx => tx.credit === acc.account).reduce((s, tx) => s + tx.amount, 0);

    let debitBalance = 0, creditBalance = 0;

    if (['Asset', 'Expense', 'COGS'].includes(acc.type)) {
      const saldo = sumDebit - sumCredit;
      if (saldo > 0) debitBalance = saldo;
      else if (saldo < 0) creditBalance = Math.abs(saldo);
    } else {
      const saldo = sumCredit - sumDebit;
      if (saldo > 0) creditBalance = saldo;
      else if (saldo < 0) debitBalance = Math.abs(saldo);
    }

    if (debitBalance > 0 || creditBalance > 0) {
      entries.push({ account: acc.account, type: acc.type, debit: debitBalance, credit: creditBalance });
      totalDebit += debitBalance;
      totalCredit += creditBalance;
    }
  }

  return {
    empty: false, entries, total_debit: totalDebit, total_credit: totalCredit,
    balanced: Math.round(totalDebit * 100) === Math.round(totalCredit * 100)
  };
}

/**
 * 4. Kalkulasi Laporan Laba Rugi (Income Statement)
 */
export function calculateIncomeStatementData(transactions, accounts) {
  if (!transactions.length || !accounts.length) return { empty: true };

  const accTypes = buildAccountTypeMap(accounts);
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const categories = ['Revenue', 'Cost of Goods Sold', 'Gross Profit', 'Operating Expenses', 'Net Profit'];

  const grid = {};
  for (const cat of categories) {
    grid[cat] = {};
    for (const m of [...MONTHS, 'Full Year']) grid[cat][m] = 0;
  }

  for (const tx of transactions) {
    const month = MONTHS[new Date(tx.date).getMonth()];
    const amt = tx.amount;

    if (accTypes[tx.credit] === 'Revenue') {
      grid['Revenue'][month] += amt;
      grid['Revenue']['Full Year'] += amt;
    }
    if (accTypes[tx.debit] === 'COGS') {
      grid['Cost of Goods Sold'][month] += amt;
      grid['Cost of Goods Sold']['Full Year'] += amt;
    }
    if (accTypes[tx.debit] === 'Expense') {
      grid['Operating Expenses'][month] += amt;
      grid['Operating Expenses']['Full Year'] += amt;
    }
  }

  for (const m of [...MONTHS, 'Full Year']) {
    grid['Gross Profit'][m] = grid['Revenue'][m] - grid['Cost of Goods Sold'][m];
    grid['Net Profit'][m] = grid['Gross Profit'][m] - grid['Operating Expenses'][m];
  }

  const rows = categories.map(cat => {
    const row = { Kategori: cat };
    for (const m of [...MONTHS, 'Full Year']) row[m] = grid[cat][m];
    return row;
  });

  return { empty: false, months: [...MONTHS, 'Full Year'], rows };
}

/**
 * 5. Kalkulasi Neraca (Balance Sheet)
 */
export function calculateBalanceSheetData(transactions, accounts) {
  if (!transactions.length || !accounts.length) return { empty: true };

  const accTypes = buildAccountTypeMap(accounts);
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const assetAccs = accounts.filter(a => a.type === 'Asset').map(a => a.account);
  const liabAccs = accounts.filter(a => a.type === 'Liability').map(a => a.account);
  const eqAccs = accounts.filter(a => a.type === 'Equity').map(a => a.account);

  function calcBalance(accList, groupType, monthLimit) {
    let bal = 0;
    for (const tx of transactions) {
      const txMonth = new Date(tx.date).getMonth();
      if (txMonth > monthLimit) continue;
      const debit = accList.includes(tx.debit) ? tx.amount : 0;
      const credit = accList.includes(tx.credit) ? tx.amount : 0;
      bal += groupType === 'Asset' ? (debit - credit) : (credit - debit);
    }
    return bal;
  }

  function calcRetainedEarnings(monthLimit) {
    let rev = 0, cogs = 0, exp = 0;
    for (const tx of transactions) {
      const txMonth = new Date(tx.date).getMonth();
      if (txMonth > monthLimit) continue;
      if (accTypes[tx.credit] === 'Revenue') rev += tx.amount;
      if (accTypes[tx.debit] === 'COGS') cogs += tx.amount;
      if (accTypes[tx.debit] === 'Expense') exp += tx.amount;
    }
    return rev - cogs - exp;
  }

  function makeRow(title, accList, groupType, isRE = false) {
    const row = { Account: title, is_header: false, is_total: false, is_check: false };
    for (let i = 0; i < MONTHS.length; i++) {
      row[MONTHS[i]] = isRE ? calcRetainedEarnings(i) : calcBalance(accList, groupType, i);
    }
    return row;
  }

  const rows = [];

  // ASSETS
  rows.push({ Account: 'ASSETS', is_header: true, is_total: false, is_check: false });
  for (const acc of assetAccs) rows.push(makeRow(`  ${acc}`, [acc], 'Asset'));
  const totalAssets = makeRow('Total Assets', assetAccs, 'Asset');
  totalAssets.is_total = true;
  rows.push(totalAssets);
  rows.push({ Account: '', is_spacer: true });

  // LIABILITIES
  rows.push({ Account: 'LIABILITIES', is_header: true, is_total: false, is_check: false });
  for (const acc of liabAccs) rows.push(makeRow(`  ${acc}`, [acc], 'Liability'));
  const totalLiab = makeRow('Total Liabilities', liabAccs, 'Liability');
  totalLiab.is_total = true;
  rows.push(totalLiab);
  rows.push({ Account: '', is_spacer: true });

  // SHAREHOLDER'S EQUITY
  rows.push({ Account: "SHAREHOLDER'S EQUITY", is_header: true, is_total: false, is_check: false });
  for (const acc of eqAccs) rows.push(makeRow(`  ${acc}`, [acc], 'Equity'));
  rows.push(makeRow('  Retained Earnings', [], '', true));

  const totalEq = { Account: 'Total Equity', is_header: false, is_total: true, is_check: false };
  for (let i = 0; i < MONTHS.length; i++) {
    totalEq[MONTHS[i]] = calcBalance(eqAccs, 'Equity', i) + calcRetainedEarnings(i);
  }
  rows.push(totalEq);
  rows.push({ Account: '', is_spacer: true });

  // TOTAL L&E + CHECK
  const totalLE = { Account: 'Total Liabilities & Equity', is_header: false, is_total: true, is_check: false };
  const checkRow = { Account: 'Check', is_header: false, is_total: false, is_check: true };
  for (const m of MONTHS) {
    totalLE[m] = totalLiab[m] + totalEq[m];
    checkRow[m] = totalAssets[m] - totalLE[m];
  }
  rows.push(totalLE);
  rows.push(checkRow);

  return { empty: false, months: MONTHS, rows };
}

/**
 * 6. Kalkulasi Arus Kas (Cashflow Statement)
 */
export function calculateCashflowData(transactions, accounts, selectedAccount) {
  if (!transactions.length || !accounts.length) return { empty: true };

  const assetAccounts = accounts.filter(a => a.type === 'Asset').map(a => a.account);
  if (!assetAccounts.length) return { empty: true, error: 'Belum ada akun bertipe Asset' };

  const selected = assetAccounts.includes(selectedAccount) ? selectedAccount : assetAccounts[0];
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const grid = {
    'Cash In (Uang Masuk)': {},
    'Cash Out (Uang Keluar)': {},
    'Net Cashflow': {}
  };
  for (const cat of Object.keys(grid)) {
    for (const m of [...MONTHS, 'Full Year']) grid[cat][m] = 0;
  }

  for (const tx of transactions) {
    const month = MONTHS[new Date(tx.date).getMonth()];
    if (tx.debit === selected) {
      grid['Cash In (Uang Masuk)'][month] += tx.amount;
      grid['Cash In (Uang Masuk)']['Full Year'] += tx.amount;
    } else if (tx.credit === selected) {
      grid['Cash Out (Uang Keluar)'][month] += tx.amount;
      grid['Cash Out (Uang Keluar)']['Full Year'] += tx.amount;
    }
  }

  for (const m of [...MONTHS, 'Full Year']) {
    grid['Net Cashflow'][m] = grid['Cash In (Uang Masuk)'][m] - grid['Cash Out (Uang Keluar)'][m];
  }

  const rows = Object.keys(grid).map(cat => {
    const row = { Kategori: cat };
    for (const m of [...MONTHS, 'Full Year']) row[m] = grid[cat][m];
    return row;
  });

  return {
    empty: false, selected_account: selected, available_accounts: assetAccounts,
    months: [...MONTHS, 'Full Year'], rows
  };
}
