'use client';

import { MessageCircle } from 'lucide-react';

export default function DemoMessages() {
  return (
    <div className="p-8">
      <div className="max-w-2xl">
        <h1 className="heading-display text-4xl mb-2">Messages</h1>
        <p className="text-[#a0a0a0] mb-8">Direct communication with coaches and athletes</p>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-12 text-center">
          <MessageCircle size={48} className="text-[#5EFF6E] mx-auto mb-4 opacity-50" />
          <p className="text-[#a0a0a0] text-lg">Messages feature coming soon</p>
          <p className="text-[#a0a0a0] text-sm mt-2">In the full app, you&apos;ll be able to message coaches and athletes directly here.</p>
        </div>
      </div>
    </div>
  );
}
