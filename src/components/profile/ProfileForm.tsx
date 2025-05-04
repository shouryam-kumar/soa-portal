// src/components/profile/ProfileForm.tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
  initialProfile: any;
  userId: string;
}

export default function ProfileForm({ initialProfile, userId }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  
  const [username, setUsername] = useState(initialProfile?.username || '');
  const [fullName, setFullName] = useState(initialProfile?.full_name || '');
  const [bio, setBio] = useState(initialProfile?.bio || '');
  const [walletAddress, setWalletAddress] = useState(initialProfile?.wallet_address || '');
  const [skills, setSkills] = useState<string[]>(initialProfile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: fullName,
          bio,
          wallet_address: walletAddress,
          skills,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      router.refresh();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div 
          className={`
            p-4 rounded-lg flex items-center 
            ${message.type === 'success' 
              ? 'bg-green-900/50 border border-green-800 text-green-300' 
              : 'bg-red-900/50 border border-red-900 text-red-300'
            }
          `}
        >
          {message.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="username" className="flex items-center text-sm font-medium mb-2 text-gray-300">
            <span className="text-blue-400 mr-1">*</span> Username
          </label>
          <input
            id="username"
            type="text"
            required
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700/70 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-2 text-gray-300">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700/70 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-2 text-gray-300">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg bg-gray-700/70 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us a bit about yourself..."
        />
      </div>
      
      <div>
        <label htmlFor="walletAddress" className="block text-sm font-medium mb-2 text-gray-300">
          Wallet Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <input
            id="walletAddress"
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-700/70 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Skills
        </label>
        <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
          {skills.map((skill, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900/60 text-blue-200 border border-blue-800 transition"
            >
              {skill}
              <button
                type="button"
                className="ml-1.5 text-blue-300 hover:text-blue-100 transition focus:outline-none"
                onClick={() => handleRemoveSkill(skill)}
                aria-label={`Remove ${skill}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-1 px-4 py-2.5 rounded-l-lg bg-gray-700/70 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Add a skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
          />
          <button
            type="button"
            className="px-4 py-2.5 rounded-r-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleAddSkill}
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Press Enter or click Add to add a skill. Skills help others know your expertise.
        </p>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          className={`
            w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 
            hover:from-blue-700 hover:to-blue-800 text-white font-medium transition 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
          `}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : 'Save Profile'}
        </button>
      </div>
    </form>
  );
} 