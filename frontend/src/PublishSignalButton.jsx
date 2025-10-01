import React, { useState } from "react";

const VAULT_ADDRESS = "0xf02e42e167e86430855e112267405f0bb4bb6a8fed16cd7e4e4a339ec7341f73";
const VAULT_MODULE = "VaultFactory";
const VAULT_FUNCTION = "publish_signal";

function PublishSignalButton() {
  const [signal, setSignal] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  async function handlePublishSignal() {
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
      arguments: [signal], // input as string/int
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
        type="number"
        value={signal}
        placeholder="Signal value"
        onChange={e => setSignal(e.target.value)}
        style={{ marginRight: "8px" }}
      />
      <button
        onClick={handlePublishSignal}
        disabled={loading || !signal}
        style={{ margin: "8px", padding: "8px 16px" }}
      >
        {loading ? "Publishing..." : "Publish Signal"}
      </button>
      {success && <div style={{ color: "green" }}>{success}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default PublishSignalButton;
