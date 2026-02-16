'use client';

export default function CompetitionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">Competition Results</h1>
        <p className="text-gray-400">Track and manage your competition scores</p>
      </div>

      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8">
        <div className="max-w-2xl">
          <h2 className="text-body-bold text-2xl mb-6 text-white">Results Management</h2>
          <p className="text-gray-400 mb-6">
            Your competition results section is coming soon. This is where you'll be able to:
          </p>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-3">
              <span className="text-[#5EFF6E] font-bold">•</span>
              <span>Add new competition results</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#5EFF6E] font-bold">•</span>
              <span>Track scores across all 6 apparatus (Vault, High Bar, Parallel Bars, Rings, Pommel Horse, Floor)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#5EFF6E] font-bold">•</span>
              <span>View All Around scores</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#5EFF6E] font-bold">•</span>
              <span>See your performance trends over time</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#5EFF6E] font-bold">•</span>
              <span>Export your results</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
