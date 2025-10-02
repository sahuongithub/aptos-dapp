import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const CreateVaultButton = () => {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  const handleCreateVault = async () => {
    if (!connected || !account) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const transaction = {
        data: {
          function: "0xf02e42e167e86430855e112267405f0bb4bb6a8fed16cd7e4e4a339ec7341f73::VaultFactory::create_vault",
          functionArguments: [],
        },
        options: {
          maxGasAmount: 20000,      // Increased gas limit for complex transactions
          gasUnitPrice: 100,        // Standard gas price for testnet
          expireTimestamp: Math.floor(Date.now() / 1000) + 30, // 30 seconds timeout
        },
      };

      console.log("Creating vault with transaction:", transaction);
      
      const response = await signAndSubmitTransaction(transaction);
      
      if (response) {
        console.log("Transaction submitted:", response.hash);
        
        // Wait for transaction confirmation
        await aptos.waitForTransaction({
          transactionHash: response.hash,
        });
        
        setSuccess(`Vault created successfully! Transaction: ${response.hash}`);
        console.log("Vault created successfully:", response);
      }
    } catch (err) {
      console.error("Create vault error:", err);
      
      let errorMessage = "Failed to create vault";
      
      if (err.message) {
        if (err.message.includes("1008")) {
          errorMessage = "You already have a vault. Only one vault per address is allowed.";
        } else if (err.message.includes("insufficient")) {
          errorMessage = "Insufficient balance for transaction fees. Please ensure you have enough APT for gas.";
        } else if (err.message.includes("MAX_GAS_UNITS_BELOW_MIN_TRANSACTION_GAS_UNITS")) {
          errorMessage = "Gas configuration error. Please try again.";
        } else if (err.message.includes("SEQUENCE_NUMBER_TOO_OLD")) {
          errorMessage = "Transaction sequence error. Please refresh and try again.";
        } else if (err.message.includes("USER_TRANSACTION_EXPIRED")) {
          errorMessage = "Transaction expired. Please try again.";
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

  return (
    <div style={{ marginBottom: "15px" }}>
      <button
        onClick={handleCreateVault}
        disabled={!connected || loading}
        style={{
          padding: "12px 20px",
          backgroundColor: !connected ? "#ccc" : loading ? "#ffa500" : "#28a745",
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
        {loading ? "Creating Vault..." : "Create Vault"}
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
          Connect wallet to create a vault
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
    </div>
  );
};

export default CreateVaultButton;