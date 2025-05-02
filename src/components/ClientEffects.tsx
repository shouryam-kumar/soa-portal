// src/components/ClientEffects.tsx
"use client";

import { useEffect } from 'react';

export default function ClientEffects() {
  useEffect(() => {
    // Check if we should force sign out (e.g., from a URL parameter)
    const params = new URLSearchParams(window.location.search);
    if (params.has('t')) {
      // Clear any localStorage items related to auth if needed
      console.log('URL has timestamp parameter - sign out detected');
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}