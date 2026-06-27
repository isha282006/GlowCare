import React, { useEffect, useState } from 'react';

import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiFileText, FiCamera, FiAlertTriangle } from 'react-icons/fi';
import { calendarService } from '../api/services';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSkeleton, Modal } from '../components/ui';
import type { CalendarEvent } from '../types';

const CalendarPage: React.FC = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected day details
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

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
    
    // Empty cells for alignment before first day of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border-b border-r border-transparent opacity-20" />);
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
          className={`h-24 p-2 border-b border-r flex flex-col justify-between cursor-pointer transition-all hover:bg-lavender-light/10 dark:hover:bg-dark-border/20 ${
            isToday
              ? 'bg-lavender/10 font-bold border-t-2 border-t-lavender'
              : 'border-gray-100 dark:border-dark-border'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              isToday ? 'bg-lavender text-lavender-dark dark:text-lavender-light font-extrabold' : ''
            }`}>
              {dayNum}
            </span>
          </div>

          {/* Render event micro-indicators */}
          <div className="flex flex-wrap gap-1 mt-1 max-h-12 overflow-hidden">
            {dayEvents.map((e, idx) => {
              let color = 'bg-lavender';
              if (e.type === 'routine') color = e.subType === 'morning' ? 'bg-amber-300' : 'bg-indigo-400';
              if (e.type === 'journal') color = 'bg-mint-dark';
              if (e.type === 'photo') color = 'bg-sky-dark';
              if (e.type === 'expiry') color = 'bg-coral';
              
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
      case 'routine': return <FiClock className="text-lavender" />;
      case 'journal': return <FiFileText className="text-mint" />;
      case 'photo': return <FiCamera className="text-sky" />;
      case 'expiry': return <FiAlertTriangle className="text-rose" />;
      default: return <FiCalendar />;
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Skin Calendar 📅</h1>
          <p className="page-subtitle">Interactive visual log tracking routines, journal updates, and product expirations</p>
        </div>
      </div>

      <div className="glass-card p-6">
        {/* Calendar Nav */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="btn-secondary p-2 flex items-center justify-center cursor-pointer border-none" style={{ background: 'rgba(200, 182, 255, 0.15)' }}>
              <FiChevronLeft size={20} />
            </button>
            <button onClick={handleNextMonth} className="btn-secondary p-2 flex items-center justify-center cursor-pointer border-none" style={{ background: 'rgba(200, 182, 255, 0.15)' }}>
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton type="chart" />
        ) : (
          <div className="border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden">
            {/* Days of Week */}
            <div className="grid grid-cols-7 text-center font-semibold text-xs py-2 bg-gray-50/50 dark:bg-dark-card/50 border-b border-gray-100 dark:border-dark-border">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7">
              {renderDays()}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={selectedDay !== null} onClose={() => setSelectedDay(null)} title={
        selectedDay ? selectedDay.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
      }>
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: '#888' }}>No logs or notifications on this date.</p>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((e, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-2xl border"
                style={{
                  background: isDark ? 'rgba(26,26,46,0.5)' : '#fafafa',
                  borderColor: isDark ? 'var(--color-dark-border)' : 'rgba(200, 182, 255, 0.1)'
                }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(200,182,255,0.1)' }}>
                  {getEventIcon(e.type)}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{e.title}</h4>
                  <p className="text-xs text-gray-500">{e.detail}</p>
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
