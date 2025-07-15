// CreateTokenForm.jsx
import React, { useState } from "react";
import { getBalance, transferTokens } from "../services/token";

function CreateTokenForm() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState(null);

  const handleTansfer = async () => {
    try {
      const hash = await transferTokens(recipient, amount);
      setStatus(`Tokens sent: ${hash}`);
    } catch(err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleBalance = async () => {
    try {
      const [account] = await window.ethereum.request({ method: "eth_accounts" });
      const bal = await getBalance(account);
      setBalance(bal);
    } catch (err) {
      setStatus("Error with balance");
    }
  };

  return (
    <div>
      <h2>Send Tokens</h2>
      <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Target Address" />
      {recipient && <p>{recipient}</p>}
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
      <button onClick={handleTansfer}>Send</button>

      <hr />

      <button onClick={handleBalance}>See my balance</button>
      {balance && <p>Balance: {balance} LOYAL</p>}
      <p>{status}</p>
    </div>
  );
};
export default CreateTokenForm;