'use client';

import { useState } from 'react';
import {
  demoCoach,
  demoCoachAccolades,
  demoCoachPosts,
  demoCoachProgramLinks,
  demoCoachRecruitingFocus,
  demoCoachTeamStats,
} from '../data/mockData';
import {
  Award,
  Edit,
  ExternalLink,
  Instagram,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Trophy,
  X,
} from 'lucide-react';

export function CoachProfileDemo() {
  const [showEditModal, setShowEditModal] = useState(false);
  const coachName = `${demoCoach.firstName} ${demoCoach.lastName}`;
  const initials = `${demoCoach.firstName[0]}${demoCoach.lastName[0]}`.toUpperCase();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="bg-[#111111] border border-[#1f1f1f] rounded-lg overflow-hidden">
        <div className="h-32 sm:h-44 bg-gradient-to-br from-[#18351d] via-[#102213] to-[#0a0a0a]" />
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-5 -mt-8 sm:-mt-10">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#1f1f1f] border-4 border-[#111111] flex items-center justify-center text-[#5EFF6E] heading-display text-4xl shrink-0">
              {initials}
            </div>

            <div className="flex-1 lg:pb-2 min-w-0">
              <div className="flex flex-col gap-4">
                <div className="min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <h1 className="heading-display text-4xl sm:text-5xl leading-none">
                      Coach {coachName}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#5EFF6E] px-3 py-1 text-xs font-bold text-[#0a0a0a]">
                      <ShieldCheck size={14} />
                      VERIFIED PROGRAM
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#1f1f1f] px-3 py-1 text-xs font-semibold text-[#a0a0a0]">
                      NCAA DIVISION I
                    </span>
                  </div>
                  <p className="text-[#5EFF6E] font-semibold mt-2">
                    {demoCoach.position} · {demoCoach.program} Men&apos;s Gymnastics
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#a0a0a0] mt-3">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={15} />
                      {demoCoach.city}, {demoCoach.state}
                    </span>
                    <span className="flex items-center gap-1.5 break-all">
                      <Mail size={15} />
                      {demoCoach.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Trophy size={15} />
                      4 National Titles
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[#d6d6d6] text-sm leading-relaxed mt-5 max-w-4xl">
                {demoCoach.bio} This profile is built to help prospective athletes understand the program&apos;s
                competitive standard, culture, recruiting needs, and recent momentum.
              </p>

              <button
                onClick={() => setShowEditModal(true)}
                className="btn-secondary mt-5 w-full px-4 py-2 flex items-center justify-center gap-2"
              >
                <Edit size={16} /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Team Metrics */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {demoCoachTeamStats.map((stat) => (
          <div key={stat.label} className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
            <p className="text-[#a0a0a0] text-xs mb-1">{stat.label}</p>
            <p className="heading-display text-2xl leading-none">{stat.value}</p>
            <p className="text-[#777777] text-xs mt-2">{stat.detail}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] gap-6">
        <div className="space-y-6">
          {/* Program Pitch */}
          <section className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold">Program Snapshot</h2>
              <span className="text-xs text-[#5EFF6E] font-bold uppercase">Recruiting Profile</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {demoCoachRecruitingFocus.map((item) => (
                <div key={item.label} className="border border-[#1f1f1f] rounded-lg p-4 bg-[#0a0a0a]">
                  <p className="text-[#a0a0a0] text-xs mb-1">{item.label}</p>
                  <p className="text-sm font-semibold leading-snug">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Posts */}
          <section className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare size={18} className="text-[#5EFF6E]" />
                Recent Posts
              </h2>
              <button className="btn-secondary px-4 py-2 text-sm">New Post</button>
            </div>
            <div className="space-y-3">
              {demoCoachPosts.map((post) => (
                <article key={post.id} className="border border-[#1f1f1f] rounded-lg p-4 bg-[#0a0a0a]">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded-full bg-[#5EFF6E] px-2.5 py-1 text-xs font-bold text-[#0a0a0a]">
                      {post.tag}
                    </span>
                    <span className="text-xs text-[#777777]">{post.createdAt}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#d6d6d6]">{post.content}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          {/* Links */}
          <section className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Program Links</h2>
            <div className="space-y-3">
              <ProgramLink icon={<Instagram size={17} />} label="Coach Instagram" value={demoCoachProgramLinks.coachInstagram} />
              <ProgramLink icon={<Instagram size={17} />} label="Program Instagram" value={demoCoachProgramLinks.programInstagram} />
              <ProgramLink icon={<ExternalLink size={17} />} label="Program Website" value={demoCoachProgramLinks.programWebsite} />
            </div>
          </section>

          {/* Accolades */}
          <section className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-5 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award size={18} className="text-[#5EFF6E]" />
              Team Accolades
            </h2>
            <div className="space-y-3">
              {demoCoachAccolades.map((accolade) => (
                <div key={accolade.title} className="flex items-start gap-3 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] p-3">
                  <Trophy size={16} className="text-[#5EFF6E] mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug">{accolade.title}</p>
                    <p className="text-xs text-[#777777] mt-1">{accolade.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Coach Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#a0a0a0] hover:text-[#ffffff]"
                aria-label="Close profile editor"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="input-label">First Name</label>
                <input type="text" defaultValue={demoCoach.firstName} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label">Last Name</label>
                <input type="text" defaultValue={demoCoach.lastName} className="input-field w-full" />
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Program</label>
                <input type="text" defaultValue={demoCoach.program} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label">Coach Instagram</label>
                <input type="text" defaultValue={demoCoachProgramLinks.coachInstagram} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label">Program Instagram</label>
                <input type="text" defaultValue={demoCoachProgramLinks.programInstagram} className="input-field w-full" />
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Program Bio</label>
                <textarea defaultValue={demoCoach.bio} className="input-field w-full" rows={4} />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowEditModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={() => setShowEditModal(false)} className="btn-primary flex-1">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgramLink({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] p-3">
      <span className="text-[#5EFF6E] shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-[#a0a0a0] mb-0.5">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}
