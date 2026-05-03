# GLAMOUR AI — Luxury Beauty E-Commerce Platform

A production-grade Sephora-like platform with AI-powered virtual makeup try-on, recommendation system, and intelligent chatbot.

## Architecture Overview

```
glamour-ai/
├── frontend/          # Next.js 14 + Tailwind CSS
├── backend/           # Python Flask REST API
├── ai-services/       # OpenCV + MediaPipe + TensorFlow
└── database/          # PostgreSQL schemas & seeds
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 15+
- pip & npm

---

## 1. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE glamour_ai;"

# Run migrations
cd database
psql -U postgres -d glamour_ai -f migrations/001_init.sql
psql -U postgres -d glamour_ai -f migrations/002_products.sql
psql -U postgres -d glamour_ai -f migrations/003_orders.sql

# Seed sample data
psql -U postgres -d glamour_ai -f seeds/products.sql
psql -U postgres -d glamour_ai -f seeds/users.sql
```

---

## 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DB credentials and secret key

# Run Flask server
python app.py
# Runs on http://localhost:5000
```

---

## 3. AI Services Setup

```bash
cd ai-services
pip install -r requirements.txt

# Run AI microservice
python server.py
# Runs on http://localhost:5001
```

---

## 4. Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local

npm run dev
# Runs on http://localhost:3000
```

---

## Environment Variables

### backend/.env
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/glamour_ai
SECRET_KEY=your-secret-key-here
JWT_EXPIRY=86400
AI_SERVICE_URL=http://localhost:5001
FLASK_ENV=development
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_AI_URL=http://localhost:5001
```

---

## Features

- **E-Commerce**: Full product catalog, cart, checkout, user auth
- **Virtual Try-On**: Real-time camera-based makeup application (lipstick, eyeshadow, foundation)
- **AI Recommendations**: TensorFlow-based collaborative filtering
- **Beauty Chatbot**: Claude-powered intelligent assistant
- **Responsive Design**: Mobile-first luxury aesthetic
