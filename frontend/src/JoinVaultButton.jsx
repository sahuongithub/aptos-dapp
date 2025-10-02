import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { parseTransactionError, getFunctionName, isValidAddress, formatAddress, LOADING_STATES } from "./utils/errorHandler";

const JoinVaultButton = () => {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [loading, setLoading] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [leaderAddress, setLeaderAddress] = useState("");
  const [addressError, setAddressError] = useState("");

  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  const validateAddress = (address) => {
    if (!address) {
      setAddressError("Leader address is required");
      return false;
    }
    
    if (!isValidAddress(address)) {
      setAddressError("Invalid Aptos address format");
      return false;
    }
    
    if (account?.address && address.toLowerCase() === account.address.toLowerCase()) {
      setAddressError("You cannot join your own vault");
      return false;
    }
    
    setAddressError("");
    return true;
  };

  const handleJoinVault = async () => {
    if (!connected || !account) {
      setError("Please connect your wallet first");
      return;
    }

    if (!validateAddress(leaderAddress)) {
      return;
    }

    setLoading(LOADING_STATES.LOADING);
    setError("");
    setSuccess("");

    try {
      // Normalize the address (ensure 0x prefix)
      const normalizedAddress = leaderAddress.startsWith('0x') ? 
        leaderAddress : 
        `0x${leaderAddress}`;

      console.log("Joining vault with leader address:", normalizedAddress);

      const transaction = {
        data: {
          function: getFunctionName("join_vault"),
          functionArguments: [normalizedAddress],
        },
        options: {
          maxGasAmount: 20000,      // Increased gas limit for complex transactions
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
        
        setSuccess(`Successfully joined vault ${formatAddress(normalizedAddress)}! Transaction: ${response.hash}`);
        console.log("Successfully joined vault:", response);
        
        // Clear the input after successful join
        setLeaderAddress("");
      }
    } catch (err) {
      console.error("Join vault error:", err);
      
      let errorMessage = "Failed to join vault";
      
      if (err.message) {
        if (err.message.includes("insufficient")) {
          errorMessage = "Insufficient balance for transaction fees. Please ensure you have enough APT for gas.";
        } else if (err.message.includes("MAX_GAS_UNITS_BELOW_MIN_TRANSACTION_GAS_UNITS")) {
          errorMessage = "Gas configuration error. Please try again.";
        } else if (err.message.includes("SEQUENCE_NUMBER_TOO_OLD")) {
          errorMessage = "Transaction sequence error. Please refresh and try again.";
        } else if (err.message.includes("USER_TRANSACTION_EXPIRED")) {
          errorMessage = "Transaction expired. Please try again.";
        } else if (err.message.includes("Generic error")) {
          errorMessage = "Transaction simulation failed. Please check the vault address and try again.";
        } else {
          errorMessage = parseTransactionError(err) || `Transaction failed: ${err.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(LOADING_STATES.IDLE);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleAddressChange = (e) => {
    const value = e.target.value.trim();
    setLeaderAddress(value);
    
    // Clear previous address error when user starts typing
    if (addressError) {
      setAddressError("");
    }
  };

  const handleAddressBlur = () => {
    if (leaderAddress) {
      validateAddress(leaderAddress);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLeaderAddress(text.trim());
      validateAddress(text.trim());
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
            placeholder="Leader Address (0x...)"
            value={leaderAddress}
            onChange={handleAddressChange}
            onBlur={handleAddressBlur}
            disabled={loading === LOADING_STATES.LOADING}
            style={{
              width: "100%",
              padding: "8px 80px 8px 12px",
              border: `1px solid ${addressError ? '#dc3545' : '#ddd'}`,
              borderRadius: "4px",
              fontSize: "14px",
              fontFamily: "monospace",
              boxSizing: "border-box"
            }}
          />
          <button
            type="button"
            onClick={pasteFromClipboard}
            disabled={loading === LOADING_STATES.LOADING}
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
        
        {addressError && (
          <div style={{
            color: "#dc3545",
            fontSize: "12px",
            marginTop: "4px"
          }}>
            {addressError}
          </div>
        )}
      </div>

      <button
        onClick={handleJoinVault}
        disabled={!connected || loading === LOADING_STATES.LOADING || !leaderAddress || !!addressError}
        style={{
          padding: "12px 20px",
          backgroundColor: !connected || !!addressError ? "#ccc" : 
                          loading === LOADING_STATES.LOADING ? "#ffa500" : "#007aff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: !connected || loading === LOADING_STATES.LOADING || !leaderAddress || !!addressError ? 
                  "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: "500",
          width: "100%",
          transition: "background-color 0.3s"
        }}
      >
        {loading === LOADING_STATES.LOADING ? "Joining Vault..." : "Join Vault"}
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
          Connect wallet to join a vault
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
        <p style={{ margin: 0 }}>Enter the leader's wallet address to join their trading vault.</p>
        <p style={{ margin: "4px 0 0 0" }}>You'll receive copy trading signals from the vault leader.</p>
      </div>
    </div>
  );
};

export default JoinVaultButton;