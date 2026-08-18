import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../utils';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function parseValue(value?: string): Date | null {
  if (!value) return null;
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  className,
  placeholder = 'Selecionar data',
  disabled,
  compact,
}) => {
  const selected = parseValue(value);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selected ?? new Date());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (selected) setViewDate(selected);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setPanelStyle({
          position: 'fixed',
          left: 16,
          right: 16,
          bottom: 16,
          width: 'auto',
        });
        return;
      }
      const width = Math.max(rect.width, 308);
      let left = rect.left;
      if (left + width > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - width - 12);
      }
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 360 && rect.top > spaceBelow;
      setPanelStyle({
        position: 'fixed',
        top: openUp ? undefined : rect.bottom + 8,
        bottom: openUp ? window.innerHeight - rect.top + 8 : undefined,
        left,
        width,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const handleSelect = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setOpen(false);
  };

  const label = selected
    ? format(selected, 'dd/MM/yyyy', { locale: ptBR })
    : placeholder;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-left text-sm text-gray-900 dark:text-white',
          compact ? 'h-9 px-2' : 'h-9 md:h-10 px-3',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 disabled:opacity-50',
          className,
        )}
      >
        <CalendarIcon className="w-4 h-4 shrink-0 text-ff-yellow" />
        <span className={cn('truncate', !selected && 'text-gray-500 dark:text-[#B3B3B3]')}>
          {label}
        </span>
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[80] bg-black/40 md:bg-transparent" />
          <div
            ref={panelRef}
            style={panelStyle}
            className="z-[90] rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#141414] p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewDate((d) => addMonths(d, -1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A1A1A]"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                {format(viewDate, 'MMMM yyyy', { locale: ptBR })}
              </p>
              <button
                type="button"
                onClick={() => setViewDate((d) => addMonths(d, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A1A1A]"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-1 text-center text-[11px] font-medium text-gray-400 dark:text-[#B3B3B3]">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const inMonth = isSameMonth(day, viewDate);
                const selectedDay = selected ? isSameDay(day, selected) : false;
                const today = isToday(day);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleSelect(day)}
                    className={cn(
                      'h-9 rounded-lg text-sm transition-colors',
                      !inMonth && 'text-gray-300 dark:text-gray-600',
                      inMonth && !selectedDay && 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#1A1A1A]',
                      today && !selectedDay && 'font-semibold text-ff-yellow',
                      selectedDay && 'bg-ff-yellow text-black font-bold hover:bg-ff-yellow',
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-[#2A2A2A] pt-3">
              <button
                type="button"
                className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-[#B3B3B3] dark:hover:text-white"
                onClick={() => setOpen(false)}
              >
                Fechar
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-ff-yellow hover:brightness-110"
                onClick={() => handleSelect(new Date())}
              >
                Hoje
              </button>
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  );
};
