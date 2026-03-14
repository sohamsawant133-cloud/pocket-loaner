import React, { useState } from 'react';
import { ChevronLeft, Info, Sparkles, Calendar, IndianRupee, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/UI';
import { getFinancialAdvice } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import toast from 'react-hot-toast';

import { useLoanApplications } from '../hooks/useLoanApplications';
import { useAuth } from '../hooks/useAuth';

import { KYCModal } from '../components/KYCModal';

export default function LoanRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitLoanApplication, loading: submitting } = useLoanApplications();
  const [amount, setAmount] = useState(500);
  const [tenure, setTenure] = useState(3);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [isKYCOpen, setIsKYCOpen] = useState(false);

  const isHighRisk = user?.risk_profile === 'High' || user?.risk_profile === 'High Risk';

  const handleApply = () => {
    if (isHighRisk) {
      toast.error("Your risk profile is too high. Please improve your credit score before applying for a loan.");
      return;
    }
    if (user?.kyc_status !== 'Verified') {
      setIsKYCOpen(true);
    } else {
      handleKYCComplete();
    }
  };

  const handleKYCComplete = async () => {
    setIsKYCOpen(false);
    const result = await submitLoanApplication({
      loanProvider: 'Pocket Loaner Direct',
      interestRate: '4.5%',
      amount,
      tenure,
      aiConfidence: 92,
    });

    if (result) {
      toast.success('✅ Success: Your loan application has been submitted!');
      navigate('/transactions');
    }
  };

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    const result = await getFinancialAdvice(`I want to take a loan of ₹${amount} for ${tenure} months. Is this a good idea?`);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  const monthlyPayment = (amount / tenure + (amount * 0.045 / 12)).toFixed(2);
  const totalRepayment = (amount + (amount * 0.045)).toFixed(2);

  return (
    <div className="p-6 pb-28 min-h-screen bg-[#F8FAFC]">
      <KYCModal 
        isOpen={isKYCOpen} 
        onClose={() => setIsKYCOpen(false)} 
        onComplete={handleKYCComplete} 
      />
      <header className="flex items-center gap-4 mb-10">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </motion.button>
        <h2 className="font-display font-extrabold text-2xl text-brand-secondary">Apply for Loan</h2>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-10">
          {/* Amount Selector */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Loan Amount</h3>
                <p className="text-slate-500 text-xs">How much do you need?</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-brand-primary">₹</span>
                <span className="text-4xl font-display font-extrabold text-brand-secondary tracking-tighter">{amount}</span>
              </div>
            </div>
            <div className="relative h-12 flex items-center">
              <input 
                type="range" 
                min="100" 
                max="5000" 
                step="100"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              <span>₹100</span>
              <span>₹5,000</span>
            </div>
          </section>

          {/* Tenure Selector */}
          <section>
            <div className="mb-6">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Repayment Period</h3>
              <p className="text-slate-500 text-xs">Choose your tenure</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[3, 6, 12, 24].map((m) => (
                <motion.button
                  key={m}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTenure(m)}
                  className={cn(
                    "py-4 rounded-2xl font-bold transition-all border-2 text-sm",
                    tenure === m 
                      ? "bg-brand-secondary text-white border-brand-secondary shadow-lg shadow-brand-secondary/20" 
                      : "bg-white text-slate-400 border-slate-50 shadow-sm"
                  )}
                >
                  {m}m
                </motion.button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Summary Bento */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white border-none shadow-sm p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Payment</p>
              <h4 className="font-display font-extrabold text-2xl text-brand-secondary">₹{monthlyPayment}</h4>
            </Card>
            <Card className="bg-white border-none shadow-sm p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                <IndianRupee className="w-5 h-5 text-brand-primary" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Repayment</p>
              <h4 className="font-display font-extrabold text-2xl text-brand-secondary">₹{totalRepayment}</h4>
            </Card>
          </div>

          {/* AI Advice Section */}
          <section className="relative">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-brand-primary/30 text-brand-primary font-bold text-sm hover:bg-brand-primary/5 transition-all"
              onClick={handleGetAdvice}
              disabled={loadingAdvice}
            >
              <Sparkles className="w-4 h-4" />
              {loadingAdvice ? 'Consulting AI...' : 'Get AI Financial Advice'}
            </motion.button>

            <AnimatePresence>
              {advice && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4"
                >
                  <Card className="bg-brand-primary/5 border-none p-6 relative overflow-hidden">
                    <div className="relative z-10 flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-primary flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6 text-brand-secondary" />
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">AI Recommendation</h5>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                          "{advice}"
                        </p>
                      </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl"></div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="pt-4">
            {isHighRisk && (
              <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-800 mb-1">Application Blocked</h4>
                  <p className="text-xs text-red-600 leading-relaxed">
                    Your current risk profile is too high. Please improve your credit score and financial health before applying for a new loan.
                  </p>
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleApply}
              disabled={submitting || isHighRisk}
              className={cn(
                "w-full py-5 text-lg flex items-center justify-center gap-3 shadow-2xl",
                isHighRisk ? "bg-slate-300 text-slate-500 shadow-none cursor-not-allowed" : "shadow-brand-primary/30"
              )}
            >
              {submitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Confirm Application
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </Button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
              By clicking confirm, you agree to our terms
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
