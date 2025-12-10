const dotenv = require('dotenv');
dotenv.config();
const aiService = require('./src/services/aiService');

async function testAi() {
    console.log("------------------------------------------------");
    console.log("🧪 Starting AI Service Isolation Test");
    console.log("------------------------------------------------");
    console.log(`Checking API Key Presence: ${process.env.GEMINI_API_KEY ? '✅ Exists' : '❌ MISSING'}`);

    if (!process.env.GEMINI_API_KEY) {
        console.error("FATAL: Cannot test without API Key.");
        process.exit(1);
    }

    try {
        console.log("... Sending Request to Gemini (gemini-1.5-flash) ...");
        const response = await aiService.generateContent("Say 'System Operational' if you can hear me.");
        console.log("✅ AI Response Received:");
        console.log(response);

        console.log("------------------------------------------------");
        console.log("... Testing JSON Validation Wrapper ...");
        const jsonResponse = await aiService.getValidatedJson(
            "Return a JSON object: { \"status\": \"Operational\", \"code\": 200 }",
            "You are a system test bot."
        );
        console.log("✅ JSON Object Received:");
        console.log(jsonResponse);

    } catch (error) {
        console.error("❌ AI Service Test Failed!");
        console.error(error);
        process.exit(1);
    }
}

testAi();
