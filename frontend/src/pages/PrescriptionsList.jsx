import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { resourceService } from "../services/resourceService";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 10;

const PrescriptionsList = () => {
  const { user } = useAuth();

  // Określamy prefix w URL i zachowanie przycisków
  const rolePrefix =
    user?.role === "doctor"
      ? "doctor"
      : user?.role === "patient"
      ? "patient"
      : "admin";

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtry
  const [filterPatient, setFilterPatient] = useState("");
  const [filterPESEL, setFilterPESEL] = useState("");
  const [filterMedication, setFilterMedication] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterMine, setFilterMine] = useState(false);

  // Paginacja
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      let data = [];

      if (user.role === "patient") {
        // Endpoint dla pacjenta, zwraca tylko jego recepty
        data = await resourceService.listPrescriptionsByPatient();
      } else {
        // Lekarz i admin
        data = await resourceService.listPrescriptions();
      }

      setPrescriptions(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    try {
      await resourceService.deletePrescription(id);
      setPrescriptions((prev) => prev.filter((p) => p.prescription_id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete prescription");
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter((p) => {
    const patientMatch = p.patient_name?.toLowerCase().includes(filterPatient.toLowerCase());
    const peselMatch = p.patient_pesel?.includes(filterPESEL);
    const medicationMatch = p.medication?.toLowerCase().includes(filterMedication.toLowerCase());
    const dateMatch = filterDate ? p.visit_date === filterDate : true;
    const mineMatch =
      filterMine && user.role === "doctor" ? p.doctor_user_id === user.user_id : true;

    return patientMatch && peselMatch && medicationMatch && dateMatch && mineMatch;
  });

  const totalPages = Math.ceil(filteredPrescriptions.length / PAGE_SIZE);
  const paginated = filteredPrescriptions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="text-center mb-4">
          <i className="bi bi-capsule text-warning" style={{ fontSize: "3rem" }}></i>
          <h2 className="fw-bold mt-3">Prescriptions</h2>
          <p className="text-muted">Manage all prescriptions</p>
        </div>

        {/* Filtry */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <div className="row g-3 mb-2">
              <div className="col-md-6">
                <label className="form-label fw-bold">Patient Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={filterPatient}
                  onChange={(e) => setFilterPatient(e.target.value)}
                  disabled={user.role === "patient"} // pacjent nie filtruje innych
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">PESEL</label>
                <input
                  type="text"
                  className="form-control"
                  value={filterPESEL}
                  onChange={(e) => setFilterPESEL(e.target.value)}
                  disabled={user.role === "patient"}
                />
              </div>
            </div>

            <div className="row g-3 mb-2">
              <div className="col-md-6">
                <label className="form-label fw-bold">Medication</label>
                <input
                  type="text"
                  className="form-control"
                  value={filterMedication}
                  onChange={(e) => setFilterMedication(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Visit Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
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
                    <label className="form-check-label fw-bold" htmlFor="mineCheck">
                      Only my prescriptions
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabela */}
        <div className="card shadow-sm border-0">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status"></div>
              </div>
            ) : paginated.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Visit ID</th>
                      <th>Visit Date</th>
                      <th>Patient</th>
                      <th>PESEL</th>
                      <th>Doctor</th>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Instruction</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((p) => (
                      <tr key={p.prescription_id}>
                        <td>{p.visit_id}</td>
                        <td>{p.visit_date}</td>
                        <td>{p.patient_name || "N/A"}</td>
                        <td>{p.patient_pesel || "N/A"}</td>
                        <td>{p.doctor_name || "N/A"}</td>
                        <td>{p.medication}</td>
                        <td>{p.dosage}</td>
                        <td>{p.instruction || ""}</td>
                        <td>
                          <div className="btn-group">
                            <Link
                              to={`/${rolePrefix}/prescriptions/${p.prescription_id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View
                            </Link>

                            {user.role !== "patient" && p.doctor_user_id === user.user_id && (
                              <>
                                <Link
                                  to={`/${rolePrefix}/prescriptions/edit/${p.prescription_id}`}
                                  className="btn btn-sm btn-outline-secondary"
                                >
                                  Edit
                                </Link>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(p.prescription_id)}
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
              <div className="text-center py-5">No prescriptions found.</div>
            )}

            {/* Paginacja */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between mt-3 align-items-center">
                <button
                  className="btn btn-outline-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-outline-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionsList;
