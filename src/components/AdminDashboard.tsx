import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Card, Button } from './UI';
import { 
  Users, 
  FileCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Eye,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { cn } from '@/src/lib/utils';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pendingKYCs, setPendingKYCs] = useState<any[]>([]);
  const [pendingLoans, setPendingLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kyc' | 'loans'>('kyc');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, kycRes, loansRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPendingKYCs(),
        adminApi.getPendingLoans()
      ]);
      setStats(statsRes.data);
      setPendingKYCs(Array.isArray(kycRes.data) ? kycRes.data : []);
      setPendingLoans(Array.isArray(loansRes.data) ? loansRes.data : []);
    } catch (error) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleKYCAction = async (id: string, status: string) => {
    try {
      await adminApi.reviewKYC(id, { status, remarks: `Reviewed as ${status}` });
      toast.success(`KYC ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleLoanAction = async (id: string, status: string) => {
    try {
      await adminApi.reviewLoan(id, { status, remarks: `Reviewed as ${status}` });
      toast.success(`Loan ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (loading && !stats) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Pending KYC', value: stats?.pendingKYC, icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Pending Loans', value: stats?.pendingLoans, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Total Disbursed', value: `₹${(stats?.totalDisbursed / 100000).toFixed(1)}L`, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i}>
            <Card className="p-6 border-none shadow-sm flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-display font-black text-brand-secondary">{stat.value}</p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('kyc')}
              className={cn(
                "text-sm font-black uppercase tracking-widest transition-all relative py-2",
                activeTab === 'kyc' ? "text-brand-primary" : "text-slate-400 hover:text-slate-600"
              )}
            >
              KYC Reviews
              {activeTab === 'kyc' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('loans')}
              className={cn(
                "text-sm font-black uppercase tracking-widest transition-all relative py-2",
                activeTab === 'loans' ? "text-brand-primary" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Loan Applications
              {activeTab === 'loans' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-full" />}
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..."
                className="bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <Button variant="outline" className="p-2 border-slate-100">
              <Filter className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'kyc' ? (
              <motion.div 
                key="kyc"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {pendingKYCs.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 font-medium">No pending KYCs</div>
                ) : (
                  pendingKYCs.map((kyc) => (
                    <div key={kyc.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-brand-secondary shadow-sm">
                          {kyc.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-secondary">{kyc.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PAN: {kyc.pan}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => handleKYCAction(kyc.id, 'Verified')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleKYCAction(kyc.id, 'Failed')}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="loans"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {pendingLoans.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 font-medium">No pending loans</div>
                ) : (
                  pendingLoans.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-brand-secondary shadow-sm">
                          {loan.user_name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-secondary">{loan.user_name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            ₹{loan.amount.toLocaleString()} • {loan.loan_provider}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right mr-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Confidence</p>
                          <p className="text-sm font-black text-brand-primary">{loan.ai_confidence}%</p>
                        </div>
                        <Button 
                          onClick={() => handleLoanAction(loan.id, 'Approved')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleLoanAction(loan.id, 'Rejected')}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
