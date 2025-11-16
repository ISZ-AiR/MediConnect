import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ListToolbar from "../components/ListToolbar";
import { resourceService } from "../services/resourceService";

const ExaminationsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await resourceService.listExaminations();
        setItems(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load examinations");
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
          <h2 className="mb-0">Examinations</h2>
          <div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/examinations/create")}
            >
              Create Examination
            </button>
          </div>
        </div>
        <ListToolbar
          search={search}
          onSearch={(v) => setSearch(v)}
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
                  <th>Name</th>
                  <th>Type</th>
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
                  .map((e, idx) => (
                    <tr key={e.examination_id || idx}>
                      <td>{idx + 1}</td>
                      <td>{e.name}</td>
                      <td>{e.type}</td>
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

export default ExaminationsList;
