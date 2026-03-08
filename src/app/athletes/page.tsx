'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  searchAthletes,
  AthleteSearchResult,
  } from '@/lib/api/athletes';
import { EventType } from '@/lib/api/competitions';
import { SponsorBanner } from '@/components/SponsorBanner';

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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar - Filters */}
      <div className="lg:col-span-1">
        <div className="sticky top-20 space-y-4">
          {/* Filters Card */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
            <h2 className="text-body-bold text-lg text-white mb-6">Filters</h2>

            {/* Grad Year Filter */}
            <div className="mb-6">
              <label className="input-label block mb-2">Graduation Year</label>
              <select
                value={gradYear || ''}
                onChange={(e) =>
                  setGradYear(e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="input-field w-full"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div className="mb-6">
              <label className="input-label block mb-2">State</label>
              <select
                value={state || ''}
                onChange={(e) => setState(e.target.value || undefined)}
                className="input-field w-full"
              >
                <option value="">All States</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Filter */}
            <div className="mb-6">
              <label className="input-label block mb-2">Event</label>
              <select
                value={event || ''}
                onChange={(e) => setEvent((e.target.value as EventType) || undefined)}
                className="input-field w-full"
              >
                <option value="">All Events</option>
                {EVENTS.map((e) => (
                  <option key={e} value={e}>
                    {EVENT_DISPLAY_NAMES[e]}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={() => handleSearch(0)}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner border-[#0a0a0a]"></span>
                  Searching
                </span>
              ) : (
                'Search'
              )}
            </button>

            {/* Clear Filters */}
            {(gradYear || state || event) && (
              <button
                onClick={() => {
                  setGradYear(undefined);
                  setState(undefined);
                  setEvent(undefined);
                  setCurrentPage(0);
                }}
                className="btn-secondary w-full mt-3"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Sponsor Banner */}
          <SponsorBanner />
        </div>
      </div>

      {/* Right Content - Results */}
      <div className="lg:col-span-3">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-display text-4xl text-white mb-2">
            Find Athletes
          </h1>
          <p className="text-gray-400">
            Discover talented gymnasts from across the country
          </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {results.map((athlete) => (
                <Link
                  key={athlete.id}
                  href={`/athletes/${athlete.id}`}
                  className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#5EFF6E]/50 transition group cursor-pointer"
                >
                  {/* Athlete Name */}
                  <h3 className="text-body-bold text-lg text-white mb-2 group-hover:text-[#5EFF6E] transition">
                    {athlete.firstName} {athlete.lastName}
                  </h3>

                  {/* Basic Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block px-2 py-1 bg-[#1f1f1f] border border-[#5EFF6E]/30 rounded text-xs text-[#5EFF6E]">
                        Class of {athlete.gradYear}
                      </span>
                      <span className="inline-block px-2 py-1 bg-[#1f1f1f] border border-gray-500/30 rounded text-xs text-gray-400">
                        {athlete.state}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {athlete.clubName}
                    </p>
                  </div>

                  {/* Top Events */}
                  {athlete.topEvents && athlete.topEvents.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                        Top Events
                      </p>
                      <div className="space-y-1">
                        {athlete.topEvents.slice(0, 3).map((eventStat) => (
                          <div
                            key={eventStat.event}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-400">
                              {EVENT_DISPLAY_NAMES[eventStat.event]}
                            </span>
                            <span className="text-[#5EFF6E] font-semibold">
                              {eventStat.averageScore.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
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
    </div>
  );
}
