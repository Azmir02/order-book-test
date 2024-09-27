// src/types/OrderBookTypes.ts
export interface OrderLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  buy: OrderLevel[];
  sell: OrderLevel[];
}
