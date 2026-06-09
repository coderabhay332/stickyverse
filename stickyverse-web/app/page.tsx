'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpen(true);
    setStatus('idle');
    setMessage('');
    setEmail('');
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    setStatus('submitting');
    setMessage('');

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email: email.trim() }]);

      if (error) {
        if (error.code === '23505') {
          setStatus('success');
          setMessage("You're already on the waitlist! ✨");
        } else {
          setStatus('error');
          setMessage(error.message || 'Something went wrong. Please try again.');
        }
      } else {
        setStatus('success');
        setMessage('Welcome to the waitlist! 🚀');
        setEmail('');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        * { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --bg: #0C0A1E;
          --bg2: #100D24;
          --purple: #7C3AED;
          --purple-light: #A78BFA;
          --purple-dark: #6D28D9;
          --pink: #EC4899;
          --text: #F0EEFF;
          --text-2: rgba(240,238,255,0.58);
          --text-3: rgba(240,238,255,0.26);
          --border: rgba(255,255,255,0.07);
          --border-2: rgba(167,139,250,0.28);
          --card: rgba(255,255,255,0.04);
          --font: 'Plus Jakarta Sans', sans-serif;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: var(--font); line-height: 1.6; overflow-x: hidden; }

        /* NAV */
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 56px; height: 64px; display: flex; align-items: center; justify-content: space-between; background: rgba(12,10,30,0.9); backdrop-filter: blur(24px); border-bottom: 0.5px solid var(--border); }
        .nav-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .nav-logo-icon { width: 30px; height: 30px; background: linear-gradient(135deg,#FFE066,#FFC000); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 10px rgba(255,192,0,0.35); flex-shrink: 0; }
        .nav-logo-text { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
        .nav-logo-text span { color: var(--purple-light); }
        .nav-links { display: flex; align-items: center; gap: 36px; }
        .nav-links a { color: var(--text-2); font-size: 14px; font-weight: 400; text-decoration: none; transition: color 0.2s; }
        .nav-links a:hover { color: #fff; }
        .nav-cta { padding: 9px 24px; border-radius: 10px; background: var(--purple); color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; letter-spacing: -0.2px; transition: all 0.2s; box-shadow: 0 4px 16px rgba(124,58,237,0.35); cursor: pointer; }
        .nav-cta:hover { background: var(--purple-dark); transform: translateY(-1px); }

        /* BLOBS & GRID */
        .blob { position: absolute; border-radius: 50%; filter: blur(130px); pointer-events: none; z-index: 0; }
        .dot-grid { position: absolute; inset: 0; background-image: radial-gradient(circle,rgba(255,255,255,0.055) 1px,transparent 1px); background-size: 28px 28px; pointer-events: none; z-index: 0; }

        /* HERO */
        .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 120px 24px 60px; position: relative; overflow: hidden; }
        .hero .blob-1 { width: 700px; height: 700px; background: #7C3AED; opacity: 0.17; top: -250px; left: -200px; }
        .hero .blob-2 { width: 550px; height: 550px; background: #EC4899; opacity: 0.13; bottom: -200px; right: -150px; }
        .hero-inner { position: relative; z-index: 2; max-width: 820px; }
        .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 20px; background: rgba(124,58,237,0.14); border: 0.5px solid rgba(167,139,250,0.3); font-size: 12.5px; font-weight: 500; color: var(--purple-light); margin-bottom: 32px; letter-spacing: 0.1px; }
        .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #A78BFA; animation: blink 2.2s ease-in-out infinite; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        h1 { font-size: clamp(40px,5.5vw,74px); font-weight: 800; line-height: 1.04; letter-spacing: -2.5px; color: #fff; margin-bottom: 24px; }
        h1 em { font-style: normal; color: var(--purple-light); }
        h1 strong { font-style: normal; color: var(--pink); font-weight: 800; }
        .hero-sub { font-size: 18px; font-weight: 300; color: var(--text-2); max-width: 500px; margin: 0 auto 44px; line-height: 1.75; }
        .btn-row { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; margin-bottom: 14px; }
        .btn-p { padding: 15px 34px; border-radius: 12px; background: var(--purple); color: #fff; font-size: 15px; font-weight: 600; text-decoration: none; letter-spacing: -0.2px; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 8px 32px rgba(124,58,237,0.45); cursor: pointer; border: none; }
        .btn-p:hover { background: var(--purple-dark); transform: translateY(-2px); box-shadow: 0 14px 40px rgba(124,58,237,0.55); }
        .btn-s { padding: 15px 30px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 0.5px solid var(--border); color: var(--text); font-size: 15px; font-weight: 400; text-decoration: none; transition: all 0.2s; }
        .btn-s:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.14); }
        .hero-note { font-size: 13px; color: var(--text-3); margin-bottom: 64px; }

        /* PRODUCT IMAGE */
        .product-frame { position: relative; z-index: 2; max-width: 1000px; margin: 0 auto; width: 100%; }
        .product-glow { position: absolute; inset: -2px; border-radius: 20px; background: linear-gradient(135deg,rgba(124,58,237,0.6),rgba(236,72,153,0.25),rgba(124,58,237,0.1)); z-index: 0; filter: blur(1px); }
        .product-inner { position: relative; z-index: 1; border-radius: 18px; overflow: hidden; box-shadow: 0 50px 150px rgba(0,0,0,0.85); border: 0.5px solid rgba(255,255,255,0.1); }
        .product-img { width: 100%; display: block; border-radius: 18px; }

        /* PROBLEM */
        .section { padding: 100px 24px; position: relative; }
        .container { max-width: 1080px; margin: 0 auto; }
        .eyebrow { font-size: 11.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--purple-light); margin-bottom: 16px; }
        h2 { font-size: clamp(30px,3.8vw,50px); font-weight: 800; letter-spacing: -1.8px; line-height: 1.08; color: #fff; margin-bottom: 16px; }
        .sec-sub { font-size: 17px; font-weight: 300; color: var(--text-2); max-width: 480px; line-height: 1.75; }
        .prob-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 56px; }
        .prob-card { border-radius: 18px; padding: 30px; background: var(--card); border: 0.5px solid var(--border); position: relative; overflow: hidden; transition: border-color 0.2s; }
        .prob-card:hover { border-color: rgba(255,255,255,0.12); }
        .prob-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 18px 18px 0 0; }
        .pc1::after { background: linear-gradient(90deg,#EF4444,transparent); }
        .pc2::after { background: linear-gradient(90deg,#F59E0B,transparent); }
        .pc3::after { background: linear-gradient(90deg,#EC4899,transparent); }
        .prob-em { font-size: 30px; margin-bottom: 18px; }
        .prob-title { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; color: #fff; margin-bottom: 10px; }
        .prob-desc { font-size: 14px; font-weight: 300; color: var(--text-2); line-height: 1.75; }
        .prob-quote { display: block; margin-top: 16px; padding: 11px 14px; background: rgba(255,255,255,0.03); border-radius: 10px; font-size: 13px; color: var(--text-3); font-style: italic; border-left: 2px solid rgba(255,255,255,0.08); }
        .solve-wrap { text-align: center; margin-top: 48px; }
        .solve-arrow { font-size: 24px; color: var(--purple-light); margin-bottom: 12px; }
        .solve-text { font-size: 24px; font-weight: 700; letter-spacing: -0.8px; color: var(--purple-light); }

        /* FEATURES */
        .feat-section { padding: 100px 24px; background: rgba(16,13,36,0.6); }
        .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 56px; }
        .feat { background: var(--card); border: 0.5px solid var(--border); border-radius: 16px; padding: 26px; transition: all 0.2s; cursor: default; }
        .feat:hover { border-color: var(--border-2); transform: translateY(-3px); background: rgba(124,58,237,0.06); }
        .feat-ico { width: 46px; height: 46px; border-radius: 13px; background: rgba(124,58,237,0.14); border: 0.5px solid rgba(167,139,250,0.18); display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 18px; }
        .feat-t { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; color: #fff; margin-bottom: 8px; }
        .feat-d { font-size: 14px; font-weight: 300; color: var(--text-2); line-height: 1.75; }

        /* HOW IT WORKS */
        .hiw-section { padding: 100px 24px; }
        .hiw-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; margin-top: 64px; position: relative; }
        .hiw-grid::before { content: ''; position: absolute; top: 27px; left: 16%; right: 16%; height: 1px; background: linear-gradient(90deg,transparent,rgba(167,139,250,0.3),transparent); }
        .hiw-step { padding: 0 28px; text-align: center; }
        .step-n { width: 54px; height: 54px; border-radius: 50%; background: rgba(124,58,237,0.12); border: 0.5px solid var(--border-2); display: flex; align-items: center; justify-content: center; margin: 0 auto 22px; font-size: 17px; font-weight: 800; color: var(--purple-light); letter-spacing: -0.5px; }
        .step-t { font-size: 18px; font-weight: 700; letter-spacing: -0.4px; color: #fff; margin-bottom: 10px; }
        .step-d { font-size: 14px; font-weight: 300; color: var(--text-2); line-height: 1.75; }

        /* TEMPLATES */
        .tmpl-section { padding: 100px 24px; background: rgba(16,13,36,0.6); }
        .tmpl-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-top: 48px; }
        .tmpl-card { background: var(--card); border: 0.5px solid var(--border); border-radius: 14px; padding: 20px 16px; border-left: 3px solid; cursor: pointer; transition: all 0.2s; }
        .tmpl-card:hover { background: rgba(124,58,237,0.07); transform: translateY(-2px); }
        .tmpl-em { font-size: 24px; margin-bottom: 10px; }
        .tmpl-name { font-size: 13.5px; font-weight: 600; letter-spacing: -0.2px; color: #fff; margin-bottom: 3px; }
        .tmpl-cat { font-size: 11px; color: var(--text-3); font-weight: 400; }

        /* PROOF */
        .proof-section { padding: 100px 24px; }
        .proof-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 56px; }
        .tweet { background: var(--card); border: 0.5px solid var(--border); border-radius: 18px; padding: 26px; transition: border-color 0.2s; }
        .tweet:hover { border-color: var(--border-2); }
        .tweet-hd { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .tweet-av { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; flex-shrink: 0; }
        .tweet-nm { font-size: 14px; font-weight: 600; color: #fff; letter-spacing: -0.2px; }
        .tweet-hn { font-size: 12px; color: var(--text-3); margin-top: 1px; }
        .tweet-body { font-size: 14px; font-weight: 300; color: var(--text-2); line-height: 1.75; margin-bottom: 14px; }
        .tweet-stars { color: #F59E0B; font-size: 13px; letter-spacing: 2px; }

        /* PRICING */
        .price-section { padding: 100px 24px; background: rgba(16,13,36,0.6); }
        .price-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 56px; max-width: 760px; margin-left: auto; margin-right: auto; }
        .plan { background: var(--card); border: 0.5px solid var(--border); border-radius: 22px; padding: 36px; position: relative; }
        .plan.hot { border-color: var(--border-2); background: rgba(124,58,237,0.07); }
        .plan.hot::before { content: 'Most Popular'; position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: var(--purple); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 16px; border-radius: 10px; white-space: nowrap; letter-spacing: 0.2px; }
        .plan-nm { font-size: 12px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--text-2); margin-bottom: 10px; }
        .plan-pr { font-size: 54px; font-weight: 800; letter-spacing: -2.5px; color: #fff; line-height: 1; margin-bottom: 5px; }
        .plan-pr span { font-size: 18px; font-weight: 400; color: var(--text-2); letter-spacing: 0; }
        .plan-ps { font-size: 13px; color: var(--text-3); margin-bottom: 28px; }
        .plan-div { height: 0.5px; background: var(--border); margin-bottom: 28px; }
        .plan-feats { display: flex; flex-direction: column; gap: 11px; margin-bottom: 30px; }
        .pf { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; font-weight: 400; color: var(--text-2); line-height: 1.5; }
        .pf.off { color: var(--text-3); }
        .pf-y { color: #10B981; flex-shrink: 0; font-size: 13px; margin-top: 2px; font-weight: 700; }
        .pf-n { color: var(--text-3); flex-shrink: 0; font-size: 13px; margin-top: 2px; }
        .plan-btn { display: block; width: 100%; padding: 14px; border-radius: 13px; font-size: 14px; font-weight: 600; letter-spacing: -0.2px; text-align: center; text-decoration: none; cursor: pointer; border: none; transition: all 0.2s; font-family: var(--font); }
        .pb-free { background: transparent; border: 0.5px solid var(--border); color: var(--text); }
        .pb-free:hover { background: rgba(255,255,255,0.06); }
        .pb-pro { background: var(--purple); color: #fff; box-shadow: 0 6px 24px rgba(124,58,237,0.4); }
        .pb-pro:hover { background: var(--purple-dark); transform: translateY(-1px); }

        /* CTA */
        .cta-section { padding: 100px 24px; text-align: center; position: relative; overflow: hidden; }
        .cta-blob { position: absolute; width: 600px; height: 600px; background: #7C3AED; opacity: 0.14; border-radius: 50%; filter: blur(110px); top: 50%; left: 50%; transform: translate(-50%,-50%); }
        .cta-inner { position: relative; z-index: 2; max-width: 600px; margin: 0 auto; }
        .cta-h { font-size: clamp(34px,4.5vw,60px); font-weight: 800; letter-spacing: -2px; line-height: 1.06; color: #fff; margin-bottom: 18px; }
        .cta-sub { font-size: 17px; font-weight: 300; color: var(--text-2); margin-bottom: 42px; line-height: 1.7; }
        .cta-micro { margin-top: 16px; font-size: 13px; color: var(--text-3); }

        /* FOOTER */
        footer { padding: 36px 56px; border-top: 0.5px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .foot-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .foot-logo-icon { width: 26px; height: 26px; background: linear-gradient(135deg,#FFE066,#FFC000); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .foot-logo-text { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.4px; }
        .foot-logo-text span { color: var(--purple-light); }
        .foot-links { display: flex; gap: 28px; }
        .foot-links a { font-size: 13px; color: var(--text-3); text-decoration: none; font-weight: 400; transition: color 0.2s; }
        .foot-links a:hover { color: var(--text); }
        .foot-x { display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 0.5px solid var(--border); text-decoration: none; transition: background 0.2s; }
        .foot-x:hover { background: rgba(255,255,255,0.09); }
        .foot-x-ico { width: 17px; height: 17px; background: rgba(255,255,255,0.92); border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #0C0A1E; flex-shrink: 0; }
        .foot-x span { font-size: 13px; color: var(--text-2); font-weight: 500; }
        .foot-copy { width: 100%; text-align: center; font-size: 12px; color: var(--text-3); padding-top: 8px; }

        /* STICKY NOTES SHOWCASE */
        .wall-section { padding: 100px 24px; overflow: hidden; }
        .wall { display: flex; flex-wrap: wrap; gap: 22px; justify-content: center; margin-top: 56px; padding: 44px; background: rgba(0,0,0,0.28); border-radius: 22px; border: 0.5px solid var(--border); position: relative; }
        .wall::before { content: ''; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='0.8' fill='%23ffffff' fill-opacity='0.025'/%3E%3C/svg%3E"); border-radius: 22px; pointer-events: none; }
        .scard { border-radius: 14px; padding: 16px; width: 188px; position: relative; font-family: 'Caveat', cursive; box-shadow: 0 1px 3px rgba(0,0,0,0.15),0 4px 12px rgba(0,0,0,0.14),0 8px 24px rgba(0,0,0,0.11),0 20px 48px rgba(0,0,0,0.09); }
        .scard-pin { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; z-index: 2; }
        .scard-pin-h { width: 13px; height: 13px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.35); }
        .scard-pin-s { width: 2px; height: 10px; background: rgba(0,0,0,0.25); border-radius: 0 0 2px 2px; }
        .scard-tape { position: absolute; top: -8px; left: 50%; transform: translateX(-50%) rotate(-0.5deg); width: 52px; height: 16px; border-radius: 2px; opacity: 0.58; z-index: 2; }
        .sc-ttl { font-size: 16px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; line-height: 1.25; }
        .sc-bdy { font-size: 13px; color: #1a1a2e; opacity: 0.72; line-height: 1.65; }
        .sc-badge { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; margin-bottom: 7px; font-family: 'Plus Jakarta Sans', sans-serif; }
        .sc-ft { margin-top: 10px; padding-top: 8px; border-top: 0.5px solid rgba(0,0,0,0.08); font-size: 10px; color: rgba(0,0,0,0.28); font-family: 'Plus Jakarta Sans', sans-serif; }
        .sc-dark .sc-ttl, .sc-dark .sc-bdy { color: #fff; opacity: 1; }
        .sc-dark .sc-bdy { opacity: 0.8; }
        .sc-dark .sc-ft { color: rgba(255,255,255,0.25); border-top-color: rgba(255,255,255,0.07); }
        .sc-ck { display: flex; flex-direction: column; gap: 5px; }
        .sc-ck-r { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #1a1a2e; }
        .sc-ck-r.done { opacity: 0.38; text-decoration: line-through; }
        .sc-cb { width: 11px; height: 11px; border-radius: 3px; flex-shrink: 0; }
        .sc-cb.on { background: #7C3AED; }
        .sc-cb.off { border: 1.5px solid rgba(0,0,0,0.2); }
        .sc-bl { display: flex; flex-direction: column; gap: 4px; }
        .sc-bl-r { display: flex; align-items: flex-start; gap: 5px; font-size: 12.5px; color: #1a1a2e; line-height: 1.4; }
        .sc-bl-d { width: 4px; height: 4px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; opacity: 0.35; background: #1a1a2e; }

        /* CUSTOM MODAL OVERRIDES */
        .w-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(12, 10, 30, 0.75);
          backdrop-filter: blur(16px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: wFadeIn 0.2s ease-out;
        }
        .w-modal {
          background: #100D24;
          border: 1px solid rgba(167, 139, 250, 0.25);
          border-radius: 18px;
          width: 100%;
          max-width: 440px;
          padding: 36px 28px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 30px rgba(124,58,237,0.15);
          position: relative;
          animation: wSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .w-modal-close {
          position: absolute;
          top: 18px;
          right: 18px;
          background: none;
          border: none;
          color: rgba(240, 238, 255, 0.4);
          font-size: 20px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .w-modal-close:hover { color: #fff; }
        .w-modal-title { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.8px; margin-bottom: 8px; text-align: center; }
        .w-modal-desc { font-size: 14px; color: rgba(240, 238, 255, 0.6); text-align: center; margin-bottom: 24px; line-height: 1.5; }
        .w-modal-form { display: flex; flex-direction: column; gap: 12px; }
        .w-modal-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 12px 16px;
          color: #fff;
          font-size: 14.5px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
        }
        .w-modal-input:focus {
          border-color: #A78BFA;
          background: rgba(124, 58, 237, 0.08);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
        }
        .w-modal-submit {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          background: #7C3AED;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
        .w-modal-submit:hover { background: #6D28D9; }
        .w-modal-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .w-modal-msg { font-size: 13.5px; text-align: center; margin-top: 12px; border-radius: 8px; padding: 10px; }
        .w-modal-msg.success { background: rgba(16, 185, 129, 0.12); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .w-modal-msg.error { background: rgba(239, 68, 68, 0.12); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.2); }

        @keyframes wFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media(max-width: 900px) {
          nav { padding: 0 20px; }
          .nav-links { display: none; }
          .prob-grid, .feat-grid, .proof-grid, .hiw-grid { grid-template-columns: 1fr; }
          .tmpl-grid { grid-template-columns: repeat(2, 1fr); }
          .price-grid { grid-template-columns: 1fr; }
          .hiw-grid::before { display: none; }
          footer { flex-direction: column; text-align: center; padding: 28px 20px; }
          .foot-links { flex-wrap: wrap; justify-content: center; }
        }
      ` }} />

      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">
          <div className="nav-logo-icon">📝</div>
          <div className="nav-logo-text">Sticky<span>Verse</span></div>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#templates">Templates</a>
          <a href="#pricing">Pricing</a>
        </div>
        <button onClick={openModal} className="nav-cta" style={{ border: 'none' }}>Join Waitlist →</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="dot-grid"></div>
        <div className="hero-inner">
          <div className="badge"><div className="badge-dot"></div> Waitlist open — launching soon</div>
          <h1>Stop confusing<br /><em>being busy</em> with<br />getting <strong>things done.</strong></h1>
          <p className="hero-sub">StickyVerse is a productivity workspace that lives in your Chrome new tab — so every time you open a tab, you see exactly what matters.</p>
          <div className="btn-row">
            <button onClick={openModal} className="btn-p">✦ Join the Waitlist — Free</button>
            <a href="#features" className="btn-s">See how it works</a>
          </div>
          <p className="hero-note">No credit card · Free plan at launch · Works with Chrome</p>
        </div>

        {/* PRODUCT IMAGE */}
        <div className="product-frame" style={{ marginTop: '64px' }}>
          <div className="product-glow"></div>
          <div className="product-inner">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1000' height='562'%3E%3Crect width='1000' height='562' fill='%23100D24'/%3E%3Ctext x='500' y='270' font-family='sans-serif' font-size='18' fill='%23ffffff44' text-anchor='middle'%3EReplace with your StickyVerse screenshot%3C/text%3E%3Ctext x='500' y='300' font-family='sans-serif' font-size='13' fill='%23ffffff22' text-anchor='middle'%3E%3Cimg src%3D%22your-screenshot.png%22 alt%3D%22StickyVerse%22 class%3D%22product-img%22%3E%3C/text%3E%3C/svg%3E" alt="StickyVerse product screenshot" className="product-img" style={{ opacity: 0.5 }} />
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section">
        <div className="container">
          <div className="eyebrow">The Problem</div>
          <h2>You are working hard.<br />But is it working?</h2>
          <p className="sec-sub">Founders and freelancers lose hours every week not because they are lazy — but because nothing keeps them focused.</p>
          <div className="prob-grid">
            <div className="prob-card pc1">
              <div className="prob-em">🗂️</div>
              <div className="prob-title">Your notes are everywhere</div>
              <div className="prob-desc">Notion, Apple Notes, WhatsApp saved messages, random docs. You know the feeling — looking for something you wrote yesterday and finding nothing.</div>
              <span className="prob-quote">"I wrote it somewhere but I can't find it."</span>
            </div>
            <div className="prob-card pc2">
              <div className="prob-em">🔄</div>
              <div className="prob-title">You start the day with no clear plan</div>
              <div className="prob-desc">Every morning feels like you are starting from scratch. Without a system that shows up automatically, important work keeps getting pushed.</div>
              <span className="prob-quote">"I was busy all day but got nothing done."</span>
            </div>
            <div className="prob-card pc3">
              <div className="prob-em">⏳</div>
              <div className="prob-title">The important gets buried by the urgent</div>
              <div className="prob-desc">You end the day feeling unproductive — not because you didn't work, but because the right things never stayed in front of you.</div>
              <span className="prob-quote">"Another full day and I'm still behind."</span>
            </div>
          </div>
          <div className="solve-wrap">
            <div className="solve-arrow">↓</div>
            <div className="solve-text">StickyVerse keeps what matters visible — always.</div>
          </div>
        </div>
      </section>

      {/* STICKY NOTES WALL */}
      <section className="wall-section">
        <div className="container">
          <div className="eyebrow">The Wall</div>
          <h2>Your workspace.<br />Every single tab.</h2>
          <p className="sec-sub">Real sticky note cards — rotated, pinned, textured. A wall that looks like your actual desk, not another flat app.</p>
          <div className="wall">
            {/* Card 1 Yellow */}
            <div className="scard" style={{ background: 'linear-gradient(145deg,#FFF9C4,#FFF176)', transform: 'rotate(-2.5deg)', color: '#1a1a2e' }}>
              <div className="scard-pin"><div className="scard-pin-h" style={{ background: '#F59E0B' }}></div><div className="scard-pin-s"></div></div>
              <span className="sc-badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#1D4ED8' }}>🔄 In Progress</span>
              <div className="sc-ttl">Today's Plan ☀️</div>
              <div className="sc-ck">
                <div className="sc-ck-r done"><div className="sc-cb on"></div>Workout 30 mins</div>
                <div className="sc-ck-r done"><div className="sc-cb on"></div>Read 20 pages</div>
                <div className="sc-ck-r"><div className="sc-cb off"></div>Ship StickyVerse</div>
                <div className="sc-ck-r"><div className="sc-cb off"></div>Post on X</div>
              </div>
              <div className="sc-ft">9 Jun · 09:15 AM</div>
            </div>
            {/* Card 2 Purple */}
            <div className="scard" style={{ background: 'linear-gradient(145deg,#EDE9FE,#DDD6FE)', transform: 'rotate(2.2deg)', marginTop: '24px', color: '#1a1a2e' }}>
              <div className="scard-pin"><div className="scard-pin-h" style={{ background: '#7C3AED' }}></div><div className="scard-pin-s"></div></div>
              <div className="sc-ttl">Design Ideas 💡</div>
              <div className="sc-bl">
                <div className="sc-bl-r"><div className="sc-bl-d"></div>Glassmorphism UI</div>
                <div className="sc-bl-r"><div className="sc-bl-d"></div>Neon gradients</div>
                <div className="sc-bl-r"><div className="sc-bl-d"></div>3D icons</div>
                <div className="sc-bl-r"><div className="sc-bl-d"></div>Paper texture</div>
              </div>
              <div className="sc-ft">9 Jun · 11:32 AM</div>
            </div>
            {/* Card 3 Dark */}
            <div className="scard sc-dark" style={{ background: 'linear-gradient(145deg,#1E1B4B,#0D0B2A)', transform: 'rotate(-1.2deg)' }}>
              <div style={{ fontFamily: 'Caveat, cursive', fontSize: '36px', color: '#EC4899', lineHeight: 0.6, marginBottom: '10px' }}>"</div>
              <div className="sc-bdy" style={{ color: '#fff', fontSize: '14px', lineHeight: 1.55, opacity: 1 }}>The best way to predict the future is to create it.</div>
              <div style={{ fontFamily: 'Caveat, cursive', fontSize: '12px', color: '#EC4899', marginTop: '8px' }}>— Peter Drucker</div>
              <div className="sc-ft">9 Jun · 10:45 AM</div>
            </div>
            {/* Card 4 Pink */}
            <div className="scard" style={{ background: 'linear-gradient(145deg,#FCE4EC,#F8BBD0)', transform: 'rotate(2.8deg)', marginTop: '-14px', color: '#1a1a2e' }}>
              <div className="scard-tape" style={{ background: 'rgba(251,182,206,0.72)' }}></div>
              <div className="sc-ttl">Books to Read 📚</div>
              <div className="sc-bl">
                <div className="sc-bl-r"><div className="sc-bl-d" style={{ background: 'rgba(190,18,60,0.3)' }}></div>Atomic Habits</div>
                <div className="sc-bl-r"><div className="sc-bl-d" style={{ background: 'rgba(190,18,60,0.3)' }}></div>Deep Work</div>
                <div className="sc-bl-r"><div className="sc-bl-d" style={{ background: 'rgba(190,18,60,0.3)' }}></div>Zero to One</div>
              </div>
              <div className="sc-ft">9 Jun · 07:30 AM</div>
            </div>
            {/* Card 5 Green */}
            <div className="scard" style={{ background: 'linear-gradient(145deg,#ECFDF5,#A7F3D0)', transform: 'rotate(-2deg)', marginTop: '18px', color: '#1a1a2e' }}>
              <div className="scard-pin"><div className="scard-pin-h" style={{ background: '#10B981' }}></div><div className="scard-pin-s"></div></div>
              <span className="sc-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#047857' }}>✅ Completed</span>
              <div className="sc-ttl">Today's Goal 🎯</div>
              <div className="sc-bdy">Build something people love.</div>
              <div className="sc-ft">9 Jun · 09:00 AM</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="feat-section" id="features">
        <div className="container">
          <div className="eyebrow">Features</div>
          <h2>Everything in one place.<br />Zero switching.</h2>
          <p className="sec-sub">Built for people who are tired of juggling ten tools just to stay on top of their day.</p>
          <div className="feat-grid">
            <div className="feat"><div className="feat-ico">📌</div><div className="feat-t">Notes Wall</div><div className="feat-d">Real sticky note cards with pushpins, rotation, and paper texture. Your wall looks alive — not like another flat productivity app.</div></div>
            <div className="feat"><div className="feat-ico">🎯</div><div className="feat-t">Daily Focus</div><div className="feat-d">Pin your one most important task at the top. It stays visible all day and auto clears at midnight so every morning starts fresh.</div></div>
            <div className="feat"><div className="feat-ico">⚡</div><div className="feat-t">Quick Capture</div><div className="feat-d">Press Space anywhere on your wall. Type your thought. Press Enter. Note drops instantly. The fastest way to capture an idea ever built into a browser.</div></div>
            <div className="feat"><div className="feat-ico">🔗</div><div className="feat-t">Link Vault</div><div className="feat-d">Save any URL as a visual card. Never lose an important link across 50 open tabs again.</div></div>
            <div className="feat"><div className="feat-ico">📋</div><div className="feat-t">Templates</div><div className="feat-d">Daily Plan, Client Brief, Brain Dump, Twitter Thread and more. One click creates a pre-filled note ready to go.</div></div>
            <div className="feat"><div className="feat-ico">🍅</div><div className="feat-t">Pomodoro</div><div className="feat-d">Built-in focus timer. 25 minute work sessions with breaks. Always visible in your workspace without switching apps.</div></div>
            <div className="feat"><div className="feat-ico">📊</div><div className="feat-t">Work Stats</div><div className="feat-d">Notes created, tasks completed, focus time. Know exactly how your day is going at a glance — no separate dashboard needed.</div></div>
            <div className="feat"><div className="feat-ico">🔔</div><div className="feat-t">Reminders</div><div className="feat-d">Set one-time, daily, or weekly reminders on any note. Chrome fires the notification exactly when you need it.</div></div>
            <div className="feat"><div className="feat-ico">📥</div><div className="feat-t">CSV Export</div><div className="feat-d">Your notes, your data. Export everything with status, timestamps, and tags anytime. No lock-in, ever.</div></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="hiw-section">
        <div className="container">
          <div className="eyebrow">How It Works</div>
          <h2>Running in 60 seconds.</h2>
          <div className="hiw-grid">
            <div className="hiw-step">
              <div className="step-n">01</div>
              <div className="step-t">Install the extension</div>
              <div className="step-d">One click from the Chrome Web Store. No account required. No forms. Just install and it works.</div>
            </div>
            <div className="hiw-step">
              <div className="step-n">02</div>
              <div className="step-t">Your wall appears</div>
              <div className="step-d">Every new tab opens your StickyVerse workspace — ready for notes, tasks, and focus. Instantly.</div>
            </div>
            <div className="hiw-step">
              <div className="step-n">03</div>
              <div className="step-t">Press Space and start</div>
              <div className="step-d">Hit Space to capture any thought. Set your daily focus. Your productivity wall is live.</div>
            </div>
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section className="tmpl-section" id="templates">
        <div className="container">
          <div className="eyebrow">Templates</div>
          <h2>Start in seconds.</h2>
          <p className="sec-sub">Pre-built templates for work, personal, creators, students, and founders. Click once — your note is ready to fill.</p>
          <div className="tmpl-grid">
            <div className="tmpl-card" style={{ borderLeftColor: '#7C3AED' }}><div className="tmpl-em">☀️</div><div className="tmpl-name">Daily Plan</div><div className="tmpl-cat">Work</div></div>
            <div className="tmpl-card" style={{ borderLeftColor: '#3B82F6' }}><div className="tmpl-em">📅</div><div className="tmpl-name">Weekly Review</div><div className="tmpl-cat">Work</div></div>
            <div className="tmpl-card" style={{ borderLeftColor: '#EC4899' }}><div className="tmpl-em">🎙️</div><div className="tmpl-name">Meeting Notes</div><div className="tmpl-cat">Work</div></div>
            <div className="tmpl-card" style={{ borderLeftColor: '#10B981' }}><div className="tmpl-em">💼</div><div className="tmpl-name">Client Brief</div><div className="tmpl-cat">Work</div></div>
            <div className="tmpl-card" style={{ borderLeftColor: '#F59E0B' }}><div className="tmpl-em">⚡</div><div className="tmpl-name">Brain Dump</div><div className="tmpl-cat">Personal</div></div>
            <div className="tmpl-card" style={{ borderLeftColor: '#8B5CF6' }}><div className="tmpl-em">🌅</div><div className="tmpl-name">Morning Routine</div><div className="tmpl-cat">Personal</div></div>
            <div className="tmpl-card" style={{ borderLeftColor: '#06B6D4' }}><div className="tmpl-em">🐦</div><div className="tmpl-name">Twitter Thread</div><div className="tmpl-cat">Creator</div></div>
            <div className="tmpl-card" style={{ borderLeftColor: '#F97316' }}><div className="tmpl-em">💡</div><div className="tmpl-name">Content Idea</div><div className="tmpl-cat">Creator</div></div>
            <div className="tmpl-card" style={{ borderLeftColor: '#7C3AED' }}><div className="tmpl-em">🚀</div><div className="tmpl-name">Idea Validation</div><div className="tmpl-cat">Founder</div></div>
            <div className="tmpl-card" style={{ borderLeftColor: '#EF4444' }}><div className="tmpl-em">🎯</div><div className="tmpl-name">Launch Plan</div><div className="tmpl-cat">Founder</div></div>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="proof-section">
        <div className="container">
          <div className="eyebrow">Early Feedback</div>
          <h2>People already feel this.</h2>
          <div className="proof-grid">
            <div className="tweet">
              <div className="tweet-hd">
                <div className="tweet-av" style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA' }}>LM</div>
                <div><div className="tweet-nm">Lucas Mendes</div><div className="tweet-hn">@lucasbuilds · São Paulo</div></div>
              </div>
              <div className="tweet-body">"I was ending every day feeling like I had accomplished nothing — even after 10 hour work days. StickyVerse is the first thing that actually kept my real priorities visible all day."</div>
              <div className="tweet-stars">★★★★★</div>
            </div>
            <div className="tweet">
              <div className="tweet-hd">
                <div className="tweet-av" style={{ background: 'rgba(236,72,153,0.2)', color: '#EC4899' }}>AW</div>
                <div><div className="tweet-nm">Aisha Wanjiku</div><div className="tweet-hn">@aishacreates · Nairobi</div></div>
              </div>
              <div className="tweet-body">"As a freelancer managing multiple clients, I was drowning in scattered notes and missed follow-ups. Having everything on one wall the moment I open Chrome changed how I work completely."</div>
              <div className="tweet-stars">★★★★★</div>
            </div>
            <div className="tweet">
              <div className="tweet-hd">
                <div className="tweet-av" style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981' }}>RP</div>
                <div><div className="tweet-nm">Rohan Pillai</div><div className="tweet-hn">@rohanshipfast · Bangalore</div></div>
              </div>
              <div className="tweet-body">"I used to start every morning by checking what I had to do across 5 different apps. Now I just open a new tab. The Daily Focus bar alone saved me 30 minutes of mental overhead every single day."</div>
              <div className="tweet-stars">★★★★★</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="price-section" id="pricing">
        <div className="container">
          <div className="eyebrow">Pricing</div>
          <h2>Start free.<br />Upgrade when ready.</h2>
          <p className="sec-sub">Free plan is free forever — not a trial. No credit card needed at launch.</p>
          <div className="price-grid">
            <div className="plan">
              <div className="plan-nm">Free</div>
              <div className="plan-pr">$0<span>/mo</span></div>
              <div className="plan-ps">No signup needed at launch</div>
              <div className="plan-div"></div>
              <div className="plan-feats">
                <div className="pf"><span className="pf-y">✓</span>Up to 20 notes</div>
                <div className="pf"><span className="pf-y">✓</span>5 saved links</div>
                <div className="pf"><span className="pf-y">✓</span>5 templates</div>
                <div className="pf"><span className="pf-y">✓</span>Daily Focus bar</div>
                <div className="pf"><span className="pf-y">✓</span>Pomodoro timer</div>
                <div className="pf off"><span className="pf-n">✕</span>Reminders</div>
                <div className="pf off"><span className="pf-n">✕</span>CSV export</div>
                <div className="pf off"><span className="pf-n">✕</span>All templates</div>
              </div>
              <button onClick={openModal} className="plan-btn pb-free">Join Waitlist</button>
            </div>
            <div className="plan hot">
              <div className="plan-nm">Pro</div>
              <div className="plan-pr">$12<span>/mo</span></div>
              <div className="plan-ps">Everything you need. Nothing you don't.</div>
              <div className="plan-div"></div>
              <div className="plan-feats">
                <div className="pf"><span className="pf-y">✓</span>Unlimited notes</div>
                <div className="pf"><span className="pf-y">✓</span>Unlimited links</div>
                <div className="pf"><span className="pf-y">✓</span>All templates</div>
                <div className="pf"><span className="pf-y">✓</span>Reminders</div>
                <div className="pf"><span className="pf-y">✓</span>CSV export</div>
                <div className="pf"><span className="pf-y">✓</span>Eisenhower Matrix</div>
                <div className="pf"><span className="pf-y">✓</span>Kanban Board view</div>
                <div className="pf"><span className="pf-y">✓</span>Priority support</div>
              </div>
              <button onClick={openModal} className="plan-btn pb-pro">Join Waitlist</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-blob"></div>
        <div className="cta-inner">
          <div className="cta-h">Your most productive<br />day starts now.</div>
          <p className="cta-sub">Join the waitlist. Be first when StickyVerse launches. Free plan included — no card needed.</p>
          <div className="btn-row">
            <button onClick={openModal} className="btn-p" style={{ fontSize: '16px', padding: '17px 40px' }}>✦ Join the Waitlist — It's Free</button>
          </div>
          <p className="cta-micro">No spam · No credit card · Unsubscribe anytime</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <a href="#" className="foot-logo">
          <div className="foot-logo-icon">📝</div>
          <div className="foot-logo-text">Sticky<span>Verse</span></div>
        </a>
        <div className="foot-links">
          <a href="#features">Features</a>
          <a href="#templates">Templates</a>
          <a href="#pricing">Pricing</a>
        </div>
        <a href="https://x.com/zero2tenx" target="_blank" className="foot-x">
          <div className="foot-x-ico">𝕏</div>
          <span>@zero2tenx</span>
        </a>
        <div className="foot-copy">Built with ✦ by @zero2tenx</div>
      </footer>

      {/* WAITLIST EMAIL COLLECTION MODAL */}
      {modalOpen && (
        <div className="w-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="w-modal">
            <button className="w-modal-close" onClick={closeModal} aria-label="Close modal">×</button>
            
            <h2 className="w-modal-title">Join the Waitlist ✨</h2>
            <p className="w-modal-desc">
              Be the first to know when we launch the StickyVerse Chrome extension. Free plan included.
            </p>

            <form onSubmit={handleSubmit} className="w-modal-form">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                className="w-modal-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'submitting'}
              />
              <button
                type="submit"
                className="w-modal-submit"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Saving...' : 'Secure My Spot ✦'}
              </button>
            </form>

            {status === 'success' && (
              <div className="w-modal-msg success">
                {message || "Successfully joined the waitlist! See you on the inside! 🎉"}
              </div>
            )}

            {status === 'error' && (
              <div className="w-modal-msg error">
                {message || "An error occurred. Please try again."}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
