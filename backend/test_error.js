const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
    console.log("Testing Upload Error...");
    const form = new FormData();
    // Simulate a "bad" PDF (just text content)
    form.append('file', Buffer.from('not a pdf'), { filename: 'bad.pdf', contentType: 'application/pdf' });

    try {
        const response = await fetch('http://localhost:4000/api/syllabus/upload', {
            method: 'POST',
            body: form
        });

        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Body:", text);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

testUpload();
