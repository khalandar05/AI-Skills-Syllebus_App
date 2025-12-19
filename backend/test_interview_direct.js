
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testStartInterview() {
    const start = Date.now();
    try {
        const prisma = require('./src/lib/prisma');
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error("No users found in DB!");
            return;
        }
        console.log("Using User ID:", user.id);

        console.log("Testing POST http://localhost:4000/api/interview/start...");
        const headers = { 
            'x-user-id': user.id,
            'Content-Type': 'application/json'
        };
        const body = { context: "DBMS" };

        const res = await axios.post('http://localhost:4000/api/interview/start', body, { headers, timeout: 60000 });
        const duration = (Date.now() - start) / 1000;

        console.log(`Success! Duration: ${duration}s`);
        console.log("Status:", res.status);
        console.log("Questions Count:", res.data.session.questions.length);

    } catch (error) {
        const duration = (Date.now() - start) / 1000;
        console.error(`Failed after ${duration}s`);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testStartInterview();
