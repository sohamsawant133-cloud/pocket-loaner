import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Building2, Star, MapPin, Phone, Globe, ExternalLink, Loader2 } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import toast from 'react-hot-toast';

const indianBanks = [
  { name: 'State Bank of India (SBI)', type: 'Public Sector', rating: 4.8, headquarter: 'Mumbai', founded: '1955' },
  { name: 'HDFC Bank', type: 'Private Sector', rating: 4.9, headquarter: 'Mumbai', founded: '1994' },
  { name: 'ICICI Bank', type: 'Private Sector', rating: 4.7, headquarter: 'Mumbai', founded: '1994' },
  { name: 'Punjab National Bank (PNB)', type: 'Public Sector', rating: 4.2, headquarter: 'New Delhi', founded: '1894' },
  { name: 'Bank of Baroda', type: 'Public Sector', rating: 4.3, headquarter: 'Vadodara', founded: '1908' },
  { name: 'Axis Bank', type: 'Private Sector', rating: 4.6, headquarter: 'Mumbai', founded: '1993' },
  { name: 'Canara Bank', type: 'Public Sector', rating: 4.1, headquarter: 'Bengaluru', founded: '1906' },
  { name: 'Union Bank of India', type: 'Public Sector', rating: 4.0, headquarter: 'Mumbai', founded: '1919' },
  { name: 'Bank of India', type: 'Public Sector', rating: 3.9, headquarter: 'Mumbai', founded: '1906' },
  { name: 'Indian Bank', type: 'Public Sector', rating: 3.8, headquarter: 'Chennai', founded: '1907' },
  { name: 'Kotak Mahindra Bank', type: 'Private Sector', rating: 4.7, headquarter: 'Mumbai', founded: '2003' },
  { name: 'IndusInd Bank', type: 'Private Sector', rating: 4.4, headquarter: 'Mumbai', founded: '1994' },
  { name: 'Yes Bank', type: 'Private Sector', rating: 3.5, headquarter: 'Mumbai', founded: '2004' },
  { name: 'IDBI Bank', type: 'Private Sector', rating: 3.7, headquarter: 'Mumbai', founded: '1964' },
  { name: 'Central Bank of India', type: 'Public Sector', rating: 3.6, headquarter: 'Mumbai', founded: '1911' },
  { name: 'Indian Overseas Bank', type: 'Public Sector', rating: 3.5, headquarter: 'Chennai', founded: '1937' },
  { name: 'UCO Bank', type: 'Public Sector', rating: 3.4, headquarter: 'Kolkata', founded: '1943' },
  { name: 'Bank of Maharashtra', type: 'Public Sector', rating: 3.6, headquarter: 'Pune', founded: '1935' },
  { name: 'Punjab & Sind Bank', type: 'Public Sector', rating: 3.3, headquarter: 'New Delhi', founded: '1908' },
  { name: 'Federal Bank', type: 'Private Sector', rating: 4.2, headquarter: 'Kochi', founded: '1931' },
  { name: 'South Indian Bank', type: 'Private Sector', rating: 3.8, headquarter: 'Thrissur', founded: '1929' },
  { name: 'Karur Vysya Bank', type: 'Private Sector', rating: 4.0, headquarter: 'Karur', founded: '1916' },
  { name: 'City Union Bank', type: 'Private Sector', rating: 4.1, headquarter: 'Kumbakonam', founded: '1904' },
  { name: 'IDFC FIRST Bank', type: 'Private Sector', rating: 4.5, headquarter: 'Mumbai', founded: '2015' },
  { name: 'Bandhan Bank', type: 'Private Sector', rating: 3.9, headquarter: 'Kolkata', founded: '2015' },
  { name: 'RBL Bank', type: 'Private Sector', rating: 3.7, headquarter: 'Mumbai', founded: '1943' },
  { name: 'Karnataka Bank', type: 'Private Sector', rating: 3.8, headquarter: 'Mangaluru', founded: '1924' },
  { name: 'Tamilnad Mercantile Bank', type: 'Private Sector', rating: 3.9, headquarter: 'Thoothukudi', founded: '1921' },
  { name: 'DCB Bank', type: 'Private Sector', rating: 3.6, headquarter: 'Mumbai', founded: '1930' },
  { name: 'Dhanlaxmi Bank', type: 'Private Sector', rating: 3.2, headquarter: 'Thrissur', founded: '1927' },
  { name: 'CSB Bank', type: 'Private Sector', rating: 3.5, headquarter: 'Thrissur', founded: '1920' },
  { name: 'Nainital Bank', type: 'Private Sector', rating: 3.1, headquarter: 'Nainital', founded: '1922' },
  { name: 'Jammu & Kashmir Bank', type: 'Private Sector', rating: 3.4, headquarter: 'Srinagar', founded: '1938' },
  { name: 'Standard Chartered Bank', type: 'Foreign Bank', rating: 4.3, headquarter: 'London/Mumbai', founded: '1853' },
  { name: 'HSBC India', type: 'Foreign Bank', rating: 4.4, headquarter: 'London/Mumbai', founded: '1853' },
  { name: 'Citibank India', type: 'Foreign Bank', rating: 4.5, headquarter: 'New York/Mumbai', founded: '1902' },
  { name: 'Deutsche Bank India', type: 'Foreign Bank', rating: 4.2, headquarter: 'Frankfurt/Mumbai', founded: '1980' },
  { name: 'DBS Bank India', type: 'Foreign Bank', rating: 4.6, headquarter: 'Singapore/Mumbai', founded: '1994' },
  { name: 'Barclays Bank India', type: 'Foreign Bank', rating: 4.1, headquarter: 'London/Mumbai', founded: '1990' },
  { name: 'JPMorgan Chase Bank India', type: 'Foreign Bank', rating: 4.7, headquarter: 'New York/Mumbai', founded: '1945' },
  { name: 'Bank of America India', type: 'Foreign Bank', rating: 4.6, headquarter: 'Charlotte/Mumbai', founded: '1964' },
  { name: 'BNP Paribas India', type: 'Foreign Bank', rating: 4.0, headquarter: 'Paris/Mumbai', founded: '1860' },
  { name: 'Saraswat Bank', type: 'Co-operative', rating: 4.1, headquarter: 'Mumbai', founded: '1918' },
  { name: 'Cosmos Bank', type: 'Co-operative', rating: 3.9, headquarter: 'Pune', founded: '1906' },
  { name: 'SVC Bank', type: 'Co-operative', rating: 3.8, headquarter: 'Mumbai', founded: '1906' },
  { name: 'TJSB Bank', type: 'Co-operative', rating: 3.7, headquarter: 'Thane', founded: '1972' },
  { name: 'Bharat Bank', type: 'Co-operative', rating: 3.6, headquarter: 'Mumbai', founded: '1978' },
  { name: 'Abhyudaya Bank', type: 'Co-operative', rating: 3.5, headquarter: 'Mumbai', founded: '1964' },
  { name: 'NKGSB Bank', type: 'Co-operative', rating: 3.4, headquarter: 'Mumbai', founded: '1917' },
  { name: 'Janata Sahakari Bank', type: 'Co-operative', rating: 3.3, headquarter: 'Pune', founded: '1949' },
];

