"use client";
import React, { useState, useEffect } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  addDays, isSameDay, isWithinInterval, isBefore, addMonths, subMonths 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Notebook } from 'lucide-react';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [range, setRange] = useState({ start: null, end: null });
  const [note, setNote] = useState('');

  // Sync notes with the start of the selected range
  useEffect(() => {
    const key = range.start ? format(range.start, 'yyyy-MM-dd') : 'general';
    const savedNote = localStorage.getItem(`note-${key}`);
    setNote(savedNote || '');
  }, [range.start]);

  const saveNote = (val) => {
    setNote(val);
    const key = range.start ? format(range.start, 'yyyy-MM-dd') : 'general';
    localStorage.setItem(`note-${key}`, val);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  
  // Updated Today Logic: Go to month + Select the date
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setRange({ start: today, end: null });
  };

  const onDateClick = (day) => {
    if (!range.start || (range.start && range.end)) {
      setRange({ start: day, end: null });
    } else if (isBefore(day, range.start)) {
      setRange({ start: day, end: null });
    } else {
      setRange({ ...range, end: day });
    }
  };

  const renderHeader = () => (
    <div className="relative min-h-[220px] md:h-64 overflow-hidden rounded-t-xl flex flex-col justify-end">
      <img 
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb" 
        alt="Hero" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-black/20" />
      
      <div className="relative z-10 p-4 md:p-6 w-full flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="bg-white/95 backdrop-blur-sm p-3 md:p-4 rounded-lg shadow-xl inline-flex items-center gap-4 self-start">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 uppercase tracking-widest leading-none">
                {format(currentMonth, 'MMMM')}
              </h2>
              <p className="text-sm font-semibold text-gray-500">{format(currentMonth, 'yyyy')}</p>
            </div>
            <div className="flex gap-1 border-l pl-4 border-gray-300">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          
          <button 
            onClick={goToToday}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95 self-stretch md:self-end"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-0 border-b bg-gray-50">
        {days.map(d => (
          <div key={d} className="text-center py-3 text-[10px] md:text-xs font-bold text-gray-400 uppercase">
            {d}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isSelected = (range.start && isSameDay(day, range.start)) || (range.end && isSameDay(day, range.end));
        const isInRange = range.start && range.end && isWithinInterval(day, { start: range.start, end: range.end });
        const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day}
            className={`h-14 md:h-24 border-t border-r flex flex-col items-center justify-center cursor-pointer transition-all relative
              ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-300' : 'text-gray-700'}
              ${isSelected ? 'bg-blue-600 text-white font-bold z-10' : ''}
              ${isInRange && !isSelected ? 'bg-blue-50 text-blue-700' : ''}
              hover:bg-blue-50/80`}
            onClick={() => onDateClick(cloneDay)}
          >
            {isToday && !isSelected && (
              <div className="absolute top-1 md:top-2 right-1 md:right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
            )}
            <span className="text-sm md:text-base">{format(day, 'd')}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div className="border-l border-b">{rows}</div>;
  };

  return (
    <div className="max-w-5xl mx-auto my-4 md:my-10 bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100">
      {renderHeader()}
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-2 md:p-6">
          {renderDays()}
          {renderCells()}
        </div>
        
        <div className="w-full lg:w-80 bg-slate-50 p-6 border-t lg:border-t-0 lg:border-l">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <Notebook size={22} className="text-blue-600" />
            <h3 className="font-bold text-lg">Daily Notes</h3>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Selected Date</p>
            <p className="text-sm text-slate-700 font-medium">
              {range.start ? format(range.start, 'PPPP') : 'Select a date'}
            </p>
          </div>

          <textarea
            className="w-full h-48 lg:h-64 p-4 text-sm border border-slate-200 text-black rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none shadow-inner"
            placeholder="Add notes for this date..."
            value={note}
            onChange={(e) => saveNote(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;