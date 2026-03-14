import React from 'react';
import { Card, Button, ErrorMessage } from './UI';
import { useFinancialProfile } from '../hooks/useFinancialProfile';
import { RefreshCw, ShieldCheck, TrendingUp, AlertCircle, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const scoreTrendData = [
  { month: 'Oct', score: 680 },
  { month: 'Nov', score: 695 },
  { month: 'Dec', score: 710 },
  { month: 'Jan', score: 705 },
  { month: 'Feb', score: 725 },
  { month: 'Mar', score: 740 },
];

const dtiData = [
  { name: 'Debt', value: 25, color: '#D2691E' },
  { name: 'Income', value: 75, color: '#F8FAFC' },
];

const comparisonData = [
  { category: 'You', score: 740, color: '#D2691E' },
  { category: 'National Avg', score: 650, color: '#94A3B8' },
  { category: 'Age Group', score: 680, color: '#94A3B8' },
  { category: 'Income Group', score: 710, color: '#94A3B8' },
];

export function FinancialHealth() {
  const { profile, loading, error, recalculateCreditScore, recalculateRiskProfile } = useFinancialProfile();

  if (loading && !profile) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="h-64 bg-slate-100 rounded-3xl"></div>
        <div className="h-64 bg-slate-100 rounded-3xl"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <ErrorMessage 
        message={`Unable to load financial profile: ${error}`} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Credit Score Card */}
        <Card className="lg:col-span-2 p-8 bg-white border-none shadow-sm relative overflow-hidden flex flex-col">
          <div className="relative z-10 flex-1">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Credit Score Analysis</h3>
                <p className="text-slate-500 text-xs">Your score trend over the last 6 months</p>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                profile?.creditScore.rating === 'Excellent' ? "bg-emerald-50 text-emerald-600" :
                profile?.creditScore.rating === 'Good' ? "bg-blue-50 text-blue-600" :
                "bg-amber-50 text-amber-600"
              )}>
                {profile?.creditScore.rating}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="flex flex-col justify-center">
                <div className="text-6xl font-display font-extrabold text-brand-secondary tracking-tighter mb-2">
                  {profile?.creditScore.score}
                </div>
                <div className="flex items-center gap-2 text-emerald-500 mb-4">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold">+15 pts this month</span>
                </div>
                <Button 
                  onClick={recalculateCreditScore}
                  disabled={loading}
                  variant="outline"
                  className="w-full py-4 border-2 border-slate-100 hover:border-brand-primary/30 hover:bg-brand-primary/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                  Recalculate
                </Button>
              </div>
              
              <div className="md:col-span-2 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrendData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D2691E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D2691E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                    />
                    <YAxis hide domain={[600, 850]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 800, color: '#1E293B' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#D2691E" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>

        {/* Risk Profile Card */}
        <Card className="p-8 bg-white border-none shadow-sm relative overflow-hidden flex flex-col">
          <div className="relative z-10 flex-1">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Assessment</h3>
                <p className="text-slate-500 text-xs">Debt to Income Ratio</p>
              </div>
              <ShieldCheck className="w-6 h-6 text-brand-primary" />
            </div>

            <div className="flex flex-col items-center justify-center mb-8">
              <div className="h-[180px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dtiData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dtiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-brand-secondary">25%</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">DTI Ratio</span>
                </div>
              </div>
              
              <div className="w-full space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Level</span>
                  <span className={cn(
                    "text-sm font-black",
                    profile?.riskProfile.riskLevel === 'Low' ? "text-emerald-500" :
                    profile?.riskProfile.riskLevel === 'Moderate' ? "text-amber-500" :
                    "text-red-500"
                  )}>
                    {profile?.riskProfile.riskLevel}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profile?.riskProfile.riskScore}%` }}
                    className={cn(
                      "h-full rounded-full",
                      profile?.riskProfile.riskLevel === 'Low' ? "bg-emerald-500" :
                      profile?.riskProfile.riskLevel === 'Moderate' ? "bg-amber-500" :
                      "bg-red-500"
                    )}
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={recalculateRiskProfile}
              disabled={loading}
              variant="outline"
              className="w-full py-4 border-2 border-slate-100 hover:border-brand-primary/30 hover:bg-brand-primary/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
              Recalculate Risk
            </Button>
          </div>
        </Card>
      </div>

      {/* Comparison Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 bg-white border-none shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-sm font-black text-brand-secondary uppercase tracking-widest">Benchmarking</h3>
              <p className="text-xs text-slate-400">Compare your score with averages</p>
            </div>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" hide domain={[0, 850]} />
                <YAxis 
                  dataKey="category" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={24}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 bg-brand-secondary text-white border-none shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Loan Eligibility</h3>
                <p className="text-xs text-white/50">AI-calculated borrowing power</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="text-center">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Maximum Eligibility</p>
                <h4 className="text-5xl font-display font-black text-brand-primary tracking-tighter">₹25,00,000</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Approval Probability</p>
                  <p className="text-xl font-black text-emerald-400">92%</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Interest Rate</p>
                  <p className="text-xl font-black text-brand-primary">10.5%</p>
                </div>
              </div>

              <Button 
                className="w-full py-5 bg-brand-primary text-brand-secondary font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-primary/20"
              >
                Boost Your Eligibility
              </Button>
            </div>
          </div>
          
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>
        </Card>
      </div>
    </div>
  );
}
