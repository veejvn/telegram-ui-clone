// MuteModal.tsx

import React from "react";
import {
  Bell,
  BellOff,
  SlidersHorizontal,
  VolumeX,
  ArrowLeft,
} from "lucide-react";

interface MainMuteModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  resetFeature?: () => void;
  onShowBanner?: (msg: string) => void;
}

export const MainMuteModal: React.FC<MainMuteModalProps> = ({
  open,
  onClose,
  onSelect,
  onShowBanner,
}) => {
  // Biến lưu trạng thái disabled sound
  const [soundDisabled, setSoundDisabled] = React.useState(() => {
    const saved = localStorage.getItem("soundDisabled");
    return saved === "true";
  });
  const [showBannerDisable, setShowBannerDisable] = React.useState(false);
  const [bannerDisabled, setBannerDisabled] = React.useState(soundDisabled);
  const toggleSound = () => {
    const newValue = !soundDisabled;
    setSoundDisabled(newValue);
    localStorage.setItem("soundDisabled", String(newValue));

    setBannerDisabled(newValue);

    if (onShowBanner) {
      onShowBanner(
        newValue
          ? "You will receive silent notifications."
          : "You will receive notifications with sound."
      );
      setShowBannerDisable(false);
    } else {
      setShowBannerDisable(true);
      setTimeout(() => setShowBannerDisable(false), 3000);
    }

    onSelect(newValue ? "disable" : "enable");
  };
  if (!open) return null;
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/0 z-40" onClick={onClose} />
      {/* Modal menu */}
      <div className="fixed right-0 top-[140px] z-50 flex justify-end w-full pointer-events-none">
        <div
          className="bg-white rounded-[20px] shadow-lg py-[8px] px-0 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl flex flex-col gap-[2px] pointer-events-auto border border-gray-100"
          style={{
            borderRadius: "20px",
            paddingTop: "8px",
            paddingBottom: "8px",
            background: "#fff",
          }}
        >
          <button
            className="w-full flex justify-between items-center py-2 px-3 text-base text-black hover:bg-gray-100"
            onClick={() => onSelect("for")}
          >
            Mute for...
            <Bell className="text-lg" />
          </button>
          <button
            className="w-full flex justify-between items-center py-2 px-3 text-base text-black hover:bg-gray-100"
            onClick={toggleSound}
          >
            {soundDisabled ? "Enable Sound" : "Disable Sound"}
            {soundDisabled ? (
              <Bell className="text-lg" />
            ) : (
              <VolumeX className="text-lg" />
            )}
          </button>
          <button
            className="w-full flex justify-between items-center py-2 px-3 text-base text-black hover:bg-gray-100"
            onClick={() => onSelect("customize")}
          >
            Customize
            <SlidersHorizontal className="text-lg" />
          </button>
          <button
            className="w-full flex justify-between items-center py-2 px-3 text-base text-red-500 hover:bg-gray-100"
            onClick={() => onSelect("forever")}
          >
            Mute Forever
            <BellOff className="text-lg text-red-500" />
          </button>
          <button
            className="w-full py-2 mt-1 text-center text-[#155dfc]"
            onClick={onClose}
          >
            Cancel
          </button>

          {showBannerDisable && (
            <div className="fixed bottom-4 inset-x-0 flex justify-center z-50">
              <div className="bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                {bannerDisabled ? (
                  <BellOff className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
                <span>
                  {bannerDisabled
                    ? "You will receive silent notifications."
                    : "You will receive notifications with sound."}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const muteOptions = [
  { label: "Mute for 1 hour", value: "1h" },
  { label: "Mute for 8 hours", value: "8h" },
  { label: "Mute for 1 day", value: "1d" },
  { label: "Mute for 7 days", value: "7d" },
  { label: "Mute until...", value: "until" },
];

// Component chọn option mute
interface MuteOptionsModalProps {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  onSelect: (value: string) => void;
}

export const MuteOptionsModal: React.FC<MuteOptionsModalProps> = ({
  open,
  // onClose,
  onBack,
  onSelect,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div
        className="bg-white w-full max-w-sm rounded-2xl p-4 pb-2 shadow-2xl border border-gray-100"
        style={{ minWidth: 320 }}
      >
        <div className="flex items-center mb-2">
          <button
            className="flex items-center text-[#155dfc] text-base font-medium px-2 py-1"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5 mr-1" /> Back
          </button>
        </div>
        <div className="divide-y">
          {muteOptions.map((opt) => (
            <button
              key={opt.value}
              className="w-full flex justify-between items-center py-3 px-2 text-base text-black hover:bg-gray-100"
              onClick={() => onSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component chọn ngày giờ mute until
interface MuteUntilPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (value: Date) => void;
}

// CSS ẩn scrollbar nhúng trong component
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
  const scrollRefs = React.useMemo(
    () => [
      React.createRef<HTMLDivElement>(),
      React.createRef<HTMLDivElement>(),
      React.createRef<HTMLDivElement>(),
    ],
    []
  );

  const [selectedIndex, setSelectedIndex] = React.useState<
    [number, number, number]
  >([0, 0, 0]);
  const [initialDate, setInitialDate] = React.useState<Date | null>(null);

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

  const scrollToIndex = React.useCallback(
    (col: number, index: number) => {
      scrollRefs[col].current?.scrollTo({
        top: index * 44,
        behavior: "auto",
      });
    },
    [scrollRefs]
  );

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
  }, [open, days, scrollToIndex]);

  if (!open) return null;

  const selectedDate = new Date(days[selectedIndex[0]]);
  selectedDate.setHours(
    hours[selectedIndex[1]],
    minutes[selectedIndex[2]],
    0,
    0
  );

  const isSame = initialDate && isSameMinute(initialDate, selectedDate);

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

  const handleSelect = () => {
    onSelect(selectedDate);
    onClose();
  };

  return (
    <>
      {/* Inject custom scroll CSS */}
      <style>{scrollStyles}</style>

      <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center">
        <div className="bg-white w-full max-w-sm rounded-t-2xl pt-4 pb-6 shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center px-4 mb-2">
            <button className="text-blue-500 text-base" onClick={onClose}>
              Cancel
            </button>
            <div className="text-base font-semibold">Mute Until...</div>
            <div className="w-[60px]" />
          </div>

          {/* Scroll Wheel */}
          <div className="relative h-[200px] overflow-hidden flex justify-center space-x-3">
            {/* Highlight Center */}
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
