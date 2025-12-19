const dotenv = require('dotenv');
dotenv.config();
const aiService = require('./src/services/aiService');

async function testChaos() {
    console.log("🧪 Testing AI Chaos Generation...");
    try {
        const topic = "Python";
        console.log(`Input Topic: ${topic}`);
        
        console.log("--- Generating Skill Simulator ---");
        const game = await aiService.generateSkillSimulator(topic);
        console.log("✅ Game Generated Successfully!");
        console.log(JSON.stringify(game, null, 2));

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

testChaos();
