'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  getProspects,
  getRoster,
  getCoachActivity,
  getTeamStats,
  PIPELINE_STAGES,
  Prospect,
  RosterAthlete,
  CoachActivity,
} from '@/lib/api/recruiting';
import { searchAthletes, AthleteSearchResult } from '@/lib/api/athletes';

const STAGE_COLORS: Record<string, string> = {
  WATCHING: 'text-gray-400',
  CONTACTED: 'text-blue-400',
  IN_TALKS: 'text-amber-400',
  OFFERED: 'text-purple-400',
  COMMITTED: 'text-[#5EFF6E]',
};

const ACTIVITY_DOT: Record<string, string> = {
  NEW_SCORE: 'bg-[#5EFF6E]',
  NEW_POST: 'bg-blue-400',
  REPLY: 'bg-amber-400',
  PROFILE_VIEW: 'bg-gray-500',
  COMMIT: 'bg-purple-400',
};

export function CoachDashboard() {
  const { user } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [roster, setRoster] = useState<RosterAthlete[]>([]);
  const [activity, setActivity] = useState<CoachActivity[]>([]);
  const [recommended, setRecommended] = useState<AthleteSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, r, a, rec] = await Promise.all([
          getProspects(),
          getRoster(),
          getCoachActivity(),
          searchAthletes(),
        ]);
        setProspects(p);
        setRoster(r);
        setActivity(a);
        setRecommended(rec.content.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const teamStats = getTeamStats(roster);
  const stageCounts = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: prospects.filter((p) => p.stage === stage.id).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, Coach {user?.user_metadata?.lastName ?? user?.user_metadata?.firstName ?? ''} · Stanford Men&apos;s Gymnastics
        </p>
      </div>

      {/* Team stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {teamStats.map((stat) => (
          <div key={stat.label} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase tracking-wide">{stat.label}</p>
            <p className="text-3xl font-bold text-[#5EFF6E] mt-1">{stat.value}</p>
            {stat.sub && <p className="text-gray-500 text-xs mt-1">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Pipeline summary */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-body-bold text-lg text-white">Recruiting Pipeline</h2>
          <Link href="/dashboard/recruiting" className="text-[#5EFF6E] text-sm font-semibold hover:underline">
            View board →
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {stageCounts.map((stage) => (
            <div key={stage.id} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4 text-center">
              <p className={`text-3xl font-bold ${STAGE_COLORS[stage.id]}`}>{stage.count}</p>
              <p className="text-gray-400 text-xs mt-1">{stage.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
          <h2 className="text-body-bold text-lg text-white mb-4">Recent Activity</h2>
          <div className="space-y-1">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-3 border-b border-[#1f1f1f] last:border-0">
                <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${ACTIVITY_DOT[item.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    <span className="text-white font-semibold">{item.athleteName}</span> {item.detail}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended athletes */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-body-bold text-lg text-white">Recommended</h2>
            <Link href="/dashboard/athletes" className="text-[#5EFF6E] text-xs font-semibold hover:underline">
              See all
            </Link>
          </div>
          <div className="space-y-3">
            {recommended.map((athlete) => (
              <Link
                key={athlete.id}
                href={`/dashboard/athletes/${athlete.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[#5EFF6E] text-sm font-bold flex-shrink-0">
                  {athlete.firstName[0]}{athlete.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-[#5EFF6E] transition-colors">
                    {athlete.firstName} {athlete.lastName}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {athlete.gradYear} · {athlete.state}
                  </p>
                </div>
                {athlete.allAroundAvg && (
                  <span className="text-[#5EFF6E] text-sm font-bold">{athlete.allAroundAvg.toFixed(1)}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
