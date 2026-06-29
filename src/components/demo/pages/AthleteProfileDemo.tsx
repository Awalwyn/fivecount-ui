'use client';

import { useState } from 'react';
import { demoAthlete, demoAthleteAwards, demoAthletePosts } from '../data/mockData';
import { Award, Award as AwardIcon, Edit, X } from 'lucide-react';

type ScoreEventId =
  | 'ALL_AROUND'
  | 'FLOOR'
  | 'POMMEL_HORSE'
  | 'RINGS'
  | 'VAULT'
  | 'PARALLEL_BARS'
  | 'HIGH_BAR';

type ScoreView = 'LINE' | 'RADAR';

const scoreEvents: { id: ScoreEventId; label: string; shortLabel: string }[] = [
  { id: 'ALL_AROUND', label: 'All Around', shortLabel: 'AA' },
  { id: 'FLOOR', label: 'Floor', shortLabel: 'Floor' },
  { id: 'POMMEL_HORSE', label: 'Pommel', shortLabel: 'Pommel' },
  { id: 'RINGS', label: 'Rings', shortLabel: 'Rings' },
  { id: 'VAULT', label: 'Vault', shortLabel: 'Vault' },
  { id: 'PARALLEL_BARS', label: 'P. Bars', shortLabel: 'P. Bars' },
  { id: 'HIGH_BAR', label: 'High Bar', shortLabel: 'High Bar' },
];

const scoreProgressionMeets: {
  name: string;
  shortName: string;
  date: string;
  scores: Record<ScoreEventId, number>;
}[] = [
  {
    name: 'Regional Championship',
    shortName: 'Regionals',
    date: 'Feb 1, 2026',
    scores: {
      ALL_AROUND: 77.1,
      FLOOR: 14.1,
      POMMEL_HORSE: 12.4,
      RINGS: 13.9,
      VAULT: 14.8,
      PARALLEL_BARS: 13.0,
      HIGH_BAR: 8.9,
    },
  },
  {
    name: 'State Qualifier Meet',
    shortName: 'State',
    date: 'Feb 28, 2026',
    scores: {
      ALL_AROUND: 81.8,
      FLOOR: 13.7,
      POMMEL_HORSE: 13.4,
      RINGS: 13.2,
      VAULT: 15.4,
      PARALLEL_BARS: 13.5,
      HIGH_BAR: 12.6,
    },
  },
  {
    name: 'West Coast Classic',
    shortName: 'West Coast',
    date: 'Mar 15, 2026',
    scores: {
      ALL_AROUND: 81.9,
      FLOOR: 14.9,
      POMMEL_HORSE: 13.3,
      RINGS: 14.4,
      VAULT: 15.2,
      PARALLEL_BARS: 13.8,
      HIGH_BAR: 10.3,
    },
  },
];

function getEventStats(eventId: ScoreEventId) {
  const scores = scoreProgressionMeets.map((meet) => meet.scores[eventId]);
  const seasonBest = Math.max(...scores);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  return {
    average,
    seasonBest,
    timesCompeted: scores.length,
  };
}

