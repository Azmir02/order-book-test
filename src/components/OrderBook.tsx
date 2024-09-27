import React, { useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import OrderLevelComponent from "./OrderLevel";
import ToggleFeedButton from "./ToggleFeedButton";
import KillFeedButton from "./KillFeedButton";
import { OrderBook, OrderLevel } from "../types/OrderBookTypes";
import GroupingSelect from "./GroupingSelectBox";

const OrderBookComponent: React.FC = () => {
  const [orderBook, setOrderBook] = useState<OrderBook>({ buy: [], sell: [] });
  const [market, setMarket] = useState("PI_XBTUSD");
  const [grouping, setGrouping] = useState(0.5);
  const [feedActive, setFeedActive] = useState(true);

  // Group orders based on selected grouping size
  const groupOrders = (
    levels: OrderLevel[],
    groupingSize: number
  ): OrderLevel[] => {
    const grouped: Record<number, number> = {};

    levels.forEach(({ price, size }) => {
      const roundedPrice = Math.floor(price / groupingSize) * groupingSize; // Round down to nearest grouping size
      if (size > 0) {
        grouped[roundedPrice] = (grouped[roundedPrice] || 0) + size; // Combine sizes for the same price level
      }
    });

    return Object.entries(grouped).map(([price, size]) => ({
      price: Number(price),
      size,
      total: size, // Total can be updated based on your logic
    }));
  };

  const handleWebSocketMessage = (data: any) => {
    if (data.numLevels) {
      handleSnapshot(data);
    } else if (data.bids || data.asks) {
      handleDelta(data);
    }
  };

  const handleSnapshot = (data: any) => {
    const buy: OrderLevel[] = [];
    const sell: OrderLevel[] = [];

    data.bids.forEach(([price, size]: [number, number]) => {
      if (size > 0) {
        buy.push({ price, size, total: size });
      }
    });

    data.asks.forEach(([price, size]: [number, number]) => {
      if (size > 0) {
        sell.push({ price, size, total: size });
      }
    });

    setOrderBook({ buy, sell });
  };

  const handleDelta = (data: any) => {
    let updatedBuy = [...orderBook.buy];
    let updatedSell = [...orderBook.sell];

    const updateLevel = (levels: OrderLevel[], price: number, size: number) => {
      const level = levels.find((l) => l.price === price);
      if (level) {
        if (size === 0) {
          return levels.filter((l) => l.price !== price);
        } else {
          level.size = size;
          return levels;
        }
      } else {
        if (size > 0) {
          levels.push({ price, size, total: size });
        }
        return levels;
      }
    };

    if (data.bids) {
      data.bids.forEach(([price, size]: [number, number]) => {
        updatedBuy = updateLevel(updatedBuy, price, size);
      });
      setOrderBook((prev) => ({ ...prev, buy: updatedBuy }));
    }

    if (data.asks) {
      data.asks.forEach(([price, size]: [number, number]) => {
        updatedSell = updateLevel(updatedSell, price, size);
      });
      setOrderBook((prev) => ({ ...prev, sell: updatedSell }));
    }
  };

  const sendUnsubscribe = (market: string) => {
    const unsubscribeMessage = JSON.stringify({
      event: "unsubscribe",
      feed: "book_ui_1",
      product_ids: [market],
    });
    if (feedActive) {
      // Send unsubscribe message to the server
      const socket = new WebSocket("wss://www.cryptofacilities.com/ws/v1");
      socket.onopen = () => {
        socket.send(unsubscribeMessage);
        socket.close();
      };
    }
  };

  const sendSubscribe = (market: string) => {
    const subscribeMessage = JSON.stringify({
      event: "subscribe",
      feed: "book_ui_1",
      product_ids: [market],
    });
    const socket = new WebSocket("wss://www.cryptofacilities.com/ws/v1");
    socket.onopen = () => {
      socket.send(subscribeMessage);
      socket.close();
    };
  };

  const toggleFeed = () => {
    setFeedActive(!feedActive);
  };

  // Group buy and sell orders based on the selected grouping size
  const groupedBuyOrders = groupOrders(orderBook.buy, grouping);
  const groupedSellOrders = groupOrders(orderBook.sell, grouping);

  useWebSocket(
    "wss://www.cryptofacilities.com/ws/v1",
    market,
    handleWebSocketMessage,
    feedActive
  );

  return (
    <div>
      <div className="p-4 h-[800px] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-b-white mb-5">
          <h1 className="text-2xl font-bold">Order Book</h1>
          <GroupingSelect grouping={grouping} setGrouping={setGrouping} />
        </div>
        <h2 className="mt-4 text-xl mb-3">Current Market: {market}</h2>

        <div className="flex gap-x-8">
          <div className="w-1/2 ">
            <div className="flex justify-between font-bold border-b">
              <span>Total </span>
              <span>Size</span>
              <span>Price</span>
            </div>
            {groupedBuyOrders.map((level) => (
              <OrderLevelComponent
                key={level.price}
                level={level}
                isBuy={true}
              />
            ))}
          </div>
          <div className="w-1/2 ">
            <div className="flex justify-between font-bold border-b">
              <span>Price</span>
              <span>Size</span>
              <span>Total</span>
            </div>
            {groupedSellOrders.map((level) => (
              <OrderLevelComponent
                key={level.price}
                level={level}
                isBuy={false}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-x-3">
        <ToggleFeedButton
          market={market}
          setMarket={setMarket}
          sendUnsubscribe={sendUnsubscribe}
          sendSubscribe={sendSubscribe}
        />
        <KillFeedButton feedActive={feedActive} toggleFeed={toggleFeed} />
      </div>
    </div>
  );
};

export default OrderBookComponent;
