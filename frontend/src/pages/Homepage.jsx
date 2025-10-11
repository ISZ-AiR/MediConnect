import { useState, useEffect } from "react";
import { healthService } from "../services";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  const handleCheckHealth = async () => {
    setLoading(true);
    setMessage("");
    setError(null);
    try {
      const res = await healthService.check();
      if (res && res.success) {
        // try to display a friendly message from the response
        const data = res.data;
        const statusText =
          (data && (data.status || data.message)) ||
          (typeof data === "string" ? data : JSON.stringify(data));
        setMessage(statusText || "OK");
      } else if (res && res.error) {
        setError(res.error.message || "Health check returned an error");
      } else {
        setError("Unknown health check response");
      }
    } catch (err) {
      setError(err?.message || "Network or server error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container text-center">
      <h1 className="display-4 mb-4">Welcome to Our Website</h1>
      <p className="lead mb-4">
        Explore our features and learn more about what we offer.
      </p>
      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={handleCheckHealth}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check backend health"}
        </button>
      </div>
      <div aria-live="polite">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    </div>
  );
}

export default Homepage;
