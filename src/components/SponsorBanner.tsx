'use client';

import { useEffect, useState } from 'react';
import { getRandomActiveSponsor, Sponsor } from '@/lib/api/sponsors';

export function SponsorBanner() {
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsor = async () => {
      try {
        const result = await getRandomActiveSponsor();
        setSponsor(result);
      } catch (error) {
        console.error('Error fetching sponsor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsor();
  }, []);

  // Don't render anything if loading or no sponsor (prevents layout shift)
  if (loading || !sponsor) {
    return null;
  }

  return (
    <a
      href={sponsor.websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-4 mb-4 block bg-[#111111] border border-[#1f1f1f] rounded-lg p-4 hover:border-[#5EFF6E]/20 transition-colors"
    >
      <p className="text-xs text-gray-600 mb-2 heading-display tracking-widest uppercase">
        Sponsored
      </p>
      <img
        src={sponsor.logoUrl}
        alt={`${sponsor.name} logo`}
        className="h-8 object-contain mb-2"
      />
      {sponsor.tagline && (
        <p className="text-xs text-gray-400 leading-tight">{sponsor.tagline}</p>
      )}
    </a>
  );
}
