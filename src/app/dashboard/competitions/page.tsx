'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  addMeet,
  getCompetitionResults,
  updateCompetitionResult,
  deleteCompetitionResult,
  CompetitionResult,
  EventType,
} from '@/lib/api/competitions';
import { getAthleteByUserId, AthleteProfile } from '@/lib/api/athletes';
import { formatScore } from '@/lib/utils/formatScore';
import { PostComposerModal } from '@/components/PostComposerModal';

const EVENT_DISPLAY_NAMES: Record<EventType, string> = {
  ALL_AROUND: 'All Around',
  FLOOR: 'Floor Exercise',
  POMMEL_HORSE: 'Pommel Horse',
  RINGS: 'Rings',
  VAULT: 'Vault',
  PARALLEL_BARS: 'Parallel Bars',
  HIGH_BAR: 'High Bar',
};

const addMeetSchema = z.object({
  meetName: z.string().min(1, 'Meet name is required').max(100),
  meetDate: z.string().min(1, 'Meet date is required').refine(
    (date) => new Date(date) <= new Date(),
    'Meet date cannot be in the future'
  ),
  meetLocation: z.string().max(100).optional(),
  floor: z.union([z.coerce.number().min(0).max(17.5), z.literal('')]).optional(),
  pommelHorse: z.union([z.coerce.number().min(0).max(17.5), z.literal('')]).optional(),
  rings: z.union([z.coerce.number().min(0).max(17.5), z.literal('')]).optional(),
  vault: z.union([z.coerce.number().min(0).max(17.5), z.literal('')]).optional(),
  parallelBars: z.union([z.coerce.number().min(0).max(17.5), z.literal('')]).optional(),
  highBar: z.union([z.coerce.number().min(0).max(17.5), z.literal('')]).optional(),
}).refine(
  (data) => [data.floor, data.pommelHorse, data.rings, data.vault, data.parallelBars, data.highBar]
    .some((s) => typeof s === 'number'),
  { message: 'At least one event score is required' }
);


