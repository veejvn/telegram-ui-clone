import { useEffect } from "react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useRoomStore } from "@/stores/useRoomStore"; // giả sử bạn có store này

const useListenRoomInvites = () => {
  const client = useMatrixClient();
  const addRoomToTop = useRoomStore((state) => state.addRoomToTop);

  useEffect(() => {
    if (!client) return;

    const handleRoom = (room: any) => {
      if (room && room.getMyMembership() === "invite") {
        // Đưa phòng mới được mời lên đầu danh sách
        addRoomToTop(room);
      }
    };

    client.on("Room" as any, handleRoom);

    // Lắng nghe các phòng đã có trạng thái invite khi load lại trang
    client.getRooms().forEach((room: any) => {
      if (room.getMyMembership() === "invite") {
        addRoomToTop(room);
      }
    });

    return () => {
      client.removeListener("Room" as any, handleRoom);
    };
  }, [client, addRoomToTop]);
};

export default useListenRoomInvites;