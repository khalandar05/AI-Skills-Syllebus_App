const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:4000/api';

async function run() {
    console.log("🚀 Starting Q&A Content Debug...");
    
    // 1. Auth
    const email = `debugger_${Date.now()}@test.com`;
    const password = 'testpassword123';
    let token = null;

    try {
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name: 'Debugger' })
        });
        const regData = await regRes.json();
        if (regData.token) {
            token = regData.token;
        } else {
            console.warn("   ⚠️ Register info:", regData);
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const loginData = await loginRes.json();
            if (loginData.token) {
                token = loginData.token;
            } else {
                console.error("   ❌ Login Failed:", loginData);
                process.exit(1);
            }
        }
        console.log("   ✅ Auth Success.");
    } catch (e) {
        console.error("Auth Failed", e);
        process.exit(1);
    }

    // 2. Prepare File
    const filePath = path.join(__dirname, 'test_syllabus.txt');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "React is a JavaScript library for building user interfaces. It uses Components and State.");
    }
    const fileContent = fs.readFileSync(filePath);
    const blob = new Blob([fileContent], { type: 'text/plain' });
    
    // 3. QA Generation
    try {
        console.log(`\n🔹 Verifying Q&A Generator Content...`);
        const formData = new FormData();
        formData.append('file', blob, 'test_syllabus.txt');
        
        const qaRes = await fetch(`${API_URL}/qa/generate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const qaData = await qaRes.json();
        
        if (qaData.success) {
            console.log("   ✅ Success.");
            if (qaData.data.questions && qaData.data.questions.length > 0) {
                 console.log("   🔍 First Question Object Keys:", Object.keys(qaData.data.questions[0]));
                 console.log("   📜 First Question Content:\n", JSON.stringify(qaData.data.questions[0], null, 2));
            } else {
                 console.log("   ⚠️ No questions array or empty.");
                 console.log("   📄 Full Data:", JSON.stringify(qaData.data, null, 2));
            }
        } else {
            console.error("   ❌ Failed:", qaData);
        }
    } catch(e) { console.error("   ❌ Error:", e.message); }
}

run();
