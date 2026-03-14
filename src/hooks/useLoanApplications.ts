import { useState, useEffect } from 'react';
import { loanApi } from '../services/api';
import toast from 'react-hot-toast';

export interface LoanApplication {
  id?: string;
  userId: string;
  userName: string;
  loanProvider: string;
  interestRate: string;
  amount: number;
  tenure: number;
  status: 'pending' | 'approved' | 'rejected';
  aiConfidence: number;
  appliedDate: string;
  kycStatus: 'verified' | 'pending' | 'failed';
  kycTransactionId: string;
}

export function useLoanApplications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loanApi.getApplications();
      if (!Array.isArray(res.data)) {
        console.error('Invalid response format', res.data);
        setError('Received invalid data format from server.');
        setApplications([]);
        return;
      }
      const normalized = res.data.map((app: any) => ({
        id: app.id,
        userId: app.user_id,
        userName: app.user_name || '',
        loanProvider: app.provider || app.loan_provider, // Handle both possible keys
        interestRate: app.interest_rate,
        amount: app.amount,
        tenure: app.tenure,
        status: app.status,
        aiConfidence: app.ai_confidence,
        appliedDate: app.created_at || app.applied_date,
        kycStatus: app.kyc_status || 'verified',
        kycTransactionId: app.kyc_transaction_id,
      }));
      setApplications(normalized);
    } catch (err: any) {
      console.error('Failed to fetch applications', err);
      setError(err.response?.data?.error || err.message || 'Failed to load loan applications. Please try again later.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const submitLoanApplication = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const res = await loanApi.apply({
        ...data,
        kycTransactionId: `KYC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      });
      fetchApplications();
      return res.data.id;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to submit loan application.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { submitLoanApplication, loading, error, applications, fetchApplications };
}
