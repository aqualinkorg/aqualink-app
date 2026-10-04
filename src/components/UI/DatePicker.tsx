import React from 'react';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  return (
    <input 
      type="date" 
      className="border p-2 rounded"
      value={value.toISOString().split('T')[0]} 
      onChange={(e) => onChange(new Date(e.target.value))}
    />
  );
};

export default DatePicker;
