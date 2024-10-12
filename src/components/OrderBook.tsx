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

  const sortFunction = (a: any[], b: any[]) => {
    if (parseFloat(b[0]) == parseFloat(a[0])) {
      return 0;
    } else {
      return parseFloat(b[0]) < parseFloat(a[0]) ? -1 : 1;
    }
  };

  const groupOrders = (
    levels: OrderLevel[],
    groupingSize: number
  ): OrderLevel[] => {
    const grouped: Record<number, number> = {};
    let cumulativeTotal = 0;

    levels.forEach(({ price, size }) => {
      const roundedPrice = Math.floor(price / groupingSize) * groupingSize;
      if (size > 0) {
        grouped[roundedPrice] = (grouped[roundedPrice] || 0) + size;
      }
    });

    const groupedData = Object.entries(grouped)
      .sort((a: any[], b: any[]) => sortFunction(a, b))
      .map(([price, size]) => {
        cumulativeTotal += size;

        return {
          price: Number(price),
          size,
          total: cumulativeTotal,
        };
      });

    console.log(groupedData);
    return groupedData;
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

  const groupedBuyOrders = groupOrders(orderBook.buy, grouping);
  const groupedSellOrders = groupOrders(orderBook.sell, grouping);

  // max and min price
  const maxBuyTotal = Math.max(
    ...groupedBuyOrders.map((order) => order.total),
    0
  );
  const maxSellTotal = Math.max(
    ...groupedSellOrders.map((order) => order.total),
    0
  );
  // implement the websocket hook
  useWebSocket(
    "wss://www.cryptofacilities.com/ws/v1",
    market,
    handleWebSocketMessage,
    feedActive
  );

  return (
    <div>
      <div className="p-4 overflow-hidden w-full h-[700px]">
        <div className="flex items-center justify-between border-b border-b-white mb-5">
          <h1 className="text-2xl font-bold">Order Book</h1>
          <GroupingSelect grouping={grouping} setGrouping={setGrouping} />
        </div>
        <h2 className="mt-4 text-xl mb-3">Current Market: {market}</h2>

        <div className="flex">
          <div className="w-1/2 relative">
            <div className="flex justify-around font-bold mb-3">
              <span>Total</span>
              <span>Size</span>
              <span>Price</span>
            </div>
            {groupedBuyOrders.map((level) => (
              <OrderLevelComponent
                key={level.price}
                level={level}
                isBuy={true}
                maxTotal={maxBuyTotal}
              />
            ))}
          </div>
          <div className="w-1/2 relative">
            <div className="flex justify-around font-bold mb-3">
              <span>Price</span>
              <span>Size</span>
              <span>Total</span>
            </div>
            {groupedSellOrders
              .sort((a: OrderLevel, b: OrderLevel) => b.price - a.price)
              .map((level) => (
                <OrderLevelComponent
                  key={level.price}
                  level={level}
                  isBuy={false}
                  maxTotal={maxSellTotal}
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
