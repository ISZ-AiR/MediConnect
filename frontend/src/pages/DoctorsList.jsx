import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ListToolbar from "../components/ListToolbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.listDoctors();
        setDoctors(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Doctors</h2>
          <div>
            <button
              className="btn btn-primary me-2"
              onClick={() => navigate("/admin/doctors/create")}
            >
              Create Doctor
            </button>
          </div>
        </div>
        <ListToolbar
          search={search}
          onSearch={(v) => setSearch(v)}
          page={1}
          pageSize={20}
          total={doctors.length}
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Specialization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors
                  .filter(
                    (it) =>
                      !search ||
                      JSON.stringify(it)
                        .toLowerCase()
                        .includes(search.toLowerCase())
                  )
                  .map((d, idx) => (
                    <tr key={d.doctor_id || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        {d.user?.first_name} {d.user?.last_name}
                      </td>
                      <td>{d.user?.email}</td>
                      <td>{d.user?.phone}</td>
                      <td>{d.specialization}</td>
                      <td>
                        <Link
                          to={`/admin/doctors/${d.doctor_id}`}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          View
                        </Link>
                        <Link
                          to={`/admin/doctors/edit/${d.doctor_id}`}
                          className="btn btn-sm btn-outline-secondary me-2"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={async () => {
                            if (
                              !confirm(
                                "Delete this doctor? This will remove the user account as well."
                              )
                            )
                              return;
                            try {
                              await apiRequest(`/doctor/${d.doctor_id}`, {
                                method: "DELETE",
                              });
                              setDoctors((prev) =>
                                prev.filter(
                                  (item) => item.doctor_id !== d.doctor_id
                                )
                              );
                            } catch (err) {
                              console.error(err);
                              alert("Failed to delete doctor");
                            }
                          }}
                        >
                          Delete
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

export default DoctorsList;
