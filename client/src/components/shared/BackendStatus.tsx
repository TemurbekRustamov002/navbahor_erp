// Backend Connection Status Indicator
"use client";

import { useState, useEffect } from 'react';
import { isBackendAvailable } from '@/lib/services';

export function BackendStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      setIsChecking(true);
      const available = await isBackendAvailable();
      setIsOnline(available);
      setIsChecking(false);
    };

    // Check immediately
    checkBackend();

    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <span>Backend tekshirilmoqda...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1 text-xs rounded-full ${
      isOnline 
        ? 'bg-green-100 text-green-800' 
        : 'bg-orange-100 text-orange-800'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isOnline 
          ? 'bg-green-400' 
          : 'bg-orange-400'
      }`}></div>
      <span>
        {isOnline ? 'Backend ulangan' : 'Demo rejim'}
      </span>
    </div>
  );
}