const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const aiService = require('./aiService');

class SyllabusService {
  // Helper for timeouts
  async withTimeout(promise, ms, operationName) {
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
              reject(new Error(`TIMEOUT: ${operationName} took longer than ${ms / 1000}s`));
          }, ms);
      });

      try {
          const result = await Promise.race([promise, timeoutPromise]);
          clearTimeout(timeoutId);
          return result;
      } catch (error) {
          clearTimeout(timeoutId);
          throw error;
      }
  }

  async parsePdf(fileBuffer) {
    try {
      // 20s Timeout for PDF Parsing
      const data = await this.withTimeout(pdf(fileBuffer), 20000, "PDF Parsing");
      const text = data.text;
      
      if (!text || text.trim().length < 20) {
          console.warn("[SyllabusService] PDF parsed but text is empty. Likely a scanned/image-based PDF.");
          return " [ERROR_SCANNED_PDF] The uploaded PDF appears to be an image or scanned document with no selectable text. Please upload a text-based PDF or use an OCR tool first. "; 
      }

      return text;
    } catch (err) {
      console.error("PDF Parse Error:", err.message);
      if (err.message.includes("TIMEOUT")) {
           throw new Error("PDF processing timed out. The file might be too large or complex. Please try a smaller file.");
      }
      throw new Error("Failed to parse PDF: " + err.message);
    }
  }

  async parseImage(fileBuffer) {
    try {
      // 40s Timeout for OCR (it's slower)
      const { data: { text } } = await this.withTimeout(
          Tesseract.recognize(fileBuffer, 'eng'), 
          40000, 
          "OCR Processing"
      );
      return text;
    } catch (err) {
      console.error("OCR Error:", err.message);
      if (err.message.includes("TIMEOUT")) {
           throw new Error("Image processing timed out. Please try a clearer image.");
      }
      throw new Error("Failed to perform OCR");
    }
  }

  async extractStructure(rawText) {
    // Truncate to 15k characters to ensure processing finishes before 30s timeout
    const truncatedText = rawText.substring(0, 15000);

    const prompt = `Analyze this syllabus and output a SIMPLIFIED COURSE HIERARCHY in JSON.
        
        GOAL: Extract the main Units and their Key Topics. Keep it simple.
        
        Output a JSON object with this EXACT shape:
        {
          "courseTitle": "Course Name",
          "units": [
            { 
              "number": 1, 
              "title": "Unit Name", 
              "topics": [
                {
                  "name": "Topic Name",
                  "skills": ["Skill 1", "Skill 2"] 
                }
              ] 
            }
          ]
        }
        
        Syllabus Text: ${truncatedText}`;

    // Call AI Service with robust JSON validation
    return await aiService.getValidatedJson(prompt, "You are a curriculum parser. Return ONLY valid JSON.");
  }
}

module.exports = new SyllabusService();
