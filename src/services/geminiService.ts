import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getFinancialAdvice(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a helpful financial advisor for a loan application called Pocket Loaner. 
      The user is asking: "${query}". 
      Provide concise, helpful, and encouraging financial advice.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting financial advice:", error);
    return "I'm sorry, I couldn't get financial advice at the moment. Please try again later.";
  }
}
