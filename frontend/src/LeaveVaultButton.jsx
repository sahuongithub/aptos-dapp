import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const LeaveVaultButton = () => {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [leaderAddress, setLeaderAddress] = useState("");

  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  const handleLeaveVault = async () => {
    if (!connected || !account) {
      setError("Please connect your wallet first");
      return;
    }

    if (!leaderAddress) {
      setError("Please enter vault leader address");
      return;
    }

    if (!leaderAddress.startsWith("0x") && !leaderAddress.match(/^[a-fA-F0-9]{64}$/)) {
      setError("Please enter a valid Aptos address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Normalize the address (ensure 0x prefix)
      const normalizedAddress = leaderAddress.startsWith('0x') ? 
        leaderAddress : 
        `0x${leaderAddress}`;

      console.log("Leaving vault with leader address:", normalizedAddress);

      const transaction = {
        data: {
          function: "0xf02e42e167e86430855e112267405f0bb4bb6a8fed16cd7e4e4a339ec7341f73::VaultFactory::leave_vault",
          functionArguments: [normalizedAddress],
        },
        options: {
          maxGasAmount: 15000,      // Sufficient gas for leave vault transactions
          gasUnitPrice: 100,        // Standard gas price for testnet
          expireTimestamp: Math.floor(Date.now() / 1000) + 30, // 30 seconds timeout
        },
      };

      console.log("Transaction configuration:", transaction);

      const response = await signAndSubmitTransaction(transaction);
      
      if (response) {
        console.log("Transaction submitted:", response.hash);
        
        // Wait for transaction confirmation
        await aptos.waitForTransaction({
          transactionHash: response.hash,
        });
        
        setSuccess(`Successfully left vault! Transaction: ${response.hash}`);
        console.log("Leave vault successful:", response);
        
        // Clear input after successful leave
        setLeaderAddress("");
      }
    } catch (err) {
      console.error("Leave vault error:", err);
      
      let errorMessage = "Failed to leave vault";
      
      if (err.message) {
        if (err.message.includes("insufficient")) {
          errorMessage = "Insufficient balance for transaction fees.";
        } else if (err.message.includes("MAX_GAS_UNITS_BELOW_MIN_TRANSACTION_GAS_UNITS")) {
          errorMessage = "Gas configuration error. Please try again.";
        } else if (err.message.includes("SEQUENCE_NUMBER_TOO_OLD")) {
          errorMessage = "Transaction sequence error. Please refresh and try again.";
        } else if (err.message.includes("USER_TRANSACTION_EXPIRED")) {
          errorMessage = "Transaction expired. Please try again.";
        } else if (err.message.includes("Generic error")) {
          errorMessage = "Transaction simulation failed. Please check if you're actually in this vault.";
        } else {
          errorMessage = `Transaction failed: ${err.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLeaderAddress(text.trim());
    } catch (err) {
      console.warn("Could not read from clipboard:", err);
    }
  };

  return (
    <div style={{ marginBottom: "15px" }}>
      <div style={{ marginBottom: "10px" }}>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Vault Leader Address (0x...)"
            value={leaderAddress}
            onChange={(e) => setLeaderAddress(e.target.value.trim())}
            disabled={loading}
            style={{
              width: "100%",
              padding: "8px 80px 8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              fontFamily: "monospace",
              boxSizing: "border-box"
            }}
          />
          <button
            type="button"
            onClick={pasteFromClipboard}
            disabled={loading}
            style={{
              position: "absolute",
              right: "4px",
              top: "50%",
              transform: "translateY(-50%)",
              padding: "4px 8px",
              fontSize: "11px",
              background: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "3px",
              cursor: "pointer",
              color: "#495057"
            }}
            title="Paste from clipboard"
          >
            Paste
          </button>
        </div>
      </div>

      <button
        onClick={handleLeaveVault}
        disabled={!connected || loading || !leaderAddress}
        style={{
          padding: "12px 20px",
          backgroundColor: !connected ? "#ccc" : loading ? "#ffa500" : "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: !connected || loading ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: "500",
          width: "100%",
          transition: "background-color 0.3s"
        }}
      >
        {loading ? "Leaving Vault..." : "Leave Vault"}
      </button>

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
          Connect wallet to leave vault
        </p>
      )}
      
      {/* Demo mode indicator */}
      <div style={{
        fontSize: "11px",
        color: "#6c757d",
        marginTop: "5px",
        textAlign: "center",
        fontStyle: "italic"
      }}>
        🔒 Demo Mode: Safe for testing
      </div>
      
      <div style={{
        fontSize: "11px",
        color: "#888",
        marginTop: "8px",
        lineHeight: "1.4"
      }}>
        <p style={{ margin: 0 }}>Leave a vault you previously joined.</p>
        <p style={{ margin: "4px 0 0 0" }}>Enter the vault leader's address to exit their trading vault.</p>
      </div>
    </div>
  );
};

export default LeaveVaultButton;