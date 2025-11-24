import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SeoResponse } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const seoSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    titles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 High-CTR, Clickbait Titles in Hindi/Hinglish",
    },
    description: {
      type: Type.STRING,
      description: "1 Long SEO-Optimized Description (150–200 words) in Hindi/Hinglish",
    },
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "25 Best SEO Hashtags",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "30 YouTube Tags / Keywords",
    },
    thumbnailTexts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 Thumbnail Text Ideas (4–5 words only)",
    },
    hooks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 Hook Lines for First 3 Seconds",
    },
    shortTitle: {
      type: Type.STRING,
      description: "1 Short Search Title (under 50 characters)",
    },
    relatedQueries: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Related Search Queries People Search on YouTube",
    },
  },
  required: ["titles", "description", "hashtags", "tags", "thumbnailTexts", "hooks", "shortTitle", "relatedQueries"],
};

export const generateSeoData = async (topic: string): Promise<SeoResponse> => {
  if (!apiKey) {
    throw new Error("API Key is undefined. Please check your environment configuration.");
  }

  const prompt = `
    You are a YouTube SEO Expert specialized in the Indian Market (Hindi + Hinglish).
    
    My Video Topic: "${topic}"

    Generate the following strictly in JSON format:
    1. 5 High-CTR, Clickbait Titles (Mix of Hindi + English)
    2. 1 Long SEO-Optimized Description (150–200 words, Keywords enriched, Viral Tone)
    3. 25 Best SEO Hashtags (starting with #)
    4. 30 YouTube Tags / Keywords (comma separated concepts but return as array)
    5. 5 Thumbnail Text Ideas (Short, Punchy, 4-5 words max)
    6. 3 Hook Lines for First 3 Seconds (Must be engaging)
    7. 1 Short Search Title (under 50 characters, for filename or quick search)
    8. Related Search Queries People Search on YouTube

    Language: Hindi + Hinglish
    Style: Viral, Engaging, High-Retention
    Goal: Ranking, CTR Boost, Suggested Videos, Shortsfeed Visibility.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: seoSchema,
        temperature: 0.7, 
      },
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("No data received from Gemini.");
    }

    // parsing is handled by the SDK if responseMimeType is json, but we double check
    return JSON.parse(textResponse) as SeoResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const editImage = async (imageBase64: string, mimeType: string, prompt: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is undefined.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
        throw new Error("No content received from model");
    }

    // Iterate through parts to find the image
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in response. The model might have returned text only.");
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};