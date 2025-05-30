'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, MinusCircle, Calendar, Award, Save, Send } from 'lucide-react';
import { createProposal } from '@/lib/supabase';

interface Milestone {
  id: string;
  title: string;
  description: string;
  points_allocated: number;
  deadline: string;
}

interface ProposalFormProps {
  initialValues?: {
    title: string;
    shortDescription: string;
    description: string;
    type: string;
    fields: string[];
    skills: string[];
    totalPoints: number;
    milestones: Milestone[];
  };
  onSubmit?: (data: any) => Promise<void>;
  editMode?: boolean;
}

export default function ProposalForm({ initialValues, onSubmit, editMode = false }: ProposalFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title || '');
  const [shortDescription, setShortDescription] = useState(initialValues?.shortDescription || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [type, setType] = useState(initialValues?.type || 'project');
  const [fields, setFields] = useState<string[]>(initialValues?.fields || []);
  const [skills, setSkills] = useState<string[]>(initialValues?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [totalPoints, setTotalPoints] = useState(initialValues?.totalPoints || 0);
  const [milestones, setMilestones] = useState<Milestone[]>(initialValues?.milestones || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Available field options
  const fieldOptions = [
    'Development',
    'Content',
    'Design',
    'Community',
    'Research',
    'Marketing',
    'Documentation'
  ];

  // Handle field selection
  const toggleField = (field: string) => {
    if (fields.includes(field)) {
      setFields(fields.filter(f => f !== field));
    } else {
      setFields([...fields, field]);
    }
  };

  // Handle skill input
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Handle milestone changes
  const addMilestone = () => {
    const newId = `milestone_${Date.now()}`;
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 14); // Default deadline is 2 weeks from now
    
    const newMilestone: Milestone = {
      id: newId,
      title: '',
      description: '',
      points_allocated: 0,
      deadline: futureDate.toISOString().split('T')[0]
    };
    
    setMilestones([...milestones, newMilestone]);
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string | number) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
    
    // Recalculate total points if milestone points changed
    if (field === 'points_allocated') {
      const newTotalPoints = milestones.reduce((sum, m) => 
        m.id === id ? sum + Number(value) : sum + m.points_allocated, 0
      );
      setTotalPoints(newTotalPoints);
    }
  };

  const removeMilestone = (id: string) => {
    const removedMilestone = milestones.find(m => m.id === id);
    setMilestones(milestones.filter(m => m.id !== id));
    
    // Adjust total points
    if (removedMilestone) {
      setTotalPoints(totalPoints - removedMilestone.points_allocated);
    }
  };

  // Validation
  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!title.trim()) newErrors.title = 'Title is required';
      if (!shortDescription.trim()) newErrors.shortDescription = 'Summary is required';
      if (shortDescription.length > 150) newErrors.shortDescription = 'Summary should be 150 characters or less';
      if (!description.trim()) newErrors.description = 'Description is required';
      if (!type) newErrors.type = 'Type is required';
      if (fields.length === 0) newErrors.fields = 'At least one field is required';
    }
    
    if (currentStep === 2) {
      if (skills.length === 0) newErrors.skills = 'At least one skill is required';
      if (milestones.length === 0) newErrors.milestones = 'At least one milestone is required';
      
      milestones.forEach((milestone, index) => {
        if (!milestone.title.trim()) {
          newErrors[`milestone_${index}_title`] = 'Milestone title is required';
        }
        if (!milestone.description.trim()) {
          newErrors[`milestone_${index}_description`] = 'Milestone description is required';
        }
        if (milestone.points_allocated <= 0) {
          newErrors[`milestone_${index}_points`] = 'Points must be greater than 0';
        }
        if (!milestone.deadline) {
          newErrors[`milestone_${index}_deadline`] = 'Deadline is required';
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setStep(step - 1);
  };

  // Handle form submission
  const handleSubmit = async (asDraft: boolean = false) => {
    if (!validateStep(step)) {
      return;
    }
    setIsSubmitting(true);
    try {
      // Prepare milestone data
      const milestonesData = milestones.map(m => ({
        title: m.title,
        description: m.description,
        points_allocated: m.points_allocated,
        deadline: m.deadline,
      }));
      // Prepare proposal data
      const proposalData = {
        title,
        shortDescription,
        description,
        type,
        fields,
        skillsRequired: skills,
        totalPoints,
        milestones: milestonesData,
        status: asDraft ? 'draft' : 'submitted'
      };
      if (onSubmit) {
        await onSubmit(proposalData);
      } else {
      await createProposal(proposalData);
      router.push('/proposals');
      router.refresh();
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      setErrors({ submit: 'Failed to submit proposal. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      {errors.submit && (
        <div className="bg-red-900/50 border border-red-900 text-red-300 px-4 py-3 rounded-lg mb-6">
          {errors.submit}
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">{editMode ? 'Edit Proposal' : 'Create New Proposal'}</h1>
          <div className="flex space-x-2">
            <span className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-600'}`}></span>
            <span className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-600'}`}></span>
          </div>
        </div>
        
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a concise title for your proposal"
              />
              {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
            </div>
            
            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium mb-2">
                Summary <span className="text-red-400">*</span> <span className="text-gray-400 text-xs">(150 characters max)</span>
              </label>
              <textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                maxLength={150}
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="A brief summary of your proposal"
              />
              <div className="flex justify-between mt-1">
                <div>
                  {errors.shortDescription && <p className="text-sm text-red-400">{errors.shortDescription}</p>}
                </div>
                <div className="text-xs text-gray-400">
                  {shortDescription.length}/150
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide a detailed description of your proposal"
              />
              {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Type <span className="text-red-400">*</span>
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="type-project"
                    type="radio"
                    value="project"
                    checked={type === 'project'}
                    onChange={() => setType('project')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700"
                  />
                  <label htmlFor="type-project" className="ml-2 text-sm text-gray-300">
                    Project
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="type-bounty"
                    type="radio"
                    value="bounty"
                    checked={type === 'bounty'}
                    onChange={() => setType('bounty')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700"
                  />
                  <label htmlFor="type-bounty" className="ml-2 text-sm text-gray-300">
                    Bounty
                  </label>
                </div>
              </div>
              {errors.type && <p className="mt-1 text-sm text-red-400">{errors.type}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Fields <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {fieldOptions.map((fieldOption) => (
                  <button
                    key={fieldOption}
                    type="button"
                    onClick={() => toggleField(fieldOption)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      fields.includes(fieldOption)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {fieldOption}
                  </button>
                ))}
              </div>
              {errors.fields && <p className="mt-1 text-sm text-red-400">{errors.fields}</p>}
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Skills Required <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill) => (
                  <div key={skill} className="bg-gray-700 text-gray-300 rounded-lg px-3 py-1.5 text-sm flex items-center">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-gray-400 hover:text-red-400"
                    >
                      <MinusCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-grow bg-gray-700 border border-gray-600 rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a required skill"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-4"
                >
                  Add
                </button>
              </div>
              {errors.skills && <p className="mt-1 text-sm text-red-400">{errors.skills}</p>}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">
                  Milestones <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                >
                  <PlusCircle size={16} className="mr-1" />
                  Add Milestone
                </button>
              </div>
              
              {milestones.length === 0 ? (
                <div className="bg-gray-700 border border-gray-600 border-dashed rounded-lg p-6 text-center">
                  <p className="text-gray-400 mb-3">No milestones added yet</p>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm"
                  >
                    Add First Milestone
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Milestone {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeMilestone(milestone.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <MinusCircle size={18} />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor={`milestone-${milestone.id}-title`} className="block text-sm font-medium mb-1">
                            Title <span className="text-red-400">*</span>
                          </label>
                          <input
                            id={`milestone-${milestone.id}-title`}
                            type="text"
                            value={milestone.title}
                            onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Milestone title"
                          />
                          {errors[`milestone_${index}_title`] && (
                            <p className="mt-1 text-sm text-red-400">{errors[`milestone_${index}_title`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor={`milestone-${milestone.id}-description`} className="block text-sm font-medium mb-1">
                            Description <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            id={`milestone-${milestone.id}-description`}
                            value={milestone.description}
                            onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                            rows={2}
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the deliverables for this milestone"
                          />
                          {errors[`milestone_${index}_description`] && (
                            <p className="mt-1 text-sm text-red-400">{errors[`milestone_${index}_description`]}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor={`milestone-${milestone.id}-points`} className="block text-sm font-medium mb-1">
                              OKTO Points <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                              <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                              <input
                                id={`milestone-${milestone.id}-points`}
                                type="number"
                                min="0"
                                value={milestone.points_allocated || ''}
                                onChange={(e) => updateMilestone(milestone.id, 'points_allocated', parseInt(e.target.value) || 0)}
                                className="w-full pl-10 bg-gray-600 border border-gray-500 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                              />
                            </div>
                            {errors[`milestone_${index}_points`] && (
                              <p className="mt-1 text-sm text-red-400">{errors[`milestone_${index}_points`]}</p>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor={`milestone-${milestone.id}-deadline`} className="block text-sm font-medium mb-1">
                              Deadline <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                              <input
                                id={`milestone-${milestone.id}-deadline`}
                                type="date"
                                value={milestone.deadline}
                                onChange={(e) => updateMilestone(milestone.id, 'deadline', e.target.value)}
                                className="w-full pl-10 bg-gray-600 border border-gray-500 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            {errors[`milestone_${index}_deadline`] && (
                              <p className="mt-1 text-sm text-red-400">{errors[`milestone_${index}_deadline`]}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.milestones && <p className="mt-1 text-sm text-red-400">{errors.milestones}</p>}
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Total OKTO Points</h4>
                <span className="text-xl font-bold text-blue-400">{totalPoints}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-6 py-2"
          >
            Back
          </button>
        ) : (
          <div></div>
        )}
        
        <div className="flex space-x-3">
          {step === 2 && (
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className={`flex items-center bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <Save size={18} className="mr-2" />
              Save as Draft
            </button>
          )}
          
          {step < 2 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className={`flex items-center ${editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg px-6 py-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <Send size={18} className="mr-2" />
              {isSubmitting ? (editMode ? 'Saving...' : 'Submitting...') : (editMode ? 'Save Changes' : 'Submit Proposal')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}