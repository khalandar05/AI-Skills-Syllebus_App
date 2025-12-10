const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Note: The Node SDK does not expose listModels directly on the main class in all versions,
    // but we can try to use the model manager if available, or just infer from documentation.
    // However, since we are in a rush, let's try a different approach:
    // Testing specific known models sequentially.

    // Actually, newer SDKs expose it via `getGenerativeModel` but the list is often hidden.
    // Let's try to just test a list of candidates.

    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-pro"
    ];

    console.log("---------------------------------------");
    console.log("🔎 MODEL DISCOVERY TOOL");
    console.log("---------------------------------------");

    for (const modelName of candidates) {
        process.stdout.write(`Testing ${modelName.padEnd(25)} ... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test.");
            await result.response;
            console.log("✅ SUCCESS");
            process.exit(0); // Found one!
        } catch (e) {
            console.log("❌ FAILED");
            console.log("   Legacy Error:", e.message);
        }
    }
    process.exit(1);
}

listModels();
