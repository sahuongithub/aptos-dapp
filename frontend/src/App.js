import React from "react";
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
  const { connected, account, connect, disconnect } = useWallet();

  return (
    <div>
    <a
  href="https://merkle.trade"
  target="_blank"
  rel="noopener noreferrer"
  style={{ color: "#007aff", fontWeight: "bold", textDecoration: "underline", marginTop: "16px", display: "block" }}>
  View live Merkle Trade markets and stats
</a>

      {!connected ? (
        <button
          style={{ padding: "8px 16px" }}
         onClick={() => {
  console.log("Direct Petra connect");
  if (window.petra) {
    window.petra.connect();
  } else {
    alert("Petra is not available!");
  }
}}

        >
          Connect Wallet
        </button>
      ) : (
        <span>
          Connected: <strong>{account?.address}</strong>{" "}
          <button
            style={{ marginLeft: "10px" }}
            onClick={disconnect}
          >
            Disconnect
          </button>
        </span>
      )}
    </div>
  );
}

function App() {
  const wallets = [new PetraWallet()];
  console.log('Wallet plugins:', wallets);

  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={false}>
      <h1>Aptos Vault Factory dApp</h1>
      <WalletConnectSection />
      <CreateVaultButton />
      <DepositButton />
      <WithdrawButton />
      <ExecuteTradeButton />
      <ResumeVaultButton />
      <UpdateLeaderButton />
      <JoinVaultButton />
      <LeaveVaultButton />
      <PublishSignalButton />
      <EmergencyPauseButton />
      <MarketStats/>
    </AptosWalletAdapterProvider>
  );
}

export default App;
