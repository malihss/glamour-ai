#!/usr/bin/env bash
# setup.sh — One-command setup for Glamour AI
# Usage: chmod +x setup.sh && ./setup.sh

set -e

BOLD='\033[1m'
GOLD='\033[0;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_step() { echo -e "\n${GOLD}${BOLD}▶ $1${NC}"; }
print_ok()   { echo -e "${GREEN}✓ $1${NC}"; }
print_err()  { echo -e "${RED}✗ $1${NC}"; }

echo -e "${GOLD}${BOLD}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║         GLAMOUR AI — SETUP            ║"
echo "  ║   Luxury Beauty E-Commerce Platform   ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# ── Check prerequisites ─────────────────────────────────────────────────
print_step "Checking prerequisites"

command -v node >/dev/null 2>&1 && print_ok "Node.js $(node -v)" || { print_err "Node.js not found. Install from nodejs.org"; exit 1; }
command -v python3 >/dev/null 2>&1 && print_ok "Python $(python3 --version)" || { print_err "Python 3 not found"; exit 1; }
command -v psql >/dev/null 2>&1 && print_ok "PostgreSQL available" || print_err "PostgreSQL not found — install it first"

# ── Database ────────────────────────────────────────────────────────────
print_step "Setting up database"

DB_NAME="glamour_ai"
DB_USER="postgres"

if psql -U $DB_USER -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw $DB_NAME; then
    print_ok "Database '$DB_NAME' already exists"
else
    psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null && print_ok "Created database '$DB_NAME'" || print_err "Could not create database. Create it manually: psql -U postgres -c 'CREATE DATABASE glamour_ai;'"
fi

echo "Running migrations..."
for f in database/migrations/*.sql; do
    psql -U $DB_USER -d $DB_NAME -f "$f" -q 2>/dev/null && echo "  ✓ $(basename $f)" || echo "  ⚠ $(basename $f) — may already exist"
done

echo "Seeding sample data..."
for f in database/seeds/*.sql; do
    psql -U $DB_USER -d $DB_NAME -f "$f" -q 2>/dev/null && echo "  ✓ $(basename $f)" || echo "  ⚠ $(basename $f)"
done

# ── Backend ─────────────────────────────────────────────────────────────
print_step "Setting up backend"

cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_ok "Created virtual environment"
fi

source venv/bin/activate
pip install -q -r requirements.txt && print_ok "Backend dependencies installed"

if [ ! -f ".env" ]; then
    cp .env.example .env
    print_ok "Created backend/.env (update with your values)"
fi

cd ..

# ── AI Services ─────────────────────────────────────────────────────────
print_step "Setting up AI services"

cd ai-services
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_ok "Created AI services virtual environment"
fi

source venv/bin/activate
pip install -q -r requirements.txt && print_ok "AI services dependencies installed"
cd ..

# ── Frontend ─────────────────────────────────────────────────────────────
print_step "Setting up frontend"

cd frontend
npm install --silent && print_ok "Frontend dependencies installed"

if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    print_ok "Created frontend/.env.local"
fi
cd ..

# ── Summary ─────────────────────────────────────────────────────────────
echo -e "\n${GOLD}${BOLD}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  Setup complete! Start the application:${NC}\n"
echo -e "  ${BOLD}Terminal 1 — Backend:${NC}"
echo "    cd backend && source venv/bin/activate && python app.py"
echo ""
echo -e "  ${BOLD}Terminal 2 — AI Services:${NC}"
echo "    cd ai-services && source venv/bin/activate && python server.py"
echo ""
echo -e "  ${BOLD}Terminal 3 — Frontend:${NC}"
echo "    cd frontend && npm run dev"
echo ""
echo -e "  ${BOLD}Open:${NC} http://localhost:3000"
echo -e "  ${BOLD}API: ${NC} http://localhost:5000/api/health"
echo -e "  ${BOLD}AI:  ${NC} http://localhost:5001/health"
echo ""
echo -e "  ${BOLD}Demo login:${NC} demo@glamour.ai / glamour123"
echo -e "${GOLD}${BOLD}═══════════════════════════════════════════${NC}\n"
