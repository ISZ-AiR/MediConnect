import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ListToolbar from "../components/ListToolbar";
import { resourceService } from "../services/resourceService";
import { apiRequest } from "../services/apiClient";

const ReferralsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.listReferrals();
        setItems(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load referrals");
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
        <h2 className="mb-4">Referrals</h2>
        <div className="mb-3">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/referrals/create")}
          >
            Create Referral
          </button>
        </div>
        <ListToolbar
          search={search}
          onSearch={(val) => setSearch(val)}
          page={1}
          pageSize={20}
          total={items.length}
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
                  <th>Examination ID</th>
                  <th>Doctor ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .filter(
                    (it) =>
                      !search ||
                      JSON.stringify(it)
                        .toLowerCase()
                        .includes(search.toLowerCase())
                  )
                  .map((r, idx) => (
                    <tr key={r.referral_id || idx}>
                      <td>{idx + 1}</td>
                      <td>{r.visit_id}</td>
                      <td>{r.examination_id}</td>
                      <td>{r.doctor_id}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              navigate(`/admin/referrals/${r.referral_id}`)
                            }
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              navigate(`/admin/referrals/edit/${r.referral_id}`)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={async () => {
                              if (!window.confirm("Delete this referral?"))
                                return;
                              try {
                                await apiRequest(
                                  `/referrals/${r.referral_id}`,
                                  { method: "DELETE" }
                                );
                                setItems((prev) =>
                                  prev.filter(
                                    (it) => it.referral_id !== r.referral_id
                                  )
                                );
                              } catch (err) {
                                console.error(err);
                                alert("Failed to delete referral");
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
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

export default ReferralsList;
