'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useUIStore } from '@/stores/uiStore';
import clsx from 'clsx';

type SettingsSection = 'profile' | 'api-keys' | 'preferences' | 'billing' | 'security';

const SECTIONS: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'api-keys',
    label: 'API Keys',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Security',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

function InputField({ label, id, type = 'text', placeholder, defaultValue }: { label: string; id: string; type?: string; placeholder?: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function ToggleSwitch({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted',
        )}
      >
        <span
          className={clsx(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { sidebarCollapsed, theme, setTheme } = useUIStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">Manage your personal information and account details.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">U</div>
              <div>
                <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Upload photo</button>
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Full Name" id="name" placeholder="Your name" defaultValue="John Doe" />
              <InputField label="Email" id="email" type="email" placeholder="you@example.com" defaultValue="john@thunders.ai" />
              <InputField label="Company" id="company" placeholder="Your company" defaultValue="Thunders AI" />
              <InputField label="Location" id="location" placeholder="City, Country" defaultValue="San Francisco, CA" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bio" className="text-sm font-medium text-foreground">Bio</label>
              <textarea id="bio" rows={3} placeholder="Tell us about yourself" defaultValue="AI Engineer passionate about building intelligent systems." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </div>
        );

      case 'api-keys':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">API Keys</h2>
                <p className="text-sm text-muted-foreground">Manage your API keys for programmatic access.</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create Key
              </button>
            </div>
            <div className="rounded-lg border border-border divide-y divide-border">
              {[
                { name: 'Production', prefix: 'sk-prod-***...a3f2', created: 'Jan 10, 2024', lastUsed: '2 hours ago' },
                { name: 'Development', prefix: 'sk-dev-***...7b91', created: 'Dec 5, 2023', lastUsed: '5 days ago' },
                { name: 'Staging', prefix: 'sk-stg-***...4c08', created: 'Nov 20, 2023', lastUsed: 'Never' },
              ].map((key) => (
                <div key={key.name} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{key.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{key.prefix}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created: {key.created}</span>
                    <span>Last used: {key.lastUsed}</span>
                    <button className="text-destructive hover:text-destructive/80 transition-colors font-medium">Revoke</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Preferences</h2>
              <p className="text-sm text-muted-foreground">Customize your dashboard experience and defaults.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Theme</label>
              <div className="flex gap-3">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={clsx(
                      'rounded-md border px-4 py-2 text-sm font-medium capitalize transition-colors',
                      theme === t ? 'border-primary bg-primary/10 text-primary' : 'border-input text-foreground hover:bg-accent',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-border">
              <ToggleSwitch label="Email Notifications" description="Receive email alerts for important events" defaultChecked />
              <ToggleSwitch label="In-App Notifications" description="Show notifications within the dashboard" defaultChecked />
              <ToggleSwitch label="Model Error Alerts" description="Get notified when a model encounters an error" defaultChecked />
              <ToggleSwitch label="Usage Alerts" description="Alert when usage exceeds 80% of budget" defaultChecked />
              <ToggleSwitch label="Auto-collapse Sidebar" description="Collapse sidebar on smaller screens" defaultChecked={false} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="defaultModel" className="text-sm font-medium text-foreground">Default Model</label>
              <select id="defaultModel" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="gpt-4o">GPT-4o</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="gemini-pro">Gemini 1.5 Pro</option>
                <option value="llama-3-70b">Llama 3 70B</option>
              </select>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Billing</h2>
              <p className="text-sm text-muted-foreground">View your usage costs and manage your billing details.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Month Spend</p>
                  <p className="text-3xl font-bold">$342.18</p>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Pro Plan</div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: '68%' }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">$342.18 of $500.00 monthly limit (68%)</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Monthly Budget Limit</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <input type="number" defaultValue={500} className="h-10 w-32 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <ToggleSwitch label="Budget Alerts" description="Receive notifications when spending exceeds 80% of your budget" defaultChecked />
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Security</h2>
              <p className="text-sm text-muted-foreground">Manage your account security and authentication settings.</p>
            </div>
            <div className="space-y-4">
              <InputField label="Current Password" id="currentPassword" type="password" placeholder="Enter current password" />
              <InputField label="New Password" id="newPassword" type="password" placeholder="Enter new password" />
              <InputField label="Confirm Password" id="confirmPassword" type="password" placeholder="Confirm new password" />
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <button className="rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">Enable 2FA</button>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Active Sessions</h3>
              <div className="space-y-3">
                {[
                  { device: 'Chrome on macOS', location: 'San Francisco, US', current: true },
                  { device: 'Safari on iPhone', location: 'San Francisco, US', current: false },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">{session.device}</p>
                      <p className="text-xs text-muted-foreground">{session.location}</p>
                    </div>
                    {session.current ? (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Current</span>
                    ) : (
                      <button className="text-xs text-destructive hover:text-destructive/80 transition-colors font-medium">Revoke</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
              <p className="mt-1 text-xs text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button className="mt-3 rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className={clsx('transition-all duration-300', sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64')}>
        <div className="p-4 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <nav className="lg:w-56 flex-shrink-0">
              <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={clsx(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors w-full text-left',
                        activeSection === section.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      )}
                    >
                      {section.icon}
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Content Area */}
            <div className="flex-1 max-w-2xl">
              <div className="rounded-xl border border-border bg-card p-6">
                {renderSection()}

                {/* Save Button */}
                <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
                  <button
                    onClick={handleSave}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button className="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
                    Cancel
                  </button>
                  {saved && (
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
                      ✓ Changes saved
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
