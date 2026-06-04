import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Import constants
const THEMES = [
  { id:'void',    bg:'#0C0A1E', label:'Dark Void',  em:'🌑',
    body:'#0C0A1E', b1:'#7C3AED', b2:'#4C1D95', b3:'#6D28D9', b4:'#EC4899',
    accent:'#A78BFA', text:'#ffffff', sidebar:'rgba(15,12,40,0.85)', card:'rgba(255,255,255,0.05)' },
  { id:'minimal', bg:'#F0EEE8', label:'Minimal',    em:'🤍',
    body:'#F0EEE8', b1:'#C4B5FD', b2:'#E0D7FF', b3:'#DDD6FE', b4:'#FBCFE8',
    accent:'#7C3AED', text:'#1a1a2e', sidebar:'rgba(240,238,232,0.92)', card:'rgba(0,0,0,0.05)' },
  { id:'cyber',   bg:'#030C06', label:'Cyber',      em:'🟩',
    body:'#030C06', b1:'#065f46', b2:'#042e2e', b3:'#10B981', b4:'#34D399',
    accent:'#34D399', text:'#e0fff4', sidebar:'rgba(3,12,6,0.92)',  card:'rgba(16,185,129,0.08)' },
  { id:'lofi',    bg:'#0F0A04', label:'Lo-fi',      em:'☕',
    body:'#0F0A04', b1:'#78350f', b2:'#451a03', b3:'#92400e', b4:'#D97706',
    accent:'#F59E0B', text:'#fef3c7', sidebar:'rgba(15,10,4,0.92)',  card:'rgba(245,158,11,0.08)' },
  { id:'ocean',   bg:'#020d1a', label:'Ocean',      em:'🌊',
    body:'#020d1a', b1:'#1e3a5f', b2:'#0c4a6e', b3:'#0369a1', b4:'#38bdf8',
    accent:'#38bdf8', text:'#e0f2fe', sidebar:'rgba(2,13,26,0.92)',  card:'rgba(56,189,248,0.08)' },
  { id:'rose',    bg:'#1a0510', label:'Rose',       em:'🌹',
    body:'#1a0510', b1:'#9f1239', b2:'#881337', b3:'#be123c', b4:'#fb7185',
    accent:'#fb7185', text:'#fff1f2', sidebar:'rgba(26,5,16,0.92)',  card:'rgba(251,113,133,0.08)' },
  { id:'galaxy',  bg:'#080516', label:'Galaxy',     em:'🌌',
    body:'#080516', b1:'#312e81', b2:'#1e1b4b', b3:'#4f46e5', b4:'#818cf8',
    accent:'#818cf8', text:'#eef2ff', sidebar:'rgba(8,5,22,0.92)',   card:'rgba(129,140,248,0.08)' },
  { id:'forest',  bg:'#051209', label:'Forest',     em:'🌲',
    body:'#051209', b1:'#14532d', b2:'#052e16', b3:'#166534', b4:'#4ade80',
    accent:'#4ade80', text:'#f0fdf4', sidebar:'rgba(5,18,9,0.92)',   card:'rgba(74,222,128,0.08)' },
];

// Make THEMES available globally
window.THEMES = THEMES;

// Initialize React app
const container = document.getElementById('root');
if (!container) {
  // Create root element if it doesn't exist
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
