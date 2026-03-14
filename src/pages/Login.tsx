import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { Mail, Lock, ArrowRight, Wallet, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let success = false;
    if (isLogin) {
      success = await login({ email, password });
    } else {
      success = await register({ name, email, password });
    }

    if (success) {
      navigate('/');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const success = await loginWithGoogle();
    if (success) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side - Branding (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 bg-brand-secondary p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mb-12 rotate-6 shadow-xl shadow-brand-primary/20"
          >
            <Wallet className="w-8 h-8 text-brand-secondary -rotate-6" />
          </motion.div>
          <h2 className="text-5xl font-display font-extrabold text-white mb-6 leading-tight">
            Manage your <br />
            <span className="text-brand-primary">finances</span> with <br />
            precision.
          </h2>
          <p className="text-white/50 text-lg max-w-md">
            Join thousands of users who trust Pocket Loaner for their daily financial needs and quick loans.
          </p>
        </div>
        
        <div className="relative z-10 flex gap-8">
          <div>
            <p className="text-white font-bold text-2xl">10k+</p>
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Active Users</p>
          </div>
          <div>
            <p className="text-white font-bold text-2xl">₹2M+</p>
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Loans Processed</p>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col p-8 md:p-12 justify-center bg-white">
        <div className="max-w-sm mx-auto w-full">
          <div className="md:hidden">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mb-8 rotate-6 shadow-xl shadow-brand-primary/20"
            >
              <Wallet className="w-8 h-8 text-brand-secondary -rotate-6" />
            </motion.div>
          </div>

          <h1 className="text-3xl font-display font-extrabold text-brand-secondary mb-2">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-slate-500 mb-8 text-sm">
            {isLogin 
              ? 'Sign in to access your pocket loaner account.' 
              : 'Create an account to start your financial journey.'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
              />
            </div>
            
            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs font-bold text-brand-primary">Forgot Password?</button>
              </div>
            )}

            <Button 
              type="submit"
              disabled={loading}
              className="w-full py-4 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <div className="relative flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-bold text-slate-700">Sign in with Google</span>
            </button>
          </form>

          <div className="py-8 text-center">
            <p className="text-slate-500 text-xs">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand-primary font-bold"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
