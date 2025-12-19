const fs = require('fs');

const API_URL = 'http://localhost:4000/api';

async function run() {
    console.log("🚀 Starting INTERVIEW & PORTFOLIO Verification...");
    
    // 1. Auth
    const email = `candidate_${Date.now()}@test.com`;
    const password = 'testpassword123';
    let token = null;
    let userId = null;

    try {
        console.log(`\n🔹 [1/4] Registering Candidate`);
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name: 'Candidate' })
        });
        const regData = await regRes.json();
        token = regData.token;
        if (regData.user) userId = regData.user.id;
        console.log("   ✅ Auth Success.");
    } catch (e) {
        console.error("Auth Failed", e);
        process.exit(1);
    }

    // 2. Portfolio Generation
    try {
        console.log(`\n🔹 [2/4] Testing Portfolio/Resume Generator`);
        // Note: Needs context, but we will rely on empty context handling or mocked implementation details
        // In a real flow, we'd upload syllabus first. Here we assume AI handles low-context gracefully.
        
        const portRes = await fetch(`${API_URL}/portfolio/generate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const portData = await portRes.json();

        if (portData.success && portData.portfolio) {
            console.log("   ✅ Portfolio Generated:", portData.portfolio.jobTitle);
            console.log("      Bio Sample:", portData.portfolio.bio.substring(0, 50) + "...");
        } else {
            console.error("   ❌ Portfolio Failed:", portData);
        }
    } catch(e) { console.error("   ❌ Portfolio Error:", e.message); }

    // 3. Interview Start
    let sessionId = null;
    let firstQuestion = null;
    try {
        console.log(`\n🔹 [3/4] Testing Mock Interview Start`);
        const startRes = await fetch(`${API_URL}/interview/start`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ context: "React.js, Node.js, System Design" })
        });
        const startData = await startRes.json();

        if (startData.success && startData.session) {
            console.log(`   ✅ Session Started. ID: ${startData.session.id}`);
            console.log(`   ❓ Questions Generated: ${startData.session.questions.length}`);
            // Check quality
            const q1 = startData.session.questions[0];
            firstQuestion = q1;
            sessionId = startData.session.id;
            console.log(`      Sample Q: "${q1}"`);
            
            if (q1.includes("What is")) console.warn("      ⚠️ Warning: Question might be too generic.");
        } else {
            console.error("   ❌ Interview Start Failed:", startData);
        }
    } catch(e) { console.error("   ❌ Interview Start Error:", e.message); }

    // 4. Interview Answer
    if (sessionId && firstQuestion) {
        try {
            console.log(`\n🔹 [4/4] Testing Interview Answer Evaluation`);
            const ansRes = await fetch(`${API_URL}/interview/answer`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    sessionId, 
                    questionIndex: 0, 
                    answer: "I would use a cache like Redis to store frequently accessed data and reduce database load. For invalidation, I'd use a TTL approach." 
                })
            });
            const ansData = await ansRes.json();

            if (ansData.success && ansData.evaluation) {
                console.log("   ✅ Evaluation Received.");
                console.log(`      Score: ${ansData.evaluation.score}`);
                console.log(`      Feedback: ${ansData.evaluation.feedback}`);
                console.log(`      Strengths: ${ansData.evaluation.strengths.join(', ')}`);
            } else {
                console.error("   ❌ Evaluation Failed:", ansData);
            }
        } catch(e) { console.error("   ❌ Evaluation Error:", e.message); }
    }

    console.log("\n🏁 Quality Audit Complete.");
}

run();
