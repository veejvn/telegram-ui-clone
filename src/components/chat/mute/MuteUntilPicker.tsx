"use client";

import React, { useState } from "react";

interface MuteUntilPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

const scrollStyles = `
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export const MuteUntilPicker: React.FC<MuteUntilPickerProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const scrollRefs = [
    React.useRef<HTMLDivElement | null>(null),
    React.useRef<HTMLDivElement | null>(null),
    React.useRef<HTMLDivElement | null>(null),
  ];

  const [selectedIndex, setSelectedIndex] = useState<[number, number, number]>([0, 0, 0]);
  const [initialDate, setInitialDate] = useState<Date | null>(null);

  const days = React.useMemo(() => {
    const year = new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const dates: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const scrollToIndex = (col: number, index: number) => {
    scrollRefs[col].current?.scrollTo({ top: index * 44, behavior: "auto" });
  };

  const handleScroll = (col: number) => {
    if (!scrollRefs[col].current) return;
    const index = Math.round(scrollRefs[col].current.scrollTop / 44);
    setSelectedIndex((prev) => {
      const updated = [...prev] as [number, number, number];
      updated[col] = index;
      return updated;
    });
  };

  const isSameMinute = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate() &&
    a.getHours() === b.getHours() &&
    a.getMinutes() === b.getMinutes();

  React.useEffect(() => {
    if (open) {
      const now = new Date();
      setInitialDate(now);

      const currentDayIndex = days.findIndex(
        (d) =>
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
      );

      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      setSelectedIndex([currentDayIndex, currentHour, currentMinute]);

      setTimeout(() => {
        scrollToIndex(0, currentDayIndex);
        scrollToIndex(1, currentHour);
        scrollToIndex(2, currentMinute);
      }, 10);
    }
  }, [open, days]);

  if (!open) return null;

  const selectedDate = new Date(days[selectedIndex[0]]);
  selectedDate.setHours(
    hours[selectedIndex[1]],
    minutes[selectedIndex[2]],
    0,
    0
  );

  const isSame =
    initialDate && isSameMinute(initialDate, selectedDate);

  const handleSelect = () => {
    onSelect(selectedDate); // Gửi thời gian về cha
    onClose(); // Đóng modal
  };

  const formatDateLabel = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <>
      <style>{scrollStyles}</style>

      <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center">
        <div className="bg-white w-full rounded-t-2xl pt-4 pb-6 shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center px-4 mb-2">
            <button className="text-blue-500 text-base" onClick={onClose}>
              Cancel
            </button>
            <div className="text-base font-semibold text-black">
              Mute Until...
            </div>
            <div className="w-[60px]" />
          </div>

          {/* Scroll Picker */}
          <div className="relative h-[200px] overflow-hidden flex justify-center space-x-3">
            <div
              className="absolute top-1/2 left-3 right-3 h-[44px] z-10 border-2 border-gray-300 rounded-md pointer-events-none"
              style={{ transform: "translateY(-50%)" }}
            />

            {/* Days */}
            <div
              ref={scrollRefs[0]}
              onScroll={() => handleScroll(0)}
              className="h-full w-[120px] overflow-y-scroll scrollbar-none snap-y snap-mandatory text-center"
            >
              <div className="h-[88px] shrink-0" />
              {days.map((date, i) => (
                <div
                  key={`date-${i}`}
                  className={`h-[44px] snap-center flex items-center justify-center text-base ${
                    selectedIndex[0] === i
                      ? "text-black font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {formatDateLabel(date)}
                </div>
              ))}
              <div className="h-[88px] shrink-0" />
            </div>

            {/* Hours */}
            <div
              ref={scrollRefs[1]}
              onScroll={() => handleScroll(1)}
              className="h-full w-[60px] overflow-y-scroll scrollbar-none snap-y snap-mandatory text-center"
            >
              <div className="h-[88px] shrink-0" />
              {hours.map((hour, i) => (
                <div
                  key={`hour-${i}`}
                  className={`h-[44px] snap-center flex items-center justify-center text-base ${
                    selectedIndex[1] === i
                      ? "text-black font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {hour.toString().padStart(2, "0")}
                </div>
              ))}
              <div className="h-[88px] shrink-0" />
            </div>

            {/* Minutes */}
            <div
              ref={scrollRefs[2]}
              onScroll={() => handleScroll(2)}
              className="h-full w-[60px] overflow-y-scroll scrollbar-none snap-y snap-mandatory text-center"
            >
              <div className="h-[88px] shrink-0" />
              {minutes.map((minute, i) => (
                <div
                  key={`minute-${i}`}
                  className={`h-[44px] snap-center flex items-center justify-center text-base ${
                    selectedIndex[2] === i
                      ? "text-black font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {minute.toString().padStart(2, "0")}
                </div>
              ))}
              <div className="h-[88px] shrink-0" />
            </div>
          </div>

          {/* Confirm Button */}
          <button
            className="w-[320px] py-2 text-base font-medium rounded-xl mx-auto block bg-blue-500 text-white mt-4"
            onClick={isSame ? onClose : handleSelect}
          >
            {isSame
              ? "Close"
              : `Mute until ${selectedDate.toLocaleDateString(
                  "en-GB"
                )}, ${selectedDate
                  .getHours()
                  .toString()
                  .padStart(2, "0")}:${selectedDate
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`}
          </button>
        </div>
      </div>
    </>
  );
};
