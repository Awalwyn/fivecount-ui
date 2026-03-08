// Public sponsor API - no authentication required

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
    if (!API_BASE_URL) {
      console.log('API base URL not configured');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/sponsors/random`, {
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
    if (!API_BASE_URL) {
      console.log('API base URL not configured');
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/sponsors/active`, {
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
