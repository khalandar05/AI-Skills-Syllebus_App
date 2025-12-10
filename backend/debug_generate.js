const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const SECRET = "supersecretkey";
// Create a fake valid token
const token = jwt.sign({ userId: "test-user-id", email: "test@example.com" }, SECRET, { expiresIn: '1h' });

async function testGenerate() {
    console.log("Testing Project Generation with Token...");
    try {
        const response = await fetch('http://localhost:4000/api/projects/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-user-id': 'test-user-id' // Explicitly set it too just in case middleware relies on it post-verification
            },
            body: JSON.stringify({
                topic: 'General',
                techStack: ['React', 'Node']
            })
        });

        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Body:", text.substring(0, 500)); // Print first 500 chars
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

testGenerate();
