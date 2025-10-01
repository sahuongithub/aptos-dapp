import React from "react";

const VAULT_ADDRESS = "0xf02e42e167e86430855e112267405f0bb4bb6a8fed16cd7e4e4a339ec7341f73";
const VAULT_MODULE = "VaultFactory";
const VAULT_FUNCTION = "resume_vault";

function ResumeVaultButton() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(null);
  const [error, setError] = React.useState(null);

  async function handleResume() {
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
      arguments: [],
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
      <button
        onClick={handleResume}
        disabled={loading}
        style={{ margin: "8px", padding: "8px 16px" }}
      >
        {loading ? "Resuming..." : "Resume Vault"}
      </button>
      {success && <div style={{ color: "green" }}>{success}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default ResumeVaultButton;
