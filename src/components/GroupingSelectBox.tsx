import React from "react";

interface GroupingSelectProps {
  grouping: number;
  setGrouping: (grouping: number) => void;
}

const GroupingSelect: React.FC<GroupingSelectProps> = ({
  grouping,
  setGrouping,
}) => {
  return (
    <>
      <div>
        <label className="mr-3">Group</label>
        <select
          value={grouping}
          className="text-black"
          onChange={(e) => setGrouping(Number(e.target.value))}
        >
          <option value={0.5}>0.5</option>
          <option value={1}>1</option>
          <option value={2.5}>2.5</option>
        </select>
      </div>
    </>
  );
};

export default GroupingSelect;
