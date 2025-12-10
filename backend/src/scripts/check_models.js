require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Fetching available models...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels on the SDK instance in some versions, 
        // but let's try to just run a simple generation with a few likely candidates if we can't contextually list.
        // Actually, the error message said "Call ListModels". In the Node SDK, it's usually via a dedicated method if exposed, 
        // or we can try to hit the REST endpoint. 
        // BUT, looking at documentation, `genAI.getGenerativeModel` is for getting a model.
        // To list, we might have to use the direct API or check if the SDK exposes it.
        // Let's try to just test a few common ones.

        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-flash-latest" // Determine which one works
        ];

        for (const modelName of candidates) {
            console.log(`Testing model: ${modelName}`);
            try {
                const m = genAI.getGenerativeModel({ model: modelName });
                const result = await m.generateContent("Test");
                console.log(`✅ SUCCESS: ${modelName}`);
                break; // Found one!
            } catch (e) {
                console.log(`❌ FAILED: ${modelName} - ${e.message}`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
