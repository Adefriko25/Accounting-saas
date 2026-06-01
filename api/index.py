import os
import mysql.connector
from flask import Flask, jsonify, request
from datetime import datetime

app = Flask(__name__)

# ==========================================
# DATABASE UTILITIES
# ==========================================
def get_db_connection():
    db_host = os.getenv("DB_HOST", "localhost")
    db_user = os.getenv("DB_USER", "root")
    db_pass = os.getenv("DB_PASSWORD", "")
    db_name = os.getenv("DB_NAME", "accounting_saas")
    db_port = int(os.getenv("DB_PORT", "3306"))
    return mysql.connector.connect(
        host=db_host,
        user=db_user,
        password=db_pass,
        database=db_name,
        port=db_port,
        autocommit=True
    )

def create_tables():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS accounts (
                account VARCHAR(255) PRIMARY KEY,
                type VARCHAR(50)
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE,
                debit VARCHAR(255),
                credit VARCHAR(255),
                amount DECIMAL(15,2),
                description TEXT
            )
        """)
        conn.commit()
        conn.close()
    except Exception as e:
        print("Error creating tables:", e)

# Inisialisasi tabel saat startup
create_tables()

# ==========================================
# HELPERS
# ==========================================
def load_accounts():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT account, type FROM accounts")
        accounts = cursor.fetchall()
        conn.close()
        return accounts
    except Exception as e:
        print("Error loading accounts:", e)
        return []

def load_transactions():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, date, debit, credit, amount, description FROM transactions")
        transactions = cursor.fetchall()
        conn.close()
        
        # Format date and amount for JSON compatibility
        for tx in transactions:
            if tx['date']:
                tx['date'] = tx['date'].strftime('%Y-%m-%d')
            tx['amount'] = float(tx['amount'])
        return transactions
    except Exception as e:
        print("Error loading transactions:", e)
        return []

# ==========================================
# REST API ENDPOINTS
# ==========================================

# 1. Accounts API
@app.route('/api/accounts', methods=['GET', 'POST'])
def handle_accounts():
    if request.method == 'POST':
        data = request.json
        name = data.get('account')
        acc_type = data.get('type')
        
        if not name or not acc_type:
            return jsonify({"error": "Nama dan tipe akun wajib diisi"}), 400
            
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO accounts (account, type) VALUES (%s, %s)", (name, acc_type))
            conn.commit()
            conn.close()
            return jsonify({"message": f"Akun '{name}' berhasil ditambahkan!"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    # GET method
    return jsonify(load_accounts())

@app.route('/api/accounts/<string:account_name>', methods=['DELETE'])
def delete_account(account_name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Cek apakah akun ini digunakan dalam transaksi
        cursor.execute("SELECT id FROM transactions WHERE debit = %s OR credit = %s LIMIT 1", (account_name, account_name))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "Akun tidak dapat dihapus karena masih digunakan dalam riwayat transaksi!"}), 400
            
        # Cek apakah akun ini terdaftar
        cursor.execute("SELECT account FROM accounts WHERE account = %s", (account_name,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"error": "Akun tidak ditemukan!"}), 404
            
        # Hapus akun
        cursor.execute("DELETE FROM accounts WHERE account = %s", (account_name,))
        conn.commit()
        conn.close()
        return jsonify({"message": f"Akun '{account_name}' berhasil dihapus!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. Transactions API
@app.route('/api/transactions', methods=['GET', 'POST'])
def handle_transactions():
    if request.method == 'POST':
        data = request.json
        date_str = data.get('date')
        debit = data.get('debit')
        credit = data.get('credit')
        amount = data.get('amount')
        description = data.get('description', '')
        
        if not date_str or not debit or not credit or amount is None:
            return jsonify({"error": "Semua field transaksi wajib diisi"}), 400
            
        if debit == credit:
            return jsonify({"error": "Akun Debit dan Credit tidak boleh sama!"}), 400
            
        if float(amount) <= 0:
            return jsonify({"error": "Nominal harus lebih dari 0!"}), 400
            
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            sql = "INSERT INTO transactions (date, debit, credit, amount, description) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql, (date_str, debit, credit, amount, description))
            conn.commit()
            conn.close()
            return jsonify({"message": "Transaksi berhasil disimpan!"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    # GET method
    return jsonify(load_transactions())

@app.route('/api/transactions/<int:tx_id>', methods=['DELETE'])
def delete_transaction(tx_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM transactions WHERE id = %s", (tx_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"error": "Transaksi tidak ditemukan"}), 404
            
        cursor.execute("DELETE FROM transactions WHERE id = %s", (tx_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": f"Transaksi dengan ID {tx_id} berhasil dihapus!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. Dashboard API
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    txs = load_transactions()
    accs = load_accounts()
    
    if not txs or not accs:
        return jsonify({
            "empty": True,
            "message": "Belum ada data. Silakan isi Chart of Accounts dan Input Journal terlebih dahulu."
        })
        
    acc_types = {acc['account']: acc['type'] for acc in accs}
    
    # Kelompokkan data per bulan
    monthly_data = {}
    
    for tx in txs:
        date_obj = datetime.strptime(tx['date'], '%Y-%m-%d')
        # Format key bulan (misal: "Jan-2026")
        m_str = date_obj.strftime('%b-%Y')
        
        if m_str not in monthly_data:
            monthly_data[m_str] = {
                'Month': m_str, 'Revenue': 0.0, 'COGS': 0.0, 'Expense': 0.0,
                'Cash In': 0.0, 'Cash Out': 0.0, 'sort_key': date_obj.strftime('%Y-%m')
            }
            
        amount = tx['amount']
        # Laba Rugi
        if acc_types.get(tx['credit']) == 'Revenue': 
            monthly_data[m_str]['Revenue'] += amount
        if acc_types.get(tx['debit']) == 'COGS': 
            monthly_data[m_str]['COGS'] += amount
        if acc_types.get(tx['debit']) == 'Expense': 
            monthly_data[m_str]['Expense'] += amount
            
        # Arus Kas (melacak pergerakan aset kas secara makro seperti di Streamlit)
        if acc_types.get(tx['debit']) == 'Asset': 
            monthly_data[m_str]['Cash In'] += amount
        if acc_types.get(tx['credit']) == 'Asset': 
            monthly_data[m_str]['Cash Out'] += amount

    # Urutkan berdasarkan waktu kronologis
    sorted_months = sorted(monthly_data.values(), key=lambda x: x['sort_key'])
    
    # Hitung profitabilitas, growth, dan margin
    for i, m_data in enumerate(sorted_months):
        rev = m_data['Revenue']
        cogs = m_data['COGS']
        exp = m_data['Expense']
        
        m_data['Gross Profit'] = rev - cogs
        m_data['Net Profit'] = (rev - cogs) - exp
        
        # Growth Revenue (%)
        if i == 0:
            m_data['Growth'] = 0.0
        else:
            prev_rev = sorted_months[i-1]['Revenue']
            m_data['Growth'] = ((rev - prev_rev) / prev_rev * 100) if prev_rev > 0 else 0.0
            
        # Margins
        m_data['Gross Margin'] = (m_data['Gross Profit'] / rev * 100) if rev > 0 else 0.0
        m_data['Net Margin'] = (m_data['Net Profit'] / rev * 100) if rev > 0 else 0.0

    # Dapatkan pengelompokan pengeluaran beban
    expense_details = {}
    for tx in txs:
        debit_acc = tx['debit']
        if acc_types.get(debit_acc) == 'Expense':
            expense_details[debit_acc] = expense_details.get(debit_acc, 0.0) + tx['amount']
            
    expense_list = [{"account": k, "amount": v} for k, v in expense_details.items()]

    return jsonify({
        "empty": False,
        "monthly_data": sorted_months,
        "expense_breakdown": expense_list
    })

# 4. General Ledger API
@app.route('/api/ledger', methods=['GET'])
def get_ledger():
    account = request.args.get('account')
    if not account:
        return jsonify({"error": "Parameter account wajib diisi"}), 400
        
    txs = load_transactions()
    accs = load_accounts()
    
    # Cari tipe akun
    acc_type = None
    for acc in accs:
        if acc['account'] == account:
            acc_type = acc['type']
            break
            
    if not acc_type:
        return jsonify({"error": "Akun tidak ditemukan"}), 404
        
    # Filter dan urutkan transaksi secara kronologis
    txs_sorted = sorted(txs, key=lambda x: x['date'])
    ledger_rows = []
    balance = 0.0
    
    for tx in txs_sorted:
        is_relevant = False
        debit_val = 0.0
        credit_val = 0.0
        
        if tx['debit'] == account:
            debit_val = tx['amount']
            is_relevant = True
            if acc_type in ['Asset', 'Expense', 'COGS']:
                balance += debit_val
            else:
                balance -= debit_val
                
        elif tx['credit'] == account:
            credit_val = tx['amount']
            is_relevant = True
            if acc_type in ['Asset', 'Expense', 'COGS']:
                balance -= credit_val
            else:
                balance += credit_val
                
        if is_relevant:
            ledger_rows.append({
                "id": tx['id'],
                "date": tx['date'],
                "description": tx['description'],
                "debit": debit_val,
                "credit": credit_val,
                "balance": balance
            })
            
    return jsonify({
        "account": account,
        "type": acc_type,
        "entries": ledger_rows
    })

# 5. Trial Balance API
@app.route('/api/trial-balance', methods=['GET'])
def get_trial_balance():
    txs = load_transactions()
    accs = load_accounts()
    
    if not txs or not accs:
        return jsonify({"empty": True, "entries": [], "total_debit": 0, "total_credit": 0, "balanced": True})
        
    acc_types = {acc['account']: acc['type'] for acc in accs}
    
    entries = []
    total_debit = 0.0
    total_credit = 0.0
    
    for acc in accs:
        acc_name = acc['account']
        a_type = acc['type']
        
        # Jumlahkan debit dan kredit untuk akun ini
        sum_debit = sum(tx['amount'] for tx in txs if tx['debit'] == acc_name)
        sum_credit = sum(tx['amount'] for tx in txs if tx['credit'] == acc_name)
        
        debit_balance = 0.0
        credit_balance = 0.0
        
        if a_type in ['Asset', 'Expense', 'COGS']:
            saldo = sum_debit - sum_credit
            if saldo > 0:
                debit_balance = saldo
            elif saldo < 0:
                credit_balance = abs(saldo)
        else:
            saldo = sum_credit - sum_debit
            if saldo > 0:
                credit_balance = saldo
            elif saldo < 0:
                debit_balance = abs(saldo)
                
        if debit_balance > 0 or credit_balance > 0:
            entries.append({
                "account": acc_name,
                "type": a_type,
                "debit": debit_balance,
                "credit": credit_balance
            })
            total_debit += debit_balance
            total_credit += credit_balance
            
    balanced = round(total_debit, 2) == round(total_credit, 2)
    
    return jsonify({
        "empty": False,
        "entries": entries,
        "total_debit": total_debit,
        "total_credit": total_credit,
        "balanced": balanced
    })

# 6. Income Statement API (Laba Rugi Bulanan)
@app.route('/api/income-statement', methods=['GET'])
def get_income_statement():
    txs = load_transactions()
    accs = load_accounts()
    
    if not txs or not accs:
        return jsonify({"empty": True})
        
    acc_types = {acc['account']: acc['type'] for acc in accs}
    
    # 12 Bulan standard
    months_keys = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    months_num = {i+1: name for i, name in enumerate(months_keys)}
    
    # Matriks Laba Rugi
    categories = ['Revenue', 'Cost of Goods Sold', 'Gross Profit', 'Operating Expenses', 'Net Profit']
    
    grid = {cat: {m: 0.0 for m in months_keys} for cat in categories}
    for cat in categories:
        grid[cat]['Full Year'] = 0.0
        
    for tx in txs:
        date_obj = datetime.strptime(tx['date'], '%Y-%m-%d')
        m_str = months_num[date_obj.month]
        amt = tx['amount']
        
        # Revenue (Credit of Revenue Account)
        if acc_types.get(tx['credit']) == 'Revenue':
            grid['Revenue'][m_str] += amt
            grid['Revenue']['Full Year'] += amt
            
        # COGS (Debit of COGS Account)
        if acc_types.get(tx['debit']) == 'COGS':
            grid['Cost of Goods Sold'][m_str] += amt
            grid['Cost of Goods Sold']['Full Year'] += amt
            
        # Expense (Debit of Expense Account)
        if acc_types.get(tx['debit']) == 'Expense':
            grid['Operating Expenses'][m_str] += amt
            grid['Operating Expenses']['Full Year'] += amt

    # Hitung turunan profit
    for m in months_keys + ['Full Year']:
        grid['Gross Profit'][m] = grid['Revenue'][m] - grid['Cost of Goods Sold'][m]
        grid['Net Profit'][m] = grid['Gross Profit'][m] - grid['Operating Expenses'][m]
        
    # Ubah format data menjadi baris untuk konsumsi tabel frontend
    rows = []
    for cat in categories:
        row_data = {"Kategori": cat}
        for m in months_keys + ['Full Year']:
            row_data[m] = grid[cat][m]
        rows.append(row_data)
        
    return jsonify({
        "empty": False,
        "months": months_keys + ['Full Year'],
        "rows": rows
    })

# 7. Balance Sheet API (Neraca Akumulasi Saldo per Bulan)
@app.route('/api/balance-sheet', methods=['GET'])
def get_balance_sheet():
    txs = load_transactions()
    accs = load_accounts()
    
    if not txs or not accs:
        return jsonify({"empty": True})
        
    acc_types = {acc['account']: acc['type'] for acc in accs}
    months_keys = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    
    asset_accs = [acc['account'] for acc in accs if acc['type'] == 'Asset']
    liab_accs = [acc['account'] for acc in accs if acc['type'] == 'Liability']
    eq_accs = [acc['account'] for acc in accs if acc['type'] == 'Equity']
    
    def calculate_balance_up_to_month(acc_list, acc_type_group, month_limit):
        # Filter transaksi <= bulan limit (diasumsikan tahun berjalan)
        bal = 0.0
        for tx in txs:
            tx_month = datetime.strptime(tx['date'], '%Y-%m-%d').month
            if tx_month > month_limit:
                continue
                
            debit = tx['amount'] if tx['debit'] in acc_list else 0.0
            credit = tx['amount'] if tx['credit'] in acc_list else 0.0
            
            if acc_type_group == 'Asset':
                bal += (debit - credit)
            else: 
                bal += (credit - debit)
        return bal

    def calculate_retained_earnings_up_to_month(month_limit):
        rev = 0.0
        cogs = 0.0
        exp = 0.0
        for tx in txs:
            tx_month = datetime.strptime(tx['date'], '%Y-%m-%d').month
            if tx_month > month_limit:
                continue
            
            amt = tx['amount']
            if acc_types.get(tx['credit']) == 'Revenue': rev += amt
            if acc_types.get(tx['debit']) == 'COGS': cogs += amt
            if acc_types.get(tx['debit']) == 'Expense': exp += amt
            
        return rev - cogs - exp

    data_rows = []
    
    # Helper untuk mengisi baris bulanan
    def make_row(title, acc_list, group_type, is_re=False):
        row = {"Account": title, "is_header": False, "is_total": False, "is_check": False}
        for m_idx, m_name in enumerate(months_keys):
            if is_re:
                row[m_name] = calculate_retained_earnings_up_to_month(m_idx + 1)
            else:
                row[m_name] = calculate_balance_up_to_month(acc_list, group_type, m_idx + 1)
        return row

    # --- ASSETS ---
    data_rows.append({"Account": "ASSETS", "is_header": True, "is_total": False, "is_check": False})
    for acc in asset_accs:
        data_rows.append(make_row(f"  {acc}", [acc], 'Asset'))
        
    # Total Assets
    total_assets = make_row("Total Assets", asset_accs, 'Asset')
    total_assets["is_total"] = True
    data_rows.append(total_assets)
    
    # Spacing
    data_rows.append({"Account": "", "is_spacer": True})
    
    # --- LIABILITIES ---
    data_rows.append({"Account": "LIABILITIES", "is_header": True, "is_total": False, "is_check": False})
    for acc in liab_accs:
        data_rows.append(make_row(f"  {acc}", [acc], 'Liability'))
        
    # Total Liabilities
    total_liab = make_row("Total Liabilities", liab_accs, 'Liability')
    total_liab["is_total"] = True
    data_rows.append(total_liab)
    
    # Spacing
    data_rows.append({"Account": "", "is_spacer": True})
    
    # --- EQUITY ---
    data_rows.append({"Account": "SHAREHOLDER'S EQUITY", "is_header": True, "is_total": False, "is_check": False})
    for acc in eq_accs:
        data_rows.append(make_row(f"  {acc}", [acc], 'Equity'))
        
    # Retained Earnings
    data_rows.append(make_row("  Retained Earnings", [], '', is_re=True))
    
    # Total Equity
    total_eq = {"Account": "Total Equity", "is_header": False, "is_total": True, "is_check": False}
    for m_idx, m_name in enumerate(months_keys):
        eq_val = calculate_balance_up_to_month(eq_accs, 'Equity', m_idx + 1)
        re_val = calculate_retained_earnings_up_to_month(m_idx + 1)
        total_eq[m_name] = eq_val + re_val
    data_rows.append(total_eq)
    
    # Spacing
    data_rows.append({"Account": "", "is_spacer": True})
    
    # --- TOTAL LIABILITIES & EQUITY & CHECK ---
    total_liab_eq = {"Account": "Total Liabilities & Equity", "is_header": False, "is_total": True, "is_check": False}
    check_row = {"Account": "Check", "is_header": False, "is_total": False, "is_check": True}
    
    for m_name in months_keys:
        total_liab_eq[m_name] = total_liab[m_name] + total_eq[m_name]
        check_row[m_name] = total_assets[m_name] - total_liab_eq[m_name]
        
    data_rows.append(total_liab_eq)
    data_rows.append(check_row)
    
    return jsonify({
        "empty": False,
        "months": months_keys,
        "rows": data_rows
    })

# 8. Cashflow API (Arus Kas Bulanan per Akun)
@app.route('/api/cashflow', methods=['GET'])
def get_cashflow():
    cash_account = request.args.get('account')
    
    txs = load_transactions()
    accs = load_accounts()
    
    if not txs or not accs:
        return jsonify({"empty": True})
        
    # Cek apakah ada akun kas/bank
    asset_accounts = [acc['account'] for acc in accs if acc['type'] == 'Asset']
    if not asset_accounts:
        return jsonify({"empty": True, "error": "Belum ada akun bertipe Asset"})
        
    # Gunakan akun pertama jika tidak ditentukan
    selected_acc = cash_account if cash_account in asset_accounts else asset_accounts[0]
    
    months_keys = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    months_num = {i+1: name for i, name in enumerate(months_keys)}
    
    grid = {
        'Cash In (Uang Masuk)': {m: 0.0 for m in months_keys},
        'Cash Out (Uang Keluar)': {m: 0.0 for m in months_keys},
        'Net Cashflow': {m: 0.0 for m in months_keys}
    }
    
    for row in ['Cash In (Uang Masuk)', 'Cash Out (Uang Keluar)', 'Net Cashflow']:
        grid[row]['Full Year'] = 0.0
        
    for tx in txs:
        date_obj = datetime.strptime(tx['date'], '%Y-%m-%d')
        m_str = months_num[date_obj.month]
        amt = tx['amount']
        
        # Uang masuk ke Kas pilihan
        if tx['debit'] == selected_acc:
            grid['Cash In (Uang Masuk)'][m_str] += amt
            grid['Cash In (Uang Masuk)']['Full Year'] += amt
            
        # Uang keluar dari Kas pilihan
        elif tx['credit'] == selected_acc:
            grid['Cash Out (Uang Keluar)'][m_str] += amt
            grid['Cash Out (Uang Keluar)']['Full Year'] += amt

    # Hitung Net
    for m in months_keys + ['Full Year']:
        grid['Net Cashflow'][m] = grid['Cash In (Uang Masuk)'][m] - grid['Cash Out (Uang Keluar)'][m]
        
    # Susun baris
    rows = []
    for cat in ['Cash In (Uang Masuk)', 'Cash Out (Uang Keluar)', 'Net Cashflow']:
        row_data = {"Kategori": cat}
        for m in months_keys + ['Full Year']:
            row_data[m] = grid[cat][m]
        rows.append(row_data)
        
    return jsonify({
        "empty": False,
        "selected_account": selected_acc,
        "available_accounts": asset_accounts,
        "months": months_keys + ['Full Year'],
        "rows": rows
    })

# 9. Reset Database API
@app.route('/api/reset', methods=['POST'])
def reset_database():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Hapus semua transaksi dan akun secara aman
        cursor.execute("DELETE FROM transactions")
        cursor.execute("DELETE FROM accounts")
        conn.commit()
        conn.close()
        return jsonify({"message": "Seluruh data pembukuan & daftar akun berhasil di-reset!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Handler jika frontend me-request halaman non-API (opsional, disajikan oleh Vercel secara default)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return jsonify({"error": "API route not found. Use frontend to access static pages."}), 404
