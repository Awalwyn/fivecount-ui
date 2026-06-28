'use client';

import { useState } from 'react';
import { demoCoach } from '../data/mockData';
import { Edit, X } from 'lucide-react';

export function CoachProfileDemo() {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="heading-display text-4xl mb-2">Profile</h1>
        <p className="text-[#a0a0a0]">Manage your coaching profile</p>
      </div>

      {/* Profile Card */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 max-w-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-[#5EFF6E] flex items-center justify-center text-2xl font-bold text-[#0a0a0a]">
              MC
            </div>
            <div>
              <h2 className="heading-display text-2xl mb-1">
                {demoCoach.firstName} {demoCoach.lastName}
              </h2>
              <p className="text-[#a0a0a0] text-sm mb-3">{demoCoach.program}</p>
              <p className="text-sm font-semibold mb-3">{demoCoach.position}</p>
              <p className="text-sm text-[#5EFF6E] break-all">{demoCoach.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-secondary px-4 py-2 flex items-center gap-2"
          >
            <Edit size={16} /> Edit
          </button>
        </div>

        {/* Location */}
        {demoCoach.city && demoCoach.state && (
          <div className="mb-6">
            <label className="text-[#a0a0a0] text-sm mb-1 block">Location</label>
            <p className="text-[#ffffff]">
              {demoCoach.city}, {demoCoach.state}
            </p>
          </div>
        )}

        {/* Bio */}
        {demoCoach.bio && (
          <div>
            <label className="text-[#a0a0a0] text-sm mb-1 block">Bio</label>
            <p className="text-[#ffffff] text-sm leading-relaxed">{demoCoach.bio}</p>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-[#0a0a0a] border border-[#5EFF6E] rounded-lg p-4">
        <p className="text-sm text-[#a0a0a0] mb-1">Verification Status</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10B981]" />
          <span className="text-[#10B981] font-semibold">{demoCoach.verificationStatus}</span>
        </div>
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
                <input type="text" defaultValue={demoCoach.firstName} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label">Last Name</label>
                <input type="text" defaultValue={demoCoach.lastName} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label">Program</label>
                <input type="text" defaultValue={demoCoach.program} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label">Position</label>
                <input type="text" defaultValue={demoCoach.position} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" defaultValue={demoCoach.email} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label">City</label>
                <input type="text" defaultValue={demoCoach.city} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label">State</label>
                <input type="text" defaultValue={demoCoach.state} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label">Bio</label>
                <textarea defaultValue={demoCoach.bio} className="input-field w-full" rows={3} />
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
