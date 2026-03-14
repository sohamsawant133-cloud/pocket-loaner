import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import path from "path";

dotenv.config();

// Initialize Firebase Admin
let db: any;
let authAdmin: any;

/*
try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠️ Firebase Admin environment variables are missing. Some backend features will be disabled.");
  } else {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }
    db = getFirestore();
    authAdmin = getAuth();
    console.log("✅ Firebase Admin initialized successfully.");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin:", error);
}
*/

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  // --- Middleware ---
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    if (!authAdmin) {
      return res.status(503).json({ error: "Authentication service unavailable" });
    }

    try {
      const decodedToken = await authAdmin.verifyIdToken(token);
      req.user = { id: decodedToken.uid, email: decodedToken.email };
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(403).json({ error: "Forbidden" });
    }
  };

  // --- User Profile ---
  app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    try {
      const userDoc = await db.collection("users").doc(req.user.id).get();
      if (!userDoc.exists) {
        return res.json({ id: req.user.id, email: req.user.email });
      }
      res.json({ id: userDoc.id, ...userDoc.data() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/user/profile", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const { name, pan, aadhaar, income, employment_type, bank_account } = req.body;
    try {
      await db.collection("users").doc(req.user.id).set({
        name, pan, aadhaar, income, employment_type, bank_account
      }, { merge: true });
      res.json({ message: "Profile updated" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- KYC ---
  app.post("/api/kyc/verify", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const { type, data } = req.body;
    const kycId = uuidv4();
    try {
      await db.collection("kyc_verifications").doc(kycId).set({
        user_id: req.user.id,
        type,
        data,
        status: "Pending",
        created_at: FieldValue.serverTimestamp()
      });
      
      if (type === 'selfie') {
        await db.collection("users").doc(req.user.id).update({ kyc_status: 'Verified' });
      }
      
      res.json({ id: kycId, status: "Pending" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Loans ---
  app.get("/api/loan/applications", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    try {
      const snapshot = await db.collection("loan_applications")
        .where("user_id", "==", req.user.id)
        .orderBy("created_at", "desc")
        .get();
      const applications = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : new Date().toISOString()
        };
      });
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/loan/apply", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const { provider, amount, tenure, interestRate, aiConfidence, kycTransactionId } = req.body;
    const loanId = uuidv4();
    try {
      await db.collection("loan_applications").doc(loanId).set({
        user_id: req.user.id,
        provider,
        amount,
        tenure,
        interest_rate: interestRate,
        ai_confidence: aiConfidence,
        kyc_transaction_id: kycTransactionId,
        status: "Pending",
        created_at: FieldValue.serverTimestamp()
      });
      
      const txId = uuidv4();
      await db.collection("transactions").doc(txId).set({
        user_id: req.user.id,
        name: provider,
        category: "Loan Application",
        amount,
        type: "credit",
        date: FieldValue.serverTimestamp()
      });

      res.json({ id: loanId, status: "Pending" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Financial Health ---
  app.post("/api/credit-score/calculate", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const score = Math.floor(Math.random() * (850 - 300) + 300);
    try {
      await db.collection("users").doc(req.user.id).update({ credit_score: score });
      res.json({ score });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/risk-profile/analyze", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const profiles = ['Low', 'Moderate', 'High'];
    const profile = profiles[Math.floor(Math.random() * profiles.length)];
    try {
      await db.collection("users").doc(req.user.id).update({ risk_profile: profile });
      res.json({ profile });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Transactions ---
  app.get("/api/transactions", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    try {
      const snapshot = await db.collection("transactions")
        .where("user_id", "==", req.user.id)
        .orderBy("date", "desc")
        .get();
      const txs = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          date: data.date?.toDate ? data.date.toDate().toISOString() : new Date().toISOString()
        };
      });
      res.json(txs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Admin Dashboard ---
  app.get("/api/admin/stats", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    try {
      const usersCount = (await db.collection("users").count().get()).data().count;
      const pendingKYC = (await db.collection("users").where("kyc_status", "==", "Pending").count().get()).data().count;
      const pendingLoans = (await db.collection("loan_applications").where("status", "==", "Pending").count().get()).data().count;
      const approvedLoans = await db.collection("loan_applications").where("status", "==", "Approved").get();
      const totalDisbursed = approvedLoans.docs.reduce((sum: number, doc: any) => sum + (doc.data().amount || 0), 0);
      
      res.json({
        totalUsers: usersCount,
        pendingKYC,
        pendingLoans,
        totalDisbursed
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/kyc/pending", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    try {
      const snapshot = await db.collection("users").where("kyc_status", "==", "Pending").get();
      const kycs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      res.json(kycs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/loans/pending", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    try {
      const snapshot = await db.collection("loan_applications").where("status", "==", "Pending").get();
      const loans = await Promise.all(snapshot.docs.map(async (doc: any) => {
        const data = doc.data();
        const userDoc = await db.collection("users").doc(data.user_id).get();
        const userData = userDoc.data() || {};
        return { 
          id: doc.id, 
          ...data, 
          created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : new Date().toISOString(),
          user_name: userData.name, 
          user_email: userData.email 
        };
      }));
      res.json(loans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/kyc/:id/review", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const { status } = req.body;
    try {
      await db.collection("users").doc(req.params.id).update({ kyc_status: status });
      res.json({ message: "KYC reviewed" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/loans/:id/review", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const { status } = req.body;
    try {
      await db.collection("loan_applications").doc(req.params.id).update({ status });
      res.json({ message: "Loan reviewed" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/loans", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    try {
      const snapshot = await db.collection("loan_applications").get();
      const loans = await Promise.all(snapshot.docs.map(async (doc: any) => {
        const data = doc.data();
        const userDoc = await db.collection("users").doc(data.user_id).get();
        const userData = userDoc.data() || {};
        return { 
          id: doc.id, 
          ...data, 
          created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : new Date().toISOString(),
          user_name: userData.name, 
          user_email: userData.email 
        };
      }));
      res.json(loans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- AI Risk Analysis ---
  app.post("/api/ai/risk-analysis", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const analysisId = uuidv4();
    const { 
      loan_application_id,
      kyc_status,
      face_match_score,
      liveness_detected,
      kyc_confidence_score,
      fraud_risk_level,
      fraud_score,
      credit_score,
      financial_stability_score,
      debt_to_income_ratio,
      risk_score,
      risk_level,
      loan_decision,
      max_safe_loan_amount,
      suggested_interest_rate,
      repayment_duration,
      risk_explanation,
      ai_recommendations
    } = req.body;

    try {
      await db.collection("ai_risk_analyses").doc(analysisId).set({
        user_id: req.user.id,
        loan_application_id,
        kyc_status,
        face_match_score,
        liveness_detected,
        kyc_confidence_score,
        fraud_risk_level,
        fraud_score,
        credit_score,
        financial_stability_score,
        debt_to_income_ratio,
        risk_score,
        risk_level,
        loan_decision,
        max_safe_loan_amount,
        suggested_interest_rate,
        repayment_duration,
        risk_explanation,
        ai_recommendations,
        created_at: FieldValue.serverTimestamp()
      });

      if (credit_score) {
        await db.collection("users").doc(req.user.id).update({
          credit_score,
          risk_profile: risk_level
        });
      }

      res.json({ id: analysisId, message: "AI Risk Analysis saved" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai/risk-analysis/:loanId", authenticateToken, async (req: any, res) => {
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    try {
      const snapshot = await db.collection("ai_risk_analyses")
        .where("loan_application_id", "==", req.params.loanId)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return res.json(null);
      }
      
      const analysis = snapshot.docs[0].data();
      res.json({ id: snapshot.docs[0].id, ...analysis });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Banks ---
  app.get("/api/banks", (req, res) => {
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
    res.json(banks);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("✅ Vite middleware integrated.");
    } catch (error) {
      console.error("❌ Failed to create Vite server:", error);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  console.error("❌ Server failed to start:", error);
});
