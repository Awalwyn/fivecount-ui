'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  addCompetitionResult,
  addMeet,
  getCompetitionResults,
  updateCompetitionResult,
  deleteCompetitionResult,
  CompetitionResult,
  EventType,
} from '@/lib/api/competitions';
import { getAthleteByUserId, AthleteProfile } from '@/lib/api/athletes';

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

type AddMeetFormData = z.infer<typeof addMeetSchema>;

// Keep old schema for edit modal
const competitionResultSchema = z.object({
  meetName: z.string().min(1, 'Meet name is required').max(100),
  meetDate: z.string().min(1, 'Meet date is required').refine(
    (date) => new Date(date) <= new Date(),
    'Meet date cannot be in the future'
  ),
  location: z.string().min(1, 'Location is required').max(100),
  eventType: z.enum([
    'ALL_AROUND',
    'FLOOR',
    'POMMEL_HORSE',
    'RINGS',
    'VAULT',
    'PARALLEL_BARS',
    'HIGH_BAR',
  ]),
  score: z.number().min(0, 'Score cannot be negative').max(20, 'Score cannot exceed 20'),
});

type CompetitionResultFormData = z.infer<typeof competitionResultSchema>;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Edit single result modal state
  const [editingResult, setEditingResult] = useState<CompetitionResult | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Edit meet modal state
  const [editingMeetKey, setEditingMeetKey] = useState<string | null>(null);
  const [editingMeetResults, setEditingMeetResults] = useState<CompetitionResult[]>([]);
  const [isEditMeetModalOpen, setIsEditMeetModalOpen] = useState(false);
  const [isEditMeetSubmitting, setIsEditMeetSubmitting] = useState(false);

  // Delete modal state
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  // Add Meet modal state
  const [isAddMeetModalOpen, setIsAddMeetModalOpen] = useState(false);
  const [isAddMeetSubmitting, setIsAddMeetSubmitting] = useState(false);

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

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompetitionResultFormData>({
    resolver: zodResolver(competitionResultSchema),
    defaultValues: {
      meetName: '',
      meetDate: '',
      location: '',
      eventType: 'FLOOR',
      score: 0,
    },
  });

  // Edit form
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    formState: { errors: editErrors },
    reset: resetEdit,
  } = useForm<CompetitionResultFormData>({
    resolver: zodResolver(competitionResultSchema),
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

  // Add new result
  async function onSubmit(data: CompetitionResultFormData) {
    if (!athleteProfile) return;
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const newResult = await addCompetitionResult(athleteProfile.id, data);
      setResults((prev) => [newResult, ...prev].sort((a, b) => new Date(b.meetDate).getTime() - new Date(a.meetDate).getTime()));
      reset();
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to add competition result'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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

  // Update result
  async function onEditSubmit(data: CompetitionResultFormData) {
    if (!athleteProfile || !editingResult) return;
    try {
      setIsEditSubmitting(true);
      const updatedResult = await updateCompetitionResult(athleteProfile.id, editingResult.id, data);
      setResults((prev) =>
        prev.map((r) => (r.id === editingResult.id ? updatedResult : r))
      );
      setIsEditModalOpen(false);
      setEditingResult(null);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to update result'
      );
    } finally {
      setIsEditSubmitting(false);
    }
  }

  // Delete result
  async function confirmDelete() {
    if (!athleteProfile || !deletingResultId) return;
    try {
      setIsDeleteSubmitting(true);
      await deleteCompetitionResult(athleteProfile.id, deletingResultId);
      setResults((prev) => prev.filter((r) => r.id !== deletingResultId));
      setIsDeleteModalOpen(false);
      setDeletingResultId(null);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to delete result'
      );
    } finally {
      setIsDeleteSubmitting(false);
    }
  }

  // Open edit modal with pre-filled form
  function openEditModal(result: CompetitionResult) {
    setEditingResult(result);
    resetEdit({
      meetName: result.meetName,
      meetDate: result.meetDate,
      location: result.location,
      eventType: result.eventType,
      score: result.score,
    });
    setIsEditModalOpen(true);
  }

  // Open meet edit modal
  function openEditMeetModal(meet: ReturnType<typeof groupResultsByMeet>[0]) {
    const key = `${meet.meetName}|${meet.meetDate}`;
    setEditingMeetKey(key);
    setEditingMeetResults(meet.allResults.filter(r => r.eventType !== 'ALL_AROUND'));
    setIsEditMeetModalOpen(true);
  }

  // Update a single event score in the meet editor
  function updateMeetEventScore(eventType: EventType, newScore: number | null) {
    setEditingMeetResults(prev =>
      prev.map(r => r.eventType === eventType ? { ...r, score: newScore ?? r.score } : r)
    );
  }

  // Save all edits from meet modal
  async function onEditMeetSave() {
    if (!athleteProfile) return;
    try {
      setIsEditMeetSubmitting(true);
      setSubmitError(null);

      // Update each result that might have changed
      const updatePromises = editingMeetResults.map(result =>
        updateCompetitionResult(athleteProfile.id, result.id, { score: result.score })
      );

      await Promise.all(updatePromises);

      // Refresh results list
      const updatedResults = await getCompetitionResults(athleteProfile.id);
      setResults(updatedResults.sort((a, b) => new Date(b.meetDate).getTime() - new Date(a.meetDate).getTime()));

      setIsEditMeetModalOpen(false);
      setEditingMeetKey(null);
      setEditingMeetResults([]);
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
                <p className="text-[#5EFF6E] text-3xl font-bold">{stat.average}</p>
                <p className="text-gray-500 text-sm mt-2">
                  avg ({stat.count} {stat.count === 1 ? 'meet' : 'meets'})
                </p>
                <p className="text-gray-400 text-sm">Best: {stat.best}</p>
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
                <div className="mb-4 pb-4 border-b border-[#1f1f1f]">
                  <p className="text-body-bold text-white text-lg">{meet.meetName}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(meet.meetDate).toLocaleDateString()} • {meet.meetLocation}
                  </p>
                </div>

                {/* Event Scores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {(['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'] as EventType[]).map((eventType) => {
                    const result = meet.eventResults[eventType];
                    return (
                      <div key={eventType} className="text-center">
                        <p className="text-gray-400 text-xs mb-1">{EVENT_DISPLAY_NAMES[eventType]}</p>
                        <p className="text-[#5EFF6E] text-xl font-bold">
                          {result ? result.score : '—'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* ALL_AROUND Score */}
                {meet.allAroundScore !== undefined && (
                  <div className="bg-[#0a0a0a] rounded-lg px-4 py-2 mb-2 border border-[#5EFF6E]/20 text-center">
                    <p className="text-gray-400 text-xs mb-0.5">All Around</p>
                    <p className="text-[#5EFF6E] text-lg font-bold">{meet.allAroundScore}</p>
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

      {/* Edit Modal */}
      {isEditModalOpen && editingResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-body-bold text-2xl mb-6 text-white">Edit Result</h2>

            <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-6">
              {/* Meet Name & Date Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Meet Name</label>
                  <input
                    {...registerEdit('meetName')}
                    type="text"
                    className="input-field"
                    disabled={isEditSubmitting}
                  />
                  {editErrors.meetName && (
                    <p className="text-red-400 text-sm mt-1">{editErrors.meetName.message}</p>
                  )}
                </div>
                <div>
                  <label className="input-label">Meet Date</label>
                  <input
                    {...registerEdit('meetDate')}
                    type="date"
                    className="input-field"
                    disabled={isEditSubmitting}
                  />
                  {editErrors.meetDate && (
                    <p className="text-red-400 text-sm mt-1">{editErrors.meetDate.message}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="input-label">Location</label>
                <input
                  {...registerEdit('location')}
                  type="text"
                  className="input-field"
                  disabled={isEditSubmitting}
                />
                {editErrors.location && (
                  <p className="text-red-400 text-sm mt-1">{editErrors.location.message}</p>
                )}
              </div>

              {/* Event Type */}
              <div>
                <label className="input-label">Event</label>
                <select
                  {...registerEdit('eventType')}
                  className="input-field"
                  disabled={isEditSubmitting}
                >
                  {Object.entries(EVENT_DISPLAY_NAMES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {editErrors.eventType && (
                  <p className="text-red-400 text-sm mt-1">{editErrors.eventType.message}</p>
                )}
              </div>

              {/* Score */}
              <div>
                <label className="input-label">Score</label>
                <input
                  {...registerEdit('score', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  className="input-field"
                  disabled={isEditSubmitting}
                />
                {editErrors.score && (
                  <p className="text-red-400 text-sm mt-1">{editErrors.score.message}</p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="btn-primary flex-1"
                >
                  {isEditSubmitting ? (
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
                    setIsEditModalOpen(false);
                    setEditingResult(null);
                  }}
                  disabled={isEditSubmitting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Meet Modal */}
      {isEditMeetModalOpen && editingMeetResults.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-body-bold text-2xl mb-2 text-white">Edit Meet Scores</h2>
            <p className="text-gray-400 text-sm mb-6">
              {editingMeetResults[0]?.meetName} • {new Date(editingMeetResults[0]?.meetDate).toLocaleDateString()}
            </p>

            <div className="space-y-6 mb-6">
              {(['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'] as EventType[]).map((eventType) => {
                const result = editingMeetResults.find(r => r.eventType === eventType);
                return (
                  <div key={eventType}>
                    <label className="input-label">{EVENT_DISPLAY_NAMES[eventType]}</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="17.5"
                      value={result?.score ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : parseFloat(e.target.value);
                        updateMeetEventScore(eventType, value);
                      }}
                      className="input-field"
                      placeholder="e.g. 14.250"
                      disabled={isEditMeetSubmitting}
                    />
                  </div>
                );
              })}
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
                  setEditingMeetKey(null);
                  setEditingMeetResults([]);
                }}
                disabled={isEditMeetSubmitting}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingResultId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-body-bold text-2xl mb-4 text-white">Delete Result</h2>
            {results.find((r) => r.id === deletingResultId) && (
              <>
                <p className="text-gray-400 mb-2">
                  Are you sure you want to delete this result?
                </p>
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3 mb-6">
                  <p className="text-white text-sm font-medium">{results.find((r) => r.id === deletingResultId)?.meetName}</p>
                  <p className="text-[#5EFF6E] text-sm">
                    {EVENT_DISPLAY_NAMES[results.find((r) => r.id === deletingResultId)?.eventType as EventType]} - {results.find((r) => r.id === deletingResultId)?.score}
                  </p>
                </div>
              </>
            )}
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                disabled={isDeleteSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-medium flex-1 transition"
              >
                {isDeleteSubmitting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingResultId(null);
                }}
                disabled={isDeleteSubmitting}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Meet Modal */}
      {isAddMeetModalOpen && (
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
        </div>
      )}
    </div>
  );
}
