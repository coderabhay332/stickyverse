'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

interface WaitlistEntry {
  id: string;
  email: string;
  created_at: string;
}

interface ProfileEntry {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [passkey, setPasskey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [profiles, setProfiles] = useState<ProfileEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if authorized in current session
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('sv_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthorized(true);
      fetchEntries();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const [waitlistRes, profilesRes] = await Promise.all([
        supabase.from('waitlist').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('created_at', { ascending: false }),
      ]);

      if (waitlistRes.error) {
        console.error('Error fetching waitlist:', waitlistRes.error.message);
      } else if (waitlistRes.data) {
        setEntries(waitlistRes.data as WaitlistEntry[]);
      }

      if (profilesRes.error) {
        console.error('Error fetching profiles:', profilesRes.error.message);
      } else if (profilesRes.data) {
        setProfiles(profilesRes.data as ProfileEntry[]);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    // Default passkey is 'stickyadmin'
    if (passkey === 'stickyadmin') {
      setIsAuthorized(true);
      sessionStorage.setItem('sv_admin_auth', 'true');
      fetchEntries();
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid passkey. Access denied.');
    }
  };

  const handleSignOut = () => {
    setIsAuthorized(false);
    sessionStorage.removeItem('sv_admin_auth');
    setEntries([]);
    setProfiles([]);
    setPasskey('');
  };

  const handleDownloadCSV = () => {
    if (entries.length === 0 && profiles.length === 0) {
      alert('No entries to export!');
      return;
    }

    const headers = ['Type', 'Email', 'Name', 'Signup Date'];
    const waitlistRows = entries.map(entry => [
      'Waitlist',
      entry.email,
      '',
      new Date(entry.created_at).toLocaleString()
    ]);
    const profileRows = profiles.map(p => [
      'Signed Up',
      p.email,
      p.name || '',
      new Date(p.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...[...waitlistRows, ...profileRows].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stickyverse_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteEntry = async (id: string, email: string) => {
    if (!window.confirm(`Remove ${email} from waitlist?`)) return;

    try {
      const { error } = await supabase
        .from('waitlist')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Failed to delete entry: ' + error.message);
      } else {
        setEntries(prev => prev.filter(entry => entry.id !== id));
      }
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Passkey Login Page
  if (!isAuthorized) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0C0A1E',
        color: '#F0EEFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        padding: '20px'
      }}>
        <div style={{
          background: '#100D24',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '32px 24px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>
            StickyVerse Admin 🔒
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(240, 238, 255, 0.5)', textAlign: 'center', marginBottom: '24px' }}>
            Enter passkey to view waitlist dashboard
          </p>

          <form onSubmit={handleAuthorize} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              placeholder="Enter passkey..."
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {errorMsg && (
              <div style={{ fontSize: '12px', color: '#EF4444', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                background: '#7C3AED',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Page
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0C0A1E',
      color: '#F0EEFF',
      fontFamily: 'sans-serif',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '20px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
              Waitlist Dashboard 📈
            </h1>
            <p style={{ fontSize: '13.5px', color: 'rgba(240, 238, 255, 0.5)', marginTop: '4px' }}>
              Manage users who joined the waitlist
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={fetchEntries}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleDownloadCSV}
              style={{
                background: '#7C3AED',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📥 Export CSV
            </button>
            <button
              onClick={handleSignOut}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                color: '#EF4444',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Exit
            </button>
          </div>
        </div>

        {/* Info stats */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '20px',
            flex: 1
          }}>
            <div style={{ fontSize: '12px', color: 'rgba(240, 238, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Waitlist Signups
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px', color: '#A78BFA' }}>
              {entries.length}
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '20px',
            flex: 1
          }}>
            <div style={{ fontSize: '12px', color: 'rgba(240, 238, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Registered Users
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px', color: '#10B981' }}>
              {profiles.length}
            </div>
          </div>
        </div>

        {/* Waitlist Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(240, 238, 255, 0.5)' }}>
              Loading waitlist...
            </div>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(240, 238, 255, 0.5)' }}>
              No subscribers on the waitlist yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'rgba(240, 238, 255, 0.6)' }}>Email</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'rgba(240, 238, 255, 0.6)' }}>Signup Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'rgba(240, 238, 255, 0.6)', width: '80px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr 
                      key={entry.id}
                      style={{ 
                        borderBottom: idx === entries.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 500 }}>{entry.email}</td>
                      <td style={{ padding: '14px 16px', color: 'rgba(240, 238, 255, 0.6)' }}>
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteEntry(entry.id, entry.email)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(239, 68, 68, 0.7)',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(239, 68, 68, 0.7)'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Registered Users Table */}
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '40px', marginBottom: '16px' }}>
          Registered Users 👤
        </h2>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(240, 238, 255, 0.5)' }}>
              Loading users...
            </div>
          ) : profiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(240, 238, 255, 0.5)' }}>
              No registered users yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'rgba(240, 238, 255, 0.6)' }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'rgba(240, 238, 255, 0.6)' }}>Email</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'rgba(240, 238, 255, 0.6)' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile, idx) => (
                    <tr
                      key={profile.id}
                      style={{
                        borderBottom: idx === profiles.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 500 }}>{profile.name || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>{profile.email}</td>
                      <td style={{ padding: '14px 16px', color: 'rgba(240, 238, 255, 0.6)' }}>
                        {new Date(profile.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
