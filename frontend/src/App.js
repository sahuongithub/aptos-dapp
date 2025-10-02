import React, { useState, useEffect } from "react";
import { AptosWalletAdapterProvider, useWallet } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import CreateVaultButton from "./CreateVaultButton";
import DepositButton from "./DepositButton";
import WithdrawButton from "./WithdrawButton";
import ExecuteTradeButton from "./ExecuteTradeButton";
import ResumeVaultButton from "./ResumeVaultButton";
import UpdateLeaderButton from "./UpdateLeaderButton";
import JoinVaultButton from "./JoinVaultButton";
import LeaveVaultButton from "./LeaveVaultButton";
import PublishSignalButton from "./PublishSignalButton";
import EmergencyPauseButton from "./EmergencyPauseButton";
import MarketStats from "./MarketStats";

function WalletConnectSection() {
  const { connected, account, connect, disconnect, connecting } = useWallet();
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  useEffect(() => {
    if (connected) {
      setConnectionStatus("connected");
      setError("");
    } else if (connecting) {
      setConnectionStatus("connecting");
    } else {
      setConnectionStatus("disconnected");
    }
  }, [connected, connecting]);

  const handleConnect = async () => {
    try {
      setError("");
      setConnectionStatus("connecting");
      
      // Use the wallet adapter's connect method instead of direct window.petra
      await connect();
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet. Please ensure Petra is installed and unlocked.");
      setConnectionStatus("disconnected");
    }
  };

  const handleDisconnect = async () => {
    try {
      setError("");
      await disconnect();
      setConnectionStatus("disconnected");
    } catch (err) {
      console.error("Wallet disconnection error:", err);
      setError("Failed to disconnect wallet");
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h3>Wallet Connection</h3>
      
      <a
        href="https://merkle.trade"
        target="_blank"
        rel="noopener noreferrer"
        style={{ 
          color: "#007aff", 
          fontWeight: "bold", 
          textDecoration: "underline", 
          marginBottom: "16px", 
          display: "block" 
        }}
      >
        View live Merkle Trade markets and stats
      </a>

      {error && (
        <div style={{ 
          color: "red", 
          backgroundColor: "#ffebee", 
          padding: "10px", 
          marginBottom: "10px", 
          borderRadius: "4px",
          border: "1px solid #ffcdd2"
        }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginBottom: "10px" }}>
        <strong>Status:</strong> 
        <span style={{ 
          marginLeft: "10px",
          color: connectionStatus === "connected" ? "green" : 
                 connectionStatus === "connecting" ? "orange" : "red"
        }}>
          {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
        </span>
      </div>

      {!connected ? (
        <button
          style={{ 
            padding: "12px 24px",
            backgroundColor: connecting ? "#ccc" : "#007aff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: connecting ? "not-allowed" : "pointer",
            fontSize: "16px"
          }}
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div>
            <strong>Connected:</strong> 
            <code style={{ 
              backgroundColor: "#f5f5f5", 
              padding: "4px 8px", 
              borderRadius: "4px",
              marginLeft: "8px"
            }}>
              {formatAddress(account?.address)}
            </code>
          </div>
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        </div>
      )}

      {!connected && (
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
          Please install and unlock the Petra wallet to continue.
        </p>
      )}
    </div>
  );
}

function App() {
  const wallets = [new PetraWallet()];
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if Petra wallet is available
    if (typeof window !== "undefined" && !window.aptos && !window.petra) {
      setError("Petra wallet not detected. Please install Petra from the Chrome Web Store.");
    }
  }, []);

  return (
    <AptosWalletAdapterProvider 
      plugins={wallets} 
      autoConnect={false}
      onError={(error) => {
        console.error("Wallet Adapter Error:", error);
        setError(error.message || "Wallet adapter error occurred");
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <header style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ color: "#333", marginBottom: "10px" }}>Aptos Vault Factory dApp</h1>
          <p style={{ color: "#666", fontSize: "16px" }}>
            Create and manage copy trading vaults on Aptos blockchain
          </p>
        </header>

        {error && (
          <div style={{ 
            color: "red", 
            backgroundColor: "#ffebee", 
            padding: "15px", 
            marginBottom: "20px", 
            borderRadius: "8px",
            border: "1px solid #ffcdd2"
          }}>
            <strong>System Error:</strong> {error}
          </div>
        )}

        <WalletConnectSection />

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "20px",
          marginTop: "20px"
        }}>
          <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <h3>Vault Management</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <CreateVaultButton />
              <EmergencyPauseButton />
              <ResumeVaultButton />
              <UpdateLeaderButton />
            </div>
          </div>

          <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <h3>Vault Operations</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <JoinVaultButton />
              <LeaveVaultButton />
              <DepositButton />
              <WithdrawButton />
            </div>
          </div>

          <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <h3>Trading</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <PublishSignalButton />
              <ExecuteTradeButton />
            </div>
          </div>
        </div>

        <div style={{ marginTop: "30px" }}>
          <MarketStats />
        </div>

        <footer style={{ 
          textAlign: "center", 
          marginTop: "40px", 
          padding: "20px", 
          borderTop: "1px solid #eee",
          color: "#666",
          fontSize: "14px"
        }}>
          <p>
            Built on Aptos blockchain. 
            <a 
              href="https://github.com/sahuongithub/aptos-dapp" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: "#007aff", textDecoration: "none" }}
            >
              View Source Code
            </a>
          </p>
          <p style={{ marginTop: "10px" }}>
            <strong>Note:</strong> Multi-signer transactions (like leadership transfer) 
            require CLI tools until wallet support is available.
          </p>
        </footer>
      </div>
    </AptosWalletAdapterProvider>
  );
}

export default App;