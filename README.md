# 🌾 CropPilotAI — AI-Powered Agriculture Crop Advisory Assistant

> Built for the Antigravity Full-Stack Hackathon / Workshop following the Antigravity Blueprint (Pages 6–14).

**CropPilotAI** is an end-to-end intelligent agricultural management and pathology diagnosis platform. Farmers and agronomists can log farm profiles, monitor active crop plantings, and diagnose crop diseases with instant, structured treatment protocols powered by **Google Gemini 3.8 Flash** and persisted via **Supabase Cloud PostgreSQL**.

---

## 🌟 Key Features

1. **🩺 AI Agronomist Diagnostic Engine**:
   - Analyzes crop variety, growth stage, observed symptoms, microclimate, and soil type.
   - Powered by `gemini-3.8-flash` with zero-downtime multi-model fallback resiliency.
   - Delivers structured pathology reports: Pathogen Identification, Severity Rating, AI Confidence %, Biological/Organic Controls, Targeted Chemical Treatments, and Long-Term Prevention Plans.
2. **🌾 Farm & Field Management**:
   - Register farm acreage, GPS/district locations, and soil profiles.
   - Track field irrigation types and crop plantings with live health state badges.
3. **📜 Persistent Advisory Audit Logs**:
   - Every AI consultation is stored in Supabase PostgreSQL with UUID primary keys and JSONB treatment arrays.
4. **🔒 Enterprise Cloud Database (Supabase)**:
   - Configured with Row Level Security (RLS) policies for secure data tenancy.

---

## 🏗️ Architecture Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express + Zod Schema Validation + CORS
- **AI Model**: Google Gemini 3.8 Flash (`@google/genai` v1beta REST)
- **Database**: Supabase Cloud PostgreSQL with Row Level Security (RLS)
- **Deployment Targets**: Render (Backend API) & Vercel (Frontend Client)

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/<your-username>/CropPilotAI.git
cd CropPilotAI

# Install server & client dependencies
npm run install:all
```

### 2. Configure Environment Variables

**Server (`server/.env`)**:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://upszactjcdplyyykkfof.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=croppilot-secret-jwt-key
```

**Client (`client/.env`)**:
```env
VITE_SUPABASE_URL=https://upszactjcdplyyykkfof.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Setup Supabase Database Schema
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project -> **SQL Editor**.
3. Copy and run the script located at `supabase/migrations/001_initial_schema.sql`.

### 4. Run the Full Application
In terminal 1 (Backend):
```bash
cd server
npm start
```

In terminal 2 (Frontend):
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment

### Backend (Render)
1. Link your GitHub repository to [Render](https://render.com).
2. Create a new **Web Service**:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node index.js`
3. Add Environment Variables: `PORT`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLIENT_URL`.

### Frontend (Vercel)
1. Import repository into [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Root Directory: `client`.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `<YOUR_RENDER_BACKEND_URL>`
   - `VITE_SUPABASE_URL`: `https://upszactjcdplyyykkfof.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<YOUR_SUPABASE_ANON_KEY>`
