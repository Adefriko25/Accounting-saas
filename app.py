import streamlit as st
import pandas as pd
import mysql.connector
import plotly.express as px
import plotly.graph_objects as go

# ==========================================
# PENGATURAN HALAMAN & DATABASE
# ==========================================
st.set_page_config(page_title="Accounting SaaS", layout="wide")
st.title("Accounting SaaS - MySQL Connected")

def format_rupiah(angka):
    if pd.isna(angka) or angka == "":
        return "Rp 0"
    return f"Rp {float(angka):,.0f}".replace(",", ".")

import os

@st.cache_resource
def init_connection():
    # Mengambil konfigurasi dari st.secrets (Streamlit Cloud) atau environment variables
    # dengan fallback ke localhost jika tidak dikonfigurasi
    db_host = st.secrets.get("DB_HOST", os.getenv("DB_HOST", "localhost"))
    db_user = st.secrets.get("DB_USER", os.getenv("DB_USER", "root"))
    db_pass = st.secrets.get("DB_PASSWORD", os.getenv("DB_PASSWORD", ""))
    db_name = st.secrets.get("DB_NAME", os.getenv("DB_NAME", "accounting_saas"))
    
    # Port default MySQL adalah 3306
    db_port_str = st.secrets.get("DB_PORT", os.getenv("DB_PORT", "3306"))
    try:
        db_port = int(db_port_str)
    except ValueError:
        db_port = 3306
        
    return mysql.connector.connect(
        host=db_host,
        user=db_user,      
        password=db_pass,      
        database=db_name,
        port=db_port,
        autocommit=True
    )

conn = init_connection()

# --- BIKIN TABEL OTOMATIS (KARENA DATABASE CLOUD MASIH KOSONG) ---
def create_tables():
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

create_tables()

# ==========================================
# FUNGSI LOAD DATA
# ==========================================
def load_accounts():
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT account, type FROM accounts")
    data = cursor.fetchall()
    if not data:
        return pd.DataFrame(columns=["account", "type"])
    return pd.DataFrame(data)

def load_transactions():
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, date, debit, credit, amount, description FROM transactions")
    data = cursor.fetchall()
    if not data:
        return pd.DataFrame(columns=["id", "date", "debit", "credit", "amount", "description"])
    df = pd.DataFrame(data)
    if not df.empty:
        df['amount'] = df['amount'].astype(float)
        df['date'] = pd.to_datetime(df['date'])
    return df

# ==========================================
# SIDEBAR MENU
# ==========================================
menu = st.sidebar.selectbox(
    "Menu Utama",
    [
        "Dashboard", 
        "Chart of Accounts", 
        "Input Journal", 
        "General Ledger", 
        "Trial Balance", 
        "Income Statement", 
        "Balance Sheet", 
        "Cashflow"
    ]
)

