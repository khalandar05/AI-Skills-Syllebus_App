const dotenv = require('dotenv');
dotenv.config();

async function debugRaw() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    console.log("------------------------------------------");
    console.log("📡 RAW HTTP DEBUG (Bypassing SDK)");
    console.log("------------------------------------------");
    console.log(`URL: https://generativelanguage.googleapis.com/v1beta/models?key=HIDDEN`);

    try {
        const response = await fetch(url);
        const status = response.status;
        console.log(`HTTP Status: ${status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.log("❌ Error Body:", errorText);
            process.exit(1);
        }

        const data = await response.json();
        console.log("✅ Models Found:");
        if (data.models) {
            data.models.forEach(m => console.log(` - ${m.name} (${m.supportedGenerationMethods.join(',')})`));
        } else {
            console.log("⚠️ No models listed in 'models' array.");
            console.log(data);
        }

    } catch (e) {
        console.log("❌ Network Error:", e.message);
    }
}

debugRaw();
