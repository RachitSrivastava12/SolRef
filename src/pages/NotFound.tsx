import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "../components/Layout";
import { SolanaMark } from "../components/Brand";

export default function NotFound() {
  return (
    <Layout>
      <div className="aurora" />
      <div className="shell" style={{ position: "relative", zIndex: 1, paddingTop: 120, textAlign: "center" }}>
        <SolanaMark size={44} />
        <h1 style={{ fontSize: 64, fontWeight: 800, marginTop: 20, letterSpacing: "-.03em" }} className="grad-text">404</h1>
        <p style={{ fontSize: 17, color: "var(--text-mid)", marginTop: 8, marginBottom: 28 }}>This slot was skipped. No block here.</p>
        <Link to="/" className="btn btn-grad"><ArrowLeft size={16} /> Back to SolRef</Link>
      </div>
    </Layout>
  );
}
