
import { GoogleGenAI } from "@google/genai";

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

/**
 * Generates a unique avatar image using Gemini 2.5 Flash Image model.
 */
export const generateAiAvatar = async (customerName: string) => {
  if (!API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `A professional, clean, flat-design profile avatar of a person named ${customerName} who enjoys coffee. Modern aesthetic, soft colors, minimalist style, centered, high quality, vector style.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("AI Image Generation Error:", error);
    throw error;
  }
};
