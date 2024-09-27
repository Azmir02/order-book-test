import React from "react";
import OrderBookComponent from "./components/OrderBook";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Trading Interface</h1>
      <OrderBookComponent />
    </div>
  );
};

export default App;
