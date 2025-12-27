import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { usersService } from "../services/usersService";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    role: "", specialization: "", license_number: "", pesel: "", birth_date: "",
  });

  // Filters State
  const [filters, setFilters] = useState({
    first_name: "", last_name: "", email: "", role: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await usersService.getAllUsers();
        setUsers(data || []);
        setFilteredUsers(data || []);
        setError(null);
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((u) =>
      Object.keys(filters).every((key) =>
        u[key]?.toString().toLowerCase().includes(filters[key].toLowerCase())
      )
    );
    setFilteredUsers(filtered);
  }, [filters, users]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (user) => {
    setEditUser(user);
    setEditForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "",
      pesel: user.pesel || "",
      birth_date: user.birth_date || "",
      specialization: user.specialization || "",
      license_number: user.license_number || "",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await usersService.updateUser(editUser.user_id, editForm);
      setUsers((prev) => prev.map((u) => (u.user_id === editUser.user_id ? updated : u)));
      setShowEditModal(false);
    } catch (err) {
      alert("Failed to update user");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">

        {/* Header Section */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-4">
                <i className="bi bi-people-fill text-primary fs-2"></i>
              </div>
              <div>
                <h1 className="display-6 fw-bold text-dark mb-1">User Management</h1>
                <p className="text-muted mb-0">Manage system roles and personal data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="card border-0 shadow-sm bg-white">
          <div className="card-body p-4 p-md-5">

            {/* Filters */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-funnel text-primary me-2 fs-5"></i>
                <h5 className="fw-bold mb-0 text-dark">Quick Filters</h5>
              </div>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-dark">First Name</label>
                  <input type="text" name="first_name" value={filters.first_name} onChange={handleFilterChange} className="form-control bg-light border-0" placeholder="Filter..." />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-dark">Last Name</label>
                  <input type="text" name="last_name" value={filters.last_name} onChange={handleFilterChange} className="form-control bg-light border-0" placeholder="Filter..." />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-dark">Email</label>
                  <input type="text" name="email" value={filters.email} onChange={handleFilterChange} className="form-control bg-light border-0" placeholder="Filter..." />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-dark">Role</label>
                  <select name="role" value={filters.role} onChange={handleFilterChange} className="form-select bg-light border-0">
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="patient">Patient</option>
                    <option value="receptionist">Receptionist</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Area */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-3 border border-dashed">
                <p className="text-muted mb-0">No users found matching your criteria.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle border-top">
                  <thead className="text-uppercase small fw-bold text-muted">
                    <tr>
                      <th className="py-3 border-0">User Details</th>
                      <th className="py-3 border-0">Role</th>
                      <th className="py-3 border-0">Contact</th>
                      <th className="py-3 border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.user_id}>
                        <td className="py-3">
                          <div className="fw-bold text-dark">{u.first_name} {u.last_name}</div>
                          <div className="small text-muted">{u.email}</div>
                        </td>
                        <td className="py-3">
                          <span className={`badge rounded-pill px-3 py-2 ${
                            u.role === 'admin' ? 'bg-danger-subtle text-danger' :
                            u.role === 'doctor' ? 'bg-primary-subtle text-primary' :
                            u.role === 'patient' ? 'bg-success-subtle text-success' : 'bg-light text-dark'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 small text-dark">{u.phone || "-"}</td>
                        <td className="py-3 text-end">
                          <button className="btn btn-sm btn-white border shadow-sm rounded-pill px-3" onClick={() => handleEditClick(u)}>
                            <i className="bi bi-pencil-square me-1"></i> Edit
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
      </div>

      {/* Edit Modal Overlay */}
      {showEditModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060, backdropFilter: "blur(4px)" }} onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-4 shadow-lg p-4 w-100 overflow-auto" style={{ maxWidth: "550px", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0 text-dark">Edit User</h4>
              <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small">First Name</label>
                  <input type="text" name="first_name" className="form-control" value={editForm.first_name} onChange={handleEditChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Last Name</label>
                  <input type="text" name="last_name" className="form-control" value={editForm.last_name} onChange={handleEditChange} required />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold small">Email</label>
                  <input type="email" name="email" className="form-control" value={editForm.email} onChange={handleEditChange} required />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold small">Role</label>
                  <select name="role" className="form-select" value={editForm.role} onChange={handleEditChange} required>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="patient">Patient</option>
                    <option value="receptionist">Receptionist</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;