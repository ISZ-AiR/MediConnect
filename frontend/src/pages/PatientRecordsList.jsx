import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ListToolbar from "../components/ListToolbar";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

const PatientRecordsList = () => {
const { user } = useAuth(); // Zalogowany pacjent
const [records, setRecords] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [search, setSearch] = useState("");
const navigate = useNavigate();

useEffect(() => {
const loadRecords = async () => {
try {
setLoading(true);
const res = await apiRequest("/visits/me");
if (res.success) {
setRecords(res.data || []);
} else {
setRecords([]);
}
} catch (err) {
console.error(err);
setError("Failed to load your visits");
} finally {
setLoading(false);
}
};
loadRecords();
}, []);

return ( <div className="min-vh-100 bg-light"> <Navbar /> <div className="container py-5"> <h2 className="mb-4">My Visits</h2>


    <ListToolbar
      search={search}
      onSearch={(val) => setSearch(val)}
      page={1}
      pageSize={20}
      total={records.length}
      onPageChange={() => {}}
    />

    {loading && (
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    )}
    {error && <div className="alert alert-danger">{error}</div>}

    {!loading && !error && (
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Visit ID</th>
              <th>Reservation ID</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Nurse</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records
              .filter(
                (rec) =>
                  !search ||
                  JSON.stringify(rec)
                    .toLowerCase()
                    .includes(search.toLowerCase())
              )
              .map((rec, idx) => (
                <tr key={rec.visit_id || idx}>
                  <td>{idx + 1}</td>
                  <td>{rec.visit_id}</td>
                  <td>{rec.reservation?.reservation_id}</td>
                  <td>{rec.reservation?.doctor_name || rec.reservation?.doctor_id}</td>
                  <td>{new Date(rec.visit_date).toLocaleDateString()}</td>
                  <td>{rec.nurse_id || "—"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        navigate(`/patient/records/${rec.visit_id}`)
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>


);
};

export default PatientRecordsList;
