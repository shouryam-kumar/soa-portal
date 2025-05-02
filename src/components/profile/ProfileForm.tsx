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
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 border border-green-800 text-green-300' : 'bg-red-900/50 border border-red-900 text-red-300'}`}>
          {message.text}
        </div>
      )}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-2">
          Username*
        </label>
        <input
          id="username"
          type="text"
          required
          className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-2">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="walletAddress" className="block text-sm font-medium mb-2">
          Wallet Address
        </label>
        <input
          id="walletAddress"
          type="text"
          className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="0x..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Skills
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map((skill, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900 text-blue-200"
            >
              {skill}
              <button
                type="button"
                className="ml-1.5 text-blue-300 hover:text-blue-100"
                onClick={() => handleRemoveSkill(skill)}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-1 px-3 py-2 rounded-l-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
          />
          <button
            type="button"
            className="px-4 py-2 rounded-r-lg bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleAddSkill}
          >
            Add
          </button>
        </div>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}