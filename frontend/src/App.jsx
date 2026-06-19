import React, { useState, useEffect } from 'react';
import api from './api/axios';

function App() {
  const [healthStatus, setHealthStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'
  const [latency, setLatency] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [errorDetails, setErrorDetails] = useState('');

  const checkHealth = async () => {
    const startTime = performance.now();
    setHealthStatus('checking');
    setErrorDetails('');
    try {
      const response = await api.get('/health');
      if (response.data && response.data.status === 'ok') {
        const endTime = performance.now();
        setLatency(Math.round(endTime - startTime));
        setHealthStatus('connected');
      } else {
        setHealthStatus('disconnected');
        setErrorDetails('Invalid response structure from server.');
      }
    } catch (error) {
      setHealthStatus('disconnected');
      setErrorDetails(error.message || 'Network error or server is down.');
    }
    setLastChecked(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent font-display">
              MERN
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold bg-slate-800 text-slate-400 rounded-full border border-slate-700">
              v1.0.0
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            id="btn-github-link"
            className="text-slate-400 hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            Documentation
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 flex-grow flex flex-col justify-center w-full z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 font-display">
            Premium <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">MERN Stack</span> Starter
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            A fully structured and configured workspace featuring Node.js, Express, MongoDB, React, Redux Toolkit, Tailwind CSS v4, and Axios.
          </p>
        </div>

        {/* Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Backend Status Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 hover:border-slate-700/80 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-300 text-lg">Backend API Health</h3>
                <div className="p-2 bg-indigo-950/50 rounded-lg text-indigo-400 border border-indigo-900/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Validates Node.js & Express server response from the <code className="text-indigo-300 bg-indigo-950/40 px-1.5 py-0.5 rounded text-xs">/api/health</code> endpoint.
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <span id="backend-status-badge" className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  healthStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  healthStatus === 'disconnected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    healthStatus === 'connected' ? 'bg-emerald-400' :
                    healthStatus === 'disconnected' ? 'bg-rose-400' :
                    'bg-amber-400'
                  }`}></span>
                  {healthStatus === 'connected' ? 'OK / Connected' :
                   healthStatus === 'disconnected' ? 'Disconnected' :
                   'Checking...'}
                </span>
              </div>
              {healthStatus === 'connected' && latency && (
                <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                  <span>Latency</span>
                  <span>{latency} ms</span>
                </div>
              )}
              {errorDetails && (
                <div className="mt-2 text-xs text-rose-400 bg-rose-950/20 p-2 rounded border border-rose-900/30 overflow-x-auto whitespace-pre-wrap">
                  {errorDetails}
                </div>
              )}
            </div>
          </div>

          {/* MongoDB Config Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 hover:border-slate-700/80 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-300 text-lg">Mongoose Connection</h3>
                <div className="p-2 bg-emerald-950/50 rounded-lg text-emerald-400 border border-emerald-900/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Monitors standard Mongoose DB handler state. Configured inside <code className="text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded text-xs">config/db.js</code>.
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Database Driver</span>
                <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Mongoose ^8.4.1</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                <span>URI Configuration</span>
                <span className="text-slate-500">Loaded from .env</span>
              </div>
            </div>
          </div>

          {/* Connection Control Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 hover:border-slate-700/80 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-300 text-lg">Diagnostics</h3>
                <div className="p-2 bg-blue-950/50 rounded-lg text-blue-400 border border-blue-900/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Manually trigger API health test or reset connection client states.
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-col gap-2">
              <button
                id="btn-retest-health"
                onClick={checkHealth}
                disabled={healthStatus === 'checking'}
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-98 text-white font-medium text-sm transition-all duration-200 shadow-md shadow-indigo-900/30 disabled:opacity-50 disabled:pointer-events-none"
              >
                {healthStatus === 'checking' ? 'Testing...' : 'Retest Health Endpoint'}
              </button>
              {lastChecked && (
                <div className="text-center text-[10px] text-slate-500 mt-1">
                  Last checked: {lastChecked}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Configurations list */}
        <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 font-display flex items-center space-x-2">
            <span>Stack Configurations</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Backend Tech */}
            <div>
              <h3 className="font-semibold text-slate-300 mb-4 flex items-center text-sm uppercase tracking-wider text-indigo-400">
                Backend Services (/backend)
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 text-sm text-slate-300">
                  <span className="text-indigo-400 mt-0.5">✔</span>
                  <div>
                    <strong className="text-white">Node.js & Express server</strong>
                    <p className="text-slate-400 text-xs">Standard routing, JSON body parsers, cookie parsers, and custom controllers setup.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-sm text-slate-300">
                  <span className="text-indigo-400 mt-0.5">✔</span>
                  <div>
                    <strong className="text-white">CORS (Credentials Allowed)</strong>
                    <p className="text-slate-400 text-xs">Configured to support secure session authentication via HTTP-only cookies.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-sm text-slate-300">
                  <span className="text-indigo-400 mt-0.5">✔</span>
                  <div>
                    <strong className="text-white">Mongoose Drivers</strong>
                    <p className="text-slate-400 text-xs">Connected via MONGO_URI with console logs on DB state changes.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-sm text-slate-300">
                  <span className="text-indigo-400 mt-0.5">✔</span>
                  <div>
                    <strong className="text-white">Auth Package Suite</strong>
                    <p className="text-slate-400 text-xs">JWT, BcryptJS, and cookie-parser installed for token authentication.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Frontend Tech */}
            <div>
              <h3 className="font-semibold text-slate-300 mb-4 flex items-center text-sm uppercase tracking-wider text-blue-400">
                Frontend App (/frontend)
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 text-sm text-slate-300">
                  <span className="text-blue-400 mt-0.5">✔</span>
                  <div>
                    <strong className="text-white">Vite + React Setup</strong>
                    <p className="text-slate-400 text-xs">Extremely fast build times, pre-bundled dev environments, ES modules support.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-sm text-slate-300">
                  <span className="text-blue-400 mt-0.5">✔</span>
                  <div>
                    <strong className="text-white">Tailwind CSS v4</strong>
                    <p className="text-slate-400 text-xs">Modern CSS-first configuration using Vite plugin. Zero JS overhead styling.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-sm text-slate-300">
                  <span className="text-blue-400 mt-0.5">✔</span>
                  <div>
                    <strong className="text-white">Redux Toolkit / State</strong>
                    <p className="text-slate-400 text-xs">Global store configuration via @reduxjs/toolkit and react-redux.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-sm text-slate-300">
                  <span className="text-blue-400 mt-0.5">✔</span>
                  <div>
                    <strong className="text-white">Axios Interceptor ready</strong>
                    <p className="text-slate-400 text-xs">Configured to inherit VITE_API_URL and automatically forward cookie sessions.</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 text-center py-6 text-xs text-slate-500 z-10">
        <p className="mb-1">© {new Date().getFullYear()} MERN Portfolio Starter template.</p>
        <p>Built with React + Vite + Express + MongoDB.</p>
      </footer>

    </div>
  );
}

export default App;
