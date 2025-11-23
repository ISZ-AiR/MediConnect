import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { usersService } from "../services/usersService";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    specialization: "",
    license_number: "",
    pesel: "",
    birth_date: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await usersService.getAllUsers(); // backendowe pola
        setUsers(data);
        setFilteredUsers(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filters
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

  // Edit
  const handleEditClick = (user) => {
    setEditUser(user);

    const newForm = {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "",
    };

    if (user.role === "patient") {
      newForm.pesel = user.pesel || "";
      newForm.birth_date = user.birth_date || "";
    }

    if (user.role === "doctor") {
      newForm.specialization = user.specialization || "";
      newForm.license_number = user.license_number || "";
    }

    setEditForm(newForm);
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
      setUsers((prev) =>
        prev.map((u) => (u.user_id === editUser.user_id ? updated : u))
      );
      setShowEditModal(false);
      setEditUser(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h1 className="display-6 fw-bold mb-4">Manage Users</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Filters */}
        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <input
              type="text"
              name="first_name"
              value={filters.first_name}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Filter by first name"
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              name="last_name"
              value={filters.last_name}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Filter by last name"
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Filter by email"
            />
          </div>
          <div className="col-md-3">
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="patient">Patient</option>
              <option value="receptionist">Receptionist</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="alert alert-info">No users found</div>
        ) : (
          <div className="table-responsive shadow-sm rounded">
            <table className="table table-hover align-middle mb-0 bg-white">
              <thead className="table-light">
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.email}</td>
                    <td>
                      {u.first_name} {u.last_name}
                    </td>
                    <td>{u.role}</td>
                    <td>{u.phone || "-"}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleEditClick(u)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          >
            <div
              className="bg-white rounded shadow-lg p-4 w-100"
              style={{
                maxWidth: "500px",
                transform: "translateY(-10%)",
              }}
              role="dialog"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowEditModal(false);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h5 className="mb-3">Edit User</h5>
              <form onSubmit={handleEditSubmit}>
                {/* Pola wspólne */}
                <div className="mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-control"
                    value={editForm.first_name}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-control"
                    value={editForm.last_name}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={editForm.phone || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    value={editForm.role}
                    className="form-select"
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="patient">Patient</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                {/* Pola pacjenta */}
                {editForm.role === "patient" && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">PESEL</label>
                      <input
                        type="text"
                        name="pesel"
                        className="form-control"
                        value={editForm.pesel || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Birth Date</label>
                      <input
                        type="date"
                        name="birth_date"
                        className="form-control"
                        value={editForm.birth_date || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                  </>
                )}

                {/* Pola lekarza */}
                {editForm.role === "doctor" && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        className="form-control"
                        value={editForm.specialization || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">License Number</label>
                      <input
                        type="text"
                        name="license_number"
                        className="form-control"
                        value={editForm.license_number || ""}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
