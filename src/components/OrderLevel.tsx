// src/components/OrderLevel.tsx
import React from "react";
import { OrderLevel } from "../types/OrderBookTypes";

interface OrderLevelProps {
  level: OrderLevel;
  isBuy: boolean;
}

const OrderLevelComponent: React.FC<OrderLevelProps> = ({ level, isBuy }) => {
  return (
    <div className="flex justify-between border-b p-2">
      {isBuy ? (
        <>
          <span>{level.size}</span>
          <span>{level.total}</span>
          <span className="text-green-500">{level.price.toFixed(2)}</span>{" "}
        </>
      ) : (
        <>
          <span className="text-red-500">{level.price.toFixed(2)}</span>{" "}
          <span>{level.size}</span>
          <span>{level.total}</span>
        </>
      )}
    </div>
  );
};

export default OrderLevelComponent;
