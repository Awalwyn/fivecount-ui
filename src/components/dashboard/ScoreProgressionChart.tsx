'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CompetitionResult, EventType } from '@/lib/api/competitions';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

const EVENT_TABS: { type: EventType; label: string }[] = [
  { type: 'ALL_AROUND', label: 'All Around' },
  { type: 'FLOOR', label: 'Floor' },
  { type: 'POMMEL_HORSE', label: 'Pommel' },
  { type: 'RINGS', label: 'Rings' },
  { type: 'VAULT', label: 'Vault' },
  { type: 'PARALLEL_BARS', label: 'P. Bars' },
  { type: 'HIGH_BAR', label: 'High Bar' },
];

const EVENT_STAT_LABELS: Partial<Record<EventType, string>> = {
  FLOOR: 'Floor',
  POMMEL_HORSE: 'Pommel Horse',
  RINGS: 'Rings',
  VAULT: 'Vault',
  PARALLEL_BARS: 'Parallel Bars',
  HIGH_BAR: 'High Bar',
  ALL_AROUND: 'All Around',
};

function getYAxisMax(eventType: EventType): number {
  return eventType === 'ALL_AROUND' ? 100 : 20;
}

interface ScoreProgressionChartProps {
  results: CompetitionResult[];
  activeEvent: EventType;
  onEventChange: (e: EventType) => void;
}

