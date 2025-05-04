// app/page.tsx
'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Award, 
  Users, 
  FileText, 
  ArrowRight, 
  Code, 
  Zap, 
  BookOpen, 
  Globe, 
  PenTool, 
  Calendar, 
  Sparkles, 
  LucideRocket,
  ChevronRight, 
  Github,
  Star,
  MessageSquare,
  Heart,
  Briefcase
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

// Timeline data
interface TimelineItem {
  date: string;
  title: string;
  description: string;
}

const timelineData: TimelineItem[] = [
  {
    date: 'May 15, 2025',
    title: 'Program Launch',
    description: 'Official kickoff of the Summer of Abstraction program'
  },
  {
    date: 'May 30, 2025',
    title: 'Proposal Deadline',
    description: 'Last day to submit your project proposals'
  },
  {
    date: 'June 5, 2025',
    title: 'Projects Announced',
    description: 'Selected projects and participants announced'
  },
  {
    date: 'June 10, 2025',
    title: 'Development Phase Begins',
    description: 'Start building and implementing your projects'
  },
  {
    date: 'August 15, 2025',
    title: 'Submission Deadline',
    description: 'Final deadline for project submissions'
  },
  {
    date: 'August 30, 2025',
    title: 'Winners Announced',
    description: 'Program winners and rewards distribution'
  }
];

// Types for Counter and GradientText components
interface CounterProps {
  value: string;
  label: string;
  icon: ReactNode;
}

interface GradientTextProps {
  text: string;
  className?: string;
}

// Stats counter animation
const Counter = ({ value, label, icon }: CounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (isInView) {
      const target = parseInt(value.replace(/,/g, ''));
      const duration = 2000; // ms
      const step = Math.ceil(target / (duration / 16)); // 60fps
      
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);
  
  // Format with commas
  const formattedCount = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  return (
    <div ref={ref} className="bg-gray-800/50 border border-gray-700/70 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 group hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-900/20 group-hover:bg-blue-900/40 transition-colors duration-300">
        {icon}
      </div>
      <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mb-2">
        {isInView ? formattedCount : '0'}
      </div>
      <div className="text-gray-300 font-medium">{label}</div>
    </div>
  );
};

// Animated gradient text
const GradientText = ({ text, className = "" }: GradientTextProps) => {
  return (
    <span className={`bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text ${className}`}>
      {text}
    </span>
  );
};