# ==========================================
# 1. HALAMAN DASHBOARD (GRAFIK INTERAKTIF)
# ==========================================
if menu == "Dashboard":
    st.header("Financial Dashboard")
    st.caption("🔄 Data otomatis diperbarui tanpa perlu refresh halaman...")

    @st.fragment(run_every=3)
    def render_live_dashboard():
        df_tx = load_transactions()
        df_acc = load_accounts()

        if df_tx.empty or df_acc.empty:
            st.info("Belum ada data. Silakan isi Chart of Accounts dan Input Journal terlebih dahulu.")
            return

        acc_types = dict(zip(df_acc['account'], df_acc['type']))
        df_tx['Month'] = df_tx['date'].dt.strftime('%b-%Y')
        
        monthly_data = []
        months = df_tx['Month'].unique()
        
        for m in months:
            df_m = df_tx[df_tx['Month'] == m]
            rev, cogs, exp, cash_in, cash_out = 0.0, 0.0, 0.0, 0.0, 0.0
            
            for _, row in df_m.iterrows():
                # Laba Rugi
                if acc_types.get(row['credit']) == 'Revenue': rev += float(row['amount'])
                if acc_types.get(row['debit']) == 'COGS': cogs += float(row['amount'])
                if acc_types.get(row['debit']) == 'Expense': exp += float(row['amount'])
                # Arus Kas
                if acc_types.get(row['debit']) == 'Asset': cash_in += float(row['amount'])
                if acc_types.get(row['credit']) == 'Asset': cash_out += float(row['amount'])

            monthly_data.append({
                'Month': m, 'Revenue': rev, 'COGS': cogs, 'Expense': exp, 
                'Gross Profit': rev - cogs, 'Net Profit': (rev - cogs) - exp,
                'Cash In': cash_in, 'Cash Out': cash_out
            })

        df_monthly = pd.DataFrame(monthly_data)
        df_monthly['Growth'] = df_monthly['Revenue'].pct_change().fillna(0) * 100
        df_monthly['Gross Margin'] = (df_monthly['Gross Profit'] / df_monthly['Revenue'].replace(0, 1)) * 100
        df_monthly['Net Margin'] = (df_monthly['Net Profit'] / df_monthly['Revenue'].replace(0, 1)) * 100

        col1, col2 = st.columns(2)

        with col1:
            # 1. Revenue vs Growth
            fig1 = go.Figure()
            fig1.add_trace(go.Bar(x=df_monthly['Month'], y=df_monthly['Revenue'], name='Revenue', marker_color='#4181C1'))
            fig1.add_trace(go.Scatter(x=df_monthly['Month'], y=df_monthly['Growth'], name='Growth (%)', yaxis='y2', mode='lines+markers', line=dict(color='#C14141', width=3)))
            fig1.update_layout(title="Revenue vs Growth", yaxis2=dict(overlaying='y', side='right', tickformat='.0f'), legend=dict(orientation="h", y=-0.2))
            st.plotly_chart(fig1, use_container_width=True)

            # 3. Revenue vs COGS
            fig3 = go.Figure(data=[
                go.Bar(name='Revenue', x=df_monthly['Month'], y=df_monthly['Revenue'], marker_color='#4181C1'),
                go.Bar(name='COGS', x=df_monthly['Month'], y=df_monthly['COGS'], marker_color='#C14141')
            ])
            fig3.update_layout(title="Revenue vs COGS", barmode='group', legend=dict(orientation="h", y=-0.2))
            st.plotly_chart(fig3, use_container_width=True)

        with col2:
            # 2. Gross & Net Margin
            fig2 = go.Figure()
            fig2.add_trace(go.Scatter(x=df_monthly['Month'], y=df_monthly['Gross Margin'], name='Gross Profit Margin', mode='lines+markers', line=dict(color='#4181C1', dash='dash')))
            fig2.add_trace(go.Scatter(x=df_monthly['Month'], y=df_monthly['Net Margin'], name='Net Profit Margin', mode='lines+markers', line=dict(color='#C14141', dash='dash')))
            fig2.update_layout(title="Gross Profit & Net Profit Margin", yaxis=dict(ticksuffix="%"), legend=dict(orientation="h", y=-0.2))
            st.plotly_chart(fig2, use_container_width=True)

            # 4. Expense & Cashflow Donuts
            c2_1, c2_2 = st.columns(2)
            with c2_1:
                df_exp = df_tx[df_tx['debit'].apply(lambda x: acc_types.get(x) == 'Expense')]
                if not df_exp.empty:
                    exp_grouped = df_exp.groupby('debit')['amount'].sum().reset_index()
                    fig4 = px.pie(exp_grouped, values='amount', names='debit', title='TOTAL EXPENSE', hole=0.5)
                    fig4.update_traces(textposition='inside', textinfo='percent+label')
                    fig4.update_layout(showlegend=False)
                    st.plotly_chart(fig4, use_container_width=True)
                else:
                    st.write("**TOTAL EXPENSE**\n\nBelum ada data beban.")

            with c2_2:
                total_cash_in = df_monthly['Cash In'].sum()
                total_cash_out = df_monthly['Cash Out'].sum()
                if total_cash_in > 0 or total_cash_out > 0:
                    fig5 = go.Figure(data=[go.Pie(labels=['Cash In', 'Cash Out'], values=[total_cash_in, total_cash_out], hole=0.5, marker_colors=['#8CC63F', '#4181C1'])])
                    fig5.update_layout(title='Cashflow', annotations=[dict(text=f"Net<br>{format_rupiah(total_cash_in - total_cash_out)}", x=0.5, y=0.5, font_size=12, showarrow=False)], showlegend=False)
                    st.plotly_chart(fig5, use_container_width=True)
                else:
                    st.write("**Cashflow**\n\nBelum ada arus kas.")

    render_live_dashboard()

