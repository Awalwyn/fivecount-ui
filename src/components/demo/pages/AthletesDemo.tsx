'use client';

import { useState, useMemo } from 'react';
import { useDemo } from '../DemoContext';
import { mockAthletes } from '../data/mockData';
import { Medal, TrendingUp } from 'lucide-react';

const GRAD_YEARS = [2025, 2026, 2027, 2028];
const STATES = ['CA', 'OR', 'WA', 'TX', 'AZ', 'NV', 'UT', 'CO', 'ID'];

export function AthletesDemo() {
  const { role } = useDemo();
  const [gradYear, setGradYear] = useState<number | ''>('');
  const [state, setState] = useState<string>('');
  const [event, setEvent] = useState<string>('');

  const filtered = useMemo(() => {
    return mockAthletes.filter((athlete) => {
      if (gradYear && athlete.gradYear !== gradYear) return false;
      if (state && athlete.state !== state) return false;
      if (event && !athlete.topEvents.some((e) => e.event === event)) return false;
      return true;
    });
  }, [gradYear, state, event]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="heading-display text-4xl mb-2">Find Athletes</h1>
        <p className="text-[#a0a0a0]">Discover and recruit the next generation of elite gymnasts</p>
      </div>

      {/* Filters */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
        <h2 className="text-sm font-semibold mb-4 uppercase">Filters</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="input-label mb-2 block">Graduation Year</label>
            <select
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value ? parseInt(e.target.value) : '')}
              className="input-field w-full"
            >
              <option value="">All Years</option>
              {GRAD_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label mb-2 block">State</label>
            <select value={state} onChange={(e) => setState(e.target.value)} className="input-field w-full">
              <option value="">All States</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label mb-2 block">Event</label>
            <select value={event} onChange={(e) => setEvent(e.target.value)} className="input-field w-full">
              <option value="">All Events</option>
              <option value="VAULT">Vault</option>
              <option value="FLOOR">Floor Exercise</option>
              <option value="PARALLEL_BARS">Parallel Bars</option>
              <option value="POMMEL_HORSE">Pommel Horse</option>
              <option value="RINGS">Rings</option>
              <option value="HIGH_BAR">High Bar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="text-[#a0a0a0] text-sm mb-4">{filtered.length} athletes found</p>
        <div className="grid grid-cols-3 gap-6">
          {filtered.map((athlete) => (
            <div key={athlete.id} className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#5EFF6E] transition-colors cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#5EFF6E] mx-auto mb-4">
                <span className="text-2xl font-bold text-[#0a0a0a]">
                  {athlete.firstName.charAt(0)}
                  {athlete.lastName.charAt(0)}
                </span>
              </div>

              <h3 className="font-semibold text-center mb-1">
                {athlete.firstName} {athlete.lastName}
              </h3>
              <p className="text-xs text-[#a0a0a0] text-center mb-4">Class of {athlete.gradYear}</p>

              <div className="space-y-3 text-sm mb-4 pb-4 border-b border-[#1f1f1f]">
                <p className="text-[#a0a0a0]">
                  {athlete.clubName} • {athlete.city}, {athlete.state}
                </p>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp size={14} className="text-[#5EFF6E]" />
                    <span className="text-[#a0a0a0] text-xs">AA Average</span>
                  </div>
                  <p className="text-[#5EFF6E] font-semibold">{athlete.allAroundAvg}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Medal size={14} className="text-[#5EFF6E]" />
                    <span className="text-[#a0a0a0] text-xs">Top Event</span>
                  </div>
                  <p className="text-[#ffffff] font-semibold">{athlete.topEvents[0].event}</p>
                  <p className="text-[#5EFF6E] text-xs">Score: {athlete.topEvents[0].averageScore}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className={`${role === 'COACH' ? 'flex-1' : 'w-full'} btn-secondary text-sm py-2`}>View</button>
                {role === 'COACH' && (
                  <button className="flex-1 btn-primary text-sm py-2">Contact</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#a0a0a0]">No athletes match your filters. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
