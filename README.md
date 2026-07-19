# QuizSlide AI: Unstructured Quiz to Google Slides Automation

An AI-powered full-stack web application that takes unstructured text inputs of up to **60 multiple-choice questions**, uses **Google Gemini AI** to extract and format them into normalized JSON records, and automatically generates a populated Google Slides deck by duplicating template slides and replacing text placeholders.

---

## 📁 Project Structure

```text
AI Slide Generator/
├── package.json           # Monorepo scripts (concurrent execution)
├── .env                   # Local server credentials
├── .env.example           # Shared credentials schema
├── README.md              # Documentation
├── server/                # Node/Express Backend
│   ├── package.json
│   ├── server.js          # Bootstrapper
│   ├── config/
│   │   └── google.js      # OAuth client & Google client configs
│   ├── controllers/
│   │   ├── authController.js    # Login redirect, cookie exchange, logout
│   │   ├── quizController.js    # Gemini extraction and placeholder routing
│   │   └── exportController.js  # PPTX / PDF binary exports
│   ├── routes/
│   │   ├── authRoutes.js        # Google authentication API routes
│   │   └── quizRoutes.js        # AI parser & slides automation API routes
│   ├── middlewares/
│   │   ├── authMiddleware.js    # OAuth session check
│   │   ├── rateLimiter.js       # API & AI rate restrictors
│   │   └── errorMiddleware.js   # Global JSON exception handler
│   ├── services/
│   │   ├── geminiService.js     # Gemini Gen AI client and retry wrapper
│   │   └── googleService.js     # Slides template parser, duplicator, & exporter
│   └── utils/
│       ├── validator.js         # Questions deduplicator & normalizer
│       └── slideParser.js       # ID parser from Google Slide links
└── frontend/              # Vite / React Frontend
    ├── package.json
    ├── index.html
    ├── tailwind.config.js # Tailwind CSS variables (V3)
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── index.css      # Core tailwind directives and glassmorphic designs
        ├── App.jsx        # Dashboard layout and API states
        ├── components/
        │   ├── Header.jsx             # Auth profiles, connection status & theme toggles
        │   ├── QuestionInput.jsx      # Pasting inputs, file drop zones, and counters
        │   ├── PreviewQuestions.jsx   # Inline grid spreadsheets and raw JSON viewer modals
        │   ├── PresentationConfig.jsx # Template URL parsing, cheatsheets and progress trackers
        │   └── ExportZone.jsx         # Redirect triggers, PDF and PPTX downloads
        ├── hooks/
        │   └── useAuth.js             # Client session validation state hook
        └── services/
            └── api.js                 # Axios API wrapper with withCredentials enabled
```

---

## 🔑 Setup & Credentials Configuration

To run the application, you need to set up two third-party integrations: **Google Cloud Platform** (for Drive/Slides APIs) and **Google Gemini** (for AI parsing).

### 1. Google Cloud Console Setup (APIs & OAuth)

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **New Project** and name it (e.g., `QuizSlide-Automation`).
3. In the sidebar, search and enable these APIs:
   - **Google Slides API**
   - **Google Drive API**
4. Navigate to **OAuth Consent Screen**:
   - Choose **External** user type.
   - Enter App details (Name, Support Email).
   - Under **Scopes**, click **Add or Remove Scopes** and add:
     - `.../auth/userinfo.profile` (Profile details)
     - `.../auth/userinfo.email` (Email identification)
     - `.../auth/presentations` (Modify slides)
     - `.../auth/drive` (Copy files and render exports)
   - Add your email as a **Test User** (required while in testing status).
5. Navigate to **Credentials** -> **Create Credentials** -> **OAuth Client ID**:
   - Application type: **Web application**.
   - Authorized redirect URIs: Add `http://localhost:5000/api/auth/google/callback`.
6. Copy the **Client ID** and **Client Secret** into your `.env` file.

### 2. Gemini API Key Setup

1. Open the [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **Create API Key**.
4. Copy the generated key and assign it to the `GEMINI_API_KEY` variable in your `.env` file.

---

## 🚀 Installation & Local Run Guide

### Step 1: Clone and Configure Environment

Ensure you have Node.js installed. Create a `.env` file in the root directory by duplicating `.env.example` and filling in your credentials:

```bash
# In the project root directory
cp .env.example .env
```

Open `.env` and fill:
```env
PORT=5000
SESSION_SECRET=a_long_random_session_secret_string
GOOGLE_CLIENT_ID=your_google_client_id_from_cloud_console
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_cloud_console
GEMINI_API_KEY=your_gemini_api_key_from_ai_studio
```

### Step 2: Install Packages

Use the monorepo helper script to automatically install all dependencies across the root, server, and frontend:

```bash
npm run install:all
```

### Step 3: Run Development Servers

Boot up both the Express Backend (Port `5000`) and the Vite React Frontend (Port `5173`) concurrently:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📝 Preparing Google Slides Templates

The application duplicates a designated slide and populates it. For automation to succeed:

1. Create a Google Slides presentation template.
2. Put the following exact placeholders inside text boxes or table cells:
   - `{{QUESTION}}`
   - `{{OPTION_A}}`
   - `{{OPTION_B}}`
   - `{{OPTION_C}}`
   - `{{OPTION_D}}`
   - `{{ANSWER}}`
3. Ensure your Google account has **Edit** access to the template (or set the template link sharing option to *Anyone with the link can view*).

---

## 🌐 Staging & Deployment Guidelines

### 1. Backend (Render / Railway / Heroku)

1. Connect your Github Repository to your hosting provider.
2. Set Environment variables in the dashboard corresponding to your `.env` values.
3. Set the **Build Command** to:
   ```bash
   npm install --prefix server
   ```
4. Set the **Start Command** to:
   ```bash
   npm run start --prefix server
   ```
5. Ensure `FRONTEND_URL` points to your final frontend domain (e.g. `https://your-app.vercel.app`).
6. Update your Google Cloud Credentials dashboard: Add your production callback URL (e.g. `https://your-api.com/api/auth/google/callback`) under **Authorized redirect URIs**.

### 2. Frontend (Vercel / Netlify)

1. Connect your Github Repository to Vercel.
2. Set the **Root Directory** option to `frontend`.
3. Set Environment variables in Vercel:
   - `VITE_API_URL`: Points to your deployed backend URL (e.g. `https://your-api.com/api`).
4. Trigger deploy.

---

## 🛠️ Troubleshooting & Common Errors

* **OAuth Error: Redirect URI Mismatch**:
  Double-check that the URL in Google Cloud Credentials matches `http://localhost:5000/api/auth/google/callback` exactly. Even trailing slashes matter.
* **No Slide Populating / Duplicate Failures**:
  Verify the slide template contains the literal placeholder `{{QUESTION}}`. The server scans slide elements for this exact match to detect the template sheet.
* **CORS Blocked (Sessions not working)**:
  Ensure `FRONTEND_URL` is configured correctly on the backend server environment and that cookies are allowed (`withCredentials: true` in Axios).
