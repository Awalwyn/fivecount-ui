'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Calendar from '@/components/ui/8bit-calendar';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  initialDate?: Date;
  title?: string;
}

export function DatePickerModal({
  isOpen,
  onClose,
  onDateSelect,
  initialDate,
  title = 'Select Date',
}: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);

  const handleConfirm = () => {
    if (selectedDate) {
      onDateSelect(selectedDate);
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#111111] border-4 border-[#5EFF6E] p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-display text-2xl text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none font-bold"
          >
            ×
          </button>
        </div>

        {/* Calendar */}
        <div className="mb-6 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date instanceof Date) {
                setSelectedDate(date);
              }
            }}
            className="border-4 border-[#5EFF6E]"
          />
        </div>

        {/* Selected date display */}
        {selectedDate && (
          <div className="mb-6 text-center">
            <p className="text-gray-400 text-xs mb-1">Selected Date</p>
            <p className="text-white text-lg font-semibold">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={handleConfirm} className="btn-primary flex-1">
            Confirm
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
