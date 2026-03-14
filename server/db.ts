import Database from 'better-sqlite3';

const db = new Database('fintech.db');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    pan TEXT,
    aadhaar TEXT,
    income REAL,
    employment_type TEXT,
    bank_account TEXT,
    kyc_status TEXT DEFAULT 'Not Started',
    credit_score INTEGER DEFAULT 0,
    risk_profile TEXT DEFAULT 'Unknown',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS kyc_verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'aadhaar', 'pan', 'selfie', 'documents'
    status TEXT DEFAULT 'Pending',
    data TEXT, -- JSON string for additional data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS loan_applications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    amount REAL NOT NULL,
    tenure INTEGER NOT NULL,
    interest_rate TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    ai_confidence REAL,
    kyc_transaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL, -- 'debit', 'credit'
    status TEXT DEFAULT 'Completed',
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS ai_risk_analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    loan_application_id TEXT,
    kyc_status TEXT,
    face_match_score REAL,
    liveness_detected TEXT,
    kyc_confidence_score REAL,
    fraud_risk_level TEXT,
    fraud_score REAL,
    credit_score INTEGER,
    financial_stability_score REAL,
    debt_to_income_ratio TEXT,
    risk_score REAL,
    risk_level TEXT,
    loan_decision TEXT,
    max_safe_loan_amount TEXT,
    suggested_interest_rate TEXT,
    repayment_duration TEXT,
    risk_explanation TEXT,
    ai_recommendations TEXT, -- JSON string array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id)
  );
`);

export default db;