# ==========================================
# 2. HALAMAN CHART OF ACCOUNTS
# ==========================================
elif menu == "Chart of Accounts":
    st.header("Chart of Accounts")
    
    df_accounts = load_accounts()
    st.dataframe(df_accounts, hide_index=True, use_container_width=True)

    st.subheader("Tambah Akun Baru")
    name = st.text_input("Nama akun")
    acc_type = st.selectbox("Tipe akun", ["Asset", "Liability", "Equity", "Revenue", "COGS", "Expense"])

    if st.button("Tambah akun"):
        if name:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO accounts (account, type) VALUES (%s, %s)", (name, acc_type))
            st.success(f"Akun '{name}' berhasil ditambahkan!")
            st.rerun() 
        else:
            st.error("Nama akun tidak boleh kosong!")

# ==========================================
# 3. HALAMAN INPUT JOURNAL
# ==========================================
elif menu == "Input Journal":
    st.header("Input Journal (Jurnal Umum)")

    df_accounts = load_accounts()
    
    if df_accounts.empty:
        st.warning("Silakan tambah akun di menu 'Chart of Accounts' terlebih dahulu.")
    else:
        accounts = df_accounts["account"].tolist()
        
        with st.form("form_input_jurnal"):
            date = st.date_input("Tanggal Transaksi")
            col1, col2 = st.columns(2)
            with col1: debit = st.selectbox("Akun Debit", accounts)
            with col2: credit = st.selectbox("Akun Credit", accounts)
            amount = st.number_input("Nominal (Rp) - Input Tanpa Titik/Koma", min_value=0.0, step=1000.0)
            desc = st.text_input("Keterangan / Deskripsi")
            
            submitted = st.form_submit_button("Post ke Database")
            if submitted:
                if debit == credit: st.error("Akun Debit dan Credit tidak boleh sama!")
                elif amount <= 0: st.error("Nominal harus lebih dari 0!")
                else:
                    cursor = conn.cursor()
                    sql = "INSERT INTO transactions (date, debit, credit, amount, description) VALUES (%s, %s, %s, %s, %s)"
                    cursor.execute(sql, (date, debit, credit, amount, desc))
                    st.success("Jurnal berhasil disimpan!")
                    st.rerun()

    st.divider()
    
    st.subheader("Riwayat Jurnal & Batalkan Transaksi")
    df_display = load_transactions()
    
    if not df_display.empty:
        df_display = df_display.sort_values(by="id", ascending=False)
        df_show = df_display.copy()
        df_show['amount'] = df_show['amount'].apply(format_rupiah)
        df_show['date'] = df_show['date'].dt.strftime('%Y-%m-%d')
        st.dataframe(df_show, hide_index=True, use_container_width=True)

        with st.expander("⚠️ Klik di sini jika ingin membatalkan/menghapus transaksi (Salah Input)"):
            hapus_id = st.number_input("Masukkan ID Transaksi yang ingin dihapus:", min_value=0, step=1)
            if st.button("Hapus Transaksi"):
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM transactions WHERE id = %s", (hapus_id,))
                if cursor.fetchone():
                    cursor.execute("DELETE FROM transactions WHERE id = %s", (hapus_id,))
                    st.success(f"Transaksi dengan ID {hapus_id} berhasil dihapus!")
                    st.rerun()
                else:
                    st.error(f"Transaksi dengan ID {hapus_id} tidak ditemukan.")
    else:
        st.info("Belum ada riwayat transaksi.")

