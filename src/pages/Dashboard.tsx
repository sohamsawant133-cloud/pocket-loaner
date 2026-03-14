import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  History, 
  TrendingUp, 
  LayoutDashboard,
  User,
  Bell,
  Search,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Settings,
  Moon,
  Home,
  ArrowLeftRight,
  UserCircle
} from 'lucide-react';
import { Card, Button } from '../components/UI';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../hooks/useAuth';

import { LoanCards } from '../components/LoanCards';
import { FinancialHealth } from '../components/FinancialHealth';
import { LoanLimit } from '../components/LoanLimit';
import { AdminDashboard } from '../components/AdminDashboard';
import { KYCModal } from '../components/KYCModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('Home');
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isKYCOpen, setIsKYCOpen] = useState(false);

  React.useEffect(() => {
    if (!authLoading && user && user.kyc_status !== 'Verified' && userRole === 'user') {
      setIsKYCOpen(true);
    }
  }, [user, userRole, authLoading]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-500", isDarkMode ? "bg-brand-secondary text-white dark" : "bg-white")}>
      <KYCModal 
        isOpen={isKYCOpen} 
        onClose={() => setIsKYCOpen(false)} 
        onComplete={() => {
          setIsKYCOpen(false);
          window.location.reload();
        }} 
      />
      {/* Top Header */}
      <header className={cn("border-b px-8 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors", isDarkMode ? "bg-brand-secondary border-white/10" : "bg-white border-slate-100")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-primary/20">
            P
          </div>
          <div>
            <h1 className={cn("font-display font-black text-lg leading-none", isDarkMode ? "text-white" : "text-brand-secondary")}>Pocket Loaner</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI-Powered Lending</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/bank-search')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
              isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-100 text-brand-secondary shadow-sm hover:shadow-md"
            )}
          >
            <Search className="w-4 h-4 text-brand-primary" />
            Search Banks
          </button>

          <div className={cn("rounded-xl p-1 flex items-center gap-1 border", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100")}>
            <button 
              onClick={() => setUserRole('user')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                userRole === 'user' 
                  ? (isDarkMode ? "bg-white/10 text-white shadow-lg" : "bg-white shadow-sm text-brand-secondary") 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <User className="w-4 h-4" />
              User
            </button>
            <button 
              onClick={() => setUserRole('admin')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                userRole === 'admin' 
                  ? (isDarkMode ? "bg-brand-primary text-brand-secondary shadow-lg" : "bg-brand-primary text-brand-secondary shadow-sm") 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Settings className="w-4 h-4" />
              Admin
            </button>
          </div>
          
          <div className={cn("flex items-center gap-4 border-l pl-6", isDarkMode ? "border-white/10" : "border-slate-100")}>
            <button 
              onClick={toggleTheme}
              className={cn("transition-colors", isDarkMode ? "text-brand-primary" : "text-slate-400 hover:text-brand-secondary")}
            >
              <Moon className="w-5 h-5" />
            </button>
            <div 
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold shadow-lg shadow-brand-primary/20 cursor-pointer"
            >
              {user?.name?.[0] || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className={cn("px-8 py-2 border-b sticky top-[73px] z-40 transition-colors", isDarkMode ? "bg-brand-secondary border-white/10" : "bg-white border-slate-50")}>
        <div className="flex items-center gap-8">
          {[
            { name: 'Home', icon: Home, path: '/' },
            { name: 'Compare', icon: ArrowLeftRight, path: '/compare' },
            { name: 'Profile & Risk', icon: UserCircle, path: '/profile' },
            { name: 'Transactions', icon: History, path: '/transactions' },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                (tab.path === '/' && window.location.pathname === '/') || (tab.path !== '/' && window.location.pathname.startsWith(tab.path))
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                  : "text-slate-400 hover:text-brand-secondary"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16 space-y-24">
        {userRole === 'admin' ? (
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-3xl text-brand-secondary">Admin Control Center</h2>
                <p className="text-slate-500 text-lg font-medium">Manage KYC verifications and loan approvals.</p>
              </div>
            </div>
            <AdminDashboard />
          </section>
        ) : (
          <>
            {/* Hero Section */}
            <section className="max-w-3xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl font-serif font-black text-brand-secondary leading-[1.1] tracking-tight mb-6"
              >
                Get your Personal Loan <br />
                <span className="text-brand-teal">at the lowest rate</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl"
              >
                Choose from India's top lending partners with attractive rates and instant approval
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 mt-10"
              >
                <Button 
                  onClick={() => navigate('/compare')}
                  className="px-8 py-4 bg-brand-primary hover:bg-brand-teal text-brand-secondary font-bold rounded-2xl shadow-lg shadow-brand-primary/20"
                >
                  Compare Rates
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/transactions')}
                  className="px-8 py-4 bg-white border-slate-200 text-brand-secondary font-bold rounded-2xl hover:bg-slate-50 flex items-center gap-2"
                >
                  <History className="w-5 h-5" />
                  View History
                </Button>
              </motion.div>
            </section>

            {/* Loan Cards Grid */}
            <section>
              <LoanCards />
            </section>

            {/* Financial Health Section */}
            <section className="space-y-8 pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-3xl text-brand-secondary">Your Financial Health</h2>
                  <p className="text-slate-500 text-lg font-medium">Real-time AI analysis of your creditworthiness.</p>
                </div>
              </div>
              <FinancialHealth />
            </section>

            {/* Loan Limit Section */}
            <section className="space-y-8 pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-3xl text-brand-secondary">Your Loan Limit</h2>
                  <p className="text-slate-500 text-lg font-medium">The maximum amount you can borrow based on your AI profile.</p>
                </div>
              </div>
              <LoanLimit />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
