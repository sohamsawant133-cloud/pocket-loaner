import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export interface AIRiskResult {
  kyc_status: string;
  face_match_score: number;
  liveness_detected: string;
  kyc_confidence_score: number;
  fraud_risk_level: string;
  fraud_score: number;
  credit_score: number;
  financial_stability_score: number;
  debt_to_income_ratio: string;
  risk_score: number;
  risk_level: string;
  loan_decision: string;
  max_safe_loan_amount: string;
  suggested_interest_rate: string;
  repayment_duration: string;
  risk_explanation: string;
  ai_recommendations: string[];
}

export const analyzeRisk = async (userData: any): Promise<AIRiskResult> => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }
  const model = "gemini-3-flash-preview";
  
  const { selfie, ...restUserData } = userData;
  
  const prompt = `
You are the **AI Financial Risk & Identity Verification Engine** for a fintech platform called **Pocket Loaner**.

Your job is to verify user identity using camera KYC, detect fraud risk, analyze banking behavior, calculate credit score, and automatically decide whether a loan should be approved or rejected.

The system must behave like a professional fintech risk engine used by digital lending platforms.

Return the final result in **STRICT JSON FORMAT ONLY**.

---

## USER DATA FOR ANALYSIS
${JSON.stringify(restUserData, null, 2)}

---

## SYSTEM MODULES

MODULE 1 — CAMERA KYC VERIFICATION
Verification Tasks:
1. Detect human face in the provided selfie image.
2. Detect spoofing attempts.
3. Perform liveness detection.

MODULE 2 — AI FRAUD DETECTION
Detect suspicious behavior.

MODULE 3 — BANK TRANSACTION ANALYSIS
Analyze financial behavior using transaction history.

MODULE 4 — AI CREDIT SCORING MODEL
Generate internal credit score (300-900).

MODULE 5 — RISK ANALYSIS ENGINE
Calculate overall financial risk score (0-100).

MODULE 6 — AUTONOMOUS LENDING DECISION ENGINE
Decide loan approval.

FINAL OUTPUT FORMAT
Return ONLY this JSON structure:
{
"kyc_status": "",
"face_match_score": "",
"liveness_detected": "",
"kyc_confidence_score": "",
"fraud_risk_level": "",
"fraud_score": "",
"credit_score": "",
"financial_stability_score": "",
"debt_to_income_ratio": "",
"risk_score": "",
"risk_level": "",
"loan_decision": "",
"max_safe_loan_amount": "",
"suggested_interest_rate": "",
"repayment_duration": "",
"risk_explanation": "",
"ai_recommendations": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"]
}

Note: Ensure ai_recommendations are short, actionable tips that the user can follow to improve their financial health or loan approval chances.
`;

  try {
    const parts: any[] = [{ text: prompt }];
    
    if (selfie) {
      // Extract base64 data and mime type from data URL
      const matches = selfie.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        parts.unshift({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Risk Engine Error:", error);
    throw error;
  }
};