export function AthleteProfileDemo() {
  const [showEditModal, setShowEditModal] = useState(false);
  const allAroundStats = getEventStats('ALL_AROUND');
  const bestEventScore = Math.max(
    ...scoreEvents
      .filter((event) => event.id !== 'ALL_AROUND')
      .map((event) => getEventStats(event.id).seasonBest)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="bg-[#111111] border border-[#1f1f1f] rounded-lg overflow-hidden">
        <div className="h-32 sm:h-44 bg-gradient-to-br from-[#18351d] via-[#102213] to-[#0a0a0a]" />
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-5 -mt-8 sm:-mt-10">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#1f1f1f] border-4 border-[#111111] flex items-center justify-center text-[#5EFF6E] heading-display text-4xl shrink-0">
              MJ
            </div>

            <div className="flex-1 lg:pb-2 min-w-0">
              <div className="flex flex-col gap-4">
                <div className="min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <h1 className="heading-display text-4xl sm:text-5xl leading-none">
                      {demoAthlete.firstName} {demoAthlete.lastName}
                    </h1>
                    <span className="inline-flex w-fit shrink-0 rounded-full bg-[#5EFF6E] px-3 py-1 text-xs font-bold text-[#0a0a0a]">
                      OPEN TO RECRUITING
                    </span>
                  </div>
                  <p className="text-[#5EFF6E] font-semibold mt-2">
                    Level 10 · {demoAthlete.clubName}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#a0a0a0] mt-3">
                    <span>{demoAthlete.city}, {demoAthlete.state}</span>
                    <span>C/O {demoAthlete.gradYear}</span>
                    {demoAthlete.instagramHandle && <span>{demoAthlete.instagramHandle}</span>}
                  </div>
                </div>
              </div>

              <p className="text-[#d6d6d6] text-sm leading-relaxed mt-5 max-w-4xl">
                {demoAthlete.bio}
              </p>

              <button
                onClick={() => setShowEditModal(true)}
                className="btn-secondary mt-5 w-full px-4 py-2 flex items-center justify-center gap-2"
              >
                <Edit size={16} /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-[#a0a0a0] text-xs mb-1">AA Peak</p>
          <p className="heading-display text-2xl">{allAroundStats.seasonBest.toFixed(1)}</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-[#a0a0a0] text-xs mb-1">Best Score</p>
          <p className="heading-display text-2xl">{bestEventScore.toFixed(1)}</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-[#a0a0a0] text-xs mb-1">Recent Meets</p>
          <p className="heading-display text-2xl">{scoreProgressionMeets.length}</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-[#a0a0a0] text-xs mb-1">GPA</p>
          <p className="heading-display text-2xl">3.7</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)] gap-6">
        <div className="space-y-6">
          <ScoreProgressionSection />

          {/* Recent Posts */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Posts</h2>
            <div className="space-y-3">
              {demoAthletePosts.slice(0, 2).map((post) => (
                <div key={post.id} className="border border-[#1f1f1f] rounded p-4">
                  {post.content && (
                    <p className="text-sm mb-2">{post.content}</p>
                  )}
                  {post.meetReference && (
                    <div className="text-xs text-[#5EFF6E] font-semibold bg-[#0a0a0a] px-2 py-1 rounded w-fit">
                      {post.meetReference}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          {/* Recent Meets */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Meets</h2>
            <div className="space-y-4">
              {scoreProgressionMeets.slice().reverse().map((meet) => (
                <div key={meet.name}>
                  <p className="font-semibold text-sm">{meet.shortName}</p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5">{meet.date}</p>
                  <p className="text-[#5EFF6E] font-bold text-sm mt-2">
                    AA: {meet.scores.ALL_AROUND.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Awards */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AwardIcon size={18} className="text-[#5EFF6E]" /> Awards
            </h2>
            <div className="space-y-2">
              {demoAthleteAwards.map((award) => (
                <div key={award.id} className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded">
                  <Award size={16} className="text-[#5EFF6E]" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{award.title}</p>
                  </div>
                  <span className="text-xs text-[#a0a0a0]">{award.year}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Bests</h2>
            <div className="space-y-3">
              {scoreEvents.filter((event) => event.id !== 'ALL_AROUND').map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#a0a0a0]">{event.label}</span>
                  <span className="text-[#5EFF6E] font-bold">
                    {Math.max(...scoreProgressionMeets.map((meet) => meet.scores[event.id])).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#a0a0a0] hover:text-[#ffffff]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="input-label">First Name</label>
                <input type="text" defaultValue={demoAthlete.firstName} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label">Last Name</label>
                <input type="text" defaultValue={demoAthlete.lastName} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label">Bio</label>
                <textarea defaultValue={demoAthlete.bio} className="input-field w-full" rows={3} />
              </div>
              <div>
                <label className="input-label">Instagram Handle</label>
                <input type="text" defaultValue={demoAthlete.instagramHandle} className="input-field w-full" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowEditModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                }}
                className="btn-primary flex-1"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreProgressionSection() {
  const [view, setView] = useState<ScoreView>('LINE');
  const [selectedEvent, setSelectedEvent] = useState<ScoreEventId>('ALL_AROUND');
  const selectedEventMeta = scoreEvents.find((event) => event.id === selectedEvent) ?? scoreEvents[0];
  const selectedScores = scoreProgressionMeets.map((meet) => ({
    meet: meet.shortName,
    score: meet.scores[selectedEvent],
  }));
  const peak = Math.max(...selectedScores.map((item) => item.score));

  return (
    <section className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h2 className="text-lg font-semibold">Score Progression</h2>
        <button className="text-sm text-[#a0a0a0] underline underline-offset-4 hover:text-white">
          Expand
        </button>
      </div>

      <div className="bg-[#0a0a0a] rounded-lg p-4 sm:p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <ToggleButton active={view === 'LINE'} onClick={() => setView('LINE')}>
            Line Graph
          </ToggleButton>
          <ToggleButton active={view === 'RADAR'} onClick={() => setView('RADAR')}>
            Radar Graph
          </ToggleButton>
        </div>

        {view === 'LINE' && (
          <div className="flex flex-wrap gap-2 mb-5">
            {scoreEvents.map((event) => (
              <ToggleButton
                key={event.id}
                active={selectedEvent === event.id}
                onClick={() => setSelectedEvent(event.id)}
              >
                {event.label}
              </ToggleButton>
            ))}
          </div>
        )}

        {view === 'LINE' ? (
          <LineGraph scores={selectedScores} selectedEvent={selectedEvent} />
        ) : (
          <RadarGraph />
        )}

        <div className="border-t border-[#1f1f1f] mt-5 pt-4 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-[#a0a0a0]">
            <span className="w-3 h-3 rounded-full bg-[#5EFF6E]" />
            {view === 'LINE' ? selectedEventMeta.shortLabel : 'Season Best'}
          </span>
          <span className="text-[#a0a0a0]">
            Peak: <span className="text-[#5EFF6E] font-bold">{peak.toFixed(2)}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

function ToggleButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? 'border-[#5EFF6E] bg-[#5EFF6E] text-[#0a0a0a]'
          : 'border-[#1f1f1f] bg-[#111111] text-white hover:border-[#5EFF6E]/60'
      }`}
    >
      {children}
    </button>
  );
}

function LineGraph({
  scores,
  selectedEvent,
}: {
  scores: { meet: string; score: number }[];
  selectedEvent: ScoreEventId;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    average: number;
    meet: string;
    score: number;
    seasonBest: number;
    x: number;
    y: number;
  } | null>(null);
  const chartWidth = 640;
  const chartHeight = 250;
  const padding = { top: 26, right: 22, bottom: 42, left: 42 };
  const minValue = selectedEvent === 'ALL_AROUND' ? 70 : 0;
  const maxValue = selectedEvent === 'ALL_AROUND' ? 90 : 16;
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const yTicks = selectedEvent === 'ALL_AROUND' ? [70, 75, 80, 85, 90] : [0, 4, 8, 12, 16];
  const eventStats = getEventStats(selectedEvent);

  const points = scores.map((item, index) => {
    const x = padding.left + (plotWidth / Math.max(scores.length - 1, 1)) * index;
    const y = padding.top + plotHeight - ((item.score - minValue) / (maxValue - minValue)) * plotHeight;
    return { ...item, x, y };
  });

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" role="img" aria-label="Score progression line graph">
        {yTicks.map((tick) => {
          const y = padding.top + plotHeight - ((tick - minValue) / (maxValue - minValue)) * plotHeight;
          return (
            <g key={tick}>
              <line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} stroke="#1f1f1f" strokeDasharray="5 5" />
              <text x={padding.left - 12} y={y + 5} textAnchor="end" fill="#7f8794" fontSize="13">
                {tick}
              </text>
            </g>
          );
        })}
        {points.map((point) => (
          <g key={point.meet}>
            <line x1={point.x} x2={point.x} y1={padding.top} y2={padding.top + plotHeight} stroke="#161616" strokeDasharray="4 5" />
            <text x={point.x} y={chartHeight - 12} textAnchor="middle" fill="#7f8794" fontSize="13">
              {point.meet}
            </text>
          </g>
        ))}
        <polyline
          points={points.map((point) => `${point.x},${point.y}`).join(' ')}
          fill="none"
          stroke="#5EFF6E"
          strokeOpacity="0.82"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point) => (
          <g
            key={`${point.meet}-${point.score}`}
            onBlur={() => setHoveredPoint(null)}
            onFocus={() => setHoveredPoint({ ...point, average: eventStats.average, seasonBest: eventStats.seasonBest })}
            onMouseEnter={() => setHoveredPoint({ ...point, average: eventStats.average, seasonBest: eventStats.seasonBest })}
            onMouseLeave={() => setHoveredPoint(null)}
            onPointerEnter={() => setHoveredPoint({ ...point, average: eventStats.average, seasonBest: eventStats.seasonBest })}
            onPointerLeave={() => setHoveredPoint(null)}
            pointerEvents="all"
            tabIndex={0}
          >
            <circle cx={point.x} cy={point.y} r="9" fill="transparent" />
            <circle cx={point.x} cy={point.y} r="5" fill="#0a0a0a" stroke="#5EFF6E" strokeOpacity="0.9" strokeWidth="2.5" />
          </g>
        ))}
        {hoveredPoint && (
          <GraphTooltip
            chartWidth={chartWidth}
            rows={[
              { label: 'Score', value: hoveredPoint.score.toFixed(2) },
              { label: 'Season High', value: hoveredPoint.seasonBest.toFixed(2) },
              { label: 'Average', value: hoveredPoint.average.toFixed(2) },
            ]}
            title={hoveredPoint.meet}
            x={hoveredPoint.x}
            y={hoveredPoint.y}
          />
        )}
      </svg>
    </div>
  );
}

function RadarGraph() {
  const [hoveredEvent, setHoveredEvent] = useState<{
    average: number;
    label: string;
    seasonBest: number;
    timesCompeted: number;
    x: number;
    y: number;
  } | null>(null);
  const events = scoreEvents.filter((event) => event.id !== 'ALL_AROUND');
  const chartSize = 340;
  const center = chartSize / 2;
  const maxRadius = 102;
  const labelRadius = maxRadius + 20;
  const rings = [0.33, 0.66, 1];
  const radarMinScore = 8;
  const radarMaxScore = 16;
  const getRadarRadius = (score: number) => (
    Math.max(0, Math.min(1, (score - radarMinScore) / (radarMaxScore - radarMinScore))) * maxRadius
  );
  const axisPoints = events.map((event, index) => {
    const angle = -Math.PI / 2 + (index / events.length) * Math.PI * 2;
    return {
      event,
      angle,
      labelX: center + Math.cos(angle) * labelRadius,
      labelY: center + Math.sin(angle) * labelRadius,
      endX: center + Math.cos(angle) * maxRadius,
      endY: center + Math.sin(angle) * maxRadius,
    };
  });
  const bestScores = events.map((event) => ({
    event,
    ...getEventStats(event.id),
  }));
  const polygonPoints = bestScores.map(({ seasonBest }, index) => {
    const angle = axisPoints[index].angle;
    const radius = getRadarRadius(seasonBest);
    return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
  });

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-5 min-h-[250px]">
      <svg viewBox={`0 0 ${chartSize} ${chartSize}`} className="w-full max-w-[340px] h-auto overflow-visible" role="img" aria-label="Season best radar graph">
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={axisPoints.map(({ angle }) => `${center + Math.cos(angle) * maxRadius * ring},${center + Math.sin(angle) * maxRadius * ring}`).join(' ')}
            fill="none"
            stroke="#1f1f1f"
            strokeWidth="1.5"
          />
        ))}
        {axisPoints.map((point) => (
          <g key={point.event.id}>
            <line x1={center} y1={center} x2={point.endX} y2={point.endY} stroke="#1f1f1f" strokeWidth="1.5" />
            <text
              x={point.labelX}
              y={point.labelY}
              textAnchor={Math.abs(point.labelX - center) < 8 ? 'middle' : point.labelX > center ? 'middle' : 'middle'}
              dominantBaseline="middle"
              fill="#9ca3af"
              fontSize="12"
            >
              {point.event.shortLabel}
            </text>
          </g>
        ))}
        <polygon points={polygonPoints.join(' ')} fill="rgba(94, 255, 110, 0.18)" stroke="#5EFF6E" strokeOpacity="0.85" strokeWidth="2.5" />
        {bestScores.map(({ average, event, seasonBest, timesCompeted }, index) => {
          const angle = axisPoints[index].angle;
          const radius = getRadarRadius(seasonBest);
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return (
            <g
              key={event.id}
              onBlur={() => setHoveredEvent(null)}
              onFocus={() => setHoveredEvent({ average, label: event.label, seasonBest, timesCompeted, x, y })}
              onMouseEnter={() => setHoveredEvent({ average, label: event.label, seasonBest, timesCompeted, x, y })}
              onMouseLeave={() => setHoveredEvent(null)}
              onPointerEnter={() => setHoveredEvent({ average, label: event.label, seasonBest, timesCompeted, x, y })}
              onPointerLeave={() => setHoveredEvent(null)}
              pointerEvents="all"
              tabIndex={0}
            >
              <circle cx={x} cy={y} r="9" fill="transparent" />
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#5EFF6E"
                stroke="#d6ffd9"
                strokeWidth="1.5"
              />
            </g>
          );
        })}
        {hoveredEvent && (
          <GraphTooltip
            chartWidth={chartSize}
            rows={[
              { label: 'Season Best', value: hoveredEvent.seasonBest.toFixed(2) },
              { label: 'Average', value: hoveredEvent.average.toFixed(2) },
              { label: 'Competed', value: String(hoveredEvent.timesCompeted) },
            ]}
            title={hoveredEvent.label}
            x={hoveredEvent.x}
            y={hoveredEvent.y}
          />
        )}
        {[10, 13, 16].map((tick) => (
          <text
            key={tick}
            x={center + 5}
            y={center - getRadarRadius(tick) + 4}
            fill="#68707d"
            fontSize="11"
          >
            {tick}
          </text>
        ))}
      </svg>

      <div className="grid grid-cols-2 gap-x-5 gap-y-3 w-full lg:w-56">
        {bestScores.map(({ event, seasonBest }) => (
          <div key={event.id} className="flex items-center justify-between gap-3">
            <span className="text-xs text-[#a0a0a0]">{event.shortLabel}</span>
            <span className="text-sm text-[#5EFF6E] font-bold">{seasonBest.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphTooltip({
  chartWidth,
  rows,
  title,
  x,
  y,
}: {
  chartWidth: number;
  rows: { label: string; value: string }[];
  title: string;
  x: number;
  y: number;
}) {
  const tooltipWidth = 154;
  const tooltipHeight = 30 + rows.length * 22;
  const tooltipX = Math.max(8, Math.min(chartWidth - tooltipWidth - 8, x + 14));
  const tooltipY = Math.max(8, y - tooltipHeight - 12);

  return (
    <g pointerEvents="none">
      <rect
        x={tooltipX}
        y={tooltipY}
        width={tooltipWidth}
        height={tooltipHeight}
        rx="10"
        fill="#111111"
        stroke="#1f1f1f"
        strokeWidth="1.5"
      />
      <text x={tooltipX + 14} y={tooltipY + 22} fill="#ffffff" fontSize="14" fontWeight="700">
        {title}
      </text>
      {rows.map((row, index) => (
        <g key={row.label}>
          <text x={tooltipX + 14} y={tooltipY + 46 + index * 22} fill="#8b93a3" fontSize="13">
            {row.label}
          </text>
          <text x={tooltipX + tooltipWidth - 14} y={tooltipY + 46 + index * 22} fill="#5EFF6E" fontSize="13" fontWeight="700" textAnchor="end">
            {row.value}
          </text>
        </g>
      ))}
    </g>
  );
}
