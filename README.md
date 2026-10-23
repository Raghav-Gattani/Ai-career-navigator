# # 🚀 AI Career Navigator

**Your AI-powered companion for career planning, skill development, and interview preparation.**

AI Career Navigator is a full-stack web application designed to help students and aspiring developers explore career paths, identify skill gaps, build personalized learning roadmaps, practice technical concepts, prepare professional resumes, and track their learning progress.

The goal is to bring essential career-development tools together in one place, from discovering what to learn next to preparing for professional opportunities.

## ✨ Features

### 🎯 Career Analyzer
- Analyze career interests, skills, and professional goals.
- Explore potential career directions.
- Use AI-powered guidance to support career planning.

### 🗺️ Skill Gap Analysis & Learning Roadmaps
- Identify skills relevant to your target role.
- Organize learning into structured phases and tasks.
- Track roadmap progress.
- Access learning activities aligned with your career goals.

### 💻 Interactive Learning Studio
- Explore technical concepts through interactive learning experiences.
- Practice programming concepts with visual simulations.
- Learn complex topics through hands-on demonstrations.
- Launch learning activities directly from roadmap tasks.

### 🤖 AI Mock Interview
- Practice interview questions.
- Prepare for technical interviews.
- Use AI-assisted feedback to support interview preparation.

### 📄 AI Resume Builder
- Generate a resume tailored to your target role.
- Use AI to enhance individual resume sections.
- Edit resume content manually.
- Save and manage resume drafts.
- Choose between Modern Tech, Classic ATS, and Minimalist templates.
- Export resumes as PDFs.
- Generate optional public, read-only resume links that can be revoked.

### 📈 Progress Tracking
- Monitor learning activity and technical practice sessions.
- Track daily learning goals and streaks.
- Use a focus timer with work and break modes.
- View roadmap tasks and continue learning from your dashboard.

### 🌗 Light & Dark Mode
- Switch between light and dark themes.
- Save your theme preference across page refreshes.
- Enjoy a consistent interface across supported application pages.

### 🔐 Backend & Data Persistence
- FastAPI backend for application APIs.
- SQLite database for persistent application data.
- User-specific data access controls.
- Google Gemini integration for AI-powered features.
- Fallback behavior for supported AI operations when an API key is unavailable.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, JavaScript |
| UI & Styling | CSS, responsive layouts, Material Design 3-inspired styling |
| Backend | Python, FastAPI |
| Database | SQLite |
| AI Integration | Google Gemini API |
| Resume PDF Export | ReportLab |
| Testing | Pytest |
| Version Control | Git and GitHub |

## 🏗️ Application Architecture

```text
AI Career Navigator
│
├── React + Vite Frontend
│   ├── Dashboard
│   ├── Career Analyzer
│   ├── Skill Gap & Roadmap
│   ├── Learning Studio
│   ├── AI Mock Interview
│   ├── Progress Reports
│   └── AI Resume Builder
│
└── FastAPI Backend
    ├── REST API Endpoints
    ├── AI Integration
    ├── User Data & Persistence
    ├── Resume Management
    ├── PDF Generation
    └── SQLite Database
```

## 🚀 Getting Started

Follow these instructions to run the project locally on your computer.

### Prerequisites

Install the following:

- Git
- Node.js and npm
- Python 3
- A Google Gemini API key for AI-powered features

Check your installations:

```bash
git --version
node --version
npm --version
python3 --version
```

### 1. Clone the repository

```bash
git clone https://github.com/Raghav-Gattani/Ai-career-navigator.git
cd Ai-career-navigator
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Set up the backend

```bash
cd backend
python3 -m venv venv
```

Activate the virtual environment.

**Linux / macOS:**

```bash
source venv/bin/activate
```

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` directory. Add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace the placeholder with your own key.

**Security:** Never commit your `.env` file, API keys, passwords, or private user data to GitHub. Keep credentials on your local machine or in your deployment platform's secure environment settings.

### 5. Start the backend

From the `backend` directory, run:

```bash
./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at:

- API: `http://localhost:8000`
- Interactive API documentation: `http://localhost:8000/docs`

Keep this terminal running.

### 6. Start the frontend

Open a second terminal and navigate to the project directory:

```bash
cd ~/ai-career-navigator
npm run dev
```

Open the local URL printed by Vite, typically:

`http://localhost:5173`

Keep both the frontend and backend running while using the application.

## 🧪 Testing

### Frontend production build

From the project root:

```bash
npm run build
```

### Backend tests

Activate the backend virtual environment if necessary, then run:

```bash
cd ~/ai-career-navigator/backend
./venv/bin/python -m pytest
```

The test suite can be used to check backend behavior, including API endpoints, persistence, access controls, and resume-related functionality.

## 🔒 Security & Privacy

- Store API keys in environment variables, never in frontend code.
- Do not commit `.env` files, local databases, or private user information.
- Protect user-specific resources with appropriate ownership checks.
- Share resumes publicly only when you choose to enable sharing.
- Revoke public resume links when they are no longer needed.
- Review configuration and access controls before deploying the application publicly.

## 🗺️ Project Goals

AI Career Navigator aims to make career preparation more structured and accessible by combining career guidance, practical technical learning, progress tracking, and professional resume preparation in a single application.

The project is designed to evolve as additional learning experiences and career-development features are developed.

## 👨‍💻 Author

**Raghav Gattani**
**Hitesh**
**Vaibhav Gupta**
**Vanshraj**

Computer Science & Engineering Student

GitHub: [@Raghav-Gattani](https://github.com/Raghav-Gattani)

## ⭐ Support

If you find this project interesting, consider starring the repository, sharing feedback, or suggesting improvements through GitHub Issues.

---

*Built with curiosity, AI, and a focus on making career development more accessible.*