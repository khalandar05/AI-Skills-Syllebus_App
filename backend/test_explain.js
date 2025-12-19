
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testExplain() {
    try {
        console.log("Testing POST http://localhost:4000/api/interview/explain...");
        const res = await axios.post('http://localhost:4000/api/interview/explain', {
            question: "What is a Closure in JavaScript?"
        });
        
        console.log("Status:", res.status);
        console.log("Explanation:", JSON.stringify(res.data.explanation, null, 2));

    } catch (error) {
        console.error("Failed!");
        if (error.response) {
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testExplain();
