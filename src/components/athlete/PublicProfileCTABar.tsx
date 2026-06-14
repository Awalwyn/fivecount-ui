'use client';

import Link from 'next/link';

interface PublicProfileCTABarProps {
  athleteFirstName: string;
}

export function PublicProfileCTABar({ athleteFirstName }: PublicProfileCTABarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1f1f1f] bg-[#111111]/95 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">
            Are you a coach? Sign up to reach out to {athleteFirstName}.
          </p>
          <p className="text-gray-500 text-xs hidden sm:block">
            Message athletes directly and track recruits in your pipeline.
          </p>
        </div>
        <Link
          href="/auth/signup"
          className="flex-shrink-0 bg-[#5EFF6E] text-black font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[#4ee65d] transition-colors"
        >
          Sign up to reach out
        </Link>
      </div>
    </div>
  );
}
