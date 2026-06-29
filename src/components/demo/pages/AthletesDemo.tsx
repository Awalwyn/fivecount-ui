'use client';

import { useState, useMemo } from 'react';
import { useDemo } from '../DemoContext';
import { mockAthletes } from '../data/mockData';
import { Filter, MapPin, Search, Star } from 'lucide-react';
import type { CommitStatus } from '@/lib/api/athletes';

const GRAD_YEARS = [2025, 2026, 2027, 2028];
const STATES = ['CA', 'OR', 'WA', 'TX', 'AZ', 'NV', 'UT', 'CO', 'ID'];

export function AthletesDemo() {
  const { role } = useDemo();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [gradYear, setGradYear] = useState<number | ''>('');
  const [state, setState] = useState<string>('');
  const [event, setEvent] = useState<string>('');

  const filtered = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return mockAthletes.filter((athlete) => {
      const fullName = `${athlete.firstName} ${athlete.lastName}`.toLowerCase();
      const clubName = athlete.clubName.toLowerCase();
      if (normalizedSearch && !fullName.includes(normalizedSearch) && !clubName.includes(normalizedSearch)) {
        return false;
      }
      if (gradYear && athlete.gradYear !== gradYear) return false;
      if (state && athlete.state !== state) return false;
      if (event && !athlete.topEvents.some((e) => e.event === event)) return false;
      return true;
    });
  }, [gradYear, state, event, searchTerm]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 pb-6 border-b border-[#1f1f1f]">
        <div>
          <h1 className="heading-display text-4xl mb-2">Find Athletes</h1>
          <p className="text-[#a0a0a0]">{filtered.length} athletes match your criteria</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:max-w-2xl">
          <label className="relative flex-1">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7f8794]" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or club..."
              className="w-full rounded-lg border border-[#1f1f1f] bg-[#111111] py-3.5 pl-12 pr-4 text-sm font-semibold text-white outline-none transition-colors placeholder:text-[#777777] focus:border-[#5EFF6E]"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowFilters((open) => !open)}
            className={`btn-secondary flex items-center justify-center gap-2 px-5 py-3.5 ${showFilters ? 'border-[#5EFF6E] text-[#5EFF6E]' : ''}`}
          >
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      )}

      {/* Results */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          {filtered.map((athlete) => (
            <div key={athlete.id} className="relative bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 hover:border-[#5EFF6E] transition-colors cursor-pointer overflow-hidden">
              <RecruitingStatusBadge status={athlete.commitStatus} />

              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#16391d]">
                    <span className="text-2xl font-bold text-[#5EFF6E]">
                      {athlete.firstName.charAt(0)}
                      {athlete.lastName.charAt(0)}
                    </span>
                  </div>
                  <span className="absolute -bottom-1 right-0 rounded-full bg-[#0a0a0a] border border-[#1f1f1f] px-2 py-1 text-[11px] font-bold text-white">
                    {athlete.gradYear}
                  </span>
                </div>

                <div className="min-w-0 flex-1 pr-16">
                  <h3 className="font-semibold text-lg leading-tight">
                    {athlete.firstName} {athlete.lastName}
                  </h3>
                  <p className="text-sm text-[#a0a0a0] truncate mt-1">{athlete.clubName}</p>
                  <p className="text-xs text-[#7f8794] flex items-center gap-1.5 mt-3">
                    <MapPin size={14} />
                    {athlete.city}, {athlete.state}
                  </p>

                  <div className="flex items-center gap-2 mt-4">
                    <Star size={18} className="text-[#5EFF6E]" />
                    <span className="font-semibold text-white">{athlete.allAroundAvg.toFixed(3)}</span>
                    <span className="text-sm text-[#7f8794]">AA Avg</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {athlete.topEvents.slice(0, 2).map((topEvent) => (
                      <span key={topEvent.event} className="rounded-md bg-[#1a1a1a] px-3 py-1.5 text-xs font-semibold text-[#a0a0a0]">
                        <span className="text-[#5EFF6E]">{formatEvent(topEvent.event)}</span> {topEvent.averageScore.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {role === 'COACH' && <span className="sr-only">Coach can open athlete details from this card.</span>}
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

function formatEvent(event: string) {
  const eventLabels: Record<string, string> = {
    FLOOR: 'FX',
    HIGH_BAR: 'HB',
    PARALLEL_BARS: 'PB',
    POMMEL_HORSE: 'PH',
    RINGS: 'SR',
    VAULT: 'VT',
  };

  return eventLabels[event] ?? event;
}

function RecruitingStatusBadge({ status }: { status?: CommitStatus }) {
  const config: Record<CommitStatus, { className: string; label: string }> = {
    OPEN_TO_RECRUITING: {
      className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
      label: 'Open',
    },
    VERBALLY_COMMITTED: {
      className: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
      label: 'Committed',
    },
    SIGNED: {
      className: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
      label: 'Signed',
    },
    NOT_RECRUITING: {
      className: 'border-[#3a3a3a] bg-[#1f1f1f] text-[#a0a0a0]',
      label: 'Not Recruiting',
    },
  };
  const current = config[status ?? 'OPEN_TO_RECRUITING'];

  return (
    <span className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-bold ${current.className}`}>
      {current.label}
    </span>
  );
}
