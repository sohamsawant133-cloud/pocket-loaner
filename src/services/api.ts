import { auth, db, IS_DUMMY_MODE, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  limit,
  getCountFromServer
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Helper to get current user ID
const getUserId = () => {
  if (IS_DUMMY_MODE) {
    const savedUser = localStorage.getItem('dummy_user');
    if (savedUser) return JSON.parse(savedUser).uid;
    return 'dummy-uid-123';
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user.uid;
};

export const authApi = {
  // Login and register are handled directly via Firebase Auth in useAuth.ts
  login: async (data: any) => ({ data: { message: "Use Firebase Auth directly" } }),
  register: async (data: any) => ({ data: { message: "Use Firebase Auth directly" } }),
};

export const userApi = {
  getProfile: async () => {
    const uid = getUserId();
    
    if (IS_DUMMY_MODE) {
      const savedUser = localStorage.getItem('dummy_user');
      const userData = savedUser ? JSON.parse(savedUser) : { name: 'Dummy User', email: 'dummy@example.com' };
      return { data: { id: uid, ...userData } };
    }

    try {
      const docRef = doc(db, 'users', uid);
      // Use getDocFromServer to ensure we're not just hitting a stale/offline cache
      const docSnap = await getDocFromServer(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { data: { id: docSnap.id, ...data } };
      }
      // If doc doesn't exist, return basic info from auth
      return { data: { id: uid, email: auth.currentUser?.email, kyc_status: 'Not Started' } };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      throw error;
    }
  },
  updateProfile: async (data: any) => {
    const uid = getUserId();

    if (IS_DUMMY_MODE) {
      const savedUser = localStorage.getItem('dummy_user');
      const userData = savedUser ? JSON.parse(savedUser) : {};
      const updatedUser = { ...userData, ...data };
      localStorage.setItem('dummy_user', JSON.stringify(updatedUser));
      return { data: { message: "Profile updated (Dummy Mode)" } };
    }

    try {
      await setDoc(doc(db, 'users', uid), data, { merge: true });
      return { data: { message: "Profile updated" } };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
      return { data: { message: "Profile updated (Mock)" } };
    }
  },
  calculateCreditScore: async () => {
    const uid = getUserId();
    const score = Math.floor(Math.random() * (850 - 300) + 300);

    if (IS_DUMMY_MODE) {
      const savedUser = localStorage.getItem('dummy_user');
      const userData = savedUser ? JSON.parse(savedUser) : {};
      localStorage.setItem('dummy_user', JSON.stringify({ ...userData, credit_score: score }));
      return { data: { score } };
    }

    try {
      await setDoc(doc(db, 'users', uid), { credit_score: score }, { merge: true });
      return { data: { score } };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
      return { data: { score } };
    }
  },
  analyzeRiskProfile: async () => {
    const uid = getUserId();
    const profiles = ['Low', 'Moderate', 'High'];
    const profile = profiles[Math.floor(Math.random() * profiles.length)];

    if (IS_DUMMY_MODE) {
      const savedUser = localStorage.getItem('dummy_user');
      const userData = savedUser ? JSON.parse(savedUser) : {};
      localStorage.setItem('dummy_user', JSON.stringify({ ...userData, risk_profile: profile }));
      return { data: { profile } };
    }

    try {
      await setDoc(doc(db, 'users', uid), { risk_profile: profile }, { merge: true });
      return { data: { profile } };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
      return { data: { profile } };
    }
  },
};

export const kycApi = {
  verify: async (type: string, data: any) => {
    if (IS_DUMMY_MODE) {
      return { data: { id: uuidv4(), status: "Verified" } };
    }
    const uid = getUserId();
    const kycId = uuidv4();
    try {
      await setDoc(doc(db, 'kyc_verifications', kycId), {
        user_id: uid,
        type,
        data,
        status: "Pending",
        created_at: serverTimestamp()
      });
      
      if (type === 'selfie') {
        await setDoc(doc(db, 'users', uid), { kyc_status: 'Verified' }, { merge: true });
      }
      
      return { data: { id: kycId, status: "Pending" } };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `kyc_verifications/${kycId}`);
      return { data: { id: uuidv4(), status: "Verified" } };
    }
  },
};

export const loanApi = {
  apply: async (data: any) => {
    const uid = getUserId();
    const loanId = uuidv4();
    const providerName = data.loanProvider || data.provider || 'Unknown Provider';

    if (IS_DUMMY_MODE) {
      const savedLoans = localStorage.getItem('dummy_loans');
      const loans = savedLoans ? JSON.parse(savedLoans) : [];
      const newLoan = {
        id: loanId,
        user_id: uid,
        provider: providerName,
        amount: data.amount,
        tenure: data.tenure,
        interest_rate: data.interestRate,
        ai_confidence: data.aiConfidence,
        kyc_transaction_id: data.kycTransactionId,
        status: "Pending",
        created_at: new Date().toISOString()
      };
      localStorage.setItem('dummy_loans', JSON.stringify([newLoan, ...loans]));

      const savedTxs = localStorage.getItem('dummy_transactions');
      const txs = savedTxs ? JSON.parse(savedTxs) : [];
      const newTx = {
        id: uuidv4(),
        user_id: uid,
        name: providerName,
        category: "Loan Application",
        amount: data.amount,
        type: "credit",
        date: new Date().toISOString()
      };
      localStorage.setItem('dummy_transactions', JSON.stringify([newTx, ...txs]));

      return { data: { id: loanId, status: "Pending" } };
    }

    try {
      await setDoc(doc(db, 'loan_applications', loanId), {
        user_id: uid,
        provider: providerName,
        amount: data.amount,
        tenure: data.tenure,
        interest_rate: data.interestRate,
        ai_confidence: data.aiConfidence,
        kyc_transaction_id: data.kycTransactionId,
        status: "Pending",
        created_at: serverTimestamp()
      });
      
      const txId = uuidv4();
      await setDoc(doc(db, 'transactions', txId), {
        user_id: uid,
        name: providerName,
        category: "Loan Application",
        amount: data.amount,
        type: "credit",
        date: serverTimestamp()
      });

      return { data: { id: loanId, status: "Pending" } };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `loan_applications/${loanId}`);
      return { data: { id: loanId, status: "Pending" } };
    }
  },
  getApplications: async () => {
    const uid = getUserId();

    if (IS_DUMMY_MODE) {
      const savedLoans = localStorage.getItem('dummy_loans');
      return { data: savedLoans ? JSON.parse(savedLoans) : [] };
    }

    try {
      const q = query(collection(db, 'loan_applications'), where('user_id', '==', uid), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const applications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : new Date().toISOString()
        };
      });
      return { data: applications };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'loan_applications');
      return { data: [] };
    }
  },
  getTransactions: async () => {
    const uid = getUserId();

    if (IS_DUMMY_MODE) {
      const savedTxs = localStorage.getItem('dummy_transactions');
      return { data: savedTxs ? JSON.parse(savedTxs) : [] };
    }

    try {
      const q = query(collection(db, 'transactions'), where('user_id', '==', uid), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const txs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate().toISOString() : new Date().toISOString()
        };
      });
      return { data: txs };
    } catch (error) {
      console.error("Firestore error in getTransactions:", error);
      return { data: [] };
    }
  },
};

