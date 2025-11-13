import axios from "axios"; // or your preferred HTTP client

// This function sends message text to Gemini API and receives urgency & suggestion
// You’ll need to replace endpoint and headers with your Gemini/OpenRouter API setup
export default async function geminiSuggest(messageText) {
    try {
        const response = await axios.post(
            "https://api.gemini.yourprovider.com/v1/suggest", // replace with actual endpoint
            { message: messageText },
            { headers: { "Authorization": `Bearer ${process.env.GEMINI_API_KEY}` } }
        );
        // Structure response: { urgencyScore: Number, suggestion: String }
        return {
            urgencyScore: response.data.urgencyScore,
            suggestion: response.data.suggestion
        };
    } catch (error) {
        // Fallback: lowest urgency, empty suggestion
        return { urgencyScore: 1, suggestion: "" };
    }
}
