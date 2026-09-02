import React from "react";
import ReactDOM from "react-dom/client";
import SSRNPlatform from "./App.jsx";
import { LanguageProvider } from "./lib/i18n.jsx";
import "./index.css";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0A1A22", color: "#EAF2F4", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "Inter, sans-serif" }}>
          <div style={{ maxWidth: "600px", width: "100%", backgroundColor: "#102530", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "24px", backgroundColor: "rgba(210, 72, 62, 0.2)", color: "#F0857C", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", fontSize: "20px" }}>⚠️</div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px", color: "#EAF2F4" }}>Récupération automatique de session</h2>
            <p style={{ fontSize: "13px", color: "#8FA8B0", marginBottom: "12px" }}>Une anomalie temporaire a été interceptée. Détails du diagnostic :</p>
            
            <div style={{ backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid rgba(210, 72, 62, 0.3)", borderRadius: "8px", padding: "12px", fontSize: "11px", color: "#F0857C", fontFamily: "monospace", textAlign: "left", maxHeight: "180px", overflowY: "auto", marginBottom: "20px", whiteSpace: "pre-wrap" }}>
              {this.state.error?.toString()}
              {"\n"}
              {this.state.error?.stack}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = "/"; }}
                style={{ backgroundColor: "#1E8FA6", color: "#03151C", fontWeight: "bold", padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px" }}
              >
                Réinitialiser & Recharger
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <LanguageProvider>
        <SSRNPlatform />
      </LanguageProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
