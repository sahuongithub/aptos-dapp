import React, { useState } from "react";

const VAULT_ADDRESS = "0xf02e42e167e86430855e112267405f0bb4bb6a8fed16cd7e4e4a339ec7341f73";
const VAULT_MODULE = "VaultFactory";
const VAULT_FUNCTION = "leave_vault";

function LeaveVaultButton() {
  const [leaderAddress, setLeaderAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  async function handleLeaveVault() {
    setLoading(true);
    setSuccess(null);
    setError(null);

    if (!window.petra) {
      setError("Petra extension not detected!");
      setLoading(false);
      return;
    }
    if (!leaderAddress || !leaderAddress.startsWith("0x")) {
      setError("Enter valid leader address (0x...)");
      setLoading(false);
      return;
    }

    const txPayload = {
      type: "entry_function_payload",
      function: `${VAULT_ADDRESS}::${VAULT_MODULE}::${VAULT_FUNCTION}`,
      arguments: [leaderAddress],
      type_arguments: [],
    };

    try {
      const txResponse = await window.petra.signAndSubmitTransaction(txPayload);
      setSuccess(`Leave Vault Txn Hash: ${txResponse.hash}`);
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
        style={{ margin: "8px", padding: "8px", width: "340px" }}
      />
      <button
        onClick={handleLeaveVault}
        disabled={loading || !leaderAddress}
        style={{ margin: "8px", padding: "8px 16px" }}
      >
        {loading ? "Leaving..." : "Leave Vault"}
      </button>
      {success && <div style={{ color: "green" }}>{success}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default LeaveVaultButton;
