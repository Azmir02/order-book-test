import React from "react";

interface OrderBookEntryProps {
  price: number;
  size: number;
  total: number;
  type: "buy" | "sell";
}

const OrderBookEntry: React.FC<OrderBookEntryProps> = ({
  price,
  size,
  total,
  type,
}) => {
  const backgroundColor = type === "buy" ? "bg-green-600" : "bg-red-600";

  const depthBarWidth = `${Math.min(total / 100, 100)}%`;

  return (
    <div className="relative flex justify-between py-1">
      <div
        className={`absolute inset-0 h-full ${backgroundColor}`}
        style={{ width: depthBarWidth, opacity: 0.2 }}
      ></div>

      <span className="relative z-10">{total.toFixed(2)}</span>
      <span className="relative z-10">{size}</span>
      <span className="relative z-10">{price.toFixed(2)}</span>
    </div>
  );
};

export default OrderBookEntry;
