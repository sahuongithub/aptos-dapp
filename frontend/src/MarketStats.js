import React, { useEffect, useState } from "react";

function MarketStats() {
  const [coins, setCoins] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:4000/api/summary')
      .then(res => res.json())
      .then(data => setCoins(data.coins || []))
      .catch(err => console.error("Proxy fetch error", err));
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "32px auto", padding: 20, boxShadow:"0 0 12px #eee", borderRadius: 8, background: "#fff" }}>
      <h2 style={{ textAlign: "center" }}>Merkle Coin Stats</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
        <thead>
          <tr style={{background:"#f5f5f5"}}>
            <th style={{ padding: "8px", border: "1px solid #eee" }}>Symbol</th>
            <th style={{ padding: "8px", border: "1px solid #eee" }}>Name</th>
            <th style={{ padding: "8px", border: "1px solid #eee" }}>Decimals</th>
            <th style={{ padding: "8px", border: "1px solid #eee" }}>Type</th>
          </tr>
        </thead>
        <tbody>
          {coins.map(coin => (
            <tr key={coin.id}>
              <td style={{ padding: "8px", border: "1px solid #eee", fontWeight: "bold" }}>{coin.symbol}</td>
              <td style={{ padding: "8px", border: "1px solid #eee" }}>{coin.name}</td>
              <td style={{ padding: "8px", border: "1px solid #eee" }}>{coin.decimals}</td>
              <td style={{ padding: "8px", border: "1px solid #eee", fontSize: "small" }}>{coin.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {coins.length === 0 && <p style={{textAlign:"center"}}>Loading or no coins found.</p>}
    </div>
  );
}

export default MarketStats;
