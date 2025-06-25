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
        <div className="incoming-screen">
            <p>Cuộc gọi đến từ <strong>{callerName}</strong></p>
            <button
                onClick={onAccept}
                className="px-4 py-2 bg-green-600 text-white rounded"
            >
                Chấp nhận
            </button>
            <button
                onClick={onReject}
                className="px-4 py-2 bg-red-600 text-white rounded ml-2"
            >
                Từ chối
            </button>
        </div>
    );
}