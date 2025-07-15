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
  height: "360px",
};

export default function LocationMap({ onSend }: LocationMapProps) {
  const [currentPos, setCurrentPos] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, // Sử dụng biến môi trường
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
    <div className="relative h-96 w-full">
      {currentPos && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPos}
          zoom={15}
        >
          <Marker position={currentPos} />
        </GoogleMap>
      )}
      <div className="absolute left-0 right-0 bottom-0 flex justify-center pointer-events-auto bg-white rounded-t-2xl z-10">
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
      </div>
    </div>
  );
}