# ==========================================
# 4. HALAMAN GENERAL LEDGER
# ==========================================
elif menu == "General Ledger":
    st.header("General Ledger (Buku Besar)")
    df_tx = load_transactions()
    df_acc = load_accounts()

    if df_tx.empty or df_acc.empty:
        st.info("Data transaksi atau akun belum ada.")
    else:
        selected_account = st.selectbox("Pilih Akun:", df_acc["account"].tolist())
        acc_type = df_acc.loc[df_acc['account'] == selected_account, 'type'].values[0]
        st.write(f"**Tipe Akun:** {acc_type}")

        gl_rows = []
        balance = 0.0

        df_tx_sorted = df_tx.sort_values(by="date")
        
        for _, row in df_tx_sorted.iterrows():
            tanggal = row['date'].strftime('%Y-%m-%d')
            if row['debit'] == selected_account:
                if acc_type in ['Asset', 'Expense', 'COGS']: balance += float(row['amount'])
                else: balance -= float(row['amount'])
                gl_rows.append([tanggal, row['description'], row['amount'], 0, balance])
                
            elif row['credit'] == selected_account:
                if acc_type in ['Asset', 'Expense', 'COGS']: balance -= float(row['amount'])
                else: balance += float(row['amount'])
                gl_rows.append([tanggal, row['description'], 0, row['amount'], balance])

        if gl_rows:
            df_gl = pd.DataFrame(gl_rows, columns=["Date", "Description", "Debit", "Credit", "Balance"])
            df_gl['Debit'] = df_gl['Debit'].apply(format_rupiah)
            df_gl['Credit'] = df_gl['Credit'].apply(format_rupiah)
            df_gl['Balance'] = df_gl['Balance'].apply(format_rupiah)
            st.dataframe(df_gl, hide_index=True, use_container_width=True)
        else:
            st.info(f"Belum ada transaksi untuk akun {selected_account}")

# ==========================================
# 5. HALAMAN TRIAL BALANCE
# ==========================================
elif menu == "Trial Balance":
    st.header("Trial Balance (Neraca Saldo)")
    df_tx = load_transactions()
    df_acc = load_accounts()

    if df_tx.empty or df_acc.empty:
        st.info("Data belum lengkap.")
    else:
        rows = []
        total_debit, total_credit = 0.0, 0.0
        acc_types = dict(zip(df_acc['account'], df_acc['type']))

        for acc in df_acc["account"]:
            sum_debit = df_tx[df_tx["debit"]==acc]["amount"].sum()
            sum_credit = df_tx[df_tx["credit"]==acc]["amount"].sum()
            
            a_type = acc_types.get(acc)
            if a_type in ['Asset', 'Expense', 'COGS']:
                saldo = sum_debit - sum_credit
                if saldo > 0:
                    rows.append([acc, saldo, 0]); total_debit += saldo
                elif saldo < 0:
                    rows.append([acc, 0, abs(saldo)]); total_credit += abs(saldo)
            else:
                saldo = sum_credit - sum_debit
                if saldo > 0:
                    rows.append([acc, 0, saldo]); total_credit += saldo
                elif saldo < 0:
                    rows.append([acc, abs(saldo), 0]); total_debit += abs(saldo)

        if rows:
            tb = pd.DataFrame(rows, columns=["Account", "Debit", "Credit"])
            tb_display = tb.copy()
            tb_display['Debit'] = tb_display['Debit'].apply(format_rupiah)
            tb_display['Credit'] = tb_display['Credit'].apply(format_rupiah)
            st.dataframe(tb_display, hide_index=True, use_container_width=True)

            st.divider()
            c1, c2 = st.columns(2)
            c1.metric("Total Debit", format_rupiah(total_debit))
            c2.metric("Total Credit", format_rupiah(total_credit))
            
            if round(total_debit, 2) == round(total_credit, 2):
                st.success("✅ TRIAL BALANCE SEIMBANG (BALANCED)")
            else:
                st.error("❌ TRIAL BALANCE TIDAK SEIMBANG")

