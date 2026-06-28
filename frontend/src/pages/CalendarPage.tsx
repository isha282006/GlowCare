import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, FileText, Camera, AlertTriangle, Heart, Sparkles } from 'lucide-react';
import { calendarService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { LoadingSkeleton, Modal } from '../components/ui';
import type { CalendarEvent } from '../types';

const CalendarPage: React.FC = () => {
  const { showToast } = useToast();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected day details
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await calendarService.getEvents(year, month);
      setEvents(res.data.data);
    } catch {
      showToast('Failed to fetch calendar events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (dayNum: number) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    const dayDateStr = dayDate.toISOString().split('T')[0];
    
    const dayEvents = events.filter(e => {
      const eDateStr = new Date(e.date).toISOString().split('T')[0];
      return eDateStr === dayDateStr;
    });

    setSelectedDay(dayDate);
    setSelectedEvents(dayEvents);
  };

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayIndex = new Date(year, month, 1).getDay();

    const days = [];
    
    // Padding empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border-b border-r border-transparent opacity-20" />);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Actual calendar cells
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const cellDate = new Date(year, month, dayNum);
      const cellDateStr = cellDate.toISOString().split('T')[0];
      const isToday = cellDateStr === todayStr;

      // Filter events matching this day
      const dayEvents = events.filter(e => {
        const eDateStr = new Date(e.date).toISOString().split('T')[0];
        return eDateStr === cellDateStr;
      });

      days.push(
        <div
          key={`day-${dayNum}`}
          onClick={() => handleDayClick(dayNum)}
          className={`h-24 p-2 border-b border-r flex flex-col justify-between cursor-pointer transition-all hover:bg-pink-100/10 ${
            isToday
              ? 'bg-pink-50/20 font-bold border-t-2 border-t-primary'
              : 'border-pink-100/35'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              isToday ? 'bg-primary text-white font-black' : 'text-gray-500'
            }`}>
              {dayNum}
            </span>
          </div>

          {/* Micro indicators */}
          <div className="flex flex-wrap gap-1 mt-1 max-h-12 overflow-hidden justify-start">
            {dayEvents.map((e, idx) => {
              let color = 'bg-lavender';
              if (e.type === 'routine') color = e.subType === 'morning' ? 'bg-amber-350' : 'bg-indigo-400';
              if (e.type === 'journal') color = 'bg-green-400';
              if (e.type === 'photo') color = 'bg-sky-400';
              if (e.type === 'expiry') color = 'bg-coral';
              if ((e.type as string) === 'wishlist') color = 'bg-primary';
              
              return (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${color}`}
                  title={`${e.title}: ${e.detail}`}
                />
              );
            })}
          </div>
        </div>
      );
    }

    return days;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'routine': return <Clock className="text-primary" />;
      case 'journal': return <FileText className="text-green-500" />;
      case 'photo': return <Camera className="text-sky-500" />;
      case 'expiry': return <AlertTriangle className="text-coral" />;
      case 'wishlist': return <Heart className="text-primary" />;
      default: return <Calendar />;
    }
  };

  return (
    <div className="page-container max-w-5xl relative z-10">
      <div className="flex items-center justify-between mb-8 text-left">
        <div>
          <h1 className="page-title flex items-center gap-2">Skin Calendar 📅</h1>
          <p className="page-subtitle">Visual month calendar tracking routines completion, journals, progress photo snaps, and wishlist reminders</p>
        </div>
      </div>

      <div className="glass-card p-6 border border-white/40 shadow-sm text-left">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6 border-b border-pink-100/50 pb-4">
          <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Sparkles size={18} className="text-primary animate-pulse" />
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="btn-secondary p-2 flex items-center justify-center cursor-pointer bg-white border-none shadow-sm">
              <ChevronLeft size={16} />
            </button>
            <button onClick={handleNextMonth} className="btn-secondary p-2 flex items-center justify-center cursor-pointer bg-white border-none shadow-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton type="chart" />
        ) : (
          <div className="border border-pink-100/40 rounded-2xl overflow-hidden shadow-sm bg-white/40">
            {/* Days of Week */}
            <div className="grid grid-cols-7 text-center font-bold text-[9px] uppercase py-2.5 bg-pink-50/20 border-b border-pink-100/40 text-gray-400 tracking-wider">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-0.5">{d}</div>
              ))}
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7">
              {renderDays()}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4.5 justify-center mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-300" /> Morning Routine</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Night Routine</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400" /> Journal Entry</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Photo Upload</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-coral" /> Product Expiration</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Wishlist Reminder</div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={selectedDay !== null} onClose={() => setSelectedDay(null)} title={
        selectedDay ? selectedDay.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
      }>
        {selectedEvents.length === 0 ? (
          <p className="text-xs text-center py-6 text-gray-400 font-semibold">No skincare logs or events scheduled on this date.</p>
        ) : (
          <div className="space-y-3.5 text-left">
            {selectedEvents.map((e, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3.5 p-4 rounded-2xl border bg-white/50 border-pink-100/30 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base bg-pink-50/40" style={{ color: 'var(--color-primary)' }}>
                  {getEventIcon(e.type)}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-gray-800">{e.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold leading-relaxed">{e.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarPage;
