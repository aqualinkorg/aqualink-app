
import React, { useState } from 'react';

interface DatePickerProps {
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  onDateSelect,
  minDate,
  maxDate = new Date()
}) => {
  const [selectedDate, setSelectedDate] = useState(maxDate);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
    onDateSelect(date);
  };

  return (
    <div className="date-picker">
      <label htmlFor="map-date">Select Date:</label>
      <input
        id="map-date"
        type="date"
        value={selectedDate.toISOString().split('T')[0]}
        onChange={handleChange}
        min={minDate?.toISOString().split('T')[0]}
        max={maxDate.toISOString().split('T')[0]}
      />
    </div>
  );
};