# ==========================================
# 6. HALAMAN INCOME STATEMENT
# ==========================================
elif menu == "Income Statement":
    st.header("Profit and Loss (P&L) Statement")
    st.caption("Tampilan Laba Rugi per Bulan (Matriks Bulanan)")
    
    df_tx = load_transactions()
    df_acc = load_accounts()

    if not df_tx.empty and not df_acc.empty:
        acc_types = dict(zip(df_acc['account'], df_acc['type']))
        
        months_map = {1: 'JAN', 2: 'FEB', 3: 'MAR', 4: 'APR', 5: 'MAY', 6: 'JUN', 
                      7: 'JUL', 8: 'AUG', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DEC'}
        
        data = {
            'Kategori': ['Revenue', 'Cost of Goods Sold', 'Gross Profit', 'Operating Expenses', 'Net Profit']
        }
        for m in months_map.values():
            data[m] = [0.0, 0.0, 0.0, 0.0, 0.0]
        data['Full Year'] = [0.0, 0.0, 0.0, 0.0, 0.0]

        for _, row in df_tx.iterrows():
            if pd.isna(row['date']): continue
            
            m_str = months_map[row['date'].month]
            amt = float(row['amount'])
            
            if acc_types.get(row['credit']) == 'Revenue':
                data[m_str][0] += amt; data['Full Year'][0] += amt
            elif acc_types.get(row['debit']) == 'COGS':
                data[m_str][1] += amt; data['Full Year'][1] += amt
            elif acc_types.get(row['debit']) == 'Expense':
                data[m_str][3] += amt; data['Full Year'][3] += amt

        for col in list(months_map.values()) + ['Full Year']:
            data[col][2] = data[col][0] - data[col][1] 
            data[col][4] = data[col][2] - data[col][3] 

        df_pnl = pd.DataFrame(data)

        def format_acc(val):
            if isinstance(val, (int, float)):
                if val == 0: return "-"
                return f"{val:,.0f}".replace(",", ".")
            return val

        cols_to_format = list(months_map.values()) + ['Full Year']
        for col in cols_to_format:
            df_pnl[col] = df_pnl[col].apply(format_acc)

        def style_bold_rows(row):
            if row['Kategori'] in ['Gross Profit', 'Net Profit']:
                return ['font-weight: bold'] * len(row)
            return [''] * len(row)
            
        styled_df_pnl = df_pnl.style.apply(style_bold_rows, axis=1)
        st.dataframe(styled_df_pnl, hide_index=True, use_container_width=True)
        
    else:
        st.info("Belum ada transaksi.")

# ==========================================
# 7. HALAMAN BALANCE SHEET
# ==========================================
elif menu == "Balance Sheet":
    st.header("Balance Sheet")
    st.caption("Tampilan Neraca (Akumulasi Saldo per Bulan)")

    df_tx = load_transactions()
    df_acc = load_accounts()

    if not df_tx.empty and not df_acc.empty:
        acc_types = dict(zip(df_acc['account'], df_acc['type']))

        months_map = {1: 'JAN', 2: 'FEB', 3: 'MAR', 4: 'APR', 5: 'MAY', 6: 'JUN', 
                      7: 'JUL', 8: 'AUG', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DEC'}

        asset_accs = df_acc[df_acc['type'] == 'Asset']['account'].tolist()
        liab_accs = df_acc[df_acc['type'] == 'Liability']['account'].tolist()
        eq_accs = df_acc[df_acc['type'] == 'Equity']['account'].tolist()

        data_rows = []

        def get_balance(acc_list, acc_type_group, month):
            tx_m = df_tx[df_tx['date'].dt.month <= month]
            if tx_m.empty: return 0.0 

            bal = 0.0
            for acc in acc_list:
                debit = tx_m[tx_m['debit'] == acc]['amount'].sum()
                credit = tx_m[tx_m['credit'] == acc]['amount'].sum()
                if acc_type_group == 'Asset':
                    bal += (debit - credit)
                else: 
                    bal += (credit - debit)
            return bal

        def get_retained_earnings(month):
            tx_m = df_tx[df_tx['date'].dt.month <= month]
            if tx_m.empty: return 0.0 
            
            rev, cogs, exp = 0.0, 0.0, 0.0
            for _, row in tx_m.iterrows():
                if acc_types.get(row['credit']) == 'Revenue': rev += float(row['amount'])
                if acc_types.get(row['debit']) == 'COGS': cogs += float(row['amount'])
                if acc_types.get(row['debit']) == 'Expense': exp += float(row['amount'])
            
            return rev - cogs - exp

        # ASSETS
        data_rows.append({"Account": "ASSETS", **{m: "" for m in months_map.values()}})
        for acc in asset_accs:
            row = {"Account": f"  {acc}"} 
            for m_num, m_str in months_map.items():
                row[m_str] = get_balance([acc], 'Asset', m_num)
            data_rows.append(row)

        row_ta = {"Account": "Total Assets"}
        for m_num, m_str in months_map.items():
            row_ta[m_str] = get_balance(asset_accs, 'Asset', m_num)
        data_rows.append(row_ta)

        data_rows.append({"Account": "", **{m: "" for m in months_map.values()}}) 

        # LIABILITIES
        data_rows.append({"Account": "LIABILITIES", **{m: "" for m in months_map.values()}})
        for acc in liab_accs:
            row = {"Account": f"  {acc}"}
            for m_num, m_str in months_map.items():
                row[m_str] = get_balance([acc], 'Liability', m_num)
            data_rows.append(row)

        row_tl = {"Account": "Total Liabilities"}
        for m_num, m_str in months_map.items():
            row_tl[m_str] = get_balance(liab_accs, 'Liability', m_num)
        data_rows.append(row_tl)

        data_rows.append({"Account": "", **{m: "" for m in months_map.values()}})

        # EQUITY
        data_rows.append({"Account": "SHAREHOLDER'S EQUITY", **{m: "" for m in months_map.values()}})
        for acc in eq_accs:
            row = {"Account": f"  {acc}"}
            for m_num, m_str in months_map.items():
                row[m_str] = get_balance([acc], 'Equity', m_num)
            data_rows.append(row)

        row_re = {"Account": "  Retained Earnings"}
        for m_num, m_str in months_map.items():
            row_re[m_str] = get_retained_earnings(m_num)
        data_rows.append(row_re)

        row_te = {"Account": "Total Equity"}
        for m_num, m_str in months_map.items():
            row_te[m_str] = get_balance(eq_accs, 'Equity', m_num) + get_retained_earnings(m_num)
        data_rows.append(row_te)

        data_rows.append({"Account": "", **{m: "" for m in months_map.values()}})

        # TOTALS & CHECK
        row_tle = {"Account": "Total Liabilities & Equity"}
        for m_num, m_str in months_map.items():
            row_tle[m_str] = row_tl[m_str] + row_te[m_str]
        data_rows.append(row_tle)

        row_check = {"Account": "Check"}
        for m_num, m_str in months_map.items():
            row_check[m_str] = row_ta[m_str] - row_tle[m_str]
        data_rows.append(row_check)

        df_bs = pd.DataFrame(data_rows)

        def format_acc(val):
            if isinstance(val, (int, float)):
                if val == 0: return "-"
                return f"{val:,.0f}".replace(",", ".")
            return val

        for col in months_map.values():
            df_bs[col] = df_bs[col].apply(format_acc)

        st.dataframe(df_bs, hide_index=True, use_container_width=True)

    else:
        st.info("Belum ada transaksi.")

# ==========================================
# 8. HALAMAN CASHFLOW
# ==========================================
elif menu == "Cashflow":
    st.header("Cashflow Statement")
    st.caption("Laporan Arus Kas per Bulan")
    
    df_tx = load_transactions()
    df_acc = load_accounts()

    if not df_tx.empty and not df_acc.empty:
        asset_accounts = df_acc[df_acc['type'] == 'Asset']['account'].tolist()
        if not asset_accounts:
            st.warning("Buat akun bertipe 'Asset' (misal: Kas, Bank) di Chart of Accounts terlebih dahulu.")
        else:
            selected_cash_acc = st.selectbox("Pilih Akun Kas/Bank untuk dilacak:", asset_accounts)
            
            months_map = {1: 'JAN', 2: 'FEB', 3: 'MAR', 4: 'APR', 5: 'MAY', 6: 'JUN', 
                          7: 'JUL', 8: 'AUG', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DEC'}
            
            data = {
                'Kategori': ['Cash In (Uang Masuk)', 'Cash Out (Uang Keluar)', 'Net Cashflow']
            }
            for m in months_map.values():
                data[m] = [0.0, 0.0, 0.0]
            data['Full Year'] = [0.0, 0.0, 0.0]
            
            for _, row in df_tx.iterrows():
                if pd.isna(row['date']): continue
                m_str = months_map[row['date'].month]
                amt = float(row['amount'])
                
                if row['debit'] == selected_cash_acc: 
                    data[m_str][0] += amt; data['Full Year'][0] += amt
                elif row['credit'] == selected_cash_acc: 
                    data[m_str][1] += amt; data['Full Year'][1] += amt
                    
            for col in list(months_map.values()) + ['Full Year']:
                data[col][2] = data[col][0] - data[col][1]

            df_cf = pd.DataFrame(data)
            
            def format_acc(val):
                if isinstance(val, (int, float)):
                    if val == 0: return "-"
                    return f"{val:,.0f}".replace(",", ".")
                return val

            cols_to_format = list(months_map.values()) + ['Full Year']
            for col in cols_to_format:
                df_cf[col] = df_cf[col].apply(format_acc)

            st.dataframe(df_cf, hide_index=True, use_container_width=True)
    else:
        st.info("Belum ada transaksi.")