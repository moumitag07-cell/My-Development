import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger limit for uploading base64 images
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazily initialize representation of GoogleGenAI to ensure it doesn't crash if key is missing until route is requested.
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required. Please provide it in the Secrets panel.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Ensure server is up and responsive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Health and Nutrition server is running!" });
});

// Endpoint: Analyze Food Picture
app.post("/api/analyze-food", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "No image content provided." });
      return;
    }

    const ai = getGeminiClient();

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: imageBase64,
      },
    };

    const textPart = {
      text: `Identify the food in this photo. Provide calories, nutrition breakdown (proteins, carbohydrates, fats, and dietary fiber in grams), a confidence level of your analysis, descriptive details, and custom healthy suggestions. Render standard single portions if the portion is unclear.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            calories: { type: Type.INTEGER, description: "Total calories in kcal" },
            protein: { type: Type.INTEGER, description: "Total protein content in grams" },
            carbs: { type: Type.INTEGER, description: "Total carbohydrate content in grams" },
            fat: { type: Type.INTEGER, description: "Total fat content in grams" },
            fiber: { type: Type.INTEGER, description: "Total dietary fiber content in grams" },
            confidence: { type: Type.NUMBER, description: "Analysis confidence level from 0.0 to 1.0" },
            description: { type: Type.STRING, description: "Comprehensive detail of the identified food items, ingredients, and approximate portion size" },
            suggestions: { type: Type.STRING, description: "Actionable, health-focused suggestions for optimization, alternative pairings, or pacing" },
          },
          required: ["foodName", "calories", "protein", "carbs", "fat", "fiber", "description", "suggestions"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error analyzing food image:", error);
    res.status(500).json({ error: error.message || "An error occurred during nutrition analysis." });
  }
});

// Endpoint: Get Personalized Health Recommendations
app.post("/api/recommendations", async (req, res) => {
  try {
    const { userProfile, vitals, summaryLogs } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are an elite, friendly, and expert Health Coach & Clinical Nutritionist. Review the following user's data and provide personalized, highly encouraging, and actionable guidance in standard markdown format (including beautiful subheadings, bold notes, and simple bullet points). 

User Profile:
- Name/Goal: ${userProfile.name || "N/A"}, Age: ${userProfile.age || "N/A"}, Gender: ${userProfile.gender || "N/A"}
- Height: ${userProfile.height || "N/A"} cm, Weight: ${userProfile.weight || "N/A"} kg
- Target Daily Calories: ${userProfile.targetCalories || "N/A"} kcal
- Primary Fitness Goals: ${userProfile.goals || "N/A"}

Current Vitals Summary:
- Weight Logged: ${userProfile.weight || "N/A"} kg
- Heart Rate average: ${vitals.heartRate ? vitals.heartRate + " bpm" : "Not Provided"}
- Blood Pressure average: ${vitals.bloodPressure || "Not Provided"}
- Water Intake: ${vitals.waterIntake ? vitals.waterIntake + " ml" : "Not Provided"}
- Sleep duration last night: ${vitals.sleepDuration ? vitals.sleepDuration + " hours" : "Not Provided"}
- Blood Sugar level: ${vitals.bloodSugar ? vitals.bloodSugar + " mg/dL" : "Not Provided"}

Nutrition Logs Summary for today:
- Total meals analyzed: ${summaryLogs.mealCount}
- Calories accumulated: ${summaryLogs.calories} kcal
- Protein compiled: ${summaryLogs.protein}g, Carbs: ${summaryLogs.carbs}g, Fat: ${summaryLogs.fat}g, Fiber: ${summaryLogs.fiber}g

Based strictly on this data:
1. Provide an overall Wellness Rating (e.g. Needs Attention, On Track, Excellent) with a brief, warm assessment.
2. Give 3-4 highly specific clinical and nutritional recommendations, especially highlighting how their nutrients or vitals correlate (such as hydration to energy, sodium/fat levels to blood pressure, sleep to blood sugar levels, or protein intake to workout goals).
3. Draft a practical action plan for today and tomorrow. Include quick food swap ideas. Keep the advice deeply personalized, realistic, positive, and clear!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the head of lifestyle medicine at Apple Health Labs. You write in a highly encouraging, concise, visually appealing, and expert clinical tone.",
      },
    });

    res.json({ recommendation: response.text });
  } catch (error: any) {
    console.error("Error creating recommendations:", error);
    res.status(500).json({ error: error.message || "An error occurred compiling recommendations." });
  }
});

// Endpoint: AI Health Advisor Custom Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userProfile, vitals, summaryLogs } = req.body;
    const ai = getGeminiClient();

    // Prepare history
    const geminiHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const lastUserMessage = messages[messages.length - 1];

    const chatInstance = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are the ultimate personalized AI Health Advisor, deeply integrated with the user's wellness metrics. Your dashboard shows:
- User Profile: ${JSON.stringify(userProfile)}
- Vitals Tracked: ${JSON.stringify(vitals)}
- Today's Nutrition Summary: ${JSON.stringify(summaryLogs)}

Use this background data to contextually answer their questions when editing diet choices, managing heart rate during exercises, evaluating blood sugar, or sleeping better. Keep advice strictly safe, evidence-based, supportive, and elegant. Write in markdown. Always direct them to consult live professionals for actual medical emergencies!`,
      },
      history: geminiHistory,
    });

    // Send high level query
    const response = await chatInstance.sendMessage({
      message: lastUserMessage.text,
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("Error with health advisor chat:", error);
    res.status(500).json({ error: error.message || "An error occurred with the AI Advisor." });
  }
});

// Vite Middleware & Static Fallback Asset Routing
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Web application is live and listening on http://localhost:${PORT}`);
  });
}

initializeServer().catch((e) => {
  console.error("Fatal: failed to initialize health server", e);
});
