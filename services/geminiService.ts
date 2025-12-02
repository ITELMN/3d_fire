
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Injected by environment

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

export const generateSafetyResponse = async (userPrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: `你是一名专业的中国消防安全教官。
        你的目标是提供关于消防安全、灭火器使用（提拔握压/PASS法）以及火灾应急处理的专业建议。
        
        要求：
        1. 必须全程使用中文回答。
        2. 回答简洁、有力，适合手机屏幕阅读（不超过100字）。
        3. 语气专业、冷静、令人安心。
        4. 如果用户询问操作步骤，请强调：一提（提灭火器）、二拔（拔插销）、三握（握喷管）、四压（压手柄）。`,
        temperature: 0.3,
      }
    });
    
    return response.text || "安全系统离线，请查阅手册。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "连接错误，请检查网络。";
  }
};