export function ScoreProgressionChart({
  results,
  activeEvent,
  onEventChange,
}: ScoreProgressionChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLineChartExpanded, setIsLineChartExpanded] = useState(false);
  const [chartType, setChartType] = useState<'radar' | 'line'>('radar');
  const uniqueMeetCount = new Set(results.map(r => `${r.meetName}|${r.meetDate}`)).size;
  const yAxisMax = getYAxisMax(activeEvent);

  // 0 meets — placeholder
  if (results.length === 0) {
    return (
      <div className="bg-[#0a0a0a] rounded-lg p-8 text-center text-gray-400 text-sm">
        Add your first meet to see score progression
      </div>
    );
  }

  // 1–2 meets — season best radar only
  if (uniqueMeetCount < 3) {
    const bestByEvent: Partial<Record<EventType, number>> = {};
    results.forEach(r => {
      if (r.eventType === 'ALL_AROUND') return;
      if (bestByEvent[r.eventType] === undefined || r.score > bestByEvent[r.eventType]!) {
        bestByEvent[r.eventType] = r.score;
      }
    });

    const eventTabs = EVENT_TABS.filter(t => t.type !== 'ALL_AROUND');

    const sumByEvent: Partial<Record<EventType, { total: number; count: number }>> = {};
    results.forEach(r => {
      if (r.eventType === 'ALL_AROUND') return;
      if (!sumByEvent[r.eventType]) sumByEvent[r.eventType] = { total: 0, count: 0 };
      sumByEvent[r.eventType]!.total += r.score;
      sumByEvent[r.eventType]!.count += 1;
    });

    const radarData = eventTabs.map(({ type, label }) => ({
      event: label,
      score: bestByEvent[type] ?? 0,
      avg: sumByEvent[type]
        ? parseFloat((sumByEvent[type]!.total / sumByEvent[type]!.count).toFixed(2))
        : 0,
    }));

    return (
      <div className="bg-[#0a0a0a] rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-white text-xs font-semibold">Season Best</p>
          <div className="flex items-center gap-3">
            <p className="text-gray-500 text-xs">
              {3 - uniqueMeetCount} more {3 - uniqueMeetCount === 1 ? 'meet' : 'meets'} to unlock chart
            </p>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-gray-400 hover:text-white text-xs underline transition-colors"
            >
              Expand
            </button>
          </div>
        </div>
        {isExpanded && (
          <RadarExpanded
            radarData={radarData}
            results={results}
            onClose={() => setIsExpanded(false)}
          />
        )}
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="#1f1f1f" />
            <PolarAngleAxis
              dataKey="event"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 17.5]}
              tick={{ fill: '#4b5563', fontSize: 9 }}
              tickCount={4}
            />
            <Radar
              dataKey="score"
              stroke="#5EFF6E"
              fill="#5EFF6E"
              fillOpacity={0.15}
              dot={{ fill: '#5EFF6E', r: 3, strokeWidth: 0 } as any}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg px-3 py-2 space-y-1">
                    <p className="text-white text-xs font-semibold mb-2">{d.event}</p>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-gray-500 text-xs">Average</p>
                      <p className="text-[#5EFF6E] text-xs font-bold">{d.avg.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-gray-500 text-xs">Season Best</p>
                      <p className="text-[#5EFF6E] text-xs font-bold">{d.score.toFixed(2)}</p>
                    </div>
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 3+ meets — can toggle between radar and line chart
  // Build radar data
  const bestByEvent: Partial<Record<EventType, number>> = {};
  const sumByEvent: Partial<Record<EventType, { total: number; count: number }>> = {};
  results.forEach(r => {
    if (r.eventType === 'ALL_AROUND') return;
    if (bestByEvent[r.eventType] === undefined || r.score > bestByEvent[r.eventType]!) {
      bestByEvent[r.eventType] = r.score;
    }
    if (!sumByEvent[r.eventType]) sumByEvent[r.eventType] = { total: 0, count: 0 };
    sumByEvent[r.eventType]!.total += r.score;
    sumByEvent[r.eventType]!.count += 1;
  });

  const eventTabs = EVENT_TABS.filter(t => t.type !== 'ALL_AROUND');
  const radarData = eventTabs.map(({ type, label }) => ({
    event: label,
    score: bestByEvent[type] ?? 0,
    avg: sumByEvent[type]
      ? parseFloat((sumByEvent[type]!.total / sumByEvent[type]!.count).toFixed(2))
      : 0,
  }));

  // Build line chart data
  const chartData = results
    .filter(r => r.eventType === activeEvent)
    .sort((a, b) => new Date(a.meetDate).getTime() - new Date(b.meetDate).getTime())
    .map(r => ({ name: r.meetName, score: r.score }));

  const peak = chartData.reduce((max, d) => Math.max(max, d.score), 0);

  return (
    <div className="bg-[#0a0a0a] rounded-lg p-4">
      {/* Header with chart type toggle and expand button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 flex-wrap flex-1">
          {/* Chart type toggle */}
          <div className="flex gap-1 mr-3">
            <button
              onClick={() => setChartType('radar')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                chartType === 'radar'
                  ? 'bg-[#5EFF6E] text-black'
                  : 'bg-[#1f1f1f] text-gray-400 hover:text-white'
              }`}
            >
              Season Best
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-[#5EFF6E] text-black'
                  : 'bg-[#1f1f1f] text-gray-400 hover:text-white'
              }`}
            >
              Progression
            </button>
          </div>

          {/* Event tabs (only for line chart) */}
          {chartType === 'line' && (
            <div className="flex gap-1 flex-wrap">
              {EVENT_TABS.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => onEventChange(type)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeEvent === type
                      ? 'bg-[#5EFF6E] text-black'
                      : 'bg-[#1f1f1f] text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => chartType === 'line' ? setIsLineChartExpanded(true) : setIsExpanded(true)}
          className="text-gray-400 hover:text-white text-xs underline transition-colors flex-shrink-0 ml-4"
        >
          Expand
        </button>
      </div>

      {/* Radar Chart */}
      {chartType === 'radar' && (
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="#1f1f1f" />
            <PolarAngleAxis
              dataKey="event"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 17.5]}
              tick={{ fill: '#4b5563', fontSize: 9 }}
              tickCount={4}
            />
            <Radar
              dataKey="score"
              stroke="#5EFF6E"
              fill="#5EFF6E"
              fillOpacity={0.15}
              dot={{ fill: '#5EFF6E', r: 3, strokeWidth: 0 } as any}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg px-3 py-2 space-y-1">
                    <p className="text-white text-xs font-semibold mb-2">{d.event}</p>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-gray-500 text-xs">Average</p>
                      <p className="text-[#5EFF6E] text-xs font-bold">{d.avg.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-gray-500 text-xs">Season Best</p>
                      <p className="text-[#5EFF6E] text-xs font-bold">{d.score.toFixed(2)}</p>
                    </div>
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}

      {/* Line Chart */}
      {chartType === 'line' && (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: '#1f1f1f' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, yAxisMax]}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', borderRadius: '8px' }}
                labelStyle={{ color: '#ffffff', fontWeight: 700, marginBottom: 4 }}
                itemStyle={{ color: '#5EFF6E', fontSize: 18, fontWeight: 700 }}
                formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Score']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#5EFF6E"
                strokeWidth={2}
                dot={{ fill: 'transparent', stroke: '#5EFF6E', strokeWidth: 2, r: 4 }}
                activeDot={{ fill: '#5EFF6E', stroke: '#5EFF6E', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-2 pt-3 border-t border-[#1f1f1f]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5EFF6E] inline-block" />
            <span className="text-gray-400 text-xs">{EVENT_STAT_LABELS[activeEvent]}</span>
            {peak > 0 && (
              <span className="ml-auto text-gray-400 text-xs">
                Peak: <span className="text-[#5EFF6E] font-bold">{peak.toFixed(2)}</span>
              </span>
            )}
          </div>
        </>
      )}

      {/* Expanded Modals */}
      {isExpanded && chartType === 'radar' && (
        <RadarExpanded
          radarData={radarData}
          results={results}
          onClose={() => setIsExpanded(false)}
        />
      )}
      {isLineChartExpanded && chartType === 'line' && (
        <LineChartExpanded
          chartData={chartData}
          activeEvent={activeEvent}
          onEventChange={onEventChange}
          peak={peak}
          yAxisMax={yAxisMax}
          onClose={() => setIsLineChartExpanded(false)}
        />
      )}
    </div>
  );
}

function RadarExpanded({
  radarData,
  results,
  onClose,
}: {
  radarData: { event: string; score: number; avg: number }[];
  results: CompetitionResult[];
  onClose: () => void;
}) {
  const sorted = [...results].sort(
    (a, b) => new Date(b.meetDate).getTime() - new Date(a.meetDate).getTime()
  );
  const grouped = new Map<string, CompetitionResult[]>();
  sorted.forEach(r => {
    const key = `${r.meetName}|${r.meetDate}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  });
  const recentMeets = Array.from(grouped.values()).slice(0, 3).map(meetResults => {
    const first = meetResults[0];
    const byEvent: Partial<Record<EventType, number>> = {};
    let aa: number | undefined;
    meetResults.forEach(r => {
      if (r.eventType === 'ALL_AROUND') aa = r.score;
      else byEvent[r.eventType] = r.score;
    });
    return { meetName: first.meetName, meetDate: first.meetDate, byEvent, aa };
  });

  const EVENT_ORDER: EventType[] = ['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'];
  const SHORT: Partial<Record<EventType, string>> = {
    FLOOR: 'FX', POMMEL_HORSE: 'PH', RINGS: 'SR', VAULT: 'VT', PARALLEL_BARS: 'PB', HIGH_BAR: 'HB',
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 max-w-4xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold text-lg">Season Best</h2>
            <p className="text-gray-500 text-xs mt-0.5">Event breakdown across all meets</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Enlarged radar */}
          <div className="col-span-3">
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#1f1f1f" />
                <PolarAngleAxis dataKey="event" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 17.5]} tick={{ fill: '#4b5563', fontSize: 9 }} tickCount={4} />
                <Radar dataKey="score" stroke="#5EFF6E" fill="#5EFF6E" fillOpacity={0.15} dot={{ fill: '#5EFF6E', r: 4, strokeWidth: 0 } as any} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2 space-y-1">
                        <p className="text-white text-xs font-semibold mb-2">{d.event}</p>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-gray-500 text-xs">Average</p>
                          <p className="text-[#5EFF6E] text-xs font-bold">{d.avg.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-gray-500 text-xs">Season Best</p>
                          <p className="text-[#5EFF6E] text-xs font-bold">{d.score.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent meets */}
          <div className="col-span-2 space-y-3">
            <p className="text-white text-sm font-semibold mb-1">Recent Meets</p>
            {recentMeets.map((meet, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3">
                <p className="text-white text-xs font-semibold">{meet.meetName}</p>
                <p className="text-gray-500 text-xs mb-2">{new Date(meet.meetDate).toLocaleDateString()}</p>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {EVENT_ORDER.map(et => (
                    <div key={et}>
                      <p className="text-gray-600">{SHORT[et]}</p>
                      <p className="text-[#5EFF6E] font-semibold">
                        {meet.byEvent[et] !== undefined ? meet.byEvent[et]!.toFixed(2) : '—'}
                      </p>
                    </div>
                  ))}
                </div>
                {meet.aa !== undefined && (
                  <div className="mt-2 pt-2 border-t border-[#1f1f1f]">
                    <p className="text-[#5EFF6E] text-xs font-bold">AA: {meet.aa.toFixed(2)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function LineChartExpanded({
  chartData,
  activeEvent,
  onEventChange,
  peak,
  yAxisMax,
  onClose,
}: {
  chartData: { name: string; score: number }[];
  activeEvent: EventType;
  onEventChange: (e: EventType) => void;
  peak: number;
  yAxisMax: number;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 max-w-4xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold text-lg">{EVENT_STAT_LABELS[activeEvent]}</h2>
            <p className="text-gray-500 text-xs mt-0.5">Score progression over time</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* Event Tabs */}
        <div className="flex gap-1 flex-wrap mb-6">
          {EVENT_TABS.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onEventChange(type)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeEvent === type
                  ? 'bg-[#5EFF6E] text-black'
                  : 'bg-[#1f1f1f] text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Enlarged Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={{ stroke: '#1f1f1f' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, yAxisMax]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', borderRadius: '8px' }}
              labelStyle={{ color: '#ffffff', fontWeight: 700, marginBottom: 4 }}
              itemStyle={{ color: '#5EFF6E', fontSize: 18, fontWeight: 700 }}
              formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Score']}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#5EFF6E"
              strokeWidth={2}
              dot={{ fill: 'transparent', stroke: '#5EFF6E', strokeWidth: 2, r: 4 }}
              activeDot={{ fill: '#5EFF6E', stroke: '#5EFF6E', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Footer Stats */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#1f1f1f]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5EFF6E] inline-block" />
          <span className="text-gray-400 text-xs">{EVENT_STAT_LABELS[activeEvent]}</span>
          {peak > 0 && (
            <span className="ml-auto text-gray-400 text-xs">
              Peak: <span className="text-[#5EFF6E] font-bold">{peak.toFixed(2)}</span>
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
