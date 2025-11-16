import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { statsService } from "../../services/statsService";

const ReservationsSummary = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!startDate || !endDate) return alert("Select start and end date");
    setLoading(true);
    try {
      const report = await statsService.getReservationsSummary(startDate, endDate);
      setData(report);
    } catch (err) {
      console.error(err);
      alert("Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    statsService.exportReservationsSummary(data, format);
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h2>Reservations Summary Report</h2>
        <p className="text-muted">Welcome back, {user?.email}</p>

        {/* Filters and Export */}
        <div className="row g-3 mb-4 align-items-center">
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <button className="btn btn-success" onClick={fetchReport}>
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
                <th>Total Reservations</th>
                <th>Cancelled</th>
                <th>Completed Visits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.total_reservations}</td>
                <td>{data.cancelled_reservations}</td>
                <td>{data.completed_visits}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReservationsSummary;
