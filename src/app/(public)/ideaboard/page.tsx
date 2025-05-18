'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, FileText, Tag, Users, ArrowRight, ArrowUpRight, X, CheckSquare, Square } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

// In a real implementation, these would come from your Supabase database
const ideas = [
  {
    id: 1,
    title: 'ZeroPass: Cross-Chain KYC-Free Web3 Passport',
    description: 'Privacy-preserving identity verification system using zkProofs and SBTs.',
    type: 'project',
    fields: ['Development'],
    skills: ['Web3 Development', 'Okto SDK', 'Solana', 'EVM', 'HyperLiquid'],
    points: 101000
  },
  {
    id: 2,
    title: 'Okto SDK Playground',
    description: 'Interactive learning environment for developers to experiment with Okto SDK features.',
    type: 'project',
    fields: ['Development', 'Content'],
    skills: ['React', 'Node.js', 'Web3.js/Viem', 'API Integrations'],
    points: 45000
  },
  {
    id: 3,
    title: 'Okto CLI',
    description: 'Command-line interface for interacting with Okto ecosystem services.',
    type: 'project',
    fields: ['Development'],
    skills: ['Node.js', 'CLI Development', 'JavaScript/TypeScript', 'Okto SDK Integration'],
    points: 30000
  },
  {
    id: 4,
    title: 'Gasless Transaction Demo',
    description: 'Create a demo app showcasing gasless transactions with Okto.',
    type: 'bounty',
    fields: ['Development', 'Content'],
    skills: ['Web3 Development', 'Okto SDK', 'Ethereum Smart Contracts'],
    points: 25000
  },
  {
    id: 5,
    title: 'Okto Pay: Merchant Integration Plugin',
    description: 'Create a plugin for easy integration of Okto payments into e-commerce platforms.',
    type: 'project',
    fields: ['Development'],
    skills: ['Web3 Payments', 'ECommerce Integration', 'API Development'],
    points: 60000
  },
  {
    id: 6,
    title: 'Voice-Controlled dApp Interactions',
    description: 'Build voice command functionality for interacting with dApps using Okto SDK.',
    type: 'project',
    fields: ['Development'],
    skills: ['NLP', 'Voice Recognition', 'Web3 Development'],
    points: 50000
  },
  {
    id: 7,
    title: 'Okto Documentation Revamp',
    description: 'Improve and expand the existing Okto SDK documentation with more examples and tutorials.',
    type: 'bounty',
    fields: ['Documentation', 'Content'],
    skills: ['Technical Writing', 'Web3 Knowledge', 'Developer Experience'],
    points: 20000
  },
  {
    id: 8,
    title: 'Okto Idea Board',
    description: 'Create a community-driven idea board for Okto ecosystem projects.',
    type: 'project',
    fields: ['Development', 'Community', 'Content'],
    skills: ['React', 'Node.js', 'Firebase/Auth0', 'Web3.js/Viem', 'Okto SDK', 'UI/UX Design'],
    points: 35000
  },
  {
    id: 9,
    title: 'Educational Workshops for Okto SDK',
    description: 'Create and deliver a series of educational workshops for developers on using Okto SDK.',
    type: 'bounty',
    fields: ['Content', 'Education'],
    skills: ['Technical Education', 'Public Speaking', 'Web3 Development'],
    points: 15000
  },
  {
    id: 10,
    title: 'Okto Explorer Chrome Extension',
    description: 'Build a Chrome extension for exploring and interacting with Okto-powered applications.',
    type: 'bounty',
    fields: ['Development'],
    skills: ['Chrome Extension', 'JavaScript', 'Web3'],
    points: 25000
  },
  {
    id: 11,
    title: 'Open Hacks: Build on Okto in Regional Hackathons',
    description: 'Organize and facilitate Okto-focused hackathons in different regions.',
    type: 'bounty',
    fields: ['Development', 'Community'],
    skills: ['Event Organization', 'Community Building', 'Web3 Development'],
    points: 40000
  },
  {
    id: 12,
    title: 'Okto Integration for Popular Wallets',
    description: 'Create integration libraries for connecting Okto to popular Web3 wallets.',
    type: 'project',
    fields: ['Development'],
    skills: ['Web3 Development', 'Wallet Integration', 'API Design'],
    points: 55000
  }
];

