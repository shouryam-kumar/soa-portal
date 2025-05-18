'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Settings, Lock, Bell, Database, Mail, Shield } from 'lucide-react';

// Dynamically import AdminHeader
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), { 
  ssr: false 
});

export default function AdminSettingsPage() {
  const [dataRetention, setDataRetention] = useState('1 Year');
  return (
    <div className="min-h-screen bg-gray-900">
      <AdminHeader title="Admin Settings" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Configure system preferences and settings</p>
          </div>
        </div>
        
        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield size={24} className="text-blue-500 mr-3" />
              <h2 className="text-xl font-bold text-white">Security Settings</h2>
            </div>
            <p className="text-gray-400 mb-6">Configure security policies, authentication options, and access control.</p>
            
            <div className="space-y-4">
              <div className="bg-gray-750 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock size={18} className="text-gray-400 mr-2" />
                    <span className="text-white">Two-Factor Authentication</span>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-gray-600">
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-gray-300"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-750 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield size={18} className="text-gray-400 mr-2" />
                    <span className="text-white">Admin Access Controls</span>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-blue-600">
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm">
              View All Security Settings
            </button>
          </div>
          
          {/* Notification Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Bell size={24} className="text-yellow-500 mr-3" />
              <h2 className="text-xl font-bold text-white">Notification Settings</h2>
            </div>
            <p className="text-gray-400 mb-6">Configure email notifications, alerts and system messages.</p>
            
            <div className="space-y-4">
              <div className="bg-gray-750 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail size={18} className="text-gray-400 mr-2" />
                    <span className="text-white">Email Notifications</span>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-blue-600">
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-750 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell size={18} className="text-gray-400 mr-2" />
                    <span className="text-white">System Alerts</span>
                  </div>
                  <div className="relative inline-block w-12 h-6 rounded-full bg-blue-600">
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm">
              View All Notification Settings
            </button>
          </div>
          
          {/* System Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Settings size={24} className="text-purple-500 mr-3" />
              <h2 className="text-xl font-bold text-white">System Settings</h2>
            </div>
            <p className="text-gray-400 mb-6">Configure general system settings and preferences.</p>
            
            <div className="space-y-4">
              <div className="bg-gray-750 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database size={18} className="text-gray-400 mr-2" />
                    <span className="text-white">Data Retention</span>
                  </div>
                  <select
                    className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm"
                    value={dataRetention}
                    onChange={e => setDataRetention(e.target.value)}
                  >
                    <option value="30 Days">30 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="1 Year">1 Year</option>
                    <option value="Forever">Forever</option>
                  </select>
                </div>
              </div>
            </div>
            
            <button className="mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm">
              View All System Settings
            </button>
          </div>
          
          {/* Coming Soon */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Settings size={24} className="text-gray-500 mr-3" />
              <h2 className="text-xl font-bold text-white">More Settings Coming Soon</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Additional configuration options are under development. Check back soon for more settings.
            </p>
            
            <div className="bg-gray-750 p-8 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">More settings coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 