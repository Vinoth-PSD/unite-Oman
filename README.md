# UniteOman — Business Directory

**Stack:** React (Vite) + FastAPI + PostgreSQL (Supabase) + Vercel

## Project Structure
```
uniteoman/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/       # API client + utils
│   │   └── context/   # Auth context
│   └── package.json
├── backend/           # FastAPI Python
│   ├── main.py
│   ├── routers/
│   ├── models/
│   ├── core/
│   └── requirements.txt
├── supabase/
│   └── migrations/    # SQL schema
└── vercel.json        # Monorepo deployment
```

## Quick Start

### 1. Supabase Setup
- Create project at supabase.com
- Run `/supabase/migrations/001_schema.sql` in SQL editor
- Copy your Project URL and anon key

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Fill in Supabase credentials
uvicorn main:app --reload
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # Fill in API URL + Supabase keys
npm run dev
```

### 4. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# From project root
vercel
```
Set environment variables in Vercel dashboard.

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.vercel.app
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://[ref].supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```
