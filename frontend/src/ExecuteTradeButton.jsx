import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MerkleClient, MerkleClientConfig } from "@merkletrade/ts-sdk";
import { parseTransactionError, getFunctionName, validateAmount, LOADING_STATES } from "./utils/errorHandler";

const ExecuteTradeButton = () => {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [loading, setLoading] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeType, setTradeType] = useState("buy");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tradePayload, setTradePayload] = useState(null);
  const [isProduction, setIsProduction] = useState(false); // Toggle for production mode

  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  // Initialize Merkle SDK (for production use)

// For mainnet, use: await MerkleClientConfig.mainnet()


  const generateMerkleTradePayload = async (amount, type) => {
    if (isProduction && process.env.REACT_APP_MERKLE_API_KEY) {
      try {
          const merkleConfig = await MerkleClientConfig.testnet();
           const merkleSDK = new MerkleClient(merkleConfig);
        // Production: Use actual Merkle SDK
        const orderData = {
          market: "APT-USDC",
          side: type === "buy" ? "BID" : "ASK",
          amount: parseFloat(amount),
          type: "LIMIT",
          price: type === "buy" ? 8.50 : 8.55, // You should get real market prices
          userAddress: account?.address,
        };

        const order = await merkleSDK.createOrder(orderData);
        return order;
      } catch (error) {
        console.error("Merkle SDK error:", error);
        throw new Error("Failed to create order with Merkle SDK: " + error.message);
      }
    } else {
      // Demo mode: Mock payload generation
      const mockPayload = {
        market: "APT-USDC",
        side: type === "buy" ? "BID" : "ASK",
        amount: parseFloat(amount),
        price: type === "buy" ? 8.50 : 8.55,
        type: "LIMIT",
        timestamp: Date.now(),
        nonce: Math.floor(Math.random() * 1000000),
        userAddress: account?.address,
        signature: "0x" + "a".repeat(128), // Mock signature
        mode: "DEMO",
      };

      return mockPayload;
    }
  };

  const submitToMerkleDEX = async (payload) => {
    if (isProduction && process.env.REACT_APP_MERKLE_API_KEY) {
      try {
         const merkleConfig = await MerkleClientConfig.testnet();
         const merkleSDK = new MerkleClient(merkleConfig);
        // Production: Submit to actual Merkle DEX
        const result = await merkleSDK.submitOrder(payload);
        return result;
      } catch (error) {
        console.error("Merkle DEX submission error:", error);
        throw new Error("Failed to submit order to Merkle DEX: " + error.message);
      }
    } else {
      // Demo mode: Simulate submission
      console.log("Demo mode: Order would be submitted to Merkle DEX:", payload);
      return {
        success: true,
        orderId: "demo_" + Date.now(),
        message: "Demo order created successfully",
      };
    }
  };

  const handleExecuteTrade = async () => {
    if (!connected || !account) {
      setError("Please connect your wallet first");
      return;
    }

    if (!tradeAmount || !validateAmount(tradeAmount)) {
      setError("Please enter a valid trade amount greater than 0");
      return;
    }

    // Check for API key in production mode
    if (isProduction && !process.env.REACT_APP_MERKLE_API_KEY) {
      setError("Merkle API key is required for production mode. Please add REACT_APP_MERKLE_API_KEY to your .env file.");
      return;
    }

    setLoading(LOADING_STATES.LOADING);
    setError("");
    setSuccess("");
    setTradePayload(null);

    try {
      // Step 1: Generate Merkle Trade payload
      const merklePayload = await generateMerkleTradePayload(tradeAmount, tradeType);
      setTradePayload(merklePayload);

      // Step 2: Submit to Merkle DEX (if in production mode)
      let merkleResult = null;
      if (isProduction) {
        merkleResult = await submitToMerkleDEX(merklePayload);
      }

      // Step 3: Store trade signal on-chain
      const tradeSignal = Math.floor(parseFloat(tradeAmount) * 100); // Convert to integer for storage

      const transaction = {
        data: {
          function: getFunctionName("execute_trade"),
          functionArguments: [tradeSignal],
        },
      };

      const response = await signAndSubmitTransaction(transaction);
      
      if (response) {
        // Wait for transaction confirmation
        await aptos.waitForTransaction({
          transactionHash: response.hash,
        });
        
        const modeText = isProduction ? "Production" : "Demo";
        const merkleText = merkleResult ? ` | Merkle Order ID: ${merkleResult.orderId}` : "";
        setSuccess(`${modeText} trade executed successfully! Transaction: ${response.hash}${merkleText}`);
        
        console.log("Trade executed:", { 
          response, 
          merklePayload, 
          merkleResult,
          mode: isProduction ? "production" : "demo"
        });
      }
    } catch (err) {
      console.error("Execute trade error:", err);
      setError(parseTransactionError(err));
    } finally {
      setLoading(LOADING_STATES.IDLE);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
    setTradePayload(null);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal points
    if (/^\d*\.?\d*$/.test(value)) {
      setTradeAmount(value);
    }
  };

  const toggleProductionMode = () => {
    if (!isProduction && !process.env.REACT_APP_MERKLE_API_KEY) {
      setError("Cannot enable production mode: REACT_APP_MERKLE_API_KEY is not configured");
      return;
    }
    setIsProduction(!isProduction);
    clearMessages();
  };

  return (
    <div style={{ marginBottom: "15px" }}>
      <div style={{ marginBottom: "10px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
          <input
            type="text"
            placeholder="Trade Amount (APT)"
            value={tradeAmount}
            onChange={handleAmountChange}
            disabled={loading === LOADING_STATES.LOADING}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
          <select
            value={tradeType}
            onChange={(e) => setTradeType(e.target.value)}
            disabled={loading === LOADING_STATES.LOADING}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              backgroundColor: "white"
            }}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
          <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              type="checkbox"
              checked={isProduction}
              onChange={toggleProductionMode}
              disabled={loading === LOADING_STATES.LOADING}
            />
            Production Mode
          </label>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              fontSize: "12px",
              color: "#007aff",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Info
          </button>
        </div>
      </div>

      <button
        onClick={handleExecuteTrade}
        disabled={!connected || loading === LOADING_STATES.LOADING || !tradeAmount}
        style={{
          padding: "12px 20px",
          backgroundColor: !connected ? "#ccc" : 
                          loading === LOADING_STATES.LOADING ? "#ffa500" : 
                          tradeType === "buy" ? "#28a745" : "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: !connected || loading === LOADING_STATES.LOADING || !tradeAmount ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: "500",
          width: "100%",
          transition: "background-color 0.3s"
        }}
      >
        {loading === LOADING_STATES.LOADING ? 
          "Executing Trade..." : 
          `${isProduction ? "[LIVE]" : "[DEMO]"} Execute ${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} Order`
        }
      </button>

      {showAdvanced && (
        <div style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#666"
        }}>
          <p><strong>Mode:</strong> {isProduction ? "Production (Live Trading)" : "Demo (Safe Testing)"}</p>
          <p><strong>Market:</strong> APT-USDC</p>
          <p><strong>SDK Status:</strong> {process.env.REACT_APP_MERKLE_API_KEY ? "Configured" : "Not Configured"}</p>
          <p><strong>Integration:</strong> {isProduction ? "Live DEX Submission Enabled" : "Demo Mode - No Real Trades"}</p>
          {!process.env.REACT_APP_MERKLE_API_KEY && (
            <p style={{ color: "#dc3545" }}><strong>Note:</strong> Add REACT_APP_MERKLE_API_KEY to .env for production mode</p>
          )}
        </div>
      )}

      {tradePayload && showAdvanced && (
        <div style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: isProduction ? "#fff3cd" : "#e3f2fd",
          borderRadius: "4px",
          fontSize: "11px",
          color: isProduction ? "#856404" : "#1976d2"
        }}>
          <p><strong>{isProduction ? "Live" : "Demo"} Merkle Trade Payload:</strong></p>
          <pre style={{ margin: 0, overflow: "auto", maxHeight: "150px" }}>
            {JSON.stringify(tradePayload, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div style={{
          color: "#dc3545",
          backgroundColor: "#f8d7da",
          padding: "8px 12px",
          marginTop: "8px",
          borderRadius: "4px",
          border: "1px solid #f5c6cb",
          fontSize: "13px"
        }}>
          {error}
          <button 
            onClick={clearMessages}
            style={{
              background: "none",
              border: "none",
              color: "#dc3545",
              cursor: "pointer",
              fontSize: "16px",
              float: "right",
              padding: "0",
              marginTop: "-2px"
            }}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div style={{
          color: "#155724",
          backgroundColor: "#d4edda",
          padding: "8px 12px",
          marginTop: "8px",
          borderRadius: "4px",
          border: "1px solid #c3e6cb",
          fontSize: "13px",
          wordBreak: "break-all"
        }}>
          {success}
          <button 
            onClick={clearMessages}
            style={{
              background: "none",
              border: "none",
              color: "#155724",
              cursor: "pointer",
              fontSize: "16px",
              float: "right",
              padding: "0",
              marginTop: "-2px"
            }}
          >
            ×
          </button>
        </div>
      )}

      {!connected && (
        <p style={{
          fontSize: "12px",
          color: "#666",
          marginTop: "5px",
          fontStyle: "italic"
        }}>
          Connect wallet to execute trades
        </p>
      )}
    </div>
  );
};

export default ExecuteTradeButton;