export default function IdeaboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract types, fields, and skills from the ideas data
  const allTypes = [...new Set(ideas.map(idea => idea.type))];
  const allFields = [...new Set(ideas.flatMap(idea => idea.fields))];
  
  // Parse URL parameters
  const typeFilter = searchParams.get('type') || '';
  const fieldsFilter = searchParams.get('fields')?.split(',').filter(Boolean) || [];
  const skillsFilter = searchParams.get('skills')?.split(',').filter(Boolean) || [];
  
  // State for filters
  const [selectedType, setSelectedType] = useState(typeFilter);
  const [selectedFields, setSelectedFields] = useState<string[]>(fieldsFilter);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(skillsFilter);
  const [showFieldsDropdown, setShowFieldsDropdown] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  
  // Get all available skills based on selected fields
  const availableSkills = [...new Set(
    ideas
      .filter(idea => 
        (selectedType ? idea.type === selectedType : true) &&
        (selectedFields.length > 0 ? selectedFields.some(field => idea.fields.includes(field)) : true)
      )
      .flatMap(idea => idea.skills)
  )];
  
  // Filter ideas based on selections
  const filteredIdeas = ideas.filter(idea => {
    // Filter by type if selected
    if (selectedType && idea.type !== selectedType) return false;
    
    // Filter by fields if any selected
    if (selectedFields.length > 0 && !selectedFields.some(field => idea.fields.includes(field))) return false;
    
    // Filter by skills if any selected
    if (selectedSkills.length > 0 && !selectedSkills.some(skill => idea.skills.includes(skill))) return false;
    
    return true;
  });
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedType) {
      params.set('type', selectedType);
    }
    
    if (selectedFields.length > 0) {
      params.set('fields', selectedFields.join(','));
    }
    
    if (selectedSkills.length > 0) {
      params.set('skills', selectedSkills.join(','));
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/ideaboard${newUrl}`, { scroll: false });
  }, [selectedType, selectedFields, selectedSkills, router]);
  
  // Toggle field selection
  const toggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field) 
        : [...prev, field]
    );
    
    // Clear skills that are no longer available due to field changes
    setSelectedSkills(prev => {
      const updatedFields = selectedFields.includes(field) 
        ? selectedFields.filter(f => f !== field) 
        : [...selectedFields, field];
      
      const newAvailableSkills = [...new Set(
        ideas
          .filter(idea => 
            (selectedType ? idea.type === selectedType : true) &&
            (updatedFields.length > 0 ? updatedFields.some(f => idea.fields.includes(f)) : true)
          )
          .flatMap(idea => idea.skills)
      )];
      
      return prev.filter(skill => newAvailableSkills.includes(skill));
    });
  };
  
  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setSelectedType('');
    setSelectedFields([]);
    setSelectedSkills([]);
  };
  
  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Idea Board</h1>
            <Link href="/proposals/new">
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm">
                Submit Your Own Idea
              </button>
            </Link>
          </div>
          
          <div className="mb-6 bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-sm text-gray-300 mb-6">
              <p>The ideas presented in this idea board are just suggestions to help you get started. We welcome proposals for any kind of idea that can help the Okto ecosystem grow.</p>
              <p className="mt-2">Whether you're a builder, content creator, community manager, or have a different skill set entirely, we encourage you to apply with your innovative and interesting concepts.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Filter by Type</label>
                <div className="relative">
                  <select
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {allTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Field Filter - Multi-select */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Filter by Fields</label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
                    onClick={() => {
                      setShowFieldsDropdown(!showFieldsDropdown);
                      setShowSkillsDropdown(false);
                    }}
                  >
                    <span className="truncate">
                      {selectedFields.length === 0 
                        ? 'Select Fields' 
                        : `${selectedFields.length} field${selectedFields.length > 1 ? 's' : ''} selected`}
                    </span>
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showFieldsDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                      <div className="p-2">
                        {allFields.map((field) => (
                          <div 
                            key={field} 
                            className="flex items-center px-3 py-2 hover:bg-gray-600 rounded cursor-pointer"
                            onClick={() => toggleField(field)}
                          >
                            {selectedFields.includes(field) ? (
                              <CheckSquare size={18} className="mr-2 text-blue-400" />
                            ) : (
                              <Square size={18} className="mr-2 text-gray-400" />
                            )}
                            <span>{field}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Skills Filter - Multi-select, filtered by fields */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Filter by Skills</label>
                <div className="relative">
                  <button
                    type="button"
                    className={`w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center ${
                      selectedFields.length === 0 ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    onClick={() => {
                      if (selectedFields.length > 0) {
                        setShowSkillsDropdown(!showSkillsDropdown);
                        setShowFieldsDropdown(false);
                      }
                    }}
                    disabled={selectedFields.length === 0}
                  >
                    <span className="truncate">
                      {selectedFields.length === 0 
                        ? 'Select fields first' 
                        : selectedSkills.length === 0 
                          ? 'Select Skills' 
                          : `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`}
                    </span>
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showSkillsDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                      <div className="p-2">
                        {availableSkills.length > 0 ? (
                          availableSkills.map((skill) => (
                            <div 
                              key={skill} 
                              className="flex items-center px-3 py-2 hover:bg-gray-600 rounded cursor-pointer"
                              onClick={() => toggleSkill(skill)}
                            >
                              {selectedSkills.includes(skill) ? (
                                <CheckSquare size={18} className="mr-2 text-blue-400" />
                              ) : (
                                <Square size={18} className="mr-2 text-gray-400" />
                              )}
                              <span>{skill}</span>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-gray-400">No skills available for selected fields</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Selected Filters Display */}
            {(selectedType || selectedFields.length > 0 || selectedSkills.length > 0) && (
              <div className="mt-4 flex justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  {selectedType && (
                    <div className="bg-blue-900/30 text-blue-300 rounded-lg px-3 py-1.5 text-sm flex items-center">
                      <FileText size={14} className="mr-2" />
                      Type: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                      <button 
                        className="ml-2 text-blue-300 hover:text-blue-200"
                        onClick={() => setSelectedType('')}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  
                  {selectedFields.map((field) => (
                    <div key={field} className="bg-green-900/30 text-green-300 rounded-lg px-3 py-1.5 text-sm flex items-center">
                      <Tag size={14} className="mr-2" />
                      Field: {field}
                      <button 
                        className="ml-2 text-green-300 hover:text-green-200"
                        onClick={() => toggleField(field)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {selectedSkills.map((skill) => (
                    <div key={skill} className="bg-purple-900/30 text-purple-300 rounded-lg px-3 py-1.5 text-sm flex items-center">
                      <Users size={14} className="mr-2" />
                      Skill: {skill}
                      <button 
                        className="ml-2 text-purple-300 hover:text-purple-200"
                        onClick={() => toggleSkill(skill)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={clearAllFilters}
                  className="text-gray-400 hover:text-gray-300 text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <h2 className="text-lg font-medium">
              Showing {filteredIdeas.length} {filteredIdeas.length === 1 ? 'idea' : 'ideas'}
              {(selectedType || selectedFields.length > 0 || selectedSkills.length > 0) && ' matching your filters'}
            </h2>
          </div>
          
          {/* Ideas Table */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Field</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Skills Required</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">OKTO Points</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredIdeas.map((idea) => (
                  <tr key={idea.id} className="hover:bg-gray-750">
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                            idea.type === 'project' 
                              ? 'bg-blue-900/50 text-blue-300' 
                              : 'bg-purple-900/50 text-purple-300'
                          }`}>
                            {idea.type.charAt(0).toUpperCase() + idea.type.slice(1)}
                          </span>
                          <h3 className="font-medium">{idea.title}</h3>
                        </div>
                        <p className="text-sm text-gray-400">{idea.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {idea.fields.map((field, index) => (
                          <button 
                            key={index}
                            onClick={() => toggleField(field)}
                            className={`bg-green-900/30 text-green-300 rounded-full px-2 py-0.5 text-xs hover:bg-green-900/50 ${
                              selectedFields.includes(field) ? 'ring-1 ring-green-400' : ''
                            }`}
                          >
                            {field}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {idea.skills.slice(0, 3).map((skill, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              // Only toggle if the field is also selected
                              const fieldSelected = idea.fields.some(field => selectedFields.includes(field));
                              if (fieldSelected) toggleSkill(skill);
                            }}
                            className={`bg-gray-700 rounded-full px-2 py-0.5 text-xs hover:bg-gray-600 ${
                              selectedSkills.includes(skill) ? 'ring-1 ring-purple-400 text-purple-300' : 'text-gray-300'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                        {idea.skills.length > 3 && (
                          <span className="bg-gray-700 rounded-full px-2 py-0.5 text-xs">
                            +{idea.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-blue-400">{idea.points.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Link href={`/proposals/new?idea=${idea.id}`}>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1.5 text-sm inline-flex items-center">
                          Apply
                          <ArrowUpRight size={14} className="ml-1" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredIdeas.length === 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 text-center">
              <h3 className="text-xl font-medium text-gray-300 mb-2">No ideas match your filters</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your filters or submit your own proposal with a new idea.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={clearAllFilters}
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-5 py-2.5"
                >
                  Clear Filters
                </button>
                <Link href="/proposals/new">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5">
                    Submit Your Own Idea
                  </button>
                </Link>
              </div>
            </div>
          )}
          
          <div className="bg-blue-900/30 border border-blue-900 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold mb-3">Note for Rewards</h2>
            <p className="text-gray-300 mb-2">
              OKTO represents tokens that will be airdropped to your Okto wallet at TGE. OKTO is primarily allocated for project contributions.
            </p>
            <p className="text-gray-300">
              Okto Points symbolize rewards credited pre-TGE into your Okto wallet and convert to OKTO tradable at TGE. Okto Points are usually awarded for bounty completions. Following TGE, all project and bounty rewards will be distributed directly in OKTO.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}