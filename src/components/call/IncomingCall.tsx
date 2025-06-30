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
        <div className="flex flex-col justify-between items-center h-[100vh] bg-gradient-to-br from-black to-gray-800 text-white px-4 py-8">
            {/* Tên người gọi */}
            <div className="mt-12 text-center">
                <h2 className="text-3xl font-semibold">{callerName}</h2>
            </div>

            {/* Nút hành động */}
            <div className="flex space-x-20 mb-10">
                {/* Nút từ chối */}
                <div className="flex flex-col items-center space-y-2">
                    <button
                        onClick={onReject}
                        className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-md hover:bg-red-700"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="white"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16.24 7.76L7.76 16.24M7.76 7.76l8.48 8.48"
                            />
                        </svg>
                    </button>
                    <span className="text-sm">Từ chối</span>
                </div>

                {/* Nút chấp nhận */}
                <div className="flex flex-col items-center space-y-2">
                    <button
                        onClick={onAccept}
                        className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-md hover:bg-green-700"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="white"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </button>
                    <span className="text-sm">Chấp nhận</span>
                </div>
            </div>
        </div>
    );
}
