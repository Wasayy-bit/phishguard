# PhishGuard 🛡️

### An Open-Source Phishing URL Detection, Reporting, and Cyber-Awareness Platform

**Final Semester Project | Department of Cyber Security**

PhishGuard is an advanced cyber security intelligence platform designed to detect malicious web indicators, provide visual threat analysis dashboards, and deliver structured cyber-awareness learning modules. Built with an asynchronous decoupled architecture, it combines a reactive frontend application with a secure distributed backend cluster.

---

## 🚀 Key Features

- **Real-time Phishing Detection:** Asynchronous URL threat evaluation utilizing cryptographic integrity checks, heuristics, and security metadata inspection.
- **Cyber-Awareness Hub:** Interactive, cloud-seeded learning modules tailored to educate end-users on vector mechanics and current phishing strategies.
- **Threat Reporting Pipeline:** Automated framework for users to submit suspicious URLs, logging telemetry into a centralized database repository.
- **Role-Based Analytics Dashboard:** Secure authentication workflows allowing system operators to audit reported threat vectors and manage system states.

---

## 🛠️ Tech Stack & Architecture

### Frontend Application

- **Framework:** React.js (Bootstrapped with Vite for high-concurrency architecture)
- **Styling Engine:** Tailwind CSS & PostCSS (Fluid utility-first interface styling)
- **State Management & Routing:** Axios Interceptors (JWT state isolation) & React Router DOM

### Backend Infrastructure

- **Core Engine:** FastAPI (Python compatible, asynchronous high-performance concurrency framework)
- **Database Driver:** Motor (Non-blocking asynchronous MongoDB connectivity driver)
- **Security Layer:** PyJWT (JSON Web Tokens) & Passlib with Bcrypt (Salted cryptographic password hashing)

### Database Layer

- **Cloud Infrastructure:** MongoDB Atlas (Cloud-Native Shared Cluster Free Tier)

---
⚙️ Runtime System Initialization

1. Backend Engine Launch
cd backend
python -m venv venv
# Activate on Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000

2. Frontend Application Launch
cd frontend
npm install
npm run dev

📋 System Metrics & Production Deployment
Backend Cloud Infrastructure: Hosted on optimized container runtimes utilizing MongoDB Atlas shared clusters for distributed logging.

Frontend Web Application: Compiled, optimized, and deployed continuously via edge networks.

👥 Student & Course Governance
Student Name: Ahmed Abdul Wasay

Roll Number: F2024408023

Program: Bachelor of Science in Cyber Security

Course: SE-494 Open Source Software Development

Section: Y9

🌐 Live Demo & Deliverables


## 📦 Directory Structure

```text
PhishGuard/
├── README.md               # Central project system architecture manual
├── backend/
│   ├── app/                # Application routes, controllers, and core logic
│   ├── plugins/            # Webpack and runtime configuration hooks
│   ├── server.py           # FastAPI entry-point & automatic cloud seeding
│   └── requirements.txt    # Python ecosystem backend dependencies
├── frontend/
│   ├── public/             # System assets, static media, and Favicon configuration
│   ├── src/
│   │   ├── components/     # Reusable global interface components
│   │   ├── constants/      # Centralized end-to-end testing element registries
│   │   ├── context/        # React global state management contexts
│   │   ├── hooks/          # Custom operational React hooks
│   │   ├── lib/            # Encapsulated network layer configurations (Axios config)
│   │   ├── pages/          # Complete view boundaries (Dashboard, Login, Scan UI)
│   │   ├── App.css         # Custom core style overrides
│   │   ├── App.jsx         # Root layout configuration and routing layout
│   │   └── main.jsx        # Application root DOM initialization bridge
│   ├── components.json     # Declarative schema definition for system UI layout
│   ├── craco.config.js     # Webpack optimization and path alias mappings
│   ├── eslint.config.js    # Strict engineering code quality standards config
│   ├── index.html          # Viewport document wrapper template
│   ├── package.json        # Frontend runtime script registry and packages
│   ├── postcss.config.js   # Cascading stylesheets compilation setup
│   ├── tailwind.config.js  # Token design overrides for fluid component styling
│   └── vite.config.js      # Vite compilation engine environment setup
└── Screenshots/            # System deployment visual evaluation documentation

