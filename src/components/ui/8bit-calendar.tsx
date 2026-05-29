'use client';

import React, { useState } from 'react';

interface CalendarProps {
  mode?: 'single' | 'range';
  selected?: Date | { from?: Date; to?: Date };
  onSelect?: (date: Date | { from?: Date; to?: Date } | undefined) => void;
  className?: string;
}

export default function Calendar({
  mode = 'single',
  selected,
  onSelect,
  className = '',
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (mode === 'single' && selected instanceof Date) {
      return new Date(selected.getFullYear(), selected.getMonth());
    }
    return new Date();
  });

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (mode === 'single') {
      onSelect?.(newDate);
    }
  };

  const isSelected = (day: number) => {
    if (mode === 'single' && selected instanceof Date) {
      const selectedDate = selected;
      return (
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear()
      );
    }
    return false;
  };

  const days = [];
  const totalDays = daysInMonth(currentMonth);
  const firstDay = firstDayOfMonth(currentMonth);

  // Empty cells for days before the month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className={`bg-[#0a0a0a] border-4 border-[#5EFF6E] p-4 rounded-none ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={prevMonth}
            className="bg-[#5EFF6E] text-black px-3 py-1 font-bold hover:bg-[#2EFF00] transition-colors"
          >
            ◀
          </button>
          <h2 className="text-white font-bold text-center flex-1">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            className="bg-[#5EFF6E] text-black px-3 py-1 font-bold hover:bg-[#2EFF00] transition-colors"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs font-bold text-[#5EFF6E]">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => day && handleDateClick(day)}
            disabled={!day}
            className={`
              aspect-square text-sm font-bold border-2 transition-all
              ${!day
                ? 'bg-[#1f1f1f] border-[#1f1f1f] cursor-default'
                : isSelected(day)
                  ? 'bg-[#5EFF6E] border-[#5EFF6E] text-black hover:bg-[#2EFF00]'
                  : 'bg-[#1f1f1f] border-[#1f1f1f] text-white hover:bg-[#2f2f2f] hover:border-[#5EFF6E] cursor-pointer'
              }
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
