'use client';

import { useState, useEffect } from 'react';
import { getRoster, getTeamStats, RosterAthlete, TeamStat } from '@/lib/api/recruiting';

const STATUS_STYLES: Record<RosterAthlete['status'], string> = {
  ENROLLED: 'bg-[#5EFF6E]/10 text-[#5EFF6E]',
  COMMITTED: 'bg-purple-400/10 text-purple-300',
  SIGNED: 'bg-blue-400/10 text-blue-300',
};

const STATUS_LABELS: Record<RosterAthlete['status'], string> = {
  ENROLLED: 'Enrolled',
  COMMITTED: 'Committed',
  SIGNED: 'Signed',
};

export default function RosterPage() {
  const [roster, setRoster] = useState<RosterAthlete[]>([]);
  const [stats, setStats] = useState<TeamStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoster()
      .then((data) => {
        setRoster(data);
        setStats(getTeamStats(data));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">My Roster</h1>
        <p className="text-gray-400">Stanford Men&apos;s Gymnastics · current roster and incoming class</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="spinner" />
        </div>
      ) : (
        <>
          {/* Team stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wide">{stat.label}</p>
                <p className="text-3xl font-bold text-[#5EFF6E] mt-1">{stat.value}</p>
                {stat.sub && <p className="text-gray-500 text-xs mt-1">{stat.sub}</p>}
              </div>
            ))}
          </div>

          {/* Roster table */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1f1f1f]">
              <h2 className="text-body-bold text-lg text-white">Athletes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-[#1f1f1f]">
                    <th className="text-left font-medium px-6 py-3">Athlete</th>
                    <th className="text-left font-medium px-4 py-3">Class</th>
                    <th className="text-left font-medium px-4 py-3">Status</th>
                    <th className="text-left font-medium px-4 py-3">Top Event</th>
                    <th className="text-right font-medium px-6 py-3">AA Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((athlete) => (
                    <tr
                      key={athlete.id}
                      className="border-b border-[#1f1f1f] last:border-0 hover:bg-[#161616] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[#5EFF6E] text-xs font-bold flex-shrink-0">
                            {athlete.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <span className="text-white font-medium">{athlete.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-400">{athlete.classYear}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[athlete.status]}`}>
                          {STATUS_LABELS[athlete.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-300">
                        {athlete.topEvent} · <span className="text-gray-500">{athlete.topEventScore.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-[#5EFF6E] font-bold">
                        {athlete.allAroundAvg.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
