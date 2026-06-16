'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getProspects,
  updateProspectStage,
  Prospect,
  PIPELINE_STAGES,
  PipelineStage,
} from '@/lib/api/recruiting';
import { PipelineColumn } from './PipelineColumn';

type PipelineData = Record<PipelineStage, Prospect[]>;

const initializePipeline = (): Record<PipelineStage, Prospect[]> => ({
  WATCHING: [],
  CONTACTED: [],
  IN_TALKS: [],
  OFFERED: [],
  COMMITTED: [],
});

export function PipelineBoard() {
  const { user } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [pipelineData, setPipelineData] = useState<PipelineData>(initializePipeline());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stageOrder: PipelineStage[] = [
    'WATCHING',
    'CONTACTED',
    'IN_TALKS',
    'OFFERED',
    'COMMITTED',
  ];

  useEffect(() => {
    if (!user?.id) return;

    async function loadProspects() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getProspects(50, 0);
        const prospectList = response.data || [];
        setProspects(prospectList);

        // Group prospects by stage
        const grouped = initializePipeline();
        stageOrder.forEach((stage) => {
          grouped[stage] = [];
        });

        prospectList.forEach((prospect) => {
          const stage = prospect.stage as PipelineStage;
          if (stage in grouped) {
            grouped[stage]!.push(prospect);
          }
        });

        setPipelineData(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prospects');
      } finally {
        setIsLoading(false);
      }
    }

    loadProspects();
  }, [user?.id]);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStage: PipelineStage) => {
    e.preventDefault();
    const prospectId = e.dataTransfer.getData('prospectId');

    if (!prospectId) return;

    const prospect = prospects.find((p) => p.athleteId === prospectId);
    if (!prospect || prospect.stage === newStage) return;

    try {
      // Optimistic update
      const updatedProspects = prospects.map((p) =>
        p.athleteId === prospectId ? { ...p, stage: newStage } : p
      );
      setProspects(updatedProspects);

      // Regroup
      const grouped = initializePipeline();
      stageOrder.forEach((stage) => {
        grouped[stage] = [];
      });
      updatedProspects.forEach((p) => {
        const stage = p.stage as PipelineStage;
        if (stage in grouped) {
          grouped[stage]!.push(p);
        }
      });
      setPipelineData(grouped);

      // API call
      await updateProspectStage(prospectId, newStage);
    } catch (err) {
      // Revert on error
      const grouped = initializePipeline();
      stageOrder.forEach((stage) => {
        grouped[stage] = [];
      });
      prospects.forEach((p) => {
        const stage = p.stage as PipelineStage;
        if (stage in grouped) {
          grouped[stage]!.push(p);
        }
      });
      setPipelineData(grouped);

      setError(err instanceof Error ? err.message : 'Failed to update prospect stage');
    }
  };

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-700/30 rounded-lg p-6 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-[500px]">
      {isLoading ? (
        <div className="flex items-center justify-center h-[500px]">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6">
          {stageOrder.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              prospects={pipelineData[stage] || []}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
