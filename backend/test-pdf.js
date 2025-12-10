const pdf = require('pdf-parse');
const fs = require('fs');

console.log('Type of pdf:', typeof pdf);
console.log('pdf properties:', Object.keys(pdf));

try {
    // Mock buffer
    const buffer = Buffer.from('test');
    pdf(buffer).then(data => {
        console.log('Success:', data.text);
    }).catch(err => {
        console.error('Execution Error:', err);
    });
} catch (e) {
    console.error('Sync Error:', e);
}
