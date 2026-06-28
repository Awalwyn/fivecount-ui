'use client';

import React, { createContext, useContext, useState } from 'react';

export type DemoRole = 'ATHLETE' | 'COACH';

interface DemoContextType {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<DemoRole>('ATHLETE');

  return (
    <DemoContext.Provider value={{ role, setRole }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within DemoProvider');
  }
  return context;
}
