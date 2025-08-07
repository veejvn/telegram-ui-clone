"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

export type LocationMapProps = {
  onSend: (location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  }) => void;
};

const containerStyle = {
  width: "100%",
  height: "150px",
};

export default function LocationMap({ onSend }: LocationMapProps) {
  const [currentPos, setCurrentPos] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GMAP_API_KEY!, // Sử dụng biến môi trường
  });

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((position) => {
      setCurrentPos({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setAccuracy(position.coords.accuracy);
    });
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-100">
        Đang lấy vị trí...
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="h-[150px] w-full">
        {currentPos && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPos}
            zoom={15}
          >
            <Marker position={currentPos} />
          </GoogleMap>
        )}
      </div>
      <div className="space-y-3">
        {currentPos && (
        <div
          className="flex items-center gap-3 m-3 p-3 rounded-xl cursor-pointer transition-colors bg-[#FFFFFF4D] backdrop-blur-[24px]"
          onClick={() =>
            onSend({
              latitude: currentPos?.lat,
              longitude: currentPos?.lng,
              accuracy: accuracy,
            })
          }
        >
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-blue-500 font-semibold">
              Share my current location
            </div>
            <div className="text-gray-500 text-sm">
              Accurate to {accuracy ? Math.round(accuracy) : "?"} metres
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-[16px] text-[#121212]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </div>
        )}

        <div className="flex items-center gap-3 m-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors bg-[#FFFFFF4D] backdrop-blur-[24px]">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-green-600 font-semibold">
              Share my live location
            </div>
            <div className="text-gray-500 text-sm">
              Update in real time as you move
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-[16px] text-[#121212]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </div>
      </div>
      <div className="m-3">
        <h3 className="text-[#121212] text-[16px] font-medium mb-3">
          Locations near you
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">LaLaLa Restaurant</div>
              <div className="text-gray-500 text-sm">
                2601 Avenue, Manhattan, New York, USA
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2,21V19H20V21H2M20,8V5L18,5V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H20M16,5H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V5Z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">LaLaLa Coffee</div>
              <div className="text-gray-500 text-sm">
                1258 2nd Avenue, Manhattan, New York, USA
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19,7H16V6A4,4 0 0,0 12,2A4,4 0 0,0 8,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M10,6A2,2 0 0,1 12,4A2,2 0 0,1 14,6V7H10V6M18,19A1,1 0 0,1 17,20H7A1,1 0 0,1 6,19V9H8V10A1,1 0 0,0 9,11A1,1 0 0,0 10,10V9H14V10A1,1 0 0,0 15,11A1,1 0 0,0 16,10V9H18V19Z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">Rolland Market</div>
              <div className="text-gray-500 text-sm">
                1258 2nd Avenue, Manhattan, New York, USA
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="flex justify-center pointer-events-auto bg-white rounded-t-2xl z-10">
        {currentPos && (
          <button
            onClick={() =>
              onSend({
                latitude: currentPos?.lat,
                longitude: currentPos?.lng,
                accuracy: accuracy,
              })
            }
            className="w-full flex items-center p-3 shadow transition"
          >
            <div className="rounded-full p-1 mr-3 bg-blue-500">
              <MapPin className="text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-black/70">
                Send My Current Location
              </div>
              <div className="text-xs text-black/70">
                Accurate to {accuracy ? Math.round(accuracy) : "?"} metres
              </div>
            </div>
          </button>
        )}
      </div> */}
    </div>
  );
}
