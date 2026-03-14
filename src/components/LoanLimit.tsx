import React, { useState } from 'react';
import { Card, Button, ErrorMessage } from './UI';
import { useFinancialProfile } from '../hooks/useFinancialProfile';
import { ShieldCheck, TrendingUp, ArrowUpRight, Loader2, Sparkles, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function LoanLimit() {
  const { profile, loading, error, requestLimitIncrease } = useFinancialProfile();
  const [requesting, setRequesting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate a dynamic loan limit based on financial profile
  const calculateLimit = () => {
    if (!profile) return 500000; // Default limit
    
    const scoreWeight = profile.creditScore.score / 850;
    const riskWeight = profile.riskProfile.riskScore / 100;
    
    // Base limit of 10 Lakhs, adjusted by profile weights
    const baseLimit = 1000000;
    const calculatedLimit = baseLimit * (scoreWeight * 0.7 + riskWeight * 0.3);
    
    // Round to nearest 50k
    return Math.round(calculatedLimit / 50000) * 50000;
  };

  const loanLimit = calculateLimit();

  const handleRequestHigherLimit = async () => {
    setRequesting(true);
    const success = await requestLimitIncrease();
    setRequesting(false);
    
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  if (loading && !profile) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <ErrorMessage 
        message={`Unable to load loan limit: ${error}`} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-brand-secondary border-none shadow-2xl shadow-brand-secondary/20 relative overflow-hidden group">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-teal/10 rounded-full blur-3xl -ml-24 -mb-24 transition-transform group-hover:scale-110 duration-700"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-brand-primary" />
              </div>
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Verified Loan Limit</span>
            </div>
            
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Maximum Availabe Limit</p>
              <h2 className="text-6xl font-display font-black text-white tracking-tight">
                ₹{loanLimit.toLocaleString()}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">+15% from last month</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                <Sparkles className="w-3 h-3 text-brand-primary" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest tracking-tighter">AI Optimized</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[240px]">
            <Button 
              onClick={handleRequestHigherLimit}
              disabled={requesting}
              className="w-full py-4 bg-brand-primary hover:bg-brand-teal text-brand-secondary font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-primary/20"
            >
              {requesting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Request Higher Limit
                  <ArrowUpRight className="w-5 h-5" />
                </>
              )}
            </Button>
            <p className="text-white/30 text-[9px] font-bold text-center uppercase tracking-widest">
              Next review in 24 days
            </p>
          </div>
        </div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 bg-brand-primary flex items-center justify-center z-20"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-secondary rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Sparkles className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-brand-secondary font-black text-xl mb-1">Request Submitted!</h3>
                <p className="text-brand-secondary/60 text-sm font-bold">Our AI is reviewing your profile for a limit increase.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Info Box */}
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
          <Info className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-brand-secondary mb-1">How is my limit calculated?</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Your loan limit is dynamically determined by our AI engine using your credit score ({profile?.creditScore.score}), 
            risk profile ({profile?.riskProfile.riskLevel}), and repayment history. Maintaining a good credit score 
            can significantly increase your borrowing capacity.
          </p>
        </div>
      </div>
    </div>
  );
}
