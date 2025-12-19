const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const aiService = require('../services/aiService');

async function testAllModels() {
    console.log("🔍 Starting AI Model Health Check...\n");
    console.log(`🔑 API Key Present: ${!!process.env.GEMINI_API_KEY}`);

    const modelsToTest = aiService.modelCandidates || [
        "gemini-1.5-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-pro",
        "gemini-pro"
    ];

    let successCount = 0;

    for (const modelName of modelsToTest) {
        process.stdout.write(`👉 Testing ${modelName}... `);
        try {
            const model = aiService.genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Reply with 'OK'");
            const response = await result.response;
            const text = response.text();
            
            if (text) {
                console.log(`✅ ALIVE (Response: "${text.trim()}")`);
                successCount++;
            } else {
                console.log(`⚠️ EMPTY RESPONSE`);
            }
        } catch (error) {
            console.log(`❌ FAILED`);
            console.log(`   Error: ${error.message.split('\n')[0]}`);
        }
    }

    console.log(`\n🎉 Summary: ${successCount}/${modelsToTest.length} models are operational.`);
    if (successCount === 0) {
        console.error("❌ CRITICAL: No AI models are working. Check API Key or Quota.");
        process.exit(1);
    } else {
        console.log("✅ AI System is HEALTHY.");
        process.exit(0);
    }
}

testAllModels();
