import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------
// 🔐 API KEY CHECK
// ---------------------------
const API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  "AIzaSyC5Zoi5byhi3M4llWH9HfZxouewMPBdEZo";

if (!API_KEY) {
  console.error("❌ Gemini API key missing! Set VITE_GEMINI_API_KEY in .env");
}

// ---------------------------
// 🤖 Initialize Gemini Client
// ---------------------------
const genAI = new GoogleGenerativeAI(API_KEY);

// Use correct model (flash = free + fast)
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

// ---------------------------
// 📄 Project System Context
// ---------------------------
const PROJECT_CONTEXT = `
You are an AI assistant for the "Smart Attendance, Leave & AI Chatbot Management System".
... (your long context here)
`;

// ---------------------------
// 💬 FUNCTION: Chat with Gemini
// ---------------------------
export const sendMessageToGemini = async (message, history = []) => {
  try {
    if (!model) return "⚠️ API key missing. Please add VITE_GEMINI_API_KEY.";

    let contextPrompt = PROJECT_CONTEXT + "\n\n";

    const cleanHistory = history
      .filter((msg) => msg.role === "user" || msg.role === "model")
      .filter(
        (msg) =>
          msg.text !==
          "👋 Hello! I'm your AI assistant powered by Google Gemini. How can I help you today?"
      );

    if (cleanHistory.length > 0) {
      contextPrompt += "Conversation history:\n";
      cleanHistory.forEach((msg) => {
        const who = msg.role === "user" ? "User" : "Assistant";
        contextPrompt += `${who}: ${msg.text}\n`;
      });
      contextPrompt += "\n";
    }

    const finalPrompt = contextPrompt + `User: ${message}\nAssistant:`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: finalPrompt }],
        },
      ],
    });

    return result.response.text();
  } catch (error) {
    console.error("❌ Gemini Chat Error:", error);
    return "⚠️ Sorry! I couldn't process your request. Please try again.";
  }
};

// ---------------------------
// 📝 FUNCTION: Simple Content Generation
// ---------------------------
export const generateContent = async (prompt) => {
  try {
    if (!model) return "⚠️ API key missing.";

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return result.response.text();
  } catch (error) {
    console.error("❌ Gemini Generate Error:", error);
    return "⚠️ Failed to generate response.";
  }
};

export default model;
