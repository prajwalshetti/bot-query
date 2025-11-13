import axios from "axios";

const geminiAnalyzeSingleUser = async (userId, messages) => {
  console.log(`=== Analyzing single user: ${userId} ===`);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Build prompt
    let prompt = `You are an AI assistant for a loan/financial support company.

Analyze this customer's messages and provide:
1. An urgency score (1-5):
   - 5: Critical (legal threats, desperate, aggressive)
   - 4: High (overdue payment, angry, repeated follow-ups)
   - 3: Medium (payment extension request, confusion)
   - 2: Low (general inquiry, polite questions)
   - 1: Very Low (thanks, resolved issues)

2. A professional, empathetic response addressing their concerns.

Customer ID: ${userId}
Messages:
`;

    messages.forEach((msg) => {
      // assume msg.timestamp and msg.message exist
      prompt += `[${msg.timestamp}] ${msg.message}\n`;
    });

    prompt += '\n\nRespond ONLY with valid JSON (no markdown). Format:\n' +
              '{\n' +
              '  "userId": "' + userId + '",\n' +
              '  "urgencyScore": 4,\n' +
              '  "suggestedResponse": "Your professional response here"\n' +
              '}';

    console.log("Calling Gemini API...");

    const response = await axios.post(
      apiUrl,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    // Try a few common paths for the assistant text
    const rawText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.data?.candidates?.[0]?.content?.[0]?.text ||
      response.data?.output?.[0]?.content?.text ||
      response.data?.text ||
      null;

    if (!rawText) {
      console.error("Full API response (for debugging):", JSON.stringify(response.data, null, 2));
      throw new Error("Empty/unknown response format from Gemini");
    }

    console.log("Raw Gemini response (preview):", rawText.slice(0, 400));

    // Remove surrounding triple-backticks or leading language tags like ```json
    let cleanedText = rawText.trim()
      .replace(/^```(?:\w*\n)?/, "")   // remove starting ``` or ```json\n
      .replace(/```$/, "")             // remove trailing ```
      .trim();

    // Try to parse JSON safely
    let analysis;
    try {
      analysis = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error("Failed to JSON.parse the assistant output. Cleaned text preview:", cleanedText.slice(0, 800));
      throw new Error("Failed to parse JSON from model output: " + parseErr.message);
    }

    console.log("✅ Analysis complete for user:", userId);
    return analysis;
  } catch (error) {
    console.error("❌ Error analyzing single user:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

export default geminiAnalyzeSingleUser;
