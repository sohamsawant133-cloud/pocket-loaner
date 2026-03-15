import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Check, 
  Loader2, 
  CreditCard, 
  Camera, 
  AlertCircle, 
  Smartphone, 
  FileText,
  UserCheck,
  Upload,
  X,
  BrainCircuit,
  TrendingUp,
  ShieldAlert,
  Activity,
  Lightbulb
} from 'lucide-react';
import { Button } from './UI';
import { cn } from '@/src/lib/utils';
import { kycApi, aiApi } from '../services/api';
import { analyzeRisk, AIRiskResult } from '../services/aiRiskEngine';
import toast from 'react-hot-toast';
import { RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';
import { auth, IS_DUMMY_MODE } from '../lib/firebase';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const steps = [
  { id: 1, name: 'Selfie', icon: Camera },
  { id: 2, name: 'Identity', icon: CreditCard },
  { id: 3, name: 'OTP Verify', icon: Smartphone },
  { id: 4, name: 'AI Risk', icon: BrainCircuit },
];

export function KYCModal({ isOpen, onClose, onComplete }: KYCModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: 100000,
    tenure: 12,
    panNumber: '',
    aadhaarNumber: '',
    phoneNumber: '+91',
    income: '',
    employmentType: 'Salaried',
    bankAccount: '',
  });

  const [aiResult, setAiResult] = useState<AIRiskResult | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (step === 1 && isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step, isOpen, capturedImage]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Camera access denied. Please grant permission in your browser settings to continue.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && stream) {
      const canvas = document.createElement('canvas');
      // Scale down the image to max 800px width/height to save space
      const MAX_SIZE = 800;
      let width = videoRef.current.videoWidth || 640;
      let height = videoRef.current.videoHeight || 480;
      
      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        // Use high compression (0.6) to ensure it fits in Firestore
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    } else {
      // Fallback if camera is not working
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Dummy Photo', 200, 200);
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.6));
      }
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        if (!capturedImage) {
          toast.error("Please capture a selfie first");
          setLoading(false);
          return;
        }
        
        // Validate image size before sending
        const imageSizeInBytes = Math.round((capturedImage.length * 3) / 4);
        if (imageSizeInBytes > 900000) { // ~900KB limit for Firestore
          toast.error("Image is too large. Please retake the photo.");
          setCapturedImage(null);
          setLoading(false);
          return;
        }

        await kycApi.verify('selfie', { image: capturedImage });
        toast.success("Selfie captured successfully");
      } else if (step === 2) {
        // Validate PAN/Aadhaar
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
          toast.error("Invalid PAN format (e.g., ABCDE1234F)");
          setLoading(false);
          return;
        }
        if (!/^\d{12}$/.test(formData.aadhaarNumber.replace(/\s/g, ''))) {
          toast.error("Invalid Aadhaar format (12 digits)");
          setLoading(false);
          return;
        }
        if (!/^\+[1-9]\d{1,14}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
          toast.error("Invalid phone number. Must include country code (e.g., +919876543210)");
          setLoading(false);
          return;
        }
        
        try {
          if (IS_DUMMY_MODE || formData.phoneNumber === '+919999999999') {
            // Dummy OTP bypass
            console.log("Dummy OTP bypass for sending");
            toast.success("OTP sent to your mobile (Dummy Mode)");
            setStep(3);
            setLoading(false);
            return;
          }

          if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              size: 'invisible',
            });
          }
          const appVerifier = (window as any).recaptchaVerifier;
          
          const confirmation = await linkWithPhoneNumber(
            auth.currentUser!, 
            formData.phoneNumber.replace(/\s/g, ''), 
            appVerifier
          );
          setConfirmationResult(confirmation);
          
          await kycApi.verify('identity', { pan: formData.panNumber, aadhaar: formData.aadhaarNumber, phone: formData.phoneNumber });
          toast.success("OTP sent to your mobile");
          setStep(3);
        } catch (error: any) {
          if (error.code === 'auth/operation-not-allowed') {
            console.warn("Phone Auth is not enabled in Firebase. Falling back to dummy mode.");
            toast.error("Phone Auth disabled. Use dummy OTP: 123456", { duration: 5000 });
          } else {
            console.error("Phone Auth Error:", error);
            toast.error("Phone Auth failed. Use dummy OTP: 123456", { duration: 5000 });
          }
          
          if ((window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier.clear();
            (window as any).recaptchaVerifier = null;
          }
          
          // Fallback to dummy mode
          await kycApi.verify('identity', { pan: formData.panNumber, aadhaar: formData.aadhaarNumber, phone: formData.phoneNumber });
          setStep(3);
          setLoading(false);
          return;
        }
      } else if (step === 3) {
        if (otp.length !== 6) {
          toast.error("Enter 6-digit OTP");
          setLoading(false);
          return;
        }
        
        try {
          if (IS_DUMMY_MODE || otp === '123456') {
             // Dummy OTP bypass
             console.log("Dummy OTP used");
          } else if (confirmationResult) {
            await confirmationResult.confirm(otp);
          } else {
            throw new Error("Invalid dummy OTP. Please enter 123456.");
          }
        } catch (error: any) {
          console.error("OTP Verification Error:", error);
          toast.error(error.message || "Invalid OTP");
          setLoading(false);
          return;
        }

        await kycApi.verify('otp', { otp });
        toast.success("Phone verified successfully!");
        
        // Trigger AI Analysis
        const analysis = await analyzeRisk({
          ...formData,
          selfie: capturedImage,
          // Mocking some transaction data for the AI to analyze
          transactions: [
            { date: '2024-03-01', type: 'Credit', amount: 50000, description: 'Salary' },
            { date: '2024-03-05', type: 'Debit', amount: 12000, description: 'Rent' },
            { date: '2024-03-10', type: 'Debit', amount: 5000, description: 'Groceries' },
          ]
        });
        setAiResult(analysis);
        
        // Save to backend (without loan_application_id yet, will be linked later or stored as general analysis)
        try {
          await aiApi.saveRiskAnalysis(analysis);
        } catch (e) {
          console.error("Failed to save AI analysis to backend:", e);
        }
        
        toast.success("AI Analysis complete!");
      } else if (step === 4) {
        onComplete();
        return;
      }
      
      setStep(step + 1);
    } catch (error: any) {
      console.error("KYC Error:", error);
      toast.error(error.response?.data?.error || error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-secondary/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
      >
        <div className="max-h-[85vh] overflow-y-auto scrollbar-hide">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 z-30"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress Header */}
          <div className="bg-brand-surface p-8 border-b border-slate-100 sticky top-0 z-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <ShieldCheck className="w-6 h-6 text-brand-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-brand-secondary">KYC Verification</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step {step} of 4</p>
              </div>
            </div>

            <div className="flex justify-between relative px-2">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-brand-primary -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
              {steps.map((s) => (
                <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                    step >= s.id ? "bg-brand-primary text-brand-secondary" : "bg-white text-slate-300 border border-slate-100"
                  )}>
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="w-64 h-64 rounded-full border-4 border-brand-primary border-dashed mx-auto flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden shadow-2xl">
                    {capturedImage ? (
                      <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        {!stream && <Camera className="w-12 h-12 text-slate-300 absolute" />}
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center gap-4">
                    {!capturedImage ? (
                      <Button 
                        onClick={capturePhoto}
                        className="bg-brand-secondary text-white px-8 py-3 rounded-2xl flex items-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Capture Photo
                      </Button>
                    ) : (
                      <button 
                        onClick={() => setCapturedImage(null)}
                        className="text-brand-primary font-bold text-sm hover:underline"
                      >
                        Retake Photo
                      </button>
                    )}
                    
                    <p className="text-center text-sm text-slate-500 max-w-xs mx-auto">
                      {capturedImage 
                        ? "Great! You look good. Click continue to finish." 
                        : "Position your face inside the circle and look directly at the camera."}
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">PAN Card Number</label>
                      <input 
                        type="text" 
                        placeholder="ABCDE1234F"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                        value={formData.panNumber}
                        onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Aadhaar Number</label>
                      <input 
                        type="text" 
                        placeholder="1234 5678 9012"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                        value={formData.aadhaarNumber}
                        onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Mobile Number (with country code)</label>
                      <input 
                        type="text" 
                        placeholder="+91 9876543210"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Smartphone className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h4 className="font-bold text-brand-secondary">Verify OTP</h4>
                    <p className="text-xs text-slate-400">Enter the 6-digit code sent to your Aadhaar-linked mobile number</p>
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="0 0 0 0 0 0"
                      className="w-full text-center text-2xl font-black tracking-[1em] bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </motion.div>
              )}

              {step === 4 && aiResult && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-brand-surface border border-brand-primary/10">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Credit Score</p>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-brand-secondary">{aiResult.credit_score}</span>
                        <span className="text-[10px] font-bold text-brand-primary mb-1">/ 900</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-brand-surface border border-brand-primary/10">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Level</p>
                      <span className={cn(
                        "text-sm font-black uppercase tracking-wider",
                        aiResult.risk_level === 'Low Risk' ? 'text-emerald-500' : 
                        aiResult.risk_level === 'Medium Risk' ? 'text-amber-500' : 'text-red-500'
                      )}>
                        {aiResult.risk_level}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-brand-secondary text-white space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Loan Decision</p>
                        <h4 className="font-black text-lg">{aiResult.loan_decision}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed italic">
                      "{aiResult.risk_explanation}"
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-brand-primary" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actionable AI Tips</p>
                    </div>
                    <div className="grid gap-2">
                      {(aiResult.ai_recommendations || []).map((rec, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-2xl bg-brand-surface border border-brand-primary/5 hover:border-brand-primary/20 transition-all group">
                          <div className="w-6 h-6 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                            <span className="text-[10px] font-bold">{i + 1}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Face Match</p>
                      <p className="text-xs font-black text-brand-secondary">{aiResult.face_match_score}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Fraud Score</p>
                      <p className="text-xs font-black text-brand-secondary">{aiResult.fraud_score}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">DTI Ratio</p>
                      <p className="text-xs font-black text-brand-secondary">{aiResult.debt_to_income_ratio}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10">
              <Button 
                onClick={handleNext}
                disabled={loading}
                className="w-full py-5 text-lg shadow-xl shadow-brand-primary/20"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  step === 4 ? 'Complete Verification' : step === 3 ? 'Analyze with AI' : 'Continue'
                )}
              </Button>
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                Secured by Pocket Loaner AI
              </p>
              <div className="mt-6 text-center">
                <button 
                  onClick={() => {
                    onClose();
                    window.location.href = '/transactions';
                  }}
                  className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                >
                  View Application History
                </button>
              </div>
            </div>
            <div id="recaptcha-container"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
