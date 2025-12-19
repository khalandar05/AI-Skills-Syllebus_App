const fs = require('fs');
const path = require('path');

// Usage: node verify_strict.js
const API_URL = 'http://localhost:4000/api';

async function run() {
    console.log("🚀 Starting STRICT Verification Sequence...");
    
    // 1. Auth: Register or Login
    const email = `verifier_${Date.now()}@test.com`;
    const password = 'testpassword123';
    let token = null;

    try {
        console.log(`\n🔹 [1/6] Registering User: ${email}`);
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name: 'Verifier' })
        });
        const regData = await regRes.json();
        
        if (regData.token) {
            token = regData.token;
            console.log("   ✅ Registration Success. Token acquired.");
        } else {
            console.warn("   ⚠️ Registration skipped or failed (User might exist). Trying Login...");
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const loginData = await loginRes.json();
            if (!loginData.token) throw new Error("Login Failed: " + JSON.stringify(loginData));
            token = loginData.token;
            console.log("   ✅ Login Success. Token acquired.");
        }
    } catch (e) {
        console.error("   ❌ Auth Failed:", e.message);
        process.exit(1);
    }

    // 2. Profile Update
    try {
        console.log(`\n🔹 [2/6] Verifying Pofile Update`);
        const updateRes = await fetch(`${API_URL}/user/profile`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ bio: "Verified by Strict Script", jobTitle: "QA Engineer" })
        });
        const updateData = await updateRes.json();
        if(updateData.success && updateData.user.bio === "Verified by Strict Script") {
            console.log("   ✅ Profile Update Verified.");
        } else {
            console.error("   ❌ Profile Update Failed:", updateData);
        }
    } catch(e) { console.error("   ❌ Profile Error:", e.message); }


    // Prepare File for Upload
    const filePath = path.join(__dirname, 'test_syllabus.txt');
    const fileContent = fs.readFileSync(filePath);
    const blob = new Blob([fileContent], { type: 'text/plain' });
    
    // 3. QA Generation
    try {
        console.log(`\n🔹 [3/6] Verifying Q&A Generator (text/plain)`);
        const formData = new FormData();
        formData.append('file', blob, 'test_syllabus.txt');
        
        const qaRes = await fetch(`${API_URL}/qa/generate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const qaData = await qaRes.json();
        
        if (qaData.success && qaData.data.questions && qaData.data.questions.length >= 30) {
            console.log(`   ✅ Q&A Success. Generated ${qaData.data.questions.length} questions.`);
        } else if (qaData.success) {
            console.warn(`   ⚠️ Q&A Generated but count low: ${qaData.data.questions?.length}`);
            console.log("   DATA PREVIEW:", JSON.stringify(qaData.data, null, 2).substring(0, 500));
        } else {
            console.error("   ❌ Q&A Failed:", qaData);
        }
    } catch(e) { console.error("   ❌ Q&A Error:", e.message); }

    // 4. Flashcards
    try {
        console.log(`\n🔹 [4/6] Verifying Flashcard Generator`);
        const formData = new FormData();
        formData.append('file', blob, 'test_syllabus.txt');

        const fcRes = await fetch(`${API_URL}/flashcards/generate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const fcData = await fcRes.json();
        
        if (fcData.success && fcData.data.cards && fcData.data.cards.length >= 25) {
            console.log(`   ✅ Flashcards Success. Generated ${fcData.data.cards.length} cards.`);
        } else if (fcData.success) {
             console.warn(`   ⚠️ Flashcards Generated but count low: ${fcData.data.cards?.length}`);
        } else {
            console.error("   ❌ Flashcards Failed:", fcData);
        }
    } catch(e) { console.error("   ❌ Flashcards Error:", e.message); }

    // 5. Projects Generation
    let firstProjectId = null;
    try {
        console.log(`\n🔹 [5/6] Verifying Project Generator`);
        const projRes = await fetch(`${API_URL}/projects/generate`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                topic: "React Learning", 
                techStack: ["React", "Node"],
                syllabusStructure: {
                    units: [
                        { number: 1, title: "React Basics", topics: ["Components", "Props", "State"] },
                        { number: 2, title: "Advanced Patterns", topics: ["HOCs", "Render Props", "Hooks"] }
                    ]
                }
            })
        });
        const projData = await projRes.json();

        if (projData.success && projData.projects.length >= 3) {
            console.log(`   ✅ Projects Success. Generated ${projData.projects.length} projects.`);
            firstProjectId = projData.projects[0].id;
            
            // Validate Structure
            const p1 = projData.projects[0];
            
            // Check for new "Deep" fields
            const hasReasoning = p1.whyThisMatchesTheSyllabus && p1.problemStatement;
            const hasArchitecture = p1.architectureOverview && p1.risksChallenges;

            if(hasReasoning && hasArchitecture) {
                 console.log("   ✅ Structure Validated (Grounding & Arch present).");
                 console.log("      whyThisMatches:", p1.whyThisMatchesTheSyllabus.substring(0, 50) + "...");
            } else {
                 console.warn("   ⚠️ Missing deep fields. Received:", JSON.stringify(p1, null, 2));
            }

        } else {
            console.error("   ❌ Projects Failed:", JSON.stringify(projData, null, 2));
        }
    } catch(e) { console.error("   ❌ Projects Error:", e.message); }

    // 6. Persistence Check
    if (firstProjectId) {
         try {
            console.log(`\n🔹 [6/6] Verifying Project Persistence (GET /)`);
            const getRes = await fetch(`${API_URL}/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const getData = await getRes.json();
            
            const found = getData.projects.find(p => p.id === firstProjectId);
            if (found) {
                console.log("   ✅ Persistence Verified. Project found in DB List.");
            } else {
                console.error("   ❌ Persistence Fail. Project NOT found in DB List.");
            }
        } catch(e) { console.error("   ❌ Persistence Error:", e.message); }
    }

    console.log("\n🏁 Verification Complete.");
}

run();
