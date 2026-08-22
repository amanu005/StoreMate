'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { VoiceModal } from '@/components/voice/VoiceModal';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-12 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      <MobileBottomNav />
      <VoiceModal />
    </div>
  );
}