export default function CompetitionsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Athlete profile state
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Results list state
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);

  // Form submission state
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Edit meet modal state
  const [editingMeetResults, setEditingMeetResults] = useState<CompetitionResult[]>([]);
  const [editScores, setEditScores] = useState<Record<string, string>>({});
  const [isEditMeetModalOpen, setIsEditMeetModalOpen] = useState(false);
  const [isEditMeetSubmitting, setIsEditMeetSubmitting] = useState(false);

  // Delete modal state
  const [deletingMeetKey, setDeletingMeetKey] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  // Add Meet modal state
  const [isAddMeetModalOpen, setIsAddMeetModalOpen] = useState(false);
  const [isAddMeetSubmitting, setIsAddMeetSubmitting] = useState(false);

  // Post composer state
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);
  const [postComposerMeetKey, setPostComposerMeetKey] = useState<string | null>(null);
  const [openMeetMenu, setOpenMeetMenu] = useState<string | null>(null);

  // Initialize Add Meet form
  const {
    register: registerMeet,
    handleSubmit: handleMeetSubmit,
    formState: { errors: meetErrors },
    reset: resetMeet,
  } = useForm({
    resolver: zodResolver(addMeetSchema) as any,
    defaultValues: {
      meetName: '',
      meetDate: '',
      meetLocation: '',
      floor: '',
      pommelHorse: '',
      rings: '',
      vault: '',
      parallelBars: '',
      highBar: '',
    },
  });

  // Fetch athlete profile on mount
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const profile = await getAthleteByUserId(user.id);
        setAthleteProfile(profile);
      } catch (error) {
        setProfileError('Please create your profile first to add competition results');
      } finally {
        setProfileLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  // Fetch competition results
  useEffect(() => {
    async function loadResults() {
      if (!athleteProfile) return;
      try {
        const data = await getCompetitionResults(athleteProfile.id);
        setResults(data.sort((a, b) => new Date(b.meetDate).getTime() - new Date(a.meetDate).getTime()));
      } catch (error) {
        console.error('Failed to load results', error);
      } finally {
        setResultsLoading(false);
      }
    }
    loadResults();
  }, [athleteProfile]);

  // Add new meet
  async function onAddMeet(data: any) {
    if (!athleteProfile) return;
    try {
      setIsAddMeetSubmitting(true);
      setSubmitError(null);
      const payload = {
        meetName: data.meetName,
        meetDate: data.meetDate,
        meetLocation: data.meetLocation || undefined,
        floor: typeof data.floor === 'number' ? data.floor : null,
        pommelHorse: typeof data.pommelHorse === 'number' ? data.pommelHorse : null,
        rings: typeof data.rings === 'number' ? data.rings : null,
        vault: typeof data.vault === 'number' ? data.vault : null,
        parallelBars: typeof data.parallelBars === 'number' ? data.parallelBars : null,
        highBar: typeof data.highBar === 'number' ? data.highBar : null,
      };
      const newResults = await addMeet(athleteProfile.id, payload);
      setResults((prev) => [...newResults, ...prev].sort((a, b) => new Date(b.meetDate).getTime() - new Date(a.meetDate).getTime()));
      resetMeet();
      setIsAddMeetModalOpen(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to add meet'
      );
    } finally {
      setIsAddMeetSubmitting(false);
    }
  }

  // Delete entire meet
  async function deleteMeet() {
    if (!athleteProfile || !deletingMeetKey) return;
    try {
      setIsDeleteSubmitting(true);
      setSubmitError(null);

      // Get all result IDs for this meet
      const meetResults = results.filter(
        (r) => `${r.meetName}|${r.meetDate}` === deletingMeetKey
      );

      // Use allSettled so a 404 on the auto-calculated ALL_AROUND result doesn't block the rest
      await Promise.allSettled(
        meetResults.map((r) => deleteCompetitionResult(athleteProfile.id, r.id))
      );

      // Remove the meet from the list
      setResults((prev) =>
        prev.filter((r) => `${r.meetName}|${r.meetDate}` !== deletingMeetKey)
      );
      setIsDeleteModalOpen(false);
      setDeletingMeetKey(null);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to delete meet'
      );
    } finally {
      setIsDeleteSubmitting(false);
    }
  }

  // Open meet edit modal
  function openEditMeetModal(meet: ReturnType<typeof groupResultsByMeet>[0]) {
    const nonAaResults = meet.allResults.filter(r => r.eventType !== 'ALL_AROUND');
    setEditingMeetResults(nonAaResults);
    const scores: Record<string, string> = {};
    nonAaResults.forEach(r => {
      scores[r.eventType] = r.score.toString();
    });
    setEditScores(scores);
    setIsEditMeetModalOpen(true);
  }

  // Save all edits from meet modal
  async function onEditMeetSave() {
    if (!athleteProfile) return;
    try {
      setIsEditMeetSubmitting(true);
      setSubmitError(null);

      const updatePromises = editingMeetResults.map(result => {
        const scoreStr = editScores[result.eventType];
        const parsedScore = scoreStr !== undefined && scoreStr !== '' ? parseFloat(scoreStr) : result.score;
        if (isNaN(parsedScore)) return Promise.resolve();
        console.log('[edit save]', { athleteId: athleteProfile.id, resultId: result.id, eventType: result.eventType, parsedScore, fullResult: result });
        return updateCompetitionResult(athleteProfile.id, result.id, {
          score: parsedScore,
          meetName: result.meetName,
          meetDate: result.meetDate,
          location: result.location,
          eventType: result.eventType,
        });
      });

      await Promise.all(updatePromises);

      // Refresh results list
      const updatedResults = await getCompetitionResults(athleteProfile.id);
      setResults(updatedResults.sort((a, b) => new Date(b.meetDate).getTime() - new Date(a.meetDate).getTime()));

      setIsEditMeetModalOpen(false);
      setEditingMeetResults([]);
      setEditScores({});
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to save meet changes'
      );
    } finally {
      setIsEditMeetSubmitting(false);
    }
  }

  // Group results by meet
  function groupResultsByMeet() {
    const grouped = new Map<string, CompetitionResult[]>();
    results.forEach((result) => {
      const key = `${result.meetName}|${result.meetDate}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(result);
    });

    return Array.from(grouped.values()).map((meetResults) => {
      const firstResult = meetResults[0];
      const byEvent: Record<EventType, CompetitionResult> = {} as Record<EventType, CompetitionResult>;
      let allAroundResult: CompetitionResult | undefined;

      meetResults.forEach((result) => {
        if (result.eventType === 'ALL_AROUND') {
          allAroundResult = result;
        } else {
          byEvent[result.eventType] = result;
        }
      });

      return {
        meetName: firstResult.meetName,
        meetDate: firstResult.meetDate,
        meetLocation: firstResult.location,
        allAroundScore: allAroundResult?.score,
        eventResults: byEvent,
        allResults: meetResults,
      };
    });
  }

  // Calculate stats
  function calculateStats() {
    if (results.length === 0) return null;

    const byEvent: Record<EventType, number[]> = {} as Record<EventType, number[]>;
    results.forEach((result) => {
      if (result.eventType !== 'ALL_AROUND') {
        if (!byEvent[result.eventType]) {
          byEvent[result.eventType] = [];
        }
        byEvent[result.eventType].push(result.score);
      }
    });

    return Object.entries(byEvent).map(([event, scores]) => ({
      event: event as EventType,
      average: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
      best: Math.max(...scores),
      count: scores.length,
    }));
  }

  const stats = calculateStats();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="spinner border-[#0a0a0a]"></span>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="heading-display text-4xl text-white mb-2">Competition Results</h1>
          <p className="text-gray-400">Track and manage your competition scores</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 max-w-2xl">
          <p className="text-gray-400 mb-4">{profileError}</p>
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="btn-primary"
          >
            Create Your Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">Competition Results</h1>
        <p className="text-gray-400">Track and manage your competition scores</p>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="error-message">{submitError}</div>
      )}

      {/* Success Message */}
      {submitSuccess && (
        <div className="success-message">Result added successfully!</div>
      )}

      {/* Add Meet Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddMeetModalOpen(true)}
          className="btn-primary px-6 py-2.5"
        >
          + Add Meet
        </button>
      </div>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <div>
          <h2 className="text-body-bold text-2xl mb-4 text-white">Your Performance Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.event}
                className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6"
              >
                <p className="text-gray-400 text-sm mb-2">{EVENT_DISPLAY_NAMES[stat.event]}</p>
                <p className="text-[#5EFF6E] text-3xl font-bold">{formatScore(stat.average)}</p>
                <p className="text-gray-500 text-sm mt-2">
                  avg ({stat.count} {stat.count === 1 ? 'meet' : 'meets'})
                </p>
                <p className="text-gray-400 text-sm">Best: {formatScore(stat.best)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results List Section */}
      <div>
        <h2 className="text-body-bold text-2xl mb-4 text-white">Competition History</h2>

        {resultsLoading ? (
          <div className="flex justify-center py-8">
            <span className="spinner border-[#0a0a0a]"></span>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-2">No competition results yet</p>
            <p className="text-gray-500 text-sm">
              Add your first result using the form above to start tracking your performance
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupResultsByMeet().map((meet, idx) => (
              <div
                key={idx}
                className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6"
              >
                {/* Meet Header */}
                <div className="mb-4 pb-4 border-b border-[#1f1f1f] flex items-start justify-between">
                  <div>
                    <p className="text-body-bold text-white text-lg">{meet.meetName}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(meet.meetDate).toLocaleDateString()} • {meet.meetLocation}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 relative">
                    {/* Three-dot menu */}
                    <button
                      onClick={() => setOpenMeetMenu(openMeetMenu === `${meet.meetName}|${meet.meetDate}` ? null : `${meet.meetName}|${meet.meetDate}`)}
                      className="text-gray-400 hover:text-white text-lg px-2 py-1 transition-colors"
                      title="More options"
                    >
                      ⋮
                    </button>
                    {openMeetMenu === `${meet.meetName}|${meet.meetDate}` && (
                      <div className="absolute right-0 top-8 bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg py-1 z-10 min-w-[160px] shadow-lg">
                        <button
                          onClick={() => {
                            setPostComposerMeetKey(`${meet.meetName}|${meet.meetDate}`);
                            setIsPostComposerOpen(true);
                            setOpenMeetMenu(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                        >
                          Post Meet Card
                        </button>
                        <button
                          onClick={() => {
                            setPostComposerMeetKey(`${meet.meetName}|${meet.meetDate}`);
                            setIsPostComposerOpen(true);
                            setOpenMeetMenu(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                        >
                          Post Score Highlight
                        </button>
                      </div>
                    )}
                    {/* Delete button */}
                    <button
                      onClick={() => {
                        setDeletingMeetKey(`${meet.meetName}|${meet.meetDate}`);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Event Scores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {(['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'] as EventType[]).map((eventType) => {
                    const result = meet.eventResults[eventType];
                    return (
                      <div key={eventType} className="text-center">
                        <p className="text-gray-400 text-xs mb-1">{EVENT_DISPLAY_NAMES[eventType]}</p>
                        <p className="text-[#5EFF6E] text-xl font-bold">
                          {formatScore(result?.score)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* ALL_AROUND Score */}
                {meet.allAroundScore !== undefined && (
                  <div className="bg-[#0a0a0a] rounded-lg px-4 py-2 mb-2 border border-[#5EFF6E]/20 text-center">
                    <p className="text-gray-400 text-xs mb-0.5">All Around</p>
                    <p className="text-[#5EFF6E] text-lg font-bold">{formatScore(meet.allAroundScore)}</p>
                  </div>
                )}

                {/* Edit Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => openEditMeetModal(meet)}
                    className="px-8 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded-full transition"
                  >
                    Edit Scores
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Meet Modal */}
      {isEditMeetModalOpen && editingMeetResults.length > 0 && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-body-bold text-2xl mb-2 text-white">Edit Meet Scores</h2>
            <p className="text-gray-400 text-sm mb-4">
              {editingMeetResults[0]?.meetName} • {new Date(editingMeetResults[0]?.meetDate).toLocaleDateString()}
            </p>
            {submitError && <div className="error-message mb-4">{submitError}</div>}

            <div className="space-y-6 mb-6">
              {(['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'] as EventType[]).map((eventType) => (
                <div key={eventType}>
                  <label className="input-label">{EVENT_DISPLAY_NAMES[eventType]}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="17.5"
                    value={editScores[eventType] ?? ''}
                    onChange={(e) => setEditScores(prev => ({ ...prev, [eventType]: e.target.value }))}
                    className="input-field"
                    placeholder="e.g. 14.250"
                    disabled={isEditMeetSubmitting}
                  />
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-4">
              <button
                onClick={onEditMeetSave}
                disabled={isEditMeetSubmitting}
                className="btn-primary flex-1"
              >
                {isEditMeetSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner border-[#0a0a0a]"></span>
                    Saving
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditMeetModalOpen(false);
                  setEditingMeetResults([]);
                  setEditScores({});
                }}
                disabled={isEditMeetSubmitting}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingMeetKey && (() => {
        const meetResults = results.filter(r => `${r.meetName}|${r.meetDate}` === deletingMeetKey);
        const firstResult = meetResults[0];
        return createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-body-bold text-2xl mb-4 text-white">Delete Meet</h2>
              {submitError && <div className="error-message mb-4">{submitError}</div>}
              <p className="text-gray-400 mb-2">
                Are you sure you want to delete this meet? This will remove all {meetResults.length} event results.
              </p>
              {firstResult && (
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3 mb-6">
                  <p className="text-white text-sm font-medium">{firstResult.meetName}</p>
                  <p className="text-gray-400 text-xs">{new Date(firstResult.meetDate).toLocaleDateString()}</p>
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={deleteMeet}
                  disabled={isDeleteSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium flex-1 transition"
                >
                  {isDeleteSubmitting ? 'Deleting...' : 'Delete Meet'}
                </button>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingMeetKey(null);
                  }}
                  disabled={isDeleteSubmitting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* Add Meet Modal */}
      {isAddMeetModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-body-bold text-2xl mb-6 text-white">Add Meet Results</h2>

            <form onSubmit={handleMeetSubmit(onAddMeet)} className="space-y-6">
              {/* Meet Name & Date Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Meet Name <span className="text-red-500">*</span></label>
                  <input
                    {...registerMeet('meetName')}
                    type="text"
                    className="input-field"
                    placeholder="State Championship"
                    disabled={isAddMeetSubmitting}
                  />
                  {meetErrors.meetName && (
                    <p className="text-red-400 text-sm mt-1">{meetErrors.meetName.message}</p>
                  )}
                </div>
                <div>
                  <label className="input-label">Meet Date <span className="text-red-500">*</span></label>
                  <input
                    {...registerMeet('meetDate')}
                    type="date"
                    className="input-field"
                    disabled={isAddMeetSubmitting}
                  />
                  {meetErrors.meetDate && (
                    <p className="text-red-400 text-sm mt-1">{meetErrors.meetDate.message}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="input-label">Meet Location</label>
                <input
                  {...registerMeet('meetLocation')}
                  type="text"
                  className="input-field"
                  placeholder="e.g., Sacramento, CA"
                  disabled={isAddMeetSubmitting}
                />
              </div>

              {/* Event Scores Section */}
              <div>
                <label className="input-label block mb-3">Event Scores</label>
                <p className="text-gray-500 text-sm mb-4">(leave blank if you didn't compete in an event)</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Floor Exercise</label>
                    <input
                      {...registerMeet('floor')}
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="e.g. 14.250"
                      disabled={isAddMeetSubmitting}
                    />
                    {meetErrors.floor && (
                      <p className="text-red-400 text-sm mt-1">{meetErrors.floor.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Pommel Horse</label>
                    <input
                      {...registerMeet('pommelHorse')}
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="e.g. 15.100"
                      disabled={isAddMeetSubmitting}
                    />
                    {meetErrors.pommelHorse && (
                      <p className="text-red-400 text-sm mt-1">{meetErrors.pommelHorse.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Rings</label>
                    <input
                      {...registerMeet('rings')}
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="e.g. 13.800"
                      disabled={isAddMeetSubmitting}
                    />
                    {meetErrors.rings && (
                      <p className="text-red-400 text-sm mt-1">{meetErrors.rings.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Vault</label>
                    <input
                      {...registerMeet('vault')}
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="e.g. 16.500"
                      disabled={isAddMeetSubmitting}
                    />
                    {meetErrors.vault && (
                      <p className="text-red-400 text-sm mt-1">{meetErrors.vault.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Parallel Bars</label>
                    <input
                      {...registerMeet('parallelBars')}
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="e.g. 14.500"
                      disabled={isAddMeetSubmitting}
                    />
                    {meetErrors.parallelBars && (
                      <p className="text-red-400 text-sm mt-1">{meetErrors.parallelBars.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">High Bar</label>
                    <input
                      {...registerMeet('highBar')}
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="e.g. 15.750"
                      disabled={isAddMeetSubmitting}
                    />
                    {meetErrors.highBar && (
                      <p className="text-red-400 text-sm mt-1">{meetErrors.highBar.message}</p>
                    )}
                  </div>
                </div>

                {meetErrors.root && (
                  <p className="text-red-400 text-sm mt-4">{meetErrors.root?.message}</p>
                )}
              </div>

              {/* ALL_AROUND Info */}
              <div className="bg-[#0a0a0a] border border-[#5EFF6E]/20 rounded-lg p-4">
                <p className="text-gray-300 text-sm">All Around score will be automatically calculated from your event scores</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isAddMeetSubmitting}
                  className="btn-primary flex-1"
                >
                  {isAddMeetSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="spinner border-[#0a0a0a]"></span>
                      Adding Meet
                    </span>
                  ) : (
                    'Add Meet Results'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddMeetModalOpen(false)}
                  disabled={isAddMeetSubmitting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Post Composer Modal */}
      {athleteProfile && (
        <PostComposerModal
          isOpen={isPostComposerOpen}
          onClose={() => {
            setIsPostComposerOpen(false);
            setPostComposerMeetKey(null);
          }}
          onSuccess={() => {
            setIsPostComposerOpen(false);
            setPostComposerMeetKey(null);
          }}
          athleteResults={results}
          prefilledMeetKey={postComposerMeetKey ?? undefined}
          prefilledTab="meet"
        />
      )}
    </div>
  );
}
