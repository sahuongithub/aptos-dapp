import React, { useState } from "react";

const VAULT_ADDRESS = "0xf02e42e167e86430855e112267405f0bb4bb6a8fed16cd7e4e4a339ec7341f73";
const VAULT_MODULE = "VaultFactory";
const VAULT_FUNCTION = "update_leader";

function UpdateLeaderButton() {
  const [newLeader, setNewLeader] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  async function handleUpdateLeader() {
    setLoading(true);
    setSuccess(null);
    setError(null);

    if (!window.petra) {
      setError("Petra wallet extension not detected.");
      setLoading(false);
      return;
    }

    // In most dApps, you can only connect one wallet at a time.
    // So, submit as old leader signer and pass new leader's address.
    const txPayload = {
      type: "entry_function_payload",
      function: `${VAULT_ADDRESS}::${VAULT_MODULE}::${VAULT_FUNCTION}`,
      arguments: [newLeader], // only passing the new leader address
      type_arguments: [],
    };

    try {
      const txResponse = await window.petra.signAndSubmitTransaction(txPayload);
      setSuccess(`Transaction hash: ${txResponse.hash}`);
    } catch (err) {
      setError(err?.message || String(err));
    }
    setLoading(false);
  }

  return (
    <div>
      <input
        value={newLeader}
        onChange={e => setNewLeader(e.target.value)}
        placeholder="New Leader Address/Update Leader requires two connected wallets, currently unsupported in Aptos web wallets."
        style={{ marginRight: "8px" }}
      />
      <button
        onClick={handleUpdateLeader}
        disabled={loading || !newLeader}
        style={{ margin: "8px", padding: "8px 16px" }}
      >
        {loading ? "Updating..." : "Update Leader"}
      </button>
      {success && <div style={{ color: "green" }}>{success}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default UpdateLeaderButton;
