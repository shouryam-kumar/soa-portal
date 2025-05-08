'use client';

import dynamic from 'next/dynamic';

// Import the debug component with SSR disabled
const SidebarDebug = dynamic(() => import('@/components/layout/SidebarDebug'), {
  ssr: false
});

export default function ClientSidebarDebug() {
  return <SidebarDebug />;
} 