import { useEffect, useRef } from "react";

const useWebSocket = (
  url: string,
  market: string,
  onMessage: (data: any) => void,
  feedActive: boolean
) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!feedActive) {
      if (socketRef.current) {
        socketRef.current.close();
      }
      return;
    }

    const connect = () => {
      socketRef.current = new WebSocket(url);

      socketRef.current.onopen = () => {
        console.log("WebSocket connected");
        const subscribeMessage = JSON.stringify({
          event: "subscribe",
          feed: "book_ui_1",
          product_ids: [market],
        });
        socketRef.current?.send(subscribeMessage);
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket closed, attempting to reconnect...");
        if (feedActive) {
          setTimeout(() => connect(), 3000);
        }
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, [url, market, onMessage, feedActive]);
};

export default useWebSocket;
