
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

export const generateCampaignCopy = async (prompt: string, offerType: string) => {
  if (!API_KEY) return "Please provide an API key for AI generation.";

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, catchy SMS marketing message (max 160 chars) for a coffee shop. 
                 The offer is: ${offerType}. 
                 User request: ${prompt}. 
                 Include emojis and a warm, inviting tone.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "Flash Sale! ☕️ Come by for a special treat today!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Flash Sale! ☕️ Get 20% off all lattes this weekend at Cafe Aroma. Show this text to redeem!";
  }
};
