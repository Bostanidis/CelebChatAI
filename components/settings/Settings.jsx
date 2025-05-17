import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import supabase from '@/utils/supabase/client';
import { User, AtSign, Volume2, Sun, Moon, Monitor, LogOut, Save, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    // Fetch user profile and settings from supabase
    const fetchUserSettings = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, email, sound_enabled, email_notifications')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setProfile({
          username: data.username || '',
          email: data.email || '',
        });
        setSoundEnabled(data.sound_enabled ?? true);
        setEmailNotifications(data.email_notifications ?? true);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setMessage({ type: 'error', text: 'Failed to fetch user settings.' });
      } finally {
        setLoading(false);
      }
    };
    fetchUserSettings();
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          email: profile.email,
        })
        .eq('id', user.id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSoundToggle = async () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ sound_enabled: newSoundEnabled })
        .eq('id', user.id);
      if (error) throw error;
      setMessage({ type: 'success', text: `Sound effects ${newSoundEnabled ? 'enabled' : 'disabled'}.` });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update sound setting.' });
    }
  };

  const handleEmailNotificationsToggle = async () => {
    const newEmailNotifications = !emailNotifications;
    setEmailNotifications(newEmailNotifications);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email_notifications: newEmailNotifications })
        .eq('id', user.id);
      if (error) throw error;
      setMessage({ type: 'success', text: `Email notifications ${newEmailNotifications ? 'enabled' : 'disabled'}.` });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update notification setting.' });
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    
    // Save theme preference to Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ chosen_theme: newTheme })
          .eq('id', user.id);
        if (error) throw error;
      } catch (error) {
        console.error('Error saving theme preference:', error);
        setMessage({ type: 'error', text: 'Failed to save theme preference.' });
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 text-gray-900 dark:text-gray-100 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark dark:from-primary dark:to-primary-light">Settings</h1>
        </div>
        
        {message && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-xl text-sm shadow-sm ${message.type === 'success' ? 'bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800/50' : 'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800/50'}`}
          >
            {message.text}
          </motion.div>
        )}
        
        {/* Profile Section */}
        <motion.section 
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-md p-6 space-y-5 border border-neutral-200/80 dark:border-neutral-700/80"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2 text-primary dark:text-primary-light">
            <User className="w-5 h-5" /> 
            <span>Profile Information</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Username</label>
              <input 
                name="username" 
                value={profile.username} 
                onChange={handleProfileChange} 
                className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900/90 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50 transition-all duration-200" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Email</label>
              <input 
                name="email" 
                type="email" 
                value={profile.email} 
                onChange={handleProfileChange} 
                className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900/90 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary-light/50 transition-all duration-200" 
              />
            </div>
            

          </div>
          
          <div className="flex justify-end pt-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProfileSave} 
              disabled={loading} 
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow"
            >
              {loading ? (
                <>
                  <span className="animate-spin"><Save className="w-4 h-4" /></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.section>
        
        {/* Sound & Notifications */}
        <motion.section 
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-md p-6 space-y-5 border border-neutral-200/80 dark:border-neutral-700/80"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2 text-primary dark:text-primary-light">
            <Bell className="w-5 h-5" /> 
            <span>Preferences</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200/50 dark:border-neutral-700/50">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <span className="text-neutral-800 dark:text-neutral-200">Sound Effects</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={soundEnabled} onChange={handleSoundToggle} />
                <div className="w-12 h-6 bg-neutral-300 dark:bg-neutral-700 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 dark:after:border-neutral-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200/50 dark:border-neutral-700/50">
              <div className="flex items-center gap-3">
                <AtSign className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <span className="text-neutral-800 dark:text-neutral-200">Email Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotifications} onChange={handleEmailNotificationsToggle} />
                <div className="w-12 h-6 bg-neutral-300 dark:bg-neutral-700 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 dark:after:border-neutral-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </motion.section>
        
        {/* Theme Switcher */}
        <motion.section 
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-md p-6 space-y-5 border border-neutral-200/80 dark:border-neutral-700/80"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2 text-primary dark:text-primary-light">
            <Sun className="w-5 h-5" /> 
            <span>Theme</span>
          </h2>
          
          <div className="flex justify-between gap-6">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleThemeChange('light')} 
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200 flex-1 ${theme === 'light' 
                ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20 dark:border-primary-light dark:text-primary-light shadow-md' 
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:border-primary dark:hover:border-primary-light'}`}
            >
              <Sun className="w-5 h-5" /> Light
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleThemeChange('dark')} 
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200 flex-1 ${theme === 'dark' 
                ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20 dark:border-primary-light dark:text-primary-light shadow-md' 
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:border-primary dark:hover:border-primary-light'}`}
            >
              <Moon className="w-5 h-5" /> Dark
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleThemeChange('system')} 
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200 flex-1 ${theme === 'system' 
                ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20 dark:border-primary-light dark:text-primary-light shadow-md' 
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:border-primary dark:hover:border-primary-light'}`}
            >
              <Monitor className="w-5 h-5" /> System
            </motion.button>
          </div>
        </motion.section>
        
        {/* Sign Out */}
        <motion.section className="flex justify-end pt-2">
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: '#ef4444' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </motion.button>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default Settings;