import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, ErrorMessage } from './UI';
import { useLoanApplications } from '../hooks/useLoanApplications';
import { Sparkles, ArrowRight, Building2, Wallet, Zap, CreditCard, Landmark, Loader2, Star, CheckCircle2, ShieldCheck, History, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

const loanProviders = [
  { 
    id: 'hdfc', 
    name: 'HDFC Bank', 
    rate: '10.50% p.a.', 
    amount: '₹25 Lakhs', 
    tenure: 'Up to 5 years', 
    icon: Building2, 
    color: 'bg-blue-50', 
    badge: 'INSTANT DISBURSAL',
    badgeColor: 'bg-orange-500',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400',
    features: ['Instant approval', 'Flexible tenure', 'Minimal documentation']
  },
  { 
    id: 'kreditbee', 
    name: 'KreditBee', 
    rate: '12.00% p.a.', 
    amount: '₹10 Lakhs', 
    tenure: 'Up to 3 years', 
    icon: Wallet, 
    color: 'bg-emerald-50', 
    badge: 'NO INCOME PROOF',
    badgeColor: 'bg-pink-500',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=400',
    features: ['No income proof needed', 'Quick disbursal', '100% digital']
  },
  { 
    id: 'navi', 
    name: 'Navi', 
    rate: '10.90% p.a.', 
    amount: '₹20 Lakhs', 
    tenure: 'Up to 5 years', 
    icon: Zap, 
    color: 'bg-yellow-50', 
    badge: 'ZERO PROCESSING FEE',
    badgeColor: 'bg-blue-500',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=400',
    features: ['Zero processing fee', 'Quick approval', 'Flexible EMI options']
  },
];

import { KYCModal } from './KYCModal';
import { LoanApplicationModal } from './LoanApplicationModal';

import { useAuth } from '../hooks/useAuth';
import { useFinancialProfile } from '../hooks/useFinancialProfile';
import toast from 'react-hot-toast';

export function LoanCards() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useFinancialProfile();
  const { submitLoanApplication, loading, error } = useLoanApplications();
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [isKYCOpen, setIsKYCOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  const filteredProviders = filter === 'All' 
    ? loanProviders 
    : loanProviders.filter(p => p.name === filter);

  const handleApplyClick = async (provider: any) => {
    setSelectedProvider(provider);
    if (user?.kyc_status !== 'Verified') {
      setIsKYCOpen(true);
    } else {
      setIsLoanModalOpen(true);
    }
  };

  const handleConfirmLoan = async () => {
    if (!selectedProvider) return;
    
    // AI Risk Mitigation System
    if (profile?.riskProfile?.riskLevel === 'High') {
      toast.error('Warning: Your risk profile is High. Application may be rejected.', { icon: '⚠️' });
    }

    setSubmittingId(selectedProvider.id);
    const result = await submitLoanApplication({
      loanProvider: selectedProvider.name,
      interestRate: selectedProvider.rate,
      amount: parseInt(selectedProvider.amount.replace(/[^0-9]/g, '')) * 100000 || 100000,
      tenure: 12,
      aiConfidence: profile?.riskProfile?.riskLevel === 'Low' ? 95 : 75,
    });

    if (result) {
      toast.success(`Application for ${selectedProvider.name} submitted!`);
      setIsLoanModalOpen(false);
      navigate('/transactions');
    } else {
      toast.error('Failed to submit application.');
    }
    setSubmittingId(null);
    setSelectedProvider(null);
  };

  const handleKYCComplete = async () => {
    setIsKYCOpen(false);
    // After KYC, open the loan application tab (modal)
    setIsLoanModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      )}
      <KYCModal 
        isOpen={isKYCOpen} 
        onClose={() => setIsKYCOpen(false)} 
        onComplete={handleKYCComplete} 
      />
      <LoanApplicationModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onConfirm={handleConfirmLoan}
        provider={selectedProvider}
        loading={submittingId !== null}
      />
      {/* Filter UI */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Filter by Provider:</p>
        {['All', 'HDFC Bank', 'KreditBee', 'Navi'].map((name) => (
          <button
            key={name}
            onClick={() => setFilter(name)}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-bold transition-all border",
              filter === name 
                ? "bg-brand-secondary text-white border-brand-secondary shadow-lg shadow-brand-secondary/20" 
                : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProviders.map((provider, i) => {
          const isSubmitting = submittingId === provider.id;
          
          return (
            <motion.div
              key={provider.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.1 }}
            >
            <Card className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden relative min-h-[500px] flex flex-col">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <img 
                  src={provider.image} 
                  alt={provider.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-brand-secondary/90"></div>
              </div>

              <div className="relative z-10 p-6 flex-1 flex flex-col">
                {/* Provider Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                    <provider.icon className="w-6 h-6 text-brand-secondary" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-xl text-white tracking-tight">{provider.name}</h3>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < provider.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="mb-8">
                  <span className={`${provider.badgeColor} text-white text-[10px] font-black px-3 py-1.5 rounded-lg tracking-wider shadow-lg inline-flex items-center gap-2`}>
                    {provider.id === 'hdfc' && <Zap className="w-3 h-3 fill-white" />}
                    {provider.id === 'kreditbee' && <ShieldCheck className="w-3 h-3 fill-white" />}
                    {provider.id === 'navi' && <CheckCircle2 className="w-3 h-3 fill-white" />}
                    {provider.badge}
                  </span>
                </div>

                {/* Details Box */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 mb-6 shadow-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Interest Rate</p>
                      <p className="text-sm font-extrabold text-brand-secondary">{provider.rate}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Max Amount</p>
                      <p className="text-sm font-extrabold text-brand-secondary">{provider.amount}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tenure</p>
                      <p className="text-sm font-extrabold text-brand-secondary">{provider.tenure}</p>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-8">
                  {provider.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-white/90">
                      <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                      <span className="text-xs font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-3">
                  <Button 
                    onClick={() => handleApplyClick(provider)}
                    disabled={submittingId !== null}
                    className="flex-1 py-4 bg-brand-primary hover:bg-brand-teal text-brand-secondary font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Apply Now
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/transactions')}
                    className="px-4 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-2xl transition-all"
                  >
                    <History className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  </div>
);
}
