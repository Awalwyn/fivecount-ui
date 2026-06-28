'use client';

import { useState } from 'react';
import { demoAthlete, demoAthleteCompetitions, demoAthleteAwards, demoAthletePosts } from '../data/mockData';
import { Award, Award as AwardIcon, Edit, X } from 'lucide-react';

export function AthleteProfileDemo() {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="p-8 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#1f1f1f] to-[#0a0a0a] rounded-lg p-8 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-[#5EFF6E] flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[#5EFF6E] to-[#2db84a] flex items-center justify-center text-4xl font-bold text-[#0a0a0a]">
                MJ
              </div>
            </div>
            <div className="flex-1">
              <h1 className="heading-display text-4xl mb-2">
                {demoAthlete.firstName} {demoAthlete.lastName}
              </h1>
              <div className="text-[#a0a0a0] text-sm space-y-1 mb-4">
                <p>
                  {demoAthlete.clubName} • {demoAthlete.city}, {demoAthlete.state}
                </p>
                <p>Class of {demoAthlete.gradYear}</p>
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#5EFF6E] text-[#0a0a0a] text-xs font-semibold">
                OPEN TO RECRUITING
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-secondary px-4 py-2 flex items-center gap-2"
          >
            <Edit size={16} /> Edit
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-[#a0a0a0] text-xs mb-1">AA Peak</p>
          <p className="heading-display text-2xl">55.1</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-[#a0a0a0] text-xs mb-1">Best Score</p>
          <p className="heading-display text-2xl">15.4</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-[#a0a0a0] text-xs mb-1">Recent Meets</p>
          <p className="heading-display text-2xl">4</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-[#a0a0a0] text-xs mb-1">GPA</p>
          <p className="heading-display text-2xl">3.7</p>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3">About</h2>
        <p className="text-[#a0a0a0] leading-relaxed">{demoAthlete.bio}</p>
        {demoAthlete.instagramHandle && (
          <p className="text-sm text-[#5EFF6E] mt-3">Instagram: {demoAthlete.instagramHandle}</p>
        )}
      </div>

      {/* Recent Meets */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Meets</h2>
        <div className="space-y-3">
          {demoAthleteCompetitions.slice(0, 3).map((comp) => (
            <div key={comp.id} className="border border-[#1f1f1f] rounded p-4">
              <p className="font-semibold text-sm mb-2">{comp.meetName}</p>
              <p className="text-xs text-[#a0a0a0] mb-3">{comp.meetDate} • {comp.location}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-[#a0a0a0]">Score</p>
                  <p className="text-[#5EFF6E] font-semibold">{comp.score}</p>
                </div>
                <div>
                  <p className="text-xs text-[#a0a0a0]">Event</p>
                  <p className="text-[#ffffff] font-semibold text-sm">{comp.eventType}</p>
                </div>
                <div>
                  <p className="text-xs text-[#a0a0a0]">Place</p>
                  <p className="text-[#ffffff] font-semibold">1st</p>
                </div>
              </div>
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
