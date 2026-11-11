import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  BookMarked,
  Scale,
  TrendingUp,
  Activity,
  Wallet
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Chart of Accounts', icon: BookOpen },
  { name: 'Input Journal', icon: FileSpreadsheet },
  { name: 'General Ledger', icon: BookMarked },
  { name: 'Trial Balance', icon: Scale },
  { name: 'Income Statement', icon: TrendingUp },
  { name: 'Balance Sheet', icon: Activity },
  { name: 'Cashflow', icon: Wallet }
];
