import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Filter, ArrowUpRight, ArrowDownLeft, Calendar, X } from 'lucide-react';
import { Card } from '../components/UI';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { useLoanApplications } from '../hooks/useLoanApplications';

export default function Transactions() {
  const navigate = useNavigate();
  const { applications, loading } = useLoanApplications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [dateFilter, setDateFilter] = useState('All Time');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const loanTransactions = applications.map(app => ({
    name: app.loanProvider,
    date: app.appliedDate,
    displayDate: new Date(app.appliedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    amount: app.amount,
    icon: '🏦',
    category: 'Loan Application',
    color: app.status === 'approved' ? 'bg-emerald-50' : app.status === 'rejected' ? 'bg-red-50' : 'bg-amber-50',
    status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
    ref: app.kycTransactionId,
    details: app
  }));

  const allTransactions = [...loanTransactions];

  const filterByDate = (tx: any) => {
    const txDate = new Date(tx.date);
    const now = new Date();
    
    if (dateFilter === 'This Month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'Last Month') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      return txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear();
    }
    if (dateFilter === 'Custom Range' && customRange.start && customRange.end) {
      const start = new Date(customRange.start);
      const end = new Date(customRange.end);
      return txDate >= start && txDate <= end;
    }
    if (dateFilter === 'All Time') return true;
    return true;
  };

  const filteredTransactions = allTransactions
    .filter(tx => 
      tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(filterByDate);

  return (
    <div className="p-6 pb-28 min-h-screen bg-[#F8FAFC]">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </motion.button>
          <h2 className="font-display font-extrabold text-2xl text-brand-secondary">History</h2>
        </div>
        <button className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
          <Filter className="w-5 h-5 text-slate-600" />
        </button>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Search and Date Filter */}
        <div className="space-y-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-50 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm text-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['This Month', 'Last Month', 'Custom Range', 'All Time'].map((range) => (
              <button
                key={range}
                onClick={() => setDateFilter(range)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                  dateFilter === range 
                    ? "bg-brand-secondary text-white border-brand-secondary shadow-md" 
                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                )}
              >
                {range}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {dateFilter === 'Custom Range' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Start Date</p>
                    <input 
                      type="date" 
                      value={customRange.start}
                      onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full text-xs font-bold text-brand-secondary focus:outline-none"
                    />
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="flex-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">End Date</p>
                    <input 
                      type="date" 
                      value={customRange.end}
                      onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full text-xs font-bold text-brand-secondary focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-brand-secondary">No transactions found</h3>
              <p className="text-slate-400 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTransactions.map((tx, i) => (
                <TransactionItem 
                  key={tx.name + i} 
                  tx={tx} 
                  index={i} 
                  onOpenModal={(tx) => setSelectedTx(tx)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="fixed inset-0 bg-brand-secondary/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-inner", selectedTx.color)}>
                      {selectedTx.icon}
                    </div>
                    <button 
                      onClick={() => setSelectedTx(null)}
                      className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-display font-black text-brand-secondary mb-1">{selectedTx.name}</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{selectedTx.category}</p>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-6 mb-8">
                    <div className="text-center mb-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                      <h4 className={cn("text-4xl font-display font-black", selectedTx.amount > 0 ? "text-brand-primary" : "text-brand-secondary")}>
                        {selectedTx.amount > 0 ? '+' : ''}₹{Math.abs(selectedTx.amount).toLocaleString()}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-6">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                        <p className="text-sm font-bold text-brand-secondary">{selectedTx.displayDate}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <p className={cn("text-sm font-bold", selectedTx.status === 'Approved' ? "text-emerald-500" : "text-amber-500")}>
                          {selectedTx.status}
                        </p>
                      </div>
                      {selectedTx.details && (
                        <>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Interest Rate</p>
                            <p className="text-sm font-bold text-brand-secondary">{selectedTx.details.interestRate}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tenure</p>
                            <p className="text-sm font-bold text-brand-secondary">{selectedTx.details.tenure} Months</p>
                          </div>
                        </>
                      )}
                      <div className="col-span-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reference ID</p>
                        <p className="text-sm font-mono font-bold text-slate-500">{selectedTx.ref}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedTx(null)}
                    className="w-full py-4 bg-brand-secondary text-white font-bold rounded-2xl hover:bg-brand-secondary/90 transition-all shadow-lg shadow-brand-secondary/20"
                  >
                    Close Details
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TransactionItem({ tx, index, onOpenModal }: { tx: any; index: number; onOpenModal: (tx: any) => void; key?: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "p-4 bg-white rounded-2xl border border-slate-50 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden",
        isExpanded ? "md:col-span-2 ring-2 ring-brand-primary/20" : ""
      )}
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-110", tx.color)}>
            {tx.icon}
          </div>
          <div>
            <h4 className="font-bold text-brand-secondary text-sm">{tx.name}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{tx.category}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("font-bold text-sm", tx.amount > 0 ? "text-brand-primary" : "text-brand-secondary")}>
            {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
          </p>
          <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">{tx.displayDate}</p>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="pt-4 border-t border-slate-50 space-y-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Date</p>
                <p className="text-xs font-bold text-brand-secondary">{tx.displayDate}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <p className={cn("text-xs font-bold", tx.status === 'Approved' || tx.status === 'Completed' ? "text-emerald-500" : "text-amber-500")}>
                  {tx.status}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reference ID</p>
                <p className="text-xs font-mono font-bold text-slate-500 truncate">{tx.ref}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenModal(tx);
                }}
                className="flex-1 py-2 bg-brand-primary text-brand-secondary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-teal transition-all"
              >
                View Full Details
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Collapse
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
