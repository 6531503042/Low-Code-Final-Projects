"use client";

import * as React from "react";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: any;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <div>
      {children}
    </div>
  );
}
