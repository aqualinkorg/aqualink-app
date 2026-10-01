import React, { createContext, useContext, useState } from 'react';

interface DateContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  isHistoricalView: boolean;
  resetToToday: () => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDateState] = useState(new Date());

  const setSelectedDate = (date: Date) => {
    setSelectedDateState(date);
  };

  const resetToToday = () => {
    setSelectedDateState(new Date());
  };

  const isHistoricalView = selectedDate.toDateString() !== new Date().toDateString();

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate, isHistoricalView, resetToToday }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDateContext = () => {
  const context = useContext(DateContext);
  if (!context) throw new Error('useDateContext must be used within a DateProvider');
  return context;
};
