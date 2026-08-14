import React, { createContext, useContext, useMemo, useState } from 'react';

interface HoveredDateContextValue {
  hoveredDate: string | null;
  setHoveredDate: (date: string | null) => void;
}

const HoveredDateContext = createContext<HoveredDateContextValue>({
  hoveredDate: null,
  setHoveredDate: () => {},
});

export function HoveredDateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const value = useMemo(() => ({ hoveredDate, setHoveredDate }), [hoveredDate]);
  return (
    <HoveredDateContext.Provider value={value}>
      {children}
    </HoveredDateContext.Provider>
  );
}

export const useHoveredDate = () => useContext(HoveredDateContext);
