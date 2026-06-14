'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getRoster, getTeamStats, RosterAthlete, TeamStat } from '@/lib/api/recruiting';
import { MapPin, Mail, Trophy } from 'lucide-react';

const RECRUITING_FOCUS = [
  { label: 'Grad Years', value: '2025 – 2027' },
  { label: 'Priority Events', value: 'Pommel Horse, High Bar, Rings' },
  { label: 'Target AA', value: '83.0+' },
  { label: 'Scholarships', value: '3 available' },
];

export function CoachProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeamStat[]>([]);
  const [roster, setRoster] = useState<RosterAthlete[]>([]);

  useEffect(() => {
    getRoster().then((data) => {
      setRoster(data);
      setStats(getTeamStats(data));
    });
  }, []);

  const firstName = user?.user_metadata?.firstName ?? 'Alex';
  const lastName = user?.user_metadata?.lastName ?? 'Johnson';

  return (
    <div className="space-y-6">
      {/* Header with cover + avatar */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="h-40 md:h-48 bg-gradient-to-br from-[#1a2a1a] via-[#0f1f0f] to-[#0a0a0a]" />
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-14">
            <div className="w-28 h-28 rounded-full border-4 border-[#111111] bg-[#1f1f1f] flex items-center justify-center text-[#5EFF6E] heading-display text-3xl flex-shrink-0">
              {firstName[0]}{lastName[0]}
            </div>
            <div className="flex-1 md:pb-2">
              <h1 className="heading-display text-3xl text-white">Coach {firstName} {lastName}</h1>
              <p className="text-[#5EFF6E] font-medium">Head Coach · Stanford Men&apos;s Gymnastics</p>
              <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mt-2">
                <span className="flex items-center gap-1"><MapPin size={14} /> Stanford, CA</span>
                <span className="flex items-center gap-1"><Mail size={14} /> {user?.email ?? 'coach@stanford.edu'}</span>
                <span className="flex items-center gap-1"><Trophy size={14} /> NCAA Division I</span>
              </div>
            </div>
            <button className="bg-transparent border border-[#1f1f1f] text-white hover:bg-[#1f1f1f] px-4 py-2 rounded-lg text-sm transition-colors md:mb-2">
              Edit Profile
            </button>
          </div>
          <p className="text-gray-300 text-sm mt-4 max-w-3xl">
            Building a championship-caliber men&apos;s gymnastics program at Stanford. Focused on recruiting
            disciplined, high-character student-athletes who excel on multiple apparatus. Reach out if you&apos;re
            an athlete who wants to compete at the highest collegiate level.
          </p>
        </div>
      </div>

      {/* Program stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase tracking-wide">{stat.label}</p>
            <p className="text-3xl font-bold text-[#5EFF6E] mt-1">{stat.value}</p>
            {stat.sub && <p className="text-gray-500 text-xs mt-1">{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruiting focus */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
          <h2 className="text-body-bold text-lg text-white mb-4">Recruiting Focus</h2>
          <div className="space-y-3">
            {RECRUITING_FOCUS.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#1f1f1f] last:border-0">
                <span className="text-gray-400 text-sm">{item.label}</span>
                <span className="text-white text-sm font-medium text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Program info */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
          <h2 className="text-body-bold text-lg text-white mb-4">Program</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-[#1f1f1f]">
              <span className="text-gray-400">School</span>
              <span className="text-white font-medium">Stanford University</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#1f1f1f]">
              <span className="text-gray-400">Conference</span>
              <span className="text-white font-medium">MPSF</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#1f1f1f]">
              <span className="text-gray-400">Division</span>
              <span className="text-white font-medium">NCAA Division I</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">National Titles</span>
              <span className="text-white font-medium">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
