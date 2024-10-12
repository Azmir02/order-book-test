import React from "react";
import { OrderLevel } from "../types/OrderBookTypes";

interface Props {
  level: OrderLevel;
  isBuy: boolean;
  maxTotal: number;
}

const OrderLevelComponent: React.FC<Props> = ({ level, isBuy, maxTotal }) => {
  const percentage = (level.total / maxTotal) * 100;
  const fillColor = isBuy ? "rgb(17, 53, 52)" : "rgb(61, 30, 40)";

  return (
    <div className="flex justify-around relative z-[1]">
      <div
        className={`absolute z-[-1] top-0 h-full ${
          isBuy ? "right-0" : "left-0"
        }`}
        style={{
          width: `${percentage}%`,
          backgroundColor: fillColor,
          direction: isBuy ? "rtl" : "ltr",
        }}
        aria-label={`${
          isBuy ? "Buy" : "Sell"
        } Order Level at ${level.price.toFixed(2)} with size ${
          level.size
        } and total ${level.total}`}
      />
      {isBuy ? (
        <>
          <span className="font-mono text-sm">{level.total.toFixed(2)}</span>
          <span className="font-mono text-sm">{level.size.toFixed(2)}</span>
          <span className="text-[#118860] font-mono text-sm">
            {level.price.toFixed(2)}
          </span>
        </>
      ) : (
        <>
          <span className="text-[#bb3336] font-mono text-sm">
            {level.price.toFixed(2)}
          </span>
          <span className="font-mono text-sm">{level.size.toFixed(2)}</span>
          <span className="font-mono text-sm">{level.total.toFixed(2)}</span>
        </>
      )}
    </div>
  );
};

export default OrderLevelComponent;
