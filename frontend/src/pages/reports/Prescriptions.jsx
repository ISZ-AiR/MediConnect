import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { statsService } from "../../services/statsService";

const Prescriptions = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const report = await statsService.getPrescriptions();
      setData(report);
    } catch (err) {
      console.error(err);
      alert("Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    statsService.exportPrescriptions(data, format);
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2>Prescriptions Report</h2>
        <p className="text-muted">Welcome back, {user?.email}</p>

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <button className="btn btn-warning" onClick={fetchReport}>
              Generate
            </button>
          </div>
          <div className="col-md-3">
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Export
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item" onClick={() => handleExport("pdf")}>
                    PDF
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => handleExport("excel")}>
                    Excel
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : !data ? (
          <p>No data</p>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Total Prescriptions</th>
                <th>Most Common Medications</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.total_prescriptions}</td>
                <td>
                  {data.most_common_medications.map((m, i) => (
                    <div key={i}>{m.medication} ({m.count})</div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
