import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowLeftRight, Check, X, Info, Sparkles, ShieldCheck, Zap, Building2 } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import toast from 'react-hot-toast';

const loanOffers = [
  { id: 1, provider: 'HDFC Bank', rate: '10.5%', tenure: '12-60m', amount: 'Up to ₹40L', processing: '1%', speed: '24-48 hrs', score: 92 },
  { id: 2, provider: 'ICICI Bank', rate: '10.75%', tenure: '12-72m', amount: 'Up to ₹50L', processing: '0.5%', speed: 'Instant', score: 88 },
  { id: 3, provider: 'KreditBee', rate: '12.0%', tenure: '3-24m', amount: 'Up to ₹4L', processing: '2%', speed: '15 mins', score: 95 },
  { id: 4, provider: 'Navi', rate: '9.9%', tenure: '6-48m', amount: 'Up to ₹20L', processing: '0%', speed: 'Instant', score: 94 },
];

import { KYCModal } from '../components/KYCModal';
import { useLoanApplications } from '../hooks/useLoanApplications';
import { useAuth } from '../hooks/useAuth';
import { useFinancialProfile } from '../hooks/useFinancialProfile';

export default function Compare() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useFinancialProfile();
  const { submitLoanApplication, loading } = useLoanApplications();
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 4]);
  const [isKYCOpen, setIsKYCOpen] = useState(false);
  const [applyingOffer, setApplyingOffer] = useState<any>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(i => i !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleApplyClick = async (offer: any) => {
    if (user?.kyc_status !== 'Verified') {
      setApplyingOffer(offer);
      setIsKYCOpen(true);
    } else {
      if (profile?.riskProfile?.riskLevel === 'High') {
        toast.error('Warning: Your risk profile is High. Application may be rejected.', { icon: '⚠️' });
      }

      setSubmittingId(offer.id);
      const result = await submitLoanApplication({
        loanProvider: offer.provider,
        interestRate: offer.rate,
        amount: 100000,
        tenure: 12,
        aiConfidence: offer.score,
      });

      if (result) {
        toast.success(`Application for ${offer.provider} submitted!`);
        navigate('/transactions');
      }
      setSubmittingId(null);
    }
  };

  const handleKYCComplete = async () => {
    setIsKYCOpen(false);
    if (!applyingOffer) return;

    if (profile?.riskProfile?.riskLevel === 'High') {
      toast.error('Warning: Your risk profile is High. Application may be rejected.', { icon: '⚠️' });
    }

    setSubmittingId(applyingOffer.id);
    const result = await submitLoanApplication({
      loanProvider: applyingOffer.provider,
      interestRate: applyingOffer.rate,
      amount: 100000,
      tenure: 12,
      aiConfidence: applyingOffer.score,
    });

    if (result) {
      toast.success(`Application for ${applyingOffer.provider} submitted!`);
      navigate('/transactions');
    }
    setSubmittingId(null);
    setApplyingOffer(null);
  };

  const selectedOffers = loanOffers.filter(o => selectedIds.includes(o.id));

  return (
    <div className="p-6 pb-28 min-h-screen bg-brand-surface">
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
        <h2 className="font-display font-extrabold text-2xl text-brand-secondary">Compare Loans</h2>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Selection Area */}
        <div className="mb-12">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select up to 3 loans to compare</h3>
          <div className="flex flex-wrap gap-3">
            {loanOffers.map((offer) => (
              <button
                key={offer.id}
                onClick={() => toggleSelection(offer.id)}
                className={cn(
                  "px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2",
                  selectedIds.includes(offer.id)
                    ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                )}
              >
                {offer.provider}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px] grid grid-cols-4 gap-6">
            {/* Labels Column */}
            <div className="space-y-4 pt-24">
              <div className="h-12 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Interest Rate</div>
              <div className="h-12 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenure Range</div>
              <div className="h-12 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Amount</div>
              <div className="h-12 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Fee</div>
              <div className="h-12 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement</div>
              <div className="h-12 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Trust Score</div>
            </div>

            {/* Selected Offers Columns */}
            {selectedOffers.map((offer) => (
              <motion.div 
                key={offer.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <Card className="p-6 bg-white border-none shadow-sm text-center relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h4 className="font-display font-black text-brand-secondary">{offer.provider}</h4>
                  <div className="absolute top-2 right-2">
                    <button 
                      onClick={() => toggleSelection(offer.id)}
                      className="p-1 rounded-lg bg-slate-50 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </Card>

                <div className="h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-50 font-bold text-brand-secondary">{offer.rate}</div>
                <div className="h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-50 font-bold text-brand-secondary">{offer.tenure}</div>
                <div className="h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-50 font-bold text-brand-secondary">{offer.amount}</div>
                <div className="h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-50 font-bold text-brand-secondary">{offer.processing}</div>
                <div className="h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-50 font-bold text-brand-secondary">{offer.speed}</div>
                <div className="h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-50">
                  <div className="flex items-center gap-1 bg-brand-primary/10 px-3 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 text-brand-primary" />
                    <span className="text-xs font-black text-brand-primary">{offer.score}%</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleApplyClick(offer)}
                  disabled={submittingId === offer.id}
                  className="w-full py-4 shadow-lg shadow-brand-primary/10"
                >
                  {submittingId === offer.id ? 'Applying...' : 'Apply Now'}
                </Button>
              </motion.div>
            ))}

            {/* Add More Placeholder */}
            {selectedIds.length < 3 && (
              <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-slate-300">
                <ArrowLeftRight className="w-8 h-8 mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">Add another bank to compare</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendation Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <Card className="bg-brand-secondary p-8 border-none relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 rounded-3xl bg-brand-primary flex items-center justify-center shrink-0 shadow-xl shadow-brand-primary/20">
                <Sparkles className="w-10 h-10 text-brand-secondary" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-display font-black text-white mb-2">AI Recommendation</h3>
                <p className="text-white/60 text-sm max-w-xl leading-relaxed">
                  Based on your credit score of 720 and current market trends, <span className="text-brand-primary font-bold">Navi</span> offers the best value with 0% processing fees and instant disbursement.
                </p>
              </div>
              <div className="md:ml-auto">
                <Button 
                  onClick={() => handleApplyClick(loanOffers.find(o => o.provider === 'Navi'))}
                  disabled={submittingId === loanOffers.find(o => o.provider === 'Navi')?.id}
                  className="bg-white text-brand-secondary hover:bg-slate-100 px-8"
                >
                  {submittingId === loanOffers.find(o => o.provider === 'Navi')?.id ? 'Applying...' : 'Get Started'}
                </Button>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
