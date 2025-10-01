import React, { useState } from "react";


const VAULT_ADDRESS = "0xf02e42e167e86430855e112267405f0bb4bb6a8fed16cd7e4e4a339ec7341f73";
const VAULT_MODULE = "VaultFactory";
const VAULT_FUNCTION = "join_vault";

function JoinVaultButton() {
  const [leaderAddress, setLeaderAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  async function handleJoinVault() {
    setLoading(true);
    setSuccess(null);
    setError(null);

    if (!window.petra) {
      setError("Petra extension not detected!");
      setLoading(false);
      return;
    }
    if (!leaderAddress || !leaderAddress.startsWith("0x") || leaderAddress.length < 66) {
      setError("Enter a valid leader address (0x...)");
      setLoading(false);
      return;
    }

    const txPayload = {
      type: "entry_function_payload",
      function: `${VAULT_ADDRESS}::${VAULT_MODULE}::${VAULT_FUNCTION}`,
      arguments: [leaderAddress], // must provide leader address
      type_arguments: [],
    };

    try {
      const txResponse = await window.petra.signAndSubmitTransaction(txPayload);
      setSuccess(`Join Vault Tx Hash: ${txResponse.hash}`);
    } catch (err) {
      setError(err?.message || String(err));
    }
    setLoading(false);
  }

  return (
    <div>
      <input
        value={leaderAddress}
        onChange={e => setLeaderAddress(e.target.value)}
        placeholder="Leader address (vault owner)"
        style={{ margin: "8px", padding: "8px", width: "320px" }}
      />
      <button
        onClick={handleJoinVault}
        disabled={loading || !leaderAddress}
        style={{ margin: "8px", padding: "8px 16px" }}
      >
        {loading ? "Joining..." : "Join Vault"}
      </button>
      {success && <div style={{ color: "green" }}>{success}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default JoinVaultButton;
