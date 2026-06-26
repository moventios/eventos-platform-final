'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Booking {
  id: string;
  title?: string;
  roomId?: string;
  facilityId?: string;
  startAt: string;
  endAt: string;
  status: string;
}

interface BookingCalendarProps {
  bookings: Booking[];
  onSelectSlot?: (info: { start: string; end: string; roomId?: string }) => void;
}

const statusColor: Record<string, string> = {
  confirmed: '#16a34a',
  pending: '#ca8a04',
  canceled: '#dc2626',
};

export function BookingCalendar({ bookings, onSelectSlot }: BookingCalendarProps) {
  const events = bookings.map((b) => ({
    id: b.id,
    title: b.title ?? b.roomId ?? 'Booking',
    start: b.startAt,
    end: b.endAt,
    backgroundColor: statusColor[b.status] ?? '#6366f1',
    borderColor: 'transparent',
  }));

  const handleDateClick = (arg: any) => {
    if (!onSelectSlot) return;
    const start = new Date(arg.dateStr).toISOString();
    const end = new Date(new Date(arg.dateStr).getTime() + 60 * 60 * 1000).toISOString(); // default 1h
    onSelectSlot({ start, end });
  };

  const handleSelect = (arg: any) => {
    if (!onSelectSlot) return;
    onSelectSlot({ start: arg.startStr, end: arg.endStr });
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
      events={events}
      height="auto"
      selectable={!!onSelectSlot}
      dateClick={handleDateClick}
      select={handleSelect}
    />
  );
}