export default function Home() {
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const timelineRef = useRef(null);
  const whyParticipateRef = useRef(null);
  const whoIsItForRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  
  const isTimelineInView = useInView(timelineRef, { once: true, amount: 0.2 });
  const isWhyParticipateInView = useInView(whyParticipateRef, { once: true, amount: 0.2 });
  const isWhoIsItForInView = useInView(whoIsItForRef, { once: true, amount: 0.2 });
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.2 });
  const isCtaInView = useInView(ctaRef, { once: true, amount: 0.5 });
  
  // Parallax effect for hero section
  const rocketY = useTransform(scrollY, [0, 500], [0, -100]);
  const textOpacity = useTransform(scrollY, [0, 200], [1, 0.5]);
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  
  return (
    <>
      <main className="flex-1 overflow-auto">
        {/* Hero Section with Parallax */}
        <section 
          ref={heroRef}
          className="relative min-h-[85vh] flex items-center overflow-hidden"
        >
          {/* Background Elements */}
          <motion.div 
            className="absolute inset-0 z-0" 
            style={{ y: backgroundY }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-indigo-900/80 to-purple-900/80"></div>
            <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-30"></div>
            
            {/* Floating Shapes */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/3 left-1/2 w-48 h-48 bg-pink-500 rounded-full filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </motion.div>
          
          <div className="container mx-auto px-6 py-10 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
              <motion.div 
                className="lg:w-3/5"
                style={{ opacity: textOpacity }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2 text-sm text-blue-200 backdrop-blur-sm mb-6">
                  <Sparkles size={16} className="mr-2 text-blue-300" />
                  <span>Applications Open for 2025</span>
                </div>
                
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                  <GradientText text="Summer of" className="mr-2" />
                  <br />
                  <span className="text-6xl text-white">ABSTRACTION</span>
                </h1>
                
                <p className="text-gray-200 text-xl mb-8 max-w-2xl leading-relaxed">
                  Build the future of Web3 with abstraction. Join our program to develop 
                  innovative dApps, create educational content, and lead community initiatives 
                  with full support from the Okto team.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link href="/proposals/new">
                    <motion.button 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-8 py-3.5 font-medium shadow-lg shadow-blue-900/30 flex items-center transform hover:translate-y-[-2px] transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Submit Proposal
                      <ChevronRight size={18} className="ml-1" />
                    </motion.button>
                  </Link>
                  <Link href="/ideaboard">
                    <motion.button 
                      className="bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 text-white rounded-full px-8 py-3.5 font-medium border border-gray-700/50 hover:border-gray-600 flex items-center transform hover:translate-y-[-2px] transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Browse Ideas
                      <ChevronRight size={18} className="ml-1" />
                    </motion.button>
                  </Link>
                </div>
                
                <div className="flex items-center mt-10 space-x-8">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-gray-800 ${['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500'][i]}`}></div>
                    ))}
                  </div>
                  <div className="text-gray-300">
                    <span className="font-bold text-white">150+</span> participants from around the world
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="lg:w-2/5 relative"
                style={{ y: rocketY }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="relative w-full h-96">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-72 h-72 bg-blue-900/50 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-60 h-60 bg-blue-800/50 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>
                        <div className="w-48 h-48 bg-blue-700/50 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '1s' }}>
                          <div className="w-36 h-36 bg-blue-600/50 rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '1.5s' }}>
                            <span className="text-7xl transform rotate-12 animate-float">🚀</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating tech symbols */}
                  <div className="absolute top-0 right-0 animate-float-slow">
                    <div className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-full border border-gray-700/50">
                      <Code size={24} className="text-blue-400" />
                    </div>
                  </div>
                  <div className="absolute bottom-20 right-12 animate-float-slow" style={{ animationDelay: '1s' }}>
                    <div className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-full border border-gray-700/50">
                      <FileText size={24} className="text-purple-400" />
                    </div>
                  </div>
                  <div className="absolute bottom-10 left-10 animate-float-slow" style={{ animationDelay: '0.5s' }}>
                    <div className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-full border border-gray-700/50">
                      <Globe size={24} className="text-green-400" />
                    </div>
                  </div>
                  <div className="absolute top-20 left-0 animate-float-slow" style={{ animationDelay: '1.5s' }}>
                    <div className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-full border border-gray-700/50">
                      <PenTool size={24} className="text-yellow-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <span className="text-sm text-gray-400 mb-2">Scroll to explore</span>
            <motion.div 
              className="w-1 h-10 bg-gradient-to-b from-white to-transparent rounded-full"
              animate={{ 
                opacity: [1, 0.5, 1],
                height: [10, 20, 10]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </section>
        
        {/* About the Program */}
        <section className="py-20 relative z-10 bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center bg-blue-900/30 rounded-full px-4 py-2 text-sm text-blue-300 backdrop-blur-sm mb-4">
                <Sparkles size={16} className="mr-2" />
                <span>About the Program</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Building <GradientText text="Abstractions" className="" /> for Web3
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                The Summer of Abstraction is a three-month program where developers, content creators, and community leaders collaborate to build the next generation of Web3 applications and services. Participants receive guidance, resources, and rewards for their contributions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group"
                whileHover={{ y: -5 }}
              >
                <div className="w-14 h-14 rounded-xl bg-blue-900/30 flex items-center justify-center mb-6 group-hover:bg-blue-900/50 transition-colors duration-300">
                  <Code size={28} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-300 transition-colors duration-300">Build Applications</h3>
                <p className="text-gray-400 leading-relaxed">
                  Develop innovative dApps, tools, and services that leverage the Okto platform's abstraction capabilities.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group"
                whileHover={{ y: -5 }}
              >
                <div className="w-14 h-14 rounded-xl bg-purple-900/30 flex items-center justify-center mb-6 group-hover:bg-purple-900/50 transition-colors duration-300">
                  <BookOpen size={28} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-purple-300 transition-colors duration-300">Create Content</h3>
                <p className="text-gray-400 leading-relaxed">
                  Develop tutorials, guides, and educational resources that help others understand and utilize the Okto ecosystem.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300 group"
                whileHover={{ y: -5 }}
              >
                <div className="w-14 h-14 rounded-xl bg-green-900/30 flex items-center justify-center mb-6 group-hover:bg-green-900/50 transition-colors duration-300">
                  <Users size={28} className="text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-green-300 transition-colors duration-300">Lead Community</h3>
                <p className="text-gray-400 leading-relaxed">
                  Organize events, workshops, and initiatives that grow and strengthen the community around Okto technology.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Who is it for */}
        <section ref={whoIsItForRef} className="py-20 relative z-10 bg-gradient-to-b from-gray-900 to-gray-900/95">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center bg-indigo-900/30 rounded-full px-4 py-2 text-sm text-indigo-300 backdrop-blur-sm mb-4">
                <Users size={16} className="mr-2" />
                <span>Participants</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Who is it <GradientText text="for" className="" />?
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our program welcomes contributors from various backgrounds who are passionate about Web3 technology and want to make an impact.
              </p>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
              initial="hidden"
              animate={isWhoIsItForInView ? "visible" : "hidden"}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {[
                { title: 'Content Creators', icon: '📸', description: 'Create tutorials, guides, and educational content about Okto.' },
                { title: 'Developers', icon: '👨‍💻', description: 'Build applications, tools, and integrations using Okto SDK.' },
                { title: 'Community Builders', icon: '👥', description: 'Lead initiatives that grow and strengthen the Okto community.' },
                { title: 'Writers', icon: '✍️', description: 'Craft documentation, articles, and technical content for Okto users.' },
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/10 group"
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
                  }}
                >
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-300 transition-colors duration-300">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* Program Timeline */}
        <section ref={timelineRef} className="py-20 relative z-10 bg-gradient-to-b from-gray-900/95 to-gray-900/90">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center bg-blue-900/30 rounded-full px-4 py-2 text-sm text-blue-300 backdrop-blur-sm mb-4">
                <Calendar size={16} className="mr-2" />
                <span>Roadmap</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Program <GradientText text="Timeline" className="" />
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                From application to completion, follow our program timeline to stay on track with your projects.
              </p>
            </div>
            
            <motion.div 
              className="relative max-w-4xl mx-auto"
              initial="hidden"
              animate={isTimelineInView ? "visible" : "hidden"}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {/* Vertical line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
              
              {timelineData.map((item, index) => (
                <motion.div 
                  key={index} 
                  className={`flex items-center relative mb-16 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  variants={{
                    hidden: { opacity: 0, x: index % 2 === 0 ? -20 : 20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                  }}
                >
                  {/* Timeline node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-gray-800 border-4 border-blue-500 z-10 timeline-node"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10">
                      <span className="inline-block px-3 py-1 rounded-full text-xs bg-blue-900/40 text-blue-300 mb-3">{item.date}</span>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  
                  {/* Empty space for opposite side */}
                  <div className="w-5/12"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* Why Participate */}
        <section ref={whyParticipateRef} className="py-20 relative z-10 bg-gradient-to-b from-gray-900/90 to-gray-900/85">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center bg-purple-900/30 rounded-full px-4 py-2 text-sm text-purple-300 backdrop-blur-sm mb-4">
                <Zap size={16} className="mr-2" />
                <span>Benefits</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Why <GradientText text="Participate" className="" />?
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Join the Summer of Abstraction program and gain valuable experiences, connections, and rewards.
              </p>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              animate={isWhyParticipateInView ? "visible" : "hidden"}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <motion.div 
                className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden group"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
                }}
              >
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-2xl transform translate-x-1/2 translate-y-1/2 group-hover:bg-blue-500/20 transition-all duration-500"></div>
                <Award size={36} className="text-blue-400 mb-6 transform group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-4 relative z-10">Earn Rewards</h3>
                <p className="text-gray-400 leading-relaxed relative z-10">
                  Complete projects and bounties to earn OKTO Points, which can be converted to OKTO tokens post-TGE.
                </p>
                <ul className="mt-6 space-y-2 relative z-10">
                  <li className="flex items-center text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                    <span>Token rewards for completed projects</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                    <span>Performance-based bonus incentives</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                    <span>Additional benefits for top contributors</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden group"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.1 } }
                }}
              >
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-purple-500/10 rounded-full filter blur-2xl transform translate-x-1/2 translate-y-1/2 group-hover:bg-purple-500/20 transition-all duration-500"></div>
                <Users size={36} className="text-purple-400 mb-6 transform group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-4 relative z-10">Join the Community</h3>
                <p className="text-gray-400 leading-relaxed relative z-10">
                  Connect with like-minded builders and become part of the growing Okto ecosystem.
                </p>
                <ul className="mt-6 space-y-2 relative z-10">
                  <li className="flex items-center text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2"></div>
                    <span>Network with Web3 professionals</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2"></div>
                    <span>Mentorship from industry experts</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2"></div>
                    <span>Exclusive access to events and workshops</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden group"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.2 } }
                }}
              >
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl transform translate-x-1/2 translate-y-1/2 group-hover:bg-indigo-500/20 transition-all duration-500"></div>
                <FileText size={36} className="text-indigo-400 mb-6 transform group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-4 relative z-10">Build Your Portfolio</h3>
                <p className="text-gray-400 leading-relaxed relative z-10">
                  Showcase your skills and contributions to strengthen your Web3 development portfolio.
                </p>
                <ul className="mt-6 space-y-2 relative z-10">
                  <li className="flex items-center text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></div>
                    <span>Hands-on experience with cutting-edge tech</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></div>
                    <span>Create portfolio-worthy projects</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></div>
                    <span>Recognition from the Okto team</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Program Stats */}
        <section ref={statsRef} className="py-20 relative z-10 bg-gradient-to-b from-gray-900/85 to-gray-900/80">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center bg-blue-900/30 rounded-full px-4 py-2 text-sm text-blue-300 backdrop-blur-sm mb-4">
                <Star size={16} className="mr-2" />
                <span>Impact</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Program <GradientText text="Stats" className="" />
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                The collective impact of our community is driving innovation across the Web3 ecosystem.
              </p>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              animate={isStatsInView ? "visible" : "hidden"}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <Counter 
                value="12" 
                label="Active Projects" 
                icon={<FileText size={32} className="text-blue-400" />} 
              />
              <Counter 
                value="152" 
                label="Participants" 
                icon={<Users size={32} className="text-purple-400" />} 
              />
              <Counter 
                value="2,400,000" 
                label="OKTO Points Distributed" 
                icon={<Award size={32} className="text-yellow-400" />} 
              />
              <Counter 
                value="38" 
                label="Completed Bounties" 
                icon={<Briefcase size={32} className="text-green-400" />} 
              />
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={isStatsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full filter blur-3xl"></div>
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-900/30 flex items-center justify-center mr-4">
                    <MessageSquare size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Community Support</h3>
                    <p className="text-gray-400">Get help and feedback from experienced mentors and peers</p>
                  </div>
                </div>
                
                <div className="pl-16">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Discord Members</span>
                    <span className="text-gray-200 font-medium">15,000+</span>
                  </div>
                  <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2 mt-4">
                    <span className="text-gray-400">Active Mentors</span>
                    <span className="text-gray-200 font-medium">42</span>
                  </div>
                  <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2 mt-4">
                    <span className="text-gray-400">Support Response Time</span>
                    <span className="text-gray-200 font-medium">{"< 24 hours"}</span>
                  </div>
                  <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={isStatsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full filter blur-3xl"></div>
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-900/30 flex items-center justify-center mr-4">
                    <Github size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Open Source Contributions</h3>
                    <p className="text-gray-400">Making an impact on the Web3 development ecosystem</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pl-16">
                  <div className="bg-gray-700/30 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-1">2,500+</div>
                    <div className="text-gray-400 text-sm">Commits</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-400 mb-1">180+</div>
                    <div className="text-gray-400 text-sm">Pull Requests</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">45+</div>
                    <div className="text-gray-400 text-sm">Repositories</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">320+</div>
                    <div className="text-gray-400 text-sm">Contributors</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section 
          ref={ctaRef}
          className="py-20 relative z-10 overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={isCtaInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900"></div>
            <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-30"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 to-transparent"></div>
            
            {/* Animated blobs */}
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-1/3 right-1/2 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </motion.div>
          
          <div className="container mx-auto px-6 relative z-10">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2 text-sm text-blue-200 backdrop-blur-sm mb-6">
                <Heart size={16} className="mr-2 text-pink-400" />
                <span>Join Our Community Today</span>
              </div>
              
              <h2 className="text-5xl font-bold mb-6 text-white">
                Ready to Build the <GradientText text="Future" className="" /> of Web3?
              </h2>
              
              <p className="text-blue-100 text-xl mb-10 leading-relaxed">
                Start your journey with Okto Summer of Abstraction today and contribute to the Web3 ecosystem. 
                Apply now to develop innovative solutions, connect with like-minded individuals, 
                and earn rewards for your contributions.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href="/register">
                    <button className="bg-white text-indigo-900 hover:bg-blue-50 rounded-full px-8 py-4 font-bold shadow-lg shadow-blue-900/30 flex items-center transform hover:translate-y-[-2px] transition-all duration-200">
                      Create Account
                      <ChevronRight size={20} className="ml-1" />
                    </button>
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href="/proposals/new">
                    <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-8 py-4 font-bold shadow-lg shadow-blue-900/30 flex items-center transform hover:translate-y-[-2px] transition-all duration-200">
                      Submit Proposal
                      <ChevronRight size={20} className="ml-1" />
                    </button>
                  </Link>
                </motion.div>
              </div>
              
              <div className="mt-16 inline-flex items-center py-2 px-4 bg-white/10 backdrop-blur-sm rounded-full text-sm text-blue-200">
                <Calendar size={14} className="mr-2" />
                Applications close on May 30, 2025 — Don't miss out!
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Custom CSS */}
        <style jsx global>{`
          @keyframes float {
            0% { transform: translateY(0px) rotate(12deg); }
            50% { transform: translateY(-15px) rotate(12deg); }
            100% { transform: translateY(0px) rotate(12deg); }
          }
          
          @keyframes float-slow {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
          
          @keyframes blob {
            0% { transform: scale(1) translate(0px, 0px); }
            33% { transform: scale(1.1) translate(30px, -50px); }
            66% { transform: scale(0.9) translate(-20px, 20px); }
            100% { transform: scale(1) translate(0px, 0px); }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-float-slow {
            animation: float-slow 6s ease-in-out infinite;
          }
          
          .animate-blob {
            animation: blob 15s ease-in-out infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          
          .timeline-node {
            border-width: 0;
            transition: all 0.3s;
          }
          
          .timeline-node::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            z-index: -1;
            opacity: 0.8;
            transition: all 0.3s;
          }
          
          .timeline-node:hover::before {
            top: -6px;
            left: -6px;
            right: -6px;
            bottom: -6px;
            opacity: 1;
          }
        `}</style>
      </main>
    </>
  );
}