'use client';

export interface IncomingCallProps {
    callerName: string;
    onAccept: () => void;
    onReject: () => void;
}

export default function IncomingCall({
    callerName,
    onAccept,
    onReject,
}: IncomingCallProps) {
    return (
        <div className="flex flex-col items-center space-y-6 bg-black/90 px-6 py-10 rounded-xl shadow-xl">
            <p className="text-white text-lg">
                Cuộc gọi đến từ <strong>{callerName}</strong>
            </p>
            <div className="flex space-x-4">
                <button
                    onClick={onAccept}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                >
                    Chấp nhận
                </button>
                <button
                    onClick={onReject}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
                >
                    Từ chối
                </button>
            </div>
        </div>
    );
}
