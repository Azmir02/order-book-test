import React from "react";

interface ToggleFeedButtonProps {
  market: string;
  setMarket: (market: string) => void;
  sendUnsubscribe: (market: string) => void;
  sendSubscribe: (market: string) => void;
}

const ToggleFeedButton: React.FC<ToggleFeedButtonProps> = ({
  market,
  setMarket,
  sendUnsubscribe,
  sendSubscribe,
}) => {
  const toggleMarket = () => {
    const newMarket = market === "PI_XBTUSD" ? "PI_ETHUSD" : "PI_XBTUSD";
    sendUnsubscribe(market);
    setMarket(newMarket);
    sendSubscribe(newMarket);
  };

  return (
    <button
      onClick={toggleMarket}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Toggle Market
    </button>
  );
};

export default ToggleFeedButton;
