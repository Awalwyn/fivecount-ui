'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, MapPin, Calendar, Trophy, ChevronDown, X, User, Star } from 'lucide-react';
import { searchAthletes, AthleteSearchResult, CommitStatus } from '@/lib/api/athletes';
import { EventType } from '@/lib/api/competitions';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029];

const EVENTS: { value: EventType; label: string }[] = [
  { value: 'FLOOR', label: 'Floor' },
  { value: 'POMMEL_HORSE', label: 'Pommel Horse' },
  { value: 'RINGS', label: 'Rings' },
  { value: 'VAULT', label: 'Vault' },
  { value: 'PARALLEL_BARS', label: 'Parallel Bars' },
  { value: 'HIGH_BAR', label: 'High Bar' },
  { value: 'ALL_AROUND', label: 'All-Around' },
];

const COMMIT_STATUS_LABELS: Record<CommitStatus, { label: string; color: string }> = {
  OPEN_TO_RECRUITING: { label: 'Open', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  VERBALLY_COMMITTED: { label: 'Committed', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  SIGNED: { label: 'Signed', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  NOT_RECRUITING: { label: 'Not Recruiting', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

const EVENT_SHORT_NAMES: Record<string, string> = {
  FLOOR: 'FX',
  POMMEL_HORSE: 'PH',
  RINGS: 'SR',
  VAULT: 'VT',
  PARALLEL_BARS: 'PB',
  HIGH_BAR: 'HB',
  ALL_AROUND: 'AA',
};

export default function AthletesSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedGradYear, setSelectedGradYear] = useState<number | ''>('');
  const [selectedEvent, setSelectedEvent] = useState<EventType | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [athletes, setAthletes] = useState<AthleteSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const activeFiltersCount = [selectedState, selectedGradYear, selectedEvent].filter(Boolean).length;

  const fetchAthletes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await searchAthletes(
        selectedGradYear || undefined,
        selectedState || undefined,
        selectedEvent || undefined,
        currentPage,
        12
      );
      setAthletes(result.content);
      setTotalResults(result.totalElements);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to fetch athletes:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedState, selectedGradYear, selectedEvent, currentPage]);

  useEffect(() => {
    fetchAthletes();
  }, [fetchAthletes]);

  const clearFilters = () => {
    setSelectedState('');
    setSelectedGradYear('');
    setSelectedEvent('');
    setCurrentPage(0);
  };

  // Filter athletes by search query (client-side for demo)
  const filteredAthletes = athletes.filter(athlete => {
    if (!searchQuery) return true;
    const fullName = `${athlete.firstName} ${athlete.lastName}`.toLowerCase();
    const club = athlete.clubName.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || club.includes(query);
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#1f1f1f] bg-[#0a0a0a] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Find Athletes</h1>
              <p className="text-sm text-gray-400 mt-1">
                {totalResults} athletes match your criteria
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or club..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 py-2.5"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-[#5EFF6E]/10 border-[#5EFF6E]/50 text-[#5EFF6E]'
                    : 'bg-[#111111] border-[#1f1f1f] text-gray-400 hover:text-white hover:border-[#333]'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#5EFF6E] text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[#1f1f1f]">
              <div className="flex flex-wrap items-center gap-3">
                {/* Grad Year Filter */}
                <div className="relative">
                  <select
                    value={selectedGradYear}
                    onChange={(e) => {
                      setSelectedGradYear(e.target.value ? Number(e.target.value) : '');
                      setCurrentPage(0);
                    }}
                    className="appearance-none bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[#5EFF6E]/50"
                  >
                    <option value="">All Grad Years</option>
                    {GRAD_YEARS.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* State Filter */}
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setCurrentPage(0);
                    }}
                    className="appearance-none bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[#5EFF6E]/50"
                  >
                    <option value="">All States</option>
                    {US_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Event Filter */}
                <div className="relative">
                  <select
                    value={selectedEvent}
                    onChange={(e) => {
                      setSelectedEvent(e.target.value as EventType | '');
                      setCurrentPage(0);
                    }}
                    className="appearance-none bg-[#111111] border border-[#1f1f1f] rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[#5EFF6E]/50"
                  >
                    <option value="">All Events</option>
                    {EVENTS.map(event => (
                      <option key={event.value} value={event.value}>{event.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-[#1f1f1f] rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-[#1f1f1f] rounded w-3/4" />
                    <div className="h-4 bg-[#1f1f1f] rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAthletes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No athletes found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAthletes.map((athlete) => (
                <AthleteCard key={athlete.id} athlete={athlete} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 rounded-lg bg-[#111111] border border-[#1f1f1f] text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-400">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 rounded-lg bg-[#111111] border border-[#1f1f1f] text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AthleteCard({ athlete }: { athlete: AthleteSearchResult }) {
  const commitStatus = athlete.commitStatus ? COMMIT_STATUS_LABELS[athlete.commitStatus] : null;

  return (
    <Link
      href={`/dashboard/athletes/${athlete.id}`}
      className="group bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 hover:border-[#5EFF6E]/30 transition-all hover:shadow-lg hover:shadow-[#5EFF6E]/5"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          {athlete.profilePictureUrl ? (
            <img
              src={athlete.profilePictureUrl}
              alt={`${athlete.firstName} ${athlete.lastName}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5EFF6E]/20 to-[#5EFF6E]/5 flex items-center justify-center">
              <span className="text-xl font-bold text-[#5EFF6E]">
                {athlete.firstName[0]}{athlete.lastName[0]}
              </span>
            </div>
          )}
          {/* Grad Year Badge */}
          <div className="absolute -bottom-1 -right-1 bg-[#0a0a0a] border border-[#1f1f1f] rounded-full px-1.5 py-0.5">
            <span className="text-[10px] font-bold text-white">{athlete.gradYear}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-white group-hover:text-[#5EFF6E] transition-colors truncate">
                {athlete.firstName} {athlete.lastName}
              </h3>
              <p className="text-sm text-gray-400 truncate">{athlete.clubName}</p>
            </div>
            {commitStatus && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${commitStatus.color}`}>
                {commitStatus.label}
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{athlete.city}, {athlete.state}</span>
          </div>

          {/* AA Score */}
          {athlete.allAroundAvg && (
            <div className="flex items-center gap-1.5 mt-2">
              <Star className="w-3.5 h-3.5 text-[#5EFF6E]" />
              <span className="text-sm font-semibold text-white">{athlete.allAroundAvg.toFixed(3)}</span>
              <span className="text-xs text-gray-500">AA Avg</span>
            </div>
          )}

          {/* Top Events */}
          <div className="flex items-center gap-2 mt-2">
            {athlete.topEvents.slice(0, 2).map((event, i) => (
              <div
                key={i}
                className="flex items-center gap-1 bg-[#1a1a1a] rounded px-2 py-1"
              >
                <span className="text-[10px] font-bold text-[#5EFF6E]">
                  {EVENT_SHORT_NAMES[event.event] || event.event}
                </span>
                <span className="text-xs text-gray-300">{event.averageScore.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
