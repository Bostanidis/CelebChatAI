"use client"

import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Settings from '@/components/settings/Settings';

export default function SettingsPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen py-12 bg-neutral-100 dark:bg-neutral-900">
        <div className="flex items-center justify-center h-full py-24">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-5xl px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl bg-white/80 dark:bg-neutral-800/50 backdrop-blur-sm shadow-lg border border-neutral-200/50 dark:border-neutral-700/50">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-neutral-600 dark:text-neutral-400">Loading settings...</span>
          </div>
        ) : (
          <Settings />
        )}
      </div>
    </div>
  );
}