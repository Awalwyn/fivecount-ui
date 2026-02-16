'use client';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">Profile</h1>
        <p className="text-gray-400">Manage your athlete profile</p>
      </div>

      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8">
        <div className="max-w-2xl">
          <h2 className="text-body-bold text-2xl mb-6 text-white">Profile Setup</h2>
          <p className="text-gray-400 mb-6">
            Your profile is coming soon. This is where you'll be able to:
          </p>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-3">
              <span className="text-[#5EFF6E] font-bold">•</span>
              <span>Create your athlete profile</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#5EFF6E] font-bold">•</span>
              <span>Add your personal information (name, graduation year, club)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#5EFF6E] font-bold">•</span>
              <span>Upload a profile picture</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#5EFF6E] font-bold">•</span>
              <span>Add your social media links</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#5EFF6E] font-bold">•</span>
              <span>Write your bio</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