export const aiApi = {
  saveRiskAnalysis: async (data: any) => {
    const uid = getUserId();
    const analysisId = uuidv4();

    if (IS_DUMMY_MODE) {
      const savedAnalyses = localStorage.getItem('dummy_risk_analyses');
      const analyses = savedAnalyses ? JSON.parse(savedAnalyses) : [];
      localStorage.setItem('dummy_risk_analyses', JSON.stringify([{ id: analysisId, user_id: uid, ...data, created_at: new Date().toISOString() }, ...analyses]));
      return { data: { id: analysisId, message: "AI Risk Analysis saved (Dummy Mode)" } };
    }

    try {
      await setDoc(doc(db, 'ai_risk_analyses', analysisId), {
        user_id: uid,
        ...data,
        created_at: serverTimestamp()
      });

      if (data.credit_score) {
        await setDoc(doc(db, 'users', uid), {
          credit_score: data.credit_score,
          risk_profile: data.risk_level
        }, { merge: true });
      }
      return { data: { id: analysisId, message: "AI Risk Analysis saved" } };
    } catch (error) {
      console.error("Firestore error in saveRiskAnalysis:", error);
      return { data: { id: analysisId, message: "AI Risk Analysis saved (Mock)" } };
    }
  },
  getRiskAnalysis: async (loanId: string) => {
    if (IS_DUMMY_MODE) {
      const savedAnalyses = localStorage.getItem('dummy_risk_analyses');
      const analyses = savedAnalyses ? JSON.parse(savedAnalyses) : [];
      const analysis = analyses.find((a: any) => a.loan_application_id === loanId);
      return { data: analysis || null };
    }

    try {
      const q = query(collection(db, 'ai_risk_analyses'), where('loan_application_id', '==', loanId), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return { data: null };
      return { data: { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } };
    } catch (error) {
      console.error("Firestore error in getRiskAnalysis:", error);
      return { data: null };
    }
  },
};

export const bankApi = {
  getBanks: async () => {
    const banks = [
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
    return { data: banks };
  },
};

export const adminApi = {
  getStats: async () => {
    if (IS_DUMMY_MODE) {
      const savedLoans = localStorage.getItem('dummy_loans');
      const loans = savedLoans ? JSON.parse(savedLoans) : [];
      const totalDisbursed = loans.filter((l: any) => l.status === 'Approved').reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
      return {
        data: {
          totalUsers: 1,
          pendingKYC: 0,
          pendingLoans: loans.filter((l: any) => l.status === 'Pending').length,
          totalDisbursed
        }
      };
    }

    try {
      const usersCount = (await getCountFromServer(collection(db, 'users'))).data().count;
      const pendingKYC = (await getCountFromServer(query(collection(db, 'users'), where('kyc_status', '==', 'Pending')))).data().count;
      const pendingLoans = (await getCountFromServer(query(collection(db, 'loan_applications'), where('status', '==', 'Pending')))).data().count;
      
      const approvedLoansSnap = await getDocs(query(collection(db, 'loan_applications'), where('status', '==', 'Approved')));
      const totalDisbursed = approvedLoansSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      
      return {
        data: {
          totalUsers: usersCount,
          pendingKYC,
          pendingLoans,
          totalDisbursed
        }
      };
    } catch (error) {
      console.error("Firestore error in getStats:", error);
      return { data: { totalUsers: 0, pendingKYC: 0, pendingLoans: 0, totalDisbursed: 0 } };
    }
  },
  getPendingKYCs: async () => {
    if (IS_DUMMY_MODE) return { data: [] };

    try {
      const snapshot = await getDocs(query(collection(db, 'users'), where('kyc_status', '==', 'Pending')));
      const kycs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { data: kycs };
    } catch (error) {
      console.error("Firestore error in getPendingKYCs:", error);
      return { data: [] };
    }
  },
  getPendingLoans: async () => {
    if (IS_DUMMY_MODE) {
      const savedLoans = localStorage.getItem('dummy_loans');
      const loans = savedLoans ? JSON.parse(savedLoans) : [];
      return { data: loans.filter((l: any) => l.status === 'Pending') };
    }

    try {
      const snapshot = await getDocs(query(collection(db, 'loan_applications'), where('status', '==', 'Pending')));
      const loans = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const userDoc = await getDoc(doc(db, 'users', data.user_id));
        const userData = userDoc.data() || {};
        return {
          id: docSnap.id,
          ...data,
          created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : new Date().toISOString(),
          user_name: userData.name,
          user_email: userData.email
        };
      }));
      return { data: loans };
    } catch (error) {
      console.error("Firestore error in getPendingLoans:", error);
      return { data: [] };
    }
  },
  reviewKYC: async (id: string, data: any) => {
    if (IS_DUMMY_MODE) return { data: { message: "KYC reviewed (Dummy Mode)" } };

    try {
      await updateDoc(doc(db, 'users', id), { kyc_status: data.status });
      return { data: { message: "KYC reviewed" } };
    } catch (error) {
      console.error("Firestore error in reviewKYC:", error);
      return { data: { message: "KYC reviewed (Mock)" } };
    }
  },
  reviewLoan: async (id: string, data: any) => {
    if (IS_DUMMY_MODE) {
      const savedLoans = localStorage.getItem('dummy_loans');
      const loans = savedLoans ? JSON.parse(savedLoans) : [];
      const updatedLoans = loans.map((l: any) => l.id === id ? { ...l, status: data.status } : l);
      localStorage.setItem('dummy_loans', JSON.stringify(updatedLoans));
      return { data: { message: "Loan reviewed (Dummy Mode)" } };
    }

    try {
      await updateDoc(doc(db, 'loan_applications', id), { status: data.status });
      return { data: { message: "Loan reviewed" } };
    } catch (error) {
      console.error("Firestore error in reviewLoan:", error);
      return { data: { message: "Loan reviewed (Mock)" } };
    }
  },
  getLoans: async () => {
    if (IS_DUMMY_MODE) {
      const savedLoans = localStorage.getItem('dummy_loans');
      return { data: savedLoans ? JSON.parse(savedLoans) : [] };
    }

    try {
      const snapshot = await getDocs(collection(db, 'loan_applications'));
      const loans = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const userDoc = await getDoc(doc(db, 'users', data.user_id));
        const userData = userDoc.data() || {};
        return {
          id: docSnap.id,
          ...data,
          created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : new Date().toISOString(),
          user_name: userData.name,
          user_email: userData.email
        };
      }));
      return { data: loans };
    } catch (error) {
      console.error("Firestore error in getLoans:", error);
      return { data: [] };
    }
  },
};

export default {
  authApi,
  userApi,
  kycApi,
  loanApi,
  aiApi,
  bankApi,
  adminApi
};
