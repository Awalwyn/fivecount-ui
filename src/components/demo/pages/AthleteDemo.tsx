'use client';

import { BarChart3, TrendingUp, Award, CheckCircle, ArrowRight } from 'lucide-react';

export function AthleteDemo() {
  return (
    <div className="p-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="heading-display text-4xl mb-1">Welcome back, Marcus!</h1>
        <p className="text-[#a0a0a0]">Here&apos;s your gymnastics dashboard</p>
      </div>

      {/* Profile Completion Banner */}
      <div className="bg-[#1f1f1f] border border-[#5EFF6E]/30 rounded-lg p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Complete Your Profile</h3>
          <p className="text-[#a0a0a0] text-sm">Add a profile picture and more details to increase visibility to coaches.</p>
        </div>
        <button className="btn-primary px-6 flex items-center gap-2 whitespace-nowrap">Edit Profile <ArrowRight size={16} /></button>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#5EFF6E] transition-colors cursor-pointer">
          <h3 className="text-lg font-semibold mb-2">Your Profile</h3>
          <p className="text-[#a0a0a0] text-sm mb-4">View and manage your profile information, bio, and social media</p>
          <span className="text-[#5EFF6E] text-sm font-semibold flex items-center gap-1">Go to Profile <ArrowRight size={14} /></span>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#5EFF6E] transition-colors cursor-pointer">
          <h3 className="text-lg font-semibold mb-2">Competition Results</h3>
          <p className="text-[#a0a0a0] text-sm mb-4">Add and track your meet scores across all events</p>
          <span className="text-[#5EFF6E] text-sm font-semibold flex items-center gap-1">View Results <ArrowRight size={14} /></span>
        </div>
      </div>

      {/* Performance Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Performance</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#a0a0a0] text-sm uppercase tracking-wide">Results</span>
              <BarChart3 size={18} className="text-[#5EFF6E]" />
            </div>
            <p className="heading-display text-3xl">8</p>
            <p className="text-[#a0a0a0] text-xs mt-2">meets completed</p>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#a0a0a0] text-sm uppercase tracking-wide">Avg Score</span>
              <TrendingUp size={18} className="text-[#5EFF6E]" />
            </div>
            <p className="heading-display text-3xl">85.1</p>
            <p className="text-[#a0a0a0] text-xs mt-2">all-around average</p>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#a0a0a0] text-sm uppercase tracking-wide">Best Score</span>
              <Award size={18} className="text-[#5EFF6E]" />
            </div>
            <p className="heading-display text-3xl">15.4</p>
            <p className="text-[#a0a0a0] text-xs mt-2">on vault</p>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#a0a0a0] text-sm uppercase tracking-wide">Events</span>
              <CheckCircle size={18} className="text-[#5EFF6E]" />
            </div>
            <p className="heading-display text-3xl">6/6</p>
            <p className="text-[#a0a0a0] text-xs mt-2">disciplines competed</p>
          </div>
        </div>
      </div>

      {/* Event Breakdown - Grid of 3 */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">Event Breakdown</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { name: 'Vault', avg: 15.2, best: 15.4, meets: 8 },
            { name: 'Floor Exercise', avg: 14.7, best: 14.8, meets: 8 },
            { name: 'Pommel Horse', avg: 13.8, best: 14.1, meets: 7 },
            { name: 'Rings', avg: 14.1, best: 14.5, meets: 8 },
            { name: 'Parallel Bars', avg: 13.5, best: 13.9, meets: 7 },
            { name: 'High Bar', avg: 14.0, best: 14.3, meets: 8 },
          ].map((event) => (
            <div key={event.name} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded p-4 hover:border-[#5EFF6E] transition-colors cursor-pointer">
              <p className="text-sm font-semibold mb-4">{event.name}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Average</span>
                  <span className="text-[#5EFF6E] font-semibold">{event.avg}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Best</span>
                  <span className="text-[#ffffff] font-semibold">{event.best}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0a0a0]">Meets</span>
                  <span className="text-[#ffffff]">{event.meets}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
