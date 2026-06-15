'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getAthleteDetail, AthleteDetail } from '@/lib/api/athletes';
import { EventType } from '@/lib/api/competitions';
import { ReachOutModal } from '@/components/coach/ReachOutModal';
import { PublicProfileCTABar } from '@/components/athlete/PublicProfileCTABar';

const EVENT_LABELS: Record<EventType, string> = {
  FLOOR: 'FX',
  POMMEL_HORSE: 'PH',
  RINGS: 'SR',
  VAULT: 'VT',
  PARALLEL_BARS: 'PB',
  HIGH_BAR: 'HB',
  ALL_AROUND: 'AA',
};

const COMMIT_LABELS: Record<string, { label: string; className: string }> = {
  OPEN_TO_RECRUITING: { label: 'Open to Recruiting', className: 'bg-[#5EFF6E]/15 text-[#5EFF6E]' },
  VERBALLY_COMMITTED: { label: 'Verbally Committed', className: 'bg-amber-500/15 text-amber-400' },
  SIGNED: { label: 'Signed', className: 'bg-blue-500/15 text-blue-400' },
  NOT_RECRUITING: { label: 'Not Recruiting', className: 'bg-gray-500/15 text-gray-400' },
};

export default function AthleteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { role } = useAuth();
  const isCoach = role === 'COACH';

  const [athlete, setAthlete] = useState<AthleteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reachOutOpen, setReachOutOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAthleteDetail(id).then((data) => {
      if (active) {
        setAthlete(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner border-[#5EFF6E]" />
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="text-center py-20">
        <p className="text-white font-medium">Athlete not found</p>
        <Link href="/dashboard/athletes" className="text-[#5EFF6E] text-sm hover:underline mt-2 inline-block">
          ← Back to search
        </Link>
      </div>
    );
  }

  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`;
  const commit = athlete.commitStatus ? COMMIT_LABELS[athlete.commitStatus] : null;
  const eventEntries = Object.entries(athlete.eventStats) as [EventType, { avg: number; high: number; count: number }][];
  const bestEvent = eventEntries.reduce((best, cur) => (cur[1].high > best[1].high ? cur : best), eventEntries[0]);

  return (
    <div className={`max-w-5xl mx-auto ${!isCoach ? 'pb-24' : ''}`}>
      <Link href="/dashboard/athletes" className="text-gray-400 hover:text-white text-sm inline-flex items-center gap-1 mb-4">
        ← Back to search
      </Link>

      {/* Cover + header */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl overflow-hidden">
        <div className="h-40 md:h-48 bg-gradient-to-br from-[#1a2a1a] via-[#0f1f0f] to-[#0a0a0a]" />
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end gap-4">
              <span className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[#111111] bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center text-4xl font-semibold heading-display -mt-14 md:-mt-16">
                {initials}
              </span>
              <div className="pb-1">
                <h1 className="heading-display text-2xl md:text-3xl text-white">
                  {athlete.firstName} {athlete.lastName}
                </h1>
                <p className="text-gray-400 text-sm">
                  {athlete.city}, {athlete.state} · Class of {athlete.gradYear}
                </p>
                <p className="text-[#5EFF6E] text-sm font-medium">{athlete.clubName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {commit && (
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${commit.className}`}>
                  {commit.label}
                </span>
              )}
              {isCoach && (
                <button
                  onClick={() => setReachOutOpen(true)}
                  className="bg-[#5EFF6E] text-black font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[#4ee65d] transition-colors"
                >
                  Reach Out
                </button>
              )}
            </div>
          </div>

          <p className="text-gray-300 text-sm mt-4 leading-relaxed max-w-2xl">{athlete.bio}</p>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <Stat label="AA Average" value={(athlete.allAroundAvg ?? 0).toFixed(2)} accent />
            <Stat label="Best Event" value={EVENT_LABELS[bestEvent[0]]} sub={bestEvent[1].high.toFixed(2)} />
            <Stat label="Level" value={athlete.level} />
            <Stat label="GPA" value={athlete.gpa} />
          </div>
        </div>
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent meets */}
          <section className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
            <h2 className="text-white font-semibold text-lg mb-4">Recent Meets</h2>
            <div className="space-y-3">
              {athlete.recentMeets.map((meet) => (
                <div key={meet.id} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white text-sm font-medium">{meet.name}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(meet.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {meet.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#5EFF6E] font-bold text-lg leading-none">{meet.allAround.toFixed(3)}</p>
                      <p className="text-gray-600 text-[10px] uppercase tracking-wide">All-Around</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {(Object.keys(EVENT_LABELS) as EventType[])
                      .filter((e) => e !== 'ALL_AROUND' && meet.scores[e] != null)
                      .map((e) => (
                        <div key={e} className="text-center">
                          <p className="text-gray-600 text-[10px]">{EVENT_LABELS[e]}</p>
                          <p className="text-[#5EFF6E] text-xs font-semibold">{meet.scores[e]!.toFixed(2)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Event averages */}
          <section className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
            <h2 className="text-white font-semibold text-lg mb-4">Event Averages</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {eventEntries
                .filter(([e]) => e !== 'ALL_AROUND')
                .map(([event, stats]) => (
                  <div key={event} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3">
                    <p className="text-gray-500 text-xs">{EVENT_LABELS[event]}</p>
                    <p className="text-white font-bold text-lg">{stats.avg.toFixed(3)}</p>
                    <p className="text-gray-600 text-[10px]">High {stats.high.toFixed(3)}</p>
                  </div>
                ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
            <h2 className="text-white font-semibold text-sm mb-4">Awards & Achievements</h2>
            <div className="space-y-4">
              {athlete.awards.map((award) => (
                <div key={award.id} className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#5EFF6E]/15 text-[#5EFF6E] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium leading-tight">{award.title}</p>
                    <p className="text-gray-500 text-xs">{award.subtitle} · {award.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
            <h2 className="text-white font-semibold text-sm mb-4">Personal Bests</h2>
            <div className="space-y-2">
              {eventEntries
                .filter(([e]) => e !== 'ALL_AROUND')
                .map(([event, stats]) => (
                  <div key={event} className="flex items-center justify-between py-1.5 border-b border-[#1a1a1a] last:border-0">
                    <span className="text-gray-400 text-sm">{EVENT_LABELS[event]}</span>
                    <span className="text-[#5EFF6E] font-semibold text-sm">{stats.high.toFixed(3)}</span>
                  </div>
                ))}
            </div>
          </section>

          {athlete.instagramHandle && (
            <section className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="text-white font-semibold text-sm mb-2">Social</h2>
              <p className="text-gray-400 text-sm">@{athlete.instagramHandle}</p>
            </section>
          )}
        </div>
      </div>

      {/* Coach reach-out modal */}
      {isCoach && (
        <ReachOutModal
          open={reachOutOpen}
          onClose={() => setReachOutOpen(false)}
          athlete={{
            id: athlete.id,
            name: `${athlete.firstName} ${athlete.lastName}`,
            subtitle: `${athlete.clubName} · ${athlete.gradYear}`,
            initials,
          }}
        />
      )}

      {/* Public/non-coach nudge */}
      {!isCoach && <PublicProfileCTABar athleteFirstName={athlete.firstName} />}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  small,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`font-bold ${small ? 'text-sm' : 'text-2xl'} ${accent ? 'text-[#5EFF6E]' : 'text-white'}`}>
        {value}
      </p>
      {sub && <p className="text-gray-600 text-xs">{sub}</p>}
    </div>
  );
}
