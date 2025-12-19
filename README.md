# 🚀 SyllabusAI - AI-Powered Learning Roadmap & Project Generator

**SyllabusAI** is an intelligent full-stack application that transforms static course syllabi into dynamic, actionable project roadmaps. It leverages Google's Gemini AI to parse PDF/Image content, extract key topics, and generate real-world coding projects, resume bullet points, and exam-style Q&A to help students master their subjects.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black)
![Node.js](https://img.shields.io/badge/Backend-Express.js-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![AI](https://img.shields.io/badge/AI-Gemini_1.5-orange)

## ✨ Key Features

### 🎓 Smart Syllabus Parsing
-   **Upload Anything**: detailed support for PDF, Images, and Raw Text.
-   **AI Extraction**: Automatically identifies units, chapters, and core topics from unstructured documents.

### 🛠️ AI Project Generator
-   **Skill-to-Project**: Converts theoretical topics into practical, portfolio-ready project ideas.
-   **Custom Roadmaps**: Generates step-by-step guides, tech stack recommendations, and difficulty levels.

### ❓ Chapter Q&A Engine
-   **Exam Prep**: Generates rapid-fire conceptual questions.
-   **Real-World Application**: Creates scenario-based questions to test understanding.
-   **Instant Answers**: Reveals AI-generated detailed answers on demand.

### 🎨 Modern UI/UX
-   **"Violet Glass" Theme**: A stunning, premium interface with glassmorphism effects and radiant gradients.
-   **Responsive Design**: Fully optimized for desktop and mobile learning.
-   **Interactive Dashboard**: Track your generated projects and skills in one place.

---

## 🏗️ Tech Stack

### Frontend
-   **Framework**: Next.js 14 (App Router)
-   **Styling**: Tailwind CSS + Shadcn/UI
-   **Icons**: Lucide React
-   **State**: React Hooks (useState, useEffect)

### Backend
-   **Server**: Node.js + Express
-   **Database**: PostgreSQL (via Prisma ORM)
-   **Authentication**: JWT (JSON Web Tokens)
-   **File Handling**: Multer (Uploads), PDF-Parse, Tesseract.js (OCR)

### AI & Services
-   **Model**: Google Gemini 1.5 Flash / Pro (with auto-fallback & retry logic)
-   **SDK**: Google Generative AI SDK

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
-   Node.js (v18+)
-   PostgreSQL installed and running
-   A Google Cloud API Key for Gemini

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/syllabus-ai.git
cd syllabus-ai
```

### 2. Backend Setup
```bash
cd backend
npm install

# Set up Environment Variables
# Create a .env file in /backend with:
# PORT=4000
# DATABASE_URL="postgresql://user:password@localhost:5432/syllabus_db"
# JWT_SECRET="your_super_secret_key"
# GEMINI_API_KEY="your_gemini_api_key"

# Run Database Migrations
npx prisma migrate dev --name init

# Start Server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start Next.js App
npm run dev
```

### 4. Usage
-   Open `http://localhost:3000` in your browser.
-   Register/Login to access the dashboard.
-   Go to **Syllabus** to upload a course PDF and generate projects.
-   Go to **Chapter Q&A** to upload a specific chapter for study questions.

---

## 📂 Project Structure

```bash
/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Logic for routes
│   │   ├── routes/        # API Endpoints (syllabus, projects, qa)
│   │   ├── services/      # AI & Parsing Services
│   │   └── app.js         # Entry point
│   └── prisma/            # DB Schema
│
└── frontend/
    ├── src/
    │   ├── app/           # Next.js Pages (syllabus, qa, dashboard)
    │   ├── components/    # Reusable UI components (ui/card, etc.)
    │   └── lib/           # Utilities
```

## 🔒 Security & Robustness
-   **Error Handling**: Centralized error handling puts an end to silent failures.
-   **AI Robustness**: Includes dynamic model selection and exponential backoff to handle API rate limits and 404s gracefully.

## 📄 License
MIT License.