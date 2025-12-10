const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const aiService = require('./aiService');

class SyllabusService {
  async parsePdf(fileBuffer) {
    try {
      const data = await pdf(fileBuffer);
      return data.text;
    } catch (err) {
      console.error("PDF Parse Error:", err);
      throw new Error("Failed to parse PDF");
    }
  }

  async parseImage(fileBuffer) {
    try {
      // Tesseract recognizes from buffer
      const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng');
      return text;
    } catch (err) {
      console.error("OCR Error:", err);
      throw new Error("Failed to perform OCR");
    }
  }

  async extractStructure(rawText) {
    const prompt = `Analyze the following syllabus text and extract the Units, Topics, Subtopics, Keywords, and related Skills.
        
        Output a JSON object with this EXACT shape:
        {
          "units": [
            { 
              "number": 1, 
              "title": "Unit Name", 
              "topics": [
                {
                  "name": "Main Topic",
                  "subtopics": ["Subtopic 1", "Subtopic 2"],
                  "keywords": ["Keyword1", "Keyword2"]
                }
              ] 
            }
          ],
          "skills": ["Skill 1", "Skill 2", "Skill 3"]
        }
        
        Syllabus Text: ${rawText.substring(0, 30000)}`; // Increased limit for Gemini 1.5 Flash

    // Call AI Service with robust JSON validation
    return await aiService.getValidatedJson(prompt, "You are a curriculum expert. Return ONLY valid JSON.");
  }
}

module.exports = new SyllabusService();
