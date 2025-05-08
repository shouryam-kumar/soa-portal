'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { BarChart2, PieChart, LineChart, TrendingUp } from 'lucide-react';

// Dynamically import AdminHeader
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), { 
  ssr: false 
});

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <AdminHeader title="Analytics & Reporting" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-gray-400">View program performance and statistics</p>
          </div>
        </div>
        
        {/* Coming Soon Message */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <BarChart2 size={48} className="text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Analytics Dashboard Coming Soon</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            Our comprehensive analytics dashboard is currently under development. Soon you'll have access to detailed metrics, trend analysis, and exportable reports.
          </p>
          
          {/* Placeholder Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
            <div className="bg-gray-750 p-4 rounded-lg text-center">
              <BarChart2 className="text-purple-500 mx-auto mb-2" size={24} />
              <h3 className="text-white font-medium">Performance Metrics</h3>
            </div>
            <div className="bg-gray-750 p-4 rounded-lg text-center">
              <PieChart className="text-green-500 mx-auto mb-2" size={24} />
              <h3 className="text-white font-medium">User Demographics</h3>
            </div>
            <div className="bg-gray-750 p-4 rounded-lg text-center">
              <LineChart className="text-yellow-500 mx-auto mb-2" size={24} />
              <h3 className="text-white font-medium">Trend Analysis</h3>
            </div>
            <div className="bg-gray-750 p-4 rounded-lg text-center">
              <TrendingUp className="text-blue-500 mx-auto mb-2" size={24} />
              <h3 className="text-white font-medium">Growth Metrics</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 