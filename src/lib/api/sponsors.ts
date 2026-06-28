// Public sponsor API - no authentication required

import { buildApiUrl } from './url';

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  tagline?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get a random active sponsor for displaying as an ad
 * Returns null if no active sponsors available
 */
export async function getRandomActiveSponsor(): Promise<Sponsor | null> {
  try {
    const response = await fetch(buildApiUrl('/sponsors/random'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.log('Failed to fetch sponsor:', error);
    return null;
  }
}

/**
 * Get all active sponsors
 * Returns empty array if no sponsors available or on error
 */
export async function getActiveSponsors(): Promise<Sponsor[]> {
  try {
    const response = await fetch(buildApiUrl('/sponsors/active'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch (error) {
    console.log('Failed to fetch sponsors:', error);
    return [];
  }
}
