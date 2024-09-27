interface KillFeedButtonProps {
  feedActive: boolean;
  toggleFeed: () => void;
}

const KillFeedButton: React.FC<KillFeedButtonProps> = ({
  feedActive,
  toggleFeed,
}) => {
  return (
    <button
      className={`px-4 py-2 font-bold rounded ${
        feedActive ? "bg-red-600" : "bg-green-600"
      }`}
      onClick={toggleFeed}
    >
      {feedActive ? "Kill Feed" : "Restart Feed"}
    </button>
  );
};

export default KillFeedButton;
