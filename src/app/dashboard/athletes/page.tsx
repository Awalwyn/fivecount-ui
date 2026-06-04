'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  searchAthletes,
  AthleteSearchResult,
} from '@/lib/api/athletes';
import { EventType } from '@/lib/api/competitions';

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const EVENTS: EventType[] = [
  'FLOOR',
  'POMMEL_HORSE',
  'RINGS',
  'VAULT',
  'PARALLEL_BARS',
  'HIGH_BAR',
  'ALL_AROUND',
];

const EVENT_DISPLAY_NAMES: Record<EventType, string> = {
  ALL_AROUND: 'All Around',
  FLOOR: 'Floor Exercise',
  POMMEL_HORSE: 'Pommel Horse',
  RINGS: 'Rings',
  VAULT: 'Vault',
  PARALLEL_BARS: 'Parallel Bars',
  HIGH_BAR: 'High Bar',
};


export default function AthletesSearchPage() {
  // Filter state
  const [gradYear, setGradYear] = useState<number | undefined>();
  const [state, setState] = useState<string | undefined>();
  const [event, setEvent] = useState<EventType | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  // Results state
  const [results, setResults] = useState<AthleteSearchResult[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 12;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  // Search function
  const handleSearch = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchAthletes(gradYear, state, event, page, pageSize);
      setResults(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to search athletes'
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load - show all athletes
  useEffect(() => {
    handleSearch(0);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">
          Find Athletes
        </h1>
        <p className="text-gray-400">
          {results.length} athletes match your criteria
        </p>
      </div>

      {/* Search Bar + Filters Row */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name or club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              🔍
            </span>
          </div>
          <button className="btn-primary px-4 py-2 flex items-center gap-2">
            <span>⚙️</span> Filters
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 flex-wrap">
          {/* Grad Year */}
          <select
            value={gradYear || ''}
            onChange={(e) => {
              setGradYear(e.target.value ? parseInt(e.target.value) : undefined);
              handleSearch(0);
            }}
            className="input-field text-sm"
          >
            <option value="">All Grad Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* State */}
          <select
            value={state || ''}
            onChange={(e) => {
              setState(e.target.value || undefined);
              handleSearch(0);
            }}
            className="input-field text-sm"
          >
            <option value="">All States</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Event */}
          <select
            value={event || ''}
            onChange={(e) => {
              setEvent((e.target.value as EventType) || undefined);
              handleSearch(0);
            }}
            className="input-field text-sm"
          >
            <option value="">All Events</option>
            {EVENTS.map((e) => (
              <option key={e} value={e}>
                {EVENT_DISPLAY_NAMES[e]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <span className="spinner"></span>
        </div>
      )}

      {/* Results Grid */}
      {!loading && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((athlete) => {
              const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`.toUpperCase();
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-cyan-500'];
              const colorIndex = athlete.id.charCodeAt(0) % colors.length;
              return (
                <Link
                  key={athlete.id}
                  href={`/athletes/${athlete.id}`}
                  className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 hover:border-[#5EFF6E]/50 transition group cursor-pointer"
                >
                  {/* Header: Avatar + Name + Badge */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar Initials */}
                    <div className={`${colors[colorIndex]} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm`}>
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name */}
                      <h3 className="text-white font-bold text-sm group-hover:text-[#5EFF6E] transition truncate">
                        {athlete.firstName} {athlete.lastName}
                      </h3>

                      {/* Club */}
                      <p className="text-gray-400 text-xs truncate">
                        {athlete.clubName}
                      </p>

                      {/* Location */}
                      <p className="text-gray-500 text-xs">
                        {athlete.city}, {athlete.state}
                      </p>
                    </div>

                    {/* Status Badge - placeholder for now */}
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded text-xs font-medium flex-shrink-0 whitespace-nowrap">
                      Open
                    </span>
                  </div>

                  {/* AA Score */}
                  <div className="mb-3 pb-3 border-b border-[#1f1f1f]">
                    <p className="text-gray-500 text-xs mb-1">AA Avg</p>
                    <p className="text-[#5EFF6E] font-bold text-lg">
                      {athlete.topEvents?.find(e => e.event === 'ALL_AROUND')?.averageScore.toFixed(0) || '—'}
                    </p>
                  </div>

                  {/* Top Events */}
                  {athlete.topEvents && athlete.topEvents.length > 0 && (
                    <div className="space-y-2">
                      {athlete.topEvents.slice(0, 3).map((eventStat) => (
                        <div key={eventStat.event} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            {EVENT_DISPLAY_NAMES[eventStat.event].split(' ')[0]}
                          </span>
                          <span className="text-[#5EFF6E] font-semibold">
                            {eventStat.averageScore.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handleSearch(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0 || loading}
                className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum =
                    totalPages <= 5
                      ? i
                      : Math.max(0, Math.min(currentPage - 2, totalPages - 5)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleSearch(pageNum)}
                      className={`px-3 py-2 rounded transition ${
                        pageNum === currentPage
                          ? 'bg-[#5EFF6E] text-black font-bold'
                          : 'bg-[#1f1f1f] text-white hover:bg-[#2a2a2a]'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handleSearch(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1 || loading}
                className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && !error && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-12 text-center">
          <p className="text-gray-400 mb-4">
            {gradYear || state || event
              ? 'No athletes found matching your filters'
              : 'No athletes yet. Check back soon!'}
          </p>
          {(gradYear || state || event) && (
            <button
              onClick={() => {
                setGradYear(undefined);
                setState(undefined);
                setEvent(undefined);
                handleSearch(0);
              }}
              className="btn-primary inline-block"
            >
              Clear Filters and Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
