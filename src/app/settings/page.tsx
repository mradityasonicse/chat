'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, loadFromStorage } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState('system');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (user?.profile && mounted) {
      setDisplayName(user.profile.displayName || '');
      setBio(user.profile.bio || '');
    }
  }, [user, mounted]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ displayName, bio })
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          theme,
          notificationsEnabled,
          soundEnabled
        })
      });

      if (response.ok) {
        setSuccess('Settings updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated) {
    return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <Link href="/dashboard" className="text-brand-400 hover:text-brand-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-semibold text-white">Settings</h1>
        </div>

        {success && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {/* Profile Settings */}
        <Card className="mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Profile</h2>
            <p className="text-slate-400 text-sm">Update your profile information</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              type="text"
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            <Button type="submit" loading={loading}>
              Save Profile
            </Button>
          </form>
        </Card>

        {/* Preferences */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Preferences</h2>
            <p className="text-slate-400 text-sm">Customize your experience</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-300">Enable notifications</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-300">Enable notification sounds</span>
              </label>
            </div>

            <Button type="submit" loading={loading}>
              Save Preferences
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