import { KYCModal } from '../components/KYCModal';
import { useLoanApplications } from '../hooks/useLoanApplications';
import { bankApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useFinancialProfile } from '../hooks/useFinancialProfile';

export default function BankSearch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useFinancialProfile();
  const { submitLoanApplication, loading } = useLoanApplications();
  const [searchQuery, setSearchQuery] = useState('');
  const [isKYCOpen, setIsKYCOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await bankApi.getBanks();
        setBanks(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch banks:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchBanks();
  }, []);

  const handleApplyClick = async (bank: any) => {
    if (user?.kyc_status !== 'Verified') {
      setSelectedBank(bank);
      setIsKYCOpen(true);
    } else {
      if (profile?.riskProfile?.riskLevel === 'High') {
        toast.error('Warning: Your risk profile is High. Application may be rejected.', { icon: '⚠️' });
      }

      setSubmittingId(bank.name);
      const result = await submitLoanApplication({
        loanProvider: bank.name,
        interestRate: '10.5%',
        amount: 100000,
        tenure: 12,
        aiConfidence: 90,
      });

      if (result) {
        toast.success(`Application for ${bank.name} submitted!`);
        navigate('/transactions');
      }
      setSubmittingId(null);
    }
  };

  const handleKYCComplete = async () => {
    setIsKYCOpen(false);
    if (!selectedBank) return;

    if (profile?.riskProfile?.riskLevel === 'High') {
      toast.error('Warning: Your risk profile is High. Application may be rejected.', { icon: '⚠️' });
    }

    setSubmittingId(selectedBank.name);
    const result = await submitLoanApplication({
      loanProvider: selectedBank.name,
      interestRate: '10.5%', // Default for bank search apply
      amount: 100000,
      tenure: 12,
      aiConfidence: 90,
    });

    if (result) {
      toast.success(`Application for ${selectedBank.name} submitted!`);
      navigate('/transactions');
    }
    setSubmittingId(null);
    setSelectedBank(null);
  };

  const filteredBanks = banks.filter(bank => 
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.headquarter.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (fetching) {
    return (
      <div className="p-6 min-h-screen bg-brand-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

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
        <h2 className="font-display font-extrabold text-2xl text-brand-secondary">Top Indian Banks</h2>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by bank name, type or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBanks.map((bank, i) => (
            <motion.div
              key={bank.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card className="p-5 bg-white border-none shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-secondary text-sm leading-tight">{bank.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{bank.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-amber-700">{bank.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-500">{bank.headquarter}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-500">Est. {bank.founded}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => handleApplyClick(bank)}
                    disabled={submittingId === bank.name}
                    className="flex-1 py-2 bg-brand-primary text-brand-secondary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-teal transition-all disabled:opacity-50"
                  >
                    {submittingId === bank.name ? 'Applying...' : 'Apply Now'}
                  </button>
                  <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-brand-primary hover:text-white transition-all">
                    <Globe className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
