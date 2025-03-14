"use client";

import { useGiveRoom } from "../../../../hooks/useGiveRoom";

import { SocketConnection } from "../../component/socketConnection";

export default function Canvas({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { loading, room, error } = useGiveRoom(params);
  if (loading) {
    return <div>loading...</div>;
  }
  return <SocketConnection room={room} />;
}
