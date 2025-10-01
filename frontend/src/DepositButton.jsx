import React, { useState } from "react";

const VAULT_ADDRESS = "0xf02e42e167e86430855e112267405f0bb4bb6a8fed16cd7e4e4a339ec7341f73";
const VAULT_MODULE = "VaultFactory";
const VAULT_FUNCTION = "deposit";

function DepositButton() {
  const [leader, setLeader] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  async function handleDeposit() {
    setLoading(true);
    setSuccess(null);
    setError(null);

    if (!window.petra) {
      setError("Petra wallet extension not detected.");
      setLoading(false);
      return;
    }

    const txPayload = {
      type: "entry_function_payload",
      function: `${VAULT_ADDRESS}::${VAULT_MODULE}::${VAULT_FUNCTION}`,
      arguments: [leader, amount],
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
        value={leader}
        onChange={e => setLeader(e.target.value)}
        placeholder="Vault Leader Address"
        style={{ marginRight: "8px" }}
      />
      <input 
        type="number" 
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Amount"
        style={{ marginRight: "8px" }}
      />
      <button
        onClick={handleDeposit}
        disabled={loading || !leader || !amount}
        style={{ margin: "8px", padding: "8px 16px" }}
      >
        {loading ? "Depositing..." : "Deposit"}
      </button>
      {success && <div style={{ color: "green" }}>{success}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default DepositButton;
