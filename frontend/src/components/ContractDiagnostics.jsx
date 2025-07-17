/**
 * Contract Diagnostics Component
 * 
 * Helps diagnose and fix contract deployment issues
 */

import React, { useState, useEffect } from "react";
import { autoDetectContractAddresses, verifyContracts } from "../services/contractVerification";
import { CONTRACT_ADDRESSES } from "../config/contracts.js";

function ContractDiagnostics() {
  const [diagnostics, setDiagnostics] = useState({
    autoDetected: {},
    verification: {},
    isLoading: false
  });

  const [currentAddresses] = useState({
    token: CONTRACT_ADDRESSES.loyaltyToken,
    dex: CONTRACT_ADDRESSES.simpleDEX
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setDiagnostics(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log("🔍 Running contract diagnostics...");
      
      // Auto-detect contracts
      const autoDetected = await autoDetectContractAddresses();
      
      // Verify current addresses
      const verification = await verifyContracts(currentAddresses.token, currentAddresses.dex);
      
      setDiagnostics({
        autoDetected,
        verification,
        isLoading: false
      });
      
      console.log("📊 Diagnostics complete:", { autoDetected, verification });
    } catch (error) {
      console.error("❌ Diagnostics failed:", error);
      setDiagnostics(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getStatusIcon = (exists, functional) => {
    if (!exists) return "❌";
    if (functional) return "✅";
    return "⚠️";
  };

  const getStatusText = (exists, functional) => {
    if (!exists) return "Not Found";
    if (functional) return "Working";
    return "Found but Non-Functional";
  };

  return (
    <div style={{
      backgroundColor: "#2d3138",
      padding: "20px",
      borderRadius: "8px",
      border: "1px solid #555",
      margin: "20px 0",
      color: "white"
    }}>
      <h3 style={{ color: "white", marginBottom: "15px" }}>🔧 Contract Diagnostics</h3>
      
      {diagnostics.isLoading && (
        <div style={{ textAlign: "center", color: "#ccc" }}>
          Running diagnostics...
        </div>
      )}
      
      {!diagnostics.isLoading && (
        <>
          {/* Current Configuration */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ color: "#87ceeb", marginBottom: "10px" }}>Current Configuration</h4>
            <div style={{ 
              backgroundColor: "#3a3f47", 
              padding: "10px", 
              borderRadius: "4px",
              fontSize: "0.9em",
              fontFamily: "monospace"
            }}>
              <div>Token: {currentAddresses.token}</div>
              <div>DEX: {currentAddresses.dex}</div>
            </div>
          </div>

          {/* Verification Results */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ color: "#87ceeb", marginBottom: "10px" }}>Verification Results</h4>
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{
                backgroundColor: "#3a3f47",
                padding: "10px",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span>LoyaltyToken</span>
                <span>
                  {getStatusIcon(diagnostics.verification.token?.exists, diagnostics.verification.token?.functional)}
                  {" "}
                  {getStatusText(diagnostics.verification.token?.exists, diagnostics.verification.token?.functional)}
                </span>
              </div>
              
              <div style={{
                backgroundColor: "#3a3f47",
                padding: "10px",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span>SimpleDEX</span>
                <span>
                  {getStatusIcon(diagnostics.verification.dex?.exists, diagnostics.verification.dex?.functional)}
                  {" "}
                  {getStatusText(diagnostics.verification.dex?.exists, diagnostics.verification.dex?.functional)}
                </span>
              </div>
            </div>
          </div>

          {/* Auto-Detection Results */}
          {Object.keys(diagnostics.autoDetected).length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ color: "#87ceeb", marginBottom: "10px" }}>Auto-Detected Contracts</h4>
              <div style={{ 
                backgroundColor: "#3a3f47", 
                padding: "10px", 
                borderRadius: "4px",
                fontSize: "0.9em",
                fontFamily: "monospace"
              }}>
                {diagnostics.autoDetected.token && (
                  <div style={{ color: "#90EE90" }}>✅ Token: {diagnostics.autoDetected.token}</div>
                )}
                {diagnostics.autoDetected.dex && (
                  <div style={{ color: "#90EE90" }}>✅ DEX: {diagnostics.autoDetected.dex}</div>
                )}
                {!diagnostics.autoDetected.token && !diagnostics.autoDetected.dex && (
                  <div style={{ color: "#FFB6C1" }}>❌ No contracts detected</div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <h4 style={{ color: "#87ceeb", marginBottom: "10px" }}>Recommendations</h4>
            <div style={{ 
              backgroundColor: "#3a3f47", 
              padding: "10px", 
              borderRadius: "4px",
              fontSize: "0.9em"
            }}>
              {!diagnostics.verification.token?.exists && !diagnostics.verification.dex?.exists ? (
                <div style={{ color: "#FFB6C1" }}>
                  ❌ No contracts found. Please deploy contracts using:<br/>
                  <code style={{ backgroundColor: "#2d3138", padding: "2px 4px", borderRadius: "2px" }}>
                    npx hardhat run scripts/deploy.js --network localhost
                  </code>
                </div>
              ) : diagnostics.autoDetected.token && diagnostics.autoDetected.dex ? (
                <div style={{ color: "#90EE90" }}>
                  ✅ Contracts detected! Update your configuration to use:<br/>
                  Token: {diagnostics.autoDetected.token}<br/>
                  DEX: {diagnostics.autoDetected.dex}
                </div>
              ) : (
                <div style={{ color: "#FFD700" }}>
                  ⚠️ Some contracts may need to be redeployed. Check the verification status above.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={runDiagnostics}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            🔄 Refresh Diagnostics
          </button>
        </>
      )}
    </div>
  );
}

export default ContractDiagnostics;
