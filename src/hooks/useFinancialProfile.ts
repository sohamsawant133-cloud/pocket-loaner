import { useState, useEffect } from 'react';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

export interface FinancialProfile {
  userId: string;
  creditScore: {
    score: number;
    rating: string;
    lastUpdated: string;
  };
  riskProfile: {
    riskLevel: string;
    riskScore: number;
    debtToIncomeRatio: number;
    lastAssessed: string;
  };
}

export function useFinancialProfile() {
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await userApi.getProfile();
      const data = res.data as any;
      
      // Map backend data to frontend interface
      setProfile({
        userId: data.id,
        creditScore: {
          score: data.credit_score || 720,
          rating: data.credit_score > 750 ? 'Excellent' : data.credit_score > 650 ? 'Good' : 'Fair',
          lastUpdated: new Date().toISOString(),
        },
        riskProfile: {
          riskLevel: data.risk_profile || 'Low',
          riskScore: data.risk_profile === 'Low' ? 85 : data.risk_profile === 'Moderate' ? 55 : 25,
          debtToIncomeRatio: 25,
          lastAssessed: new Date().toISOString(),
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const recalculateCreditScore = async () => {
    setLoading(true);
    try {
      const res = await userApi.calculateCreditScore();
      toast.success(`Credit score updated to ${res.data.score}`);
      fetchProfile();
    } catch (err: any) {
      toast.error('Failed to recalculate credit score');
    } finally {
      setLoading(false);
    }
  };

  const recalculateRiskProfile = async () => {
    setLoading(true);
    try {
      const res = await userApi.analyzeRiskProfile();
      toast.success(`Risk profile updated to ${res.data.profile}`);
      fetchProfile();
    } catch (err: any) {
      toast.error('Failed to recalculate risk profile');
    } finally {
      setLoading(false);
    }
  };

  const requestLimitIncrease = async () => {
    setLoading(true);
    try {
      // Simulate limit increase request
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Limit increase request submitted!');
      return true;
    } catch (err: any) {
      toast.error('Failed to request limit increase');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, recalculateCreditScore, recalculateRiskProfile, requestLimitIncrease };
}
