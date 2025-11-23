import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";

const PatientsList = () => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [peselFilter, setPeselFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [patientsData, usersData] = await Promise.all([
          resourceService.listPatients(),
          apiRequest("/users"),
        ]);

        setItems(patientsData || []);
        setUsers(usersData?.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load patients");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getPatientName = (patient) => {
    const user = users.find((u) => u.user_id === patient.user_id);
    return user ? `${user.first_name} ${user.last_name}` : "[brak danych]";
  };

  const filteredItems = items.filter((p) => {
    const userName = getPatientName(p).toLowerCase();
    return (
      (!peselFilter || p.pesel.includes(peselFilter)) &&
      (!nameFilter || userName.includes(nameFilter.toLowerCase()))
    );
  });

  const paginatedItems = filteredItems.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8"> {/* --- zawężenie --- */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i
                    className="bi bi-people-fill text-primary"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h2 className="fw-bold mt-3 mb-2">Patients</h2>
                  <p className="text-muted">Manage patients and their details</p>
                </div>

                {/* --- Create Patient Button (full width, icon + ) --- */}
                <div className="mb-4">
                  <button
                    className="btn btn-primary btn-lg w-100"
                    onClick={() => navigate("/receptionist/patients/create")}
                  >
                    <i className="bi bi-plus-lg me-2"></i>Create Patient
                  </button>
                </div>

                {/* --- Filters --- */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Filter by PESEL</label>
                  <input
                    type="text"
                    className="form-control mb-3"
                    value={peselFilter}
                    onChange={(e) => setPeselFilter(e.target.value)}
                    placeholder="PESEL"
                  />

                  <label className="form-label fw-bold">Filter by Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="First or Last Name"
                  />
                </div>

                {loading && (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                )}

                {error && <div className="alert alert-danger">{error}</div>}

                {!loading && !error && (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>PESEL</th>
                          <th>Birth Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map((p, idx) => (
                          <tr key={p.patient_id || idx}>
                            <td>{(page - 1) * pageSize + idx + 1}</td>
                            <td>{getPatientName(p)}</td>
                            <td>{p.pesel}</td>
                            <td>{p.birth_date}</td>
                            <td>
                              <Link
                                to={`/receptionist/patients/${p.patient_id}`}
                                className="btn btn-sm btn-outline-primary me-2"
                              >
                                View
                              </Link>
                              <Link
                                to={`/receptionist/patients/edit/${p.patient_id}`}
                                className="btn btn-sm btn-outline-secondary"
                              >
                                Edit
                              </Link>
                              {/* DELETE — removed */}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="d-flex justify-content-between mt-3">
                      <button
                        className="btn btn-outline-secondary"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </button>
                      <span>Page {page}</span>
                      <button
                        className="btn btn-outline-secondary"
                        disabled={page * pageSize >= filteredItems.length}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsList;
