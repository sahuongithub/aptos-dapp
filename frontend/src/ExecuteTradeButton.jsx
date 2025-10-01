import React, { useState } from "react";
import { MerkleClient, MerkleClientConfig } from "@merkletrade/ts-sdk";
/* global BigInt */

const VAULT_ADDRESS = "0xf02e42e167e86430855e112267405f0bb4bb6a8fed16cd7e4e4a339ec7341f73";
const VAULT_MODULE = "VaultFactory";
const VAULT_FUNCTION = "execute_trade";

function ExecuteTradeButton() {
  const [tradeData, setTradeData] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  async function handleExecuteTrade() {
    setLoading(true);
    setSuccess(null);
    setError(null);

    // Use Aptos Wallet Standard API
    if (!window.aptos) {
      setError("Aptos wallet extension not detected.");
      setLoading(false);
      return;
    }

    // 1. Send signal to your Move contract (what you already have)
    const txPayload = {
      type: "entry_function_payload",
      function: `${VAULT_ADDRESS}::${VAULT_MODULE}::${VAULT_FUNCTION}`,
      arguments: [tradeData],
      type_arguments: [],
    };

    try {
      const txResponse = await window.aptos.signAndSubmitTransaction({ payload: txPayload });
      let resultMsg = `Vault signal hash: ${txResponse.hash}`;

      // 2. Place a real Merkle trade (NEW PART)
      // (You can make this conditional if you want to separate signal vs. real trade)
      const merkle = new MerkleClient(await MerkleClientConfig.mainnet());

      // Use your own logic or wallet for address, here just an example:
      const userAddress = window.aptos?.account?.address || ""; // update with your wallet connect logic
      // Parameters for Merkle trade (use your fields or test/demo values)
      const pair = "BTC_USD";
      const sizeDelta = BigInt(tradeData || "1000000"); // Must be BigInt
      const collateralDelta = BigInt("1000000"); // Example collateral, set as needed
      const isLong = true;
      const isIncrease = true;

      const orderPayload = await merkle.payloads.placeMarketOrder({
        pair,
        userAddress,
        sizeDelta,
        collateralDelta,
        isLong,
        isIncrease,
      });
      orderPayload.functionArguments.forEach((arg, i) => {
        console.log(`Arg[${i}]:`, arg, typeof arg);
      });
      
      // FIX: Serialize arguments for the wallet
      const dexTxPayload = {
        type: "entry_function_payload",
        function: orderPayload.function,
        type_arguments: orderPayload.typeArguments,
        arguments: orderPayload.functionArguments.map((arg, i) => {
          if (typeof arg === "bigint") return arg.toString();
          if (typeof arg === "object" && arg !== null) {
            // Temporarily stringify for demo; for production, BCS hex if contract expects it!
            console.log("Struct/Object arg at index", i, arg);
            return JSON.stringify(arg);
          }
          return arg;
        }),
      };
      console.log("FINAL dexTxPayload:", dexTxPayload);

      // Submit the Merkle trade on-chain!
      const merkleTxResponse = await window.aptos.signAndSubmitTransaction({ payload: dexTxPayload });

      // Wait for confirmation (optional for UX)
      await window.aptos.waitForTransaction(merkleTxResponse.hash);

      resultMsg += ` | Merkle Trade Tx sent to DEX: ${merkleTxResponse.hash}`;

      setSuccess(resultMsg);
    } catch (err) {
      setError(err?.message || String(err));
    }
    setLoading(false);
  }

  return (
    <div>
      <input 
        value={tradeData}
        onChange={e => setTradeData(e.target.value)}
        placeholder="Trade Data (u64)"
        style={{ marginRight: "8px" }}
      />
      <button
        onClick={handleExecuteTrade}
        disabled={loading || !tradeData}
        style={{ margin: "8px", padding: "8px 16px" }}
      >
        {loading ? "Executing..." : "Execute Trade"}
      </button>
      {success && <div style={{ color: "green" }}>{success}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default ExecuteTradeButton;
