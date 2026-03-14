import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, IndianRupee, Percent, ArrowRight, ShieldCheck, Zap, Building2 } from 'lucide-react';
import { Card, Button } from './UI';
import { cn } from '@/src/lib/utils';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  provider: {
    name: string;
    rate: string;
    amount: string;
    icon: any;
  } | null;
  loading?: boolean;
}

export function LoanApplicationModal({ isOpen, onClose, onConfirm, provider, loading }: LoanApplicationModalProps) {
  if (!provider) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-secondary/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                    <provider.icon className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <h2 className="font-display font-extrabold text-xl text-brand-secondary">Loan Application</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                  <div className="grid grid-cols-1 gap-8">
                    {/* Price (Amount) */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                          <IndianRupee className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</p>
                          <p className="text-sm font-bold text-slate-600">Loan Amount</p>
                        </div>
                      </div>
                      <p className="text-2xl font-display font-black text-brand-secondary">{provider.amount}</p>
                    </div>

                    <div className="h-px bg-slate-200 w-full" />

                    {/* Interest */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                          <Percent className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interest</p>
                          <p className="text-sm font-bold text-slate-600">Annual Rate</p>
                        </div>
                      </div>
                      <p className="text-2xl font-display font-black text-brand-secondary">{provider.rate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                    Your KYC is verified. This loan is pre-approved based on your financial health score.
                  </p>
                </div>

                <Button 
                  onClick={onConfirm}
                  disabled={loading}
                  className="w-full py-5 text-lg font-black flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Confirm & Approve
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </Button>
                
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Instant disbursal to your linked bank account
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
