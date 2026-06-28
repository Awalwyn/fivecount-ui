'use client';

import { Users, TrendingUp, CheckCircle, Zap, Target } from 'lucide-react';

export function CoachDemo() {
  const stages = [
    { label: 'Watching', value: 3, color: '#6B7280' },
    { label: 'Contacted', value: 2, color: '#3B82F6' },
    { label: 'In Talks', value: 2, color: '#F59E0B' },
    { label: 'Offered', value: 2, color: '#A855F7' },
    { label: 'Committed', value: 3, color: '#10B981' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      <div>
        <h1 className="heading-display text-4xl mb-2">Coach Dashboard</h1>
        <p className="text-[#a0a0a0]">Stanford Men&apos;s Gymnastics Recruiting</p>
      </div>

      {/* Recruiting Pipeline Stages */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pipeline Overview</h2>
        <div className="grid grid-cols-5 gap-4">
          {stages.map((stage) => (
            <div key={stage.label} className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#5EFF6E] transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold">{stage.label}</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
              </div>
              <p className="heading-display text-4xl" style={{ color: stage.color }}>{stage.value}</p>
              <p className="text-[#a0a0a0] text-xs mt-3 font-medium">prospects</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roster Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#a0a0a0] text-sm uppercase tracking-wide">Total Roster</span>
            <Users size={18} className="text-[#5EFF6E]" />
          </div>
          <p className="heading-display text-3xl">4</p>
          <p className="text-[#a0a0a0] text-xs mt-3">committed athletes</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#a0a0a0] text-sm uppercase tracking-wide">Roster Avg (AA)</span>
            <TrendingUp size={18} className="text-blue-400" />
          </div>
          <p className="heading-display text-3xl">85.0</p>
          <p className="text-[#a0a0a0] text-xs mt-3">all-around average</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#a0a0a0] text-sm uppercase tracking-wide">Highest Score</span>
            <CheckCircle size={18} className="text-[#5EFF6E]" />
          </div>
          <p className="heading-display text-3xl">15.5</p>
          <p className="text-[#a0a0a0] text-xs mt-3">Michael Rodriguez (Vault)</p>
        </div>
      </div>

      {/* Activity Feed & Recommended Athletes */}
      <div className="grid grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="col-span-2 bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap size={18} className="text-[#5EFF6E]" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {[
              { icon: '📊', athlete: 'Marcus Johnson', event: 'Scored 15.4 on vault', time: '2 hours ago' },
              { icon: '📊', athlete: 'Andrew Thompson', event: 'Scored 15.2 on bars', time: '5 hours ago' },
              { icon: '👁️', athlete: 'Jacob Garcia', event: 'Profile viewed', time: '1 day ago' },
              { icon: '📝', athlete: 'Michael Rodriguez', event: 'Posted about training', time: '2 days ago' },
              { icon: '✅', athlete: 'David Williams', event: 'Verbally committed', time: '3 days ago' },
              { icon: '📊', athlete: 'Nathan Rodriguez', event: 'Scored 14.8 on vault', time: '5 days ago' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-[#1f1f1f] last:border-0">
                <span className="text-lg">{activity.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold text-[#ffffff]">{activity.athlete}</span>
                    <span className="text-[#a0a0a0]"> {activity.event}</span>
                  </p>
                  <p className="text-xs text-[#a0a0a0] mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Athletes */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target size={18} className="text-[#5EFF6E]" />
            Recommended
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Christopher Lee', year: 2026, aa: 84.2, top: 'Parallel Bars', topScore: 14.6 },
              { name: 'Derek Martinez', year: 2027, aa: 84.8, top: 'Floor', topScore: 14.9 },
              { name: 'Nathan Rodriguez', year: 2027, aa: 84.5, top: 'Vault', topScore: 14.8 },
            ].map((athlete) => (
              <div key={athlete.name} className="border border-[#1f1f1f] rounded p-4 hover:border-[#5EFF6E] transition-colors cursor-pointer">
                <p className="font-semibold text-sm">{athlete.name}</p>
                <p className="text-xs text-[#a0a0a0] mb-2">Class of {athlete.year}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0]">AA Avg:</span>
                    <span className="text-[#5EFF6E]">{athlete.aa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0]">Top:</span>
                    <span className="text-[#ffffff]">{athlete.top}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0]">Score:</span>
                    <span className="text-[#5EFF6E]">{athlete.topScore}</span>
                  </div>
                </div>
                <button className="w-full mt-3 btn-secondary text-xs py-1">View Profile</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
