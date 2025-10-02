import React, { useState, useEffect } from "react";
import { AptosWalletAdapterProvider, useWallet } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { Network } from "@aptos-labs/ts-sdk";
// Commented out for testing - uncomment when packages are installed
// import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
// import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
// import { PontemWallet } from "@pontem/wallet-adapter-plugin";
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
  const { 
    connect, 
    disconnect, 
    account, 
    connected, 
    wallet,
    wallets 
  } = useWallet();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [walletName, setWalletName] = useState("");

  useEffect(() => {
    if (connected && account) {
      setConnectionStatus("connected");
      setWalletName(wallet?.name || wallet?.adapter?.name || "Unknown Wallet");
      setError("");
    } else if (isConnecting) {
      setConnectionStatus("connecting");
    } else {
      setConnectionStatus("disconnected");
      setWalletName("");
    }
  }, [connected, isConnecting, account, wallet]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError("");
      setConnectionStatus("connecting");
      
      console.log("Available wallets:", wallets);
      console.log("Attempting to connect...");
      
      // Connect using the working method you found
      if (wallets && wallets.length > 0) {
        await connect(wallets[0].name);
        console.log("Connection successful!");
      } else {
        throw new Error("No wallets detected. Please install Petra wallet.");
      }
    } catch (err) {
      console.error("Connection error:", err);
      let errorMessage = "Failed to connect wallet. ";
      
      if (err.message?.includes('User rejected')) {
        errorMessage += "Connection was rejected. Please approve the connection in your wallet.";
      } else if (err.message?.includes('No wallet')) {
        errorMessage += "No wallet found. Please install Petra or another supported Aptos wallet.";
      } else {
        errorMessage += err.message || "Please ensure your wallet is installed and unlocked.";
      }
      
      setError(errorMessage);
      setConnectionStatus("disconnected");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setError("");
      await disconnect();
      setConnectionStatus("disconnected");
      setWalletName("");
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
        {walletName && (
          <span style={{ marginLeft: "10px", fontSize: "14px", color: "#666" }}>
            ({walletName})
          </span>
        )}
      </div>

      {!connected ? (
        <>
          <button
            style={{ 
              padding: "12px 24px",
              backgroundColor: isConnecting ? "#ccc" : "#007aff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isConnecting ? "not-allowed" : "pointer",
              fontSize: "16px",
              marginRight: "10px"
            }}
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
          
          {isConnecting && (
            <button
              style={{
                padding: "12px 24px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px"
              }}
              onClick={() => {
                setIsConnecting(false);
                setConnectionStatus("disconnected");
                setError("");
              }}
            >
              Cancel
            </button>
          )}
        </>
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

      {!connected && !isConnecting && (
        <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
          <p>Supported wallets: Petra, Martian, Fewcha, Pontem</p>
          <p>
            Don't have a wallet?{" "}
            <a 
              href="https://petra.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: "#007aff" }}
            >
              Install Petra
            </a>
            {" or "}
            <a 
              href="https://martianwallet.xyz/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: "#007aff" }}
            >
              Install Martian
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

function App() {
  // Initialize multiple wallet adapters for better compatibility
  const wallets = [
    new PetraWallet(),
    // Uncomment these when you install the respective packages
    // new MartianWallet(),
    // new FewchaWallet(),
    // new PontemWallet(),
  ];
  
  const [error, setError] = useState("");
  const [systemReady, setSystemReady] = useState(false);

  useEffect(() => {
    // Enhanced wallet detection
    const checkWalletAvailability = () => {
      const hasWallet = (
        (typeof window !== "undefined") && 
        (window.aptos || window.petra || window.martian || window.fewcha || window.pontem)
      );
      
      if (!hasWallet) {
        setError("No Aptos wallet detected. Please install Petra, Martian, or another supported wallet.");
      } else {
        setError("");
      }
      
      setSystemReady(true);
    };
    
    // Check immediately and after a short delay (for wallet injection)
    checkWalletAvailability();
    const timeoutId = setTimeout(checkWalletAvailability, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  if (!systemReady) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "18px"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AptosWalletAdapterProvider 
      plugins={wallets} 
      autoConnect={false}
      onError={(error) => {
        console.error("Wallet Adapter Error:", error);
        setError(error?.message || "Wallet adapter error occurred");
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <header style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ color: "#333", marginBottom: "10px" }}>Aptos Vault Factory dApp</h1>
          <p style={{ color: "#666", fontSize: "16px" }}>
            Create and manage copy trading vaults on Aptos blockchain
          </p>
        </header>

        {/* Demo Mode Indicator */}
        <div style={{ 
          backgroundColor: "#d4edda", 
          border: "1px solid #c3e6cb",
          padding: "15px", 
          marginBottom: "20px", 
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <strong style={{ color: "#155724" }}>🔒 DEMO MODE - Safe Testing Environment</strong>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#155724" }}>
            All transactions are simulated. No real funds required for testing.
          </p>
        </div>

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
            {error.includes("No Aptos wallet") && (
              <div style={{ marginTop: "10px" }}>
                <a 
                  href="https://petra.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "#007aff", textDecoration: "underline", marginRight: "15px" }}
                >
                  Install Petra Wallet
                </a>
                <a 
                  href="https://martianwallet.xyz/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "#007aff", textDecoration: "underline" }}
                >
                  Install Martian Wallet
                </a>
              </div>
            )}
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
