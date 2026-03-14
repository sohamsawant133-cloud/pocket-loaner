import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Shield, Bell, CreditCard, LogOut, ChevronRight, Settings, HelpCircle, X, Loader2 } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { cn } from '@/src/lib/utils';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    pan: '',
    aadhaar: '',
    income: '',
    employment_type: 'Salaried',
    bank_account: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        pan: user.pan || '',
        aadhaar: user.aadhaar || '',
        income: user.income?.toString() || '',
        employment_type: user.employment_type || 'Salaried',
        bank_account: user.bank_account || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await userApi.updateProfile({
        ...formData,
        income: parseFloat(formData.income) || 0
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      window.location.reload(); // Refresh to get updated data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: User, label: 'Personal Information', sub: 'Name, Email, Phone', color: 'text-blue-500' },
    { icon: Shield, label: 'Security', sub: 'Password, Biometrics', color: 'text-emerald-500' },
    { icon: Bell, label: 'Notifications', sub: 'Alerts, Updates', color: 'text-orange-500' },
    { icon: CreditCard, label: 'Payment Methods', sub: 'Cards, Bank Accounts', color: 'text-purple-500' },
    { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs, Contact Us', color: 'text-slate-500' },
  ];

  if (authLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 pb-28 min-h-screen bg-brand-surface">
      <header className="flex items-center gap-4 mb-10">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </motion.button>
        <h2 className="font-display font-extrabold text-2xl text-brand-secondary">My Profile</h2>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-28 h-28 rounded-[2rem] bg-white border-4 border-white shadow-2xl shadow-brand-secondary/10 flex items-center justify-center mb-4 overflow-hidden"
          >
            <div className="w-full h-full bg-brand-primary flex items-center justify-center">
              <User className="w-12 h-12 text-brand-secondary" />
            </div>
          </motion.div>
          <h3 className="font-display font-extrabold text-xl text-brand-secondary">
            {user?.name || 'User'}
          </h3>
          <p className="text-slate-400 text-sm font-medium">{user?.email}</p>
          
          <div className="flex gap-3 mt-4">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-brand-primary text-brand-secondary rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20"
            >
              Edit Profile
            </motion.button>
            <div className={cn(
              "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
              user?.kyc_status === 'Verified' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            )}>
              <Shield className="w-3 h-3" />
              {user?.kyc_status || 'Not Started'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item, i) => (
            <motion.button 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full text-left"
              onClick={() => toast.success(`${item.label} settings opened`)}
            >
              <Card className="flex items-center justify-between p-4 bg-white border-none shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center", item.color)}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-secondary text-sm">{item.label}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-200" />
              </Card>
            </motion.button>
          ))}

          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={logout}
            className="w-full text-left md:col-span-2"
          >
            <Card className="flex items-center gap-4 p-4 border-none bg-red-50/50 hover:bg-red-50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="font-bold text-red-600 text-sm">Sign Out</h4>
            </Card>
          </motion.button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-secondary/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-display font-black text-brand-secondary mb-6">Edit Profile</h3>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">PAN Number</label>
                    <input 
                      type="text" 
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Aadhaar Number</label>
                    <input 
                      type="text" 
                      value={formData.aadhaar}
                      onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Monthly Income</label>
                    <input 
                      type="number" 
                      value={formData.income}
                      onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Employment</label>
                    <select 
                      value={formData.employment_type}
                      onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    >
                      <option>Salaried</option>
                      <option>Self-Employed</option>
                      <option>Business</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Bank Account Number</label>
                  <input 
                    type="text" 
                    value={formData.bank_account}
                    onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
