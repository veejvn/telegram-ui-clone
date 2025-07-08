'use client';

export interface IncomingCallProps {
    callerName: string;
    onAccept: () => void | Promise<void>;
    onReject: () => void;
    callType?: 'voice' | 'video';
}

export default function IncomingCall({
    callerName,
    onAccept,
    onReject,
    callType = 'voice',
}: IncomingCallProps) {
    return (
        <div className="flex items-center gap-4 px-4 py-3 w-[95vw] max-w-[400px] min-h-[68px] bg-black/90 rounded-2xl shadow-xl">
            {/* Icon Telegram */}
            <div className="flex flex-col items-center justify-center">
                <div className="bg-blue-500 rounded-full w-7 h-7 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9.036 15.956l-.398 4.02c.57 0 .818-.246 1.117-.543l2.68-2.56 5.557 4.06c1.018.561 1.74.266 1.995-.941l3.62-16.93c.33-1.563-.567-2.174-1.58-1.797L1.6 9.23c-1.54.6-1.523 1.46-.263 1.85l4.63 1.444 10.75-6.77c.506-.327.97-.146.59.182" fill="#fff" /></svg>
                </div>
            </div>
            {/* Nội dung */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="text-white/80 text-xs font-medium truncate">{callType === 'video' ? 'Telegram video call...' : 'Telegram âm thanh...'}</div>
                <div className="text-white text-lg font-semibold leading-tight truncate">{callerName}</div>
            </div>
            {/* Nút hành động */}
            <div className="flex items-center gap-2 ml-2">
                <button
                    onClick={onReject}
                    className="w-11 h-11 bg-red-500 rounded-full flex items-center justify-center shadow hover:bg-red-600 active:scale-95 transition"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.24 7.76L7.76 16.24M7.76 7.76l8.48 8.48" /></svg>
                </button>
                <button
                    onClick={onAccept}
                    className="w-11 h-11 bg-blue-500 rounded-full flex items-center justify-center shadow hover:bg-blue-600 active:scale-95 transition"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </button>
            </div>
        </div>
    );
}
