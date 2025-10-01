import React, { useEffect } from "react";

function MarketStats() {
  useEffect(() => {
    fetch('https://api.merkle.trade/v1/summary')
      .then(res => res.json())
      .then(data => {
        console.log("Merkle summary:", data);
        // You can add state & display UI later
      })
      .catch(err => console.error("Fetch summary error", err));
  }, []);

  return (
    <div>
      <h2>Market Stats (check browser Console!)</h2>
    </div>
  );
}

export default MarketStats;
