const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '.env');
console.log("Checking .env at:", envPath);

try {
    const rawParams = fs.readFileSync(envPath);
    console.log("File found. Size:", rawParams.length, "bytes");
    console.log("First 20 bytes (Hex):", rawParams.subarray(0, 20).toString('hex'));
    console.log("First 200 chars raw:\n", rawParams.toString('utf8').substring(0, 200));

    const parsed = dotenv.parse(rawParams);
    console.log("Dotenv Parse Result Keys:", Object.keys(parsed));
    console.log("GEMINI_API_KEY in parsed:", parsed.GEMINI_API_KEY);
    
    dotenv.config();
    console.log("process.env.GEMINI_API_KEY after config():", process.env.GEMINI_API_KEY);

} catch (e) {
    console.error("Error reading .env:", e);
}
