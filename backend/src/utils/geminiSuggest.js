import axios from "axios";

export default async function geminiSuggest(messageText) {
    console.log("=== geminiSuggest called ===");
    console.log("Message text:", messageText);
    
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("API Key loaded:", apiKey ? "Yes" : "No");
        
        if (!apiKey) {
            console.error("GEMINI_API_KEY not found");
            return { 
                urgencyScore: 3, 
                suggestion: "Thank you for your message. We'll respond soon." 
            };
        }

        // Use v1 API with gemini-1.5-flash model (NOT v1beta)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        console.log("Calling Gemini API (v1)...");

        const response = await axios.post(
            apiUrl,
            {
                contents: [{
                    parts: [{
                        text: `You are a helpful customer support assistant. Reply to this customer message in a friendly and professional way (keep it under 100 words): "${messageText}"`
                    }]
                }]
            },
            {
                headers: { 
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );

        console.log("✅ Gemini API Success!");
        console.log("Response received:", response.data);

        const suggestion = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!suggestion) {
            console.warn("No suggestion in response, using fallback");
            return {
                urgencyScore: 3,
                suggestion: "Thank you for reaching out. How can I help you today?"
            };
        }

        // Detect urgency
        const urgentKeywords = ['urgent', 'emergency', 'asap', 'critical', 'immediately', 'help', 'problem', 'issue', 'error', 'broken', 'not working'];
        const urgentWordCount = urgentKeywords.filter(keyword => 
            messageText.toLowerCase().includes(keyword)
        ).length;
        
        // Calculate urgency score
        let urgencyScore = 1;
        if (urgentWordCount >= 3) urgencyScore = 5;
        else if (urgentWordCount === 2) urgencyScore = 4;
        else if (urgentWordCount === 1) urgencyScore = 3;
        else urgencyScore = 2;
        
        const result = {
            urgencyScore,
            suggestion: suggestion.trim()
        };
        
        console.log("✅ Returning result:", result);
        return result;

    } catch (error) {
        console.error("❌ === Gemini API ERROR ===");
        console.error("Error message:", error.message);
        
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Status text:", error.response.statusText);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
            console.error("Headers:", error.response.headers);
        } else if (error.request) {
            console.error("No response received from Gemini API");
            console.error("Request details:", error.request);
        } else {
            console.error("Error setting up request:", error.message);
        }
        
        return { 
            urgencyScore: 3, 
            suggestion: "Thank you for contacting us. Our team will respond shortly." 
        };
    }
}
