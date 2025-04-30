import Link from 'next/link';
import { Award, Users, FileText, ArrowRight } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

export default function Home() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-10">
          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 rounded-xl p-8 mb-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h1 className="text-3xl font-bold mb-4">
                  <span className="text-blue-300">Summer of</span>
                  <span className="text-pink-400 ml-2">ABSTRACTION</span>
                </h1>
                <p className="text-gray-300 mb-6 max-w-2xl">
                  Explore exciting project ideas for the Okto Summer of Abstraction program. 
                  Build innovative Web3 applications, create educational content, or lead 
                  community initiatives with support from Okto.
                </p>
                <div className="flex space-x-4">
                  <Link href="/proposals/new">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 font-medium">
                      Submit Proposal
                    </button>
                  </Link>
                  <Link href="/ideaboard">
                    <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-5 py-2.5 font-medium">
                      Browse Ideas
                    </button>
                  </Link>
                </div>
              </div>
              <div className="w-64 h-64 bg-blue-900/50 rounded-full flex items-center justify-center">
                <div className="w-56 h-56 bg-blue-800/50 rounded-full flex items-center justify-center">
                  <div className="w-48 h-48 bg-blue-700/50 rounded-full flex items-center justify-center">
                    <span className="text-5xl">🚀</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Who is it for section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Who is it for?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Content Creators', icon: '📸', description: 'Create tutorials, guides, and educational content about Okto.' },
                { title: 'Developers', icon: '👨‍💻', description: 'Build applications, tools, and integrations using Okto SDK.' },
                { title: 'Community Builders', icon: '👥', description: 'Lead initiatives that grow and strengthen the Okto community.' },
                { title: 'Writers', icon: '✍️', description: 'Craft documentation, articles, and technical content for Okto users.' },
              ].map((item, index) => (
                <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Projects */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Featured Projects</h2>
              <Link href="/projects" className="text-blue-400 hover:text-blue-300 flex items-center">
                View All
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Project cards would be generated from API data */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded">Development</span>
                    <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">Project</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">ZeroPass: Cross-Chain KYC-Free Web3 Passport</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Privacy-preserving identity verification system using zkProofs and SBTs.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Mithun R</span>
                    </div>
                    <div className="text-sm text-gray-400">101,000 OKTO POINTS</div>
                  </div>
                </div>
                <div className="bg-gray-900 px-6 py-3">
                  <Link href="/projects/zeropass">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">View Details →</button>
                  </Link>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded">Development</span>
                    <span className="bg-purple-900 text-purple-300 text-xs px-2 py-1 rounded">Bounty</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Okto SDK Playground</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Interactive learning environment for developers to experiment with Okto SDK features.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">John Smith</span>
                    </div>
                    <div className="text-sm text-gray-400">45,000 OKTO POINTS</div>
                  </div>
                </div>
                <div className="bg-gray-900 px-6 py-3">
                  <Link href="/projects/sdk-playground">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">View Details →</button>
                  </Link>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded">Development</span>
                    <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">Project</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Okto CLI</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Command-line interface for interacting with Okto ecosystem services.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Alex Kim</span>
                    </div>
                    <div className="text-sm text-gray-400">30,000 OKTO POINTS</div>
                  </div>
                </div>
                <div className="bg-gray-900 px-6 py-3">
                  <Link href="/projects/okto-cli">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">View Details →</button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Why Participate */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Why Participate?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <Award size={32} className="text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
                <p className="text-gray-400">
                  Complete projects and bounties to earn OKTO Points, which can be converted to OKTO tokens post-TGE.
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <Users size={32} className="text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Join the Community</h3>
                <p className="text-gray-400">
                  Connect with like-minded builders and become part of the growing Okto ecosystem.
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <FileText size={32} className="text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Build Your Portfolio</h3>
                <p className="text-gray-400">
                  Showcase your skills and contributions to strengthen your Web3 development portfolio.
                </p>
              </div>
            </div>
          </section>

          {/* Program Stats */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Program Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Active Projects', value: '12' },
                { label: 'Participants', value: '152' },
                { label: 'OKTO Points Distributed', value: '2.4M' },
                { label: 'Completed Bounties', value: '38' },
              ].map((stat, index) => (
                <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-10 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 rounded-xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Start your journey with Okto Summer of Abstraction today and contribute to the Web3 ecosystem.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/register">
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 font-medium">
                  Create Account
                </button>
              </Link>
              <Link href="/ideaboard">
                <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-5 py-2.5 font-medium">
                  Explore Ideas
                </button>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}