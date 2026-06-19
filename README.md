# MERN Stack Project Starter

A fully configured and clean structure for a modern MERN stack development project.

## Directory Structure

```text
/
├── backend/
│   ├── config/             # DB and core server configurations
│   ├── controllers/        # Express request handlers
│   ├── models/             # Mongoose database models
│   ├── routes/             # API routes definition
│   ├── middleware/         # Custom Express middlewares
│   ├── server.js           # Express main server entry point
│   ├── .env.example        # Reference environment variables
│   ├── .env                # Local secrets (git-ignored)
│   └── package.json        # Backend dependencies & scripts
│
└── frontend/
    ├── src/
    │   ├── api/            # API client configurations (Axios)
    │   ├── components/     # Reusable UI components
    │   ├── layouts/        # Page layout wrappers
    │   ├── pages/          # Routing entry views
    │   ├── redux/          # Redux toolkit store modules
    │   ├── App.jsx         # Main application component
    │   ├── index.css       # Tailwind CSS v4 styling file
    │   └── main.jsx        # React entry mount point
    │
    ├── .env                # Local frontend variables
    ├── vite.config.js      # Vite build configuration (including Tailwind v4)
    └── package.json        # Frontend dependencies & scripts
```

---

## Setup & Running Guide

Ensure you have [Node.js](https://nodejs.org) installed on your system.

### 1. Backend Setup

1. Open a terminal and navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell, use `copy .env.example .env`)*
4. Run the development server (runs on port `5000` by default):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server (runs on port `5173` by default):
   ```bash
   npm run dev
   ```

---

## Architecture & Features

### Backend Integration
- **Mongoose / MongoDB**: Fully integrated connection handler inside `backend/config/db.js` with structured success/error notifications.
- **Security Middlewares**: `cors` initialized supporting cookie-session configurations and `cookie-parser` for authentication tokens.
- **REST Endpoints**: Initial `/api/health` diagnostics check endpoint for server validation.

### Frontend Integration
- **Tailwind CSS v4**: Set up using modern CSS-first `@theme` settings and `@tailwindcss/vite` plugin.
- **State Management**: `@reduxjs/toolkit` and `react-redux` configured and ready.
- **API Client**: Customized Axios instance (`frontend/src/api/axios.js`) ready to make requests with automatic cookie inclusion.
