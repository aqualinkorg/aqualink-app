import React from 'react';

interface DateSelectorProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onChange }) => {
  return (
    <div className="absolute top-4 right-4 z-10 bg-white p-2 rounded shadow-md flex items-center gap-2">
      <label htmlFor="date-picker" className="text-sm font-medium text-gray-700">
        View Date:
      </label>
      <input
        id="date-picker"
        type="date"
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      />
    </div>
  );
};
