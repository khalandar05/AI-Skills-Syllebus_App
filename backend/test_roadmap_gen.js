require('dotenv').config();
const aiService = require('./src/services/aiService');

async function test() {
    console.log("Testing generateResearchRoadmap...");
    try {
        const result = await aiService.generateResearchRoadmap("A realtime collaborative code editor");
        console.log("SUCCESS:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("FAILED:", error);
    }
}

test();
