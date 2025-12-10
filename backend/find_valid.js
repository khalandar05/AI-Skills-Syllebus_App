const dotenv = require('dotenv');
dotenv.config();

async function findValid() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.models) {
            console.log("No models found.");
            return;
        }

        console.log("✅ Models supporting 'generateContent':");
        const validModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));

        validModels.forEach(m => {
            console.log(` - ${m.name}`);
        });

        if (validModels.length === 0) {
            console.log("❌ CRITICAL: No text generation models found!");
        }

    } catch (e) {
        console.log("Error:", e.message);
    }
}

findValid();
