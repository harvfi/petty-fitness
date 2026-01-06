
import { GoogleGenAI, Type } from "@google/genai";
import { AIWorkoutPlan, FoodFacts } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
// Use a placeholder if API key is not set to prevent app crashes
const apiKey = process.env.API_KEY || "PLACEHOLDER_KEY_NOT_SET";
const ai = new GoogleGenAI({ apiKey });

export const generateWorkoutPlan = async (goal: string, experience: string): Promise<AIWorkoutPlan | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a professional gym workout plan for someone with the goal: "${goal}" and experience level: "${experience}". 
                 Include 5 exercises with sets, reps, and a brief description.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.STRING },
                  reps: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "sets", "reps", "description"]
              }
            }
          },
          required: ["title", "exercises"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as AIWorkoutPlan;
    }
    return null;
  } catch (error) {
    console.error("Error generating workout plan:", error);
    return null;
  }
};

export const generateNutritionPlan = async (goal: string, clientName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Draft a professional, high-impact nutrition plan for an athlete named ${clientName} whose primary goal is ${goal}. 
                 Structure it with clear headings: Daily Macros, Key Nutritional Rules, and a sample Meal Timing Strategy. 
                 Make it sound expert and motivating. Keep it under 250 words. Use Markdown formatting.`,
    });
    return response.text?.trim() || "Strategy draft failed. Please write manually.";
  } catch (error) {
    console.error("Error generating nutrition plan:", error);
    return "Failed to contact the Nutrition Architect.";
  }
};

export const analyzeFood = async (description: string, imageBase64?: string): Promise<{ name: string; facts: FoodFacts } | null> => {
  try {
    const parts: any[] = [
      { text: `Analyze the following food item: "${description}". Provide the estimated nutritional facts (Calories, Protein in g, Carbs in g, Fat in g). If an image is provided, use it to accurately identify the food and portion size.` }
    ];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(',')[1] || imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Common name of the food" },
            facts: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER }
              },
              required: ["calories", "protein", "carbs", "fat"]
            }
          },
          required: ["name", "facts"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  } catch (error) {
    console.error("Error analyzing food:", error);
    return null;
  }
};

export const enhanceTestimonial = async (rawText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Polishing this fitness testimonial to be punchy, inspiring, and professional for a gym website. 
                 Keep the core message but improve grammar and impact: "${rawText}"`,
    });
    return response.text?.trim() || rawText;
  } catch (error) {
    console.error("Error enhancing testimonial:", error);
    return rawText;
  }
};
