import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const PAGE_SIZE = 10;

const ReferralsList = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const rolePrefix = user?.role === "doctor" ? "doctor" : "admin";

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtry
  const [filterPatient, setFilterPatient] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterMine, setFilterMine] = useState(false);
  const [filterCompleted, setFilterCompleted] = useState("");

  // Paginacja
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const data = await resourceService.listReferrals();
      setReferrals(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const filteredReferrals = referrals.filter((r) => {
    const patientMatch = r.patient_name
      ?.toLowerCase()
      .includes(filterPatient.toLowerCase());
    const doctorMatch = r.doctor_name
      ?.toLowerCase()
      .includes(filterDoctor.toLowerCase());
    const dateMatch = filterDate ? r.referral_date === filterDate : true;
    const mineMatch = filterMine ? r.doctor_user_id === user.user_id : true;
    const completedMatch =
      filterCompleted === ""
        ? true
        : filterCompleted === "yes"
        ? r.is_completed
        : !r.is_completed;

    return (
      patientMatch && doctorMatch && dateMatch && mineMatch && completedMatch
    );
  });

  const totalPages = Math.ceil(filteredReferrals.length / PAGE_SIZE);
  const paginated = filteredReferrals.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this referral?")) return;
    try {
      await resourceService.deleteReferral(id);
      setReferrals((prev) => prev.filter((r) => r.referral_id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete referral");
    }
  };

  return (
      <div className="min-vh-100">
        <Navbar/>
        <div className="container py-5">
          <div className="card shadow-sm border-0 overflow-hidden">
              <div className="card-body text-center p-4">
                <i
                    className="bi bi-card-checklist text-warning"
                    style={{fontSize: "3rem"}}
                ></i>
                <h2 className="fw-bold mt-2">Referrals</h2>
                <p className={`${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'} mb-0`}>
                  Manage and track patient referrals
                </p>
              </div>

            {/* Filtry */}
            <div className="card-body shadow-sm border-0 mb-4 p-3">
              <div className="row g-3 mb-2">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Patient</label>
                  <input
                      type="text"
                      className="form-control"
                      value={filterPatient}
                      onChange={(e) => {
                        setFilterPatient(e.target.value);
                        setCurrentPage(1);
                      }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Doctor</label>
                  <input
                      type="text"
                      className="form-control"
                      value={filterDoctor}
                      onChange={(e) => {
                        setFilterDoctor(e.target.value);
                        setCurrentPage(1);
                      }}
                  />
                </div>
              </div>

              <div className="row g-3 mb-2">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Referral Date</label>
                  <input
                      type="date"
                      className="form-control"
                      value={filterDate}
                      onChange={(e) => {
                        setFilterDate(e.target.value);
                        setCurrentPage(1);
                      }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Completed</label>
                  <select
                      className="form-select"
                      value={filterCompleted}
                      onChange={(e) => {
                        setFilterCompleted(e.target.value);
                        setCurrentPage(1);
                      }}
                  >
                    <option value="">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {user.role === "doctor" && (
                  <div className="row g-3">
                    <div className="col-md-6 d-flex align-items-center">
                      <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="mineCheck"
                            checked={filterMine}
                            onChange={(e) => setFilterMine(e.target.checked)}
                        />
                        <label
                            className="form-check-label fw-bold"
                            htmlFor="mineCheck"
                        >
                          Only my referrals
                        </label>
                      </div>
                    </div>
                  </div>
              )}
            </div>

            {/* Tabela */}
            <div className="card-body shadow-sm border-0">
              <div className="card-body">
                {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-warning"></div>
                    </div>
                ) : paginated.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover mb-0">
                        <thead className="table-light">
                        <tr>
                          <th>Visit ID</th>
                          <th>Examination</th>
                          <th>Doctor</th>
                          <th>Patient</th>
                          <th>Completed</th>
                          <th>Notes</th>
                          <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginated.map((r) => (
                            <tr key={r.referral_id}>
                              <td>{r.visit_id}</td>
                              <td>{r.examination_name || r.examination_id}</td>
                              <td>{r.doctor_name || r.doctor_id}</td>
                              <td>{r.patient_name}</td>
                              <td>{r.is_completed ? "Yes" : "No"}</td>
                              <td>{r.notes || ""}</td>
                              <td>
                                <div className="btn-group">
                                  <Link
                                      to={`/${rolePrefix}/referrals/${r.referral_id}`}
                                      className="btn btn-sm btn-outline-primary"
                                  >
                                    View
                                  </Link>

                                  {r.doctor_user_id === user.user_id && (
                                      <>
                                        <Link
                                            to={`/${rolePrefix}/referrals/edit/${r.referral_id}`}
                                            className="btn btn-sm btn-outline-secondary"
                                        >
                                          Edit
                                        </Link>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(r.referral_id)}
                                        >
                                          Delete
                                        </button>
                                      </>
                                  )}
                                </div>
                              </td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                ) : (
                    <div className="text-center py-5">No referrals found.</div>
                )}

                {/* Paginacja */}
                {totalPages > 1 && (
                    <nav className="mt-3">
                      <ul className="pagination justify-content-center mb-0">
                        <li
                            className={`page-item ${
                                currentPage === 1 ? "disabled" : ""
                            }`}
                        >
                          <button
                              className="page-link"
                              onClick={() =>
                                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                          >
                            Previous
                          </button>
                        </li>
                        {Array.from({length: totalPages}, (_, i) => (
                            <li
                                key={i}
                                className={`page-item ${
                                    currentPage === i + 1 ? "active" : ""
                                }`}
                            >
                              <button
                                  className="page-link"
                                  onClick={() => setCurrentPage(i + 1)}
                              >
                                {i + 1}
                              </button>
                            </li>
                        ))}
                        <li
                            className={`page-item ${
                                currentPage === totalPages ? "disabled" : ""
                            }`}
                        >
                          <button
                              className="page-link"
                              onClick={() =>
                                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                              }
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
        );
        };

        export default ReferralsList;
