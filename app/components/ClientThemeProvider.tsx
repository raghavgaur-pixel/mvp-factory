"use client";

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/app/contexts/ThemeContext';

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  // Always render ThemeProvider so children never render outside context.
  // ThemeProvider itself guards against SSR access to window/localStorage.
  return <ThemeProvider>{children}</ThemeProvider>;
}
