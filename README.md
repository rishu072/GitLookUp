# GitPulse ⚡ GitHub Analytics Dashboard

GitPulse is a sleek, production-ready, full-stack web application that fetches, aggregates, and displays real-time GitHub user analytics. Built with a lightweight **Python/Flask** backend proxy and a highly responsive **Vite + React + TypeScript** frontend styled with high-fidelity glassmorphism **Vanilla CSS**.

---

## Key Features

- **Real-Time Profile Insights**: Live retrieval of avatar, bio, quick metrics (followers, following, repos, gists), website links, location, and metadata.
- **Dynamic Milestones & Badges**: Achievement system tracking developer metrics: account age anniversaries, star counts, fork counts, repo count milestones, and language polyglot status.
- **Interactive SVG Language Doughnut**: Beautiful custom chart visualizing programming language usage distribution with hover tooltips and interactive legends.
- **SVG Analytics Growth Trends**: Toggleable line chart showing historical repository creation growth timelines and follower growth trends.
- **Robust Repository Search**: Grid of repositories filterable by custom language selector, keyword search, and sorted by Stars, Forks, Recency, or Size.
- **Server-Side JSON File Cache**: Cache manager that writes responses locally (default TTL: 1 hour) to minimize API requests and ensure sub-10ms loads on repeated queries.
- **Rate-Limit Monitor**: Live header tracker in the search interface displaying remaining requests and reset times.

---

## Tech Stack & Architecture

- **Backend**: Python 3.11+ / Flask (Proxy & Cache Layer)
- **Frontend**: Vite / React 18 / TypeScript / Lucide Icons
- **Styling**: Vanilla CSS3 (Custom HSL Variable Palette, Glassmorphism, Micro-Animations)
- **Database / Storage**: Local File-based Cache & localStorage (Recent Searches)

---

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### 1. Environment Configurations
Rename or edit `.env` in the root directory:
```env
# Root .env
GITHUB_TOKEN=your_personal_access_token_here
PORT=5000
FLASK_ENV=development
CACHE_TTL=3600
```
> [!TIP]
> **API Rate Limits**: Generate a GitHub Personal Access Token (PAT) with `read:user` scope at [GitHub Settings](https://github.com/settings/tokens) and paste it into `.env`. This raises the API rate limit from **60/hr to 5,000/hr**.

### 2. Install Dependencies & Build Frontend

#### Frontend Setup
From the root directory, install npm packages:
```bash
npm install
```

To run the Vite development server (proxies API requests to Flask on port 5000):
```bash
npm run dev
```

To build the static files into `frontend/dist` (which Flask hosts in production):
```bash
npm run build
```

#### Backend Setup
It is recommended to run the backend in a virtual environment. From the root directory:
```bash
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows PowerShell
# or
.\venv\Scripts\activate.bat   # Windows Command Prompt
# or
source venv/bin/activate      # macOS/Linux

# Install requirements
pip install -r backend/requirements.txt
```

To start the Flask backend API server:
```bash
python -m backend.app
```

---

## Local Development Layout

During development, start both servers:
1. **Flask API** on `http://localhost:5000` (runs `python -m backend.app`)
2. **Vite Frontend** on `http://localhost:5173` (runs `npm run dev`)

Vite is configured via `vite.config.ts` to proxy `/api` requests to Flask. Open `http://localhost:5173` in your browser to test live changes with Hot Module Replacement (HMR).

---

## Production Deployment

To run GitPulse in production:
1. Build the React assets: `npm run build`. This outputs bundle files into the root `dist/` folder (configured as Flask static assets directory).
2. Start the Flask server: `python -m backend.app` or use a WSGI server (like `gunicorn` on Linux or `waitress` on Windows).
3. The Flask server serves the frontend assets from `dist/` directly on `http://localhost:5000`. No separate frontend server is required!
