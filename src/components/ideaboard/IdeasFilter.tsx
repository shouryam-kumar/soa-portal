'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowDown } from 'lucide-react';

interface IdeasFilterProps {
  allTypes: string[];
  allFields: string[];
  allSkills: string[];
}

export default function IdeasFilter({ allTypes, allFields, allSkills }: IdeasFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const typeFilter = searchParams.get('type') || '';
  const fieldFilter = searchParams.get('field') || '';
  const skillFilter = searchParams.get('skill') || '';
  
  const handleFilterChange = (paramName: string, value: string) => {
    // Create a new URLSearchParams object with current query parameters
    const params = new URLSearchParams(searchParams.toString());
    
    // Update the specific parameter
    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }
    
    // Navigate to the new URL
    router.push(`/ideaboard?${params.toString()}`);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-400">Filter by Type</label>
        <div className="relative">
          <select
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            value={typeFilter}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            {allTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ArrowDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Field Filter */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-400">Filter by Field</label>
        <div className="relative">
          <select
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            value={fieldFilter}
            onChange={(e) => handleFilterChange('field', e.target.value)}
          >
            <option value="">All Fields</option>
            {allFields.map((field) => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ArrowDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Skill Filter */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-400">Filter by Skill</label>
        <div className="relative">
          <select
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            value={skillFilter}
            onChange={(e) => handleFilterChange('skill', e.target.value)}
          >
            <option value="">All Skills</option>
            {allSkills.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ArrowDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
} 