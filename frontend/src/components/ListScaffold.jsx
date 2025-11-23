import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import ListToolbar from "./ListToolbar";
import { useFetchResource } from "../hooks/useFetchResource";
import { useNavigate } from "react-router-dom";

// columns: [{ header: 'Name', render: (row) => JSX }]
export const ListScaffold = ({
  title,
  fetchFn,
  createLabel,
  createPath,
  columns,
  pageSize = 20,
  actions,
}) => {
  const navigate = useNavigate();
  const { items, loading, error, reload } = useFetchResource(fetchFn);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return items;
    return items.filter((it) => JSON.stringify(it).toLowerCase().includes(s));
  }, [items, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">{title}</h2>
        {createLabel && createPath && (
          <button
            className="btn btn-primary"
            onClick={() => navigate(createPath)}
          >
            {createLabel}
          </button>
        )}
      </div>
      <ListToolbar
        search={search}
        onSearch={setSearch}
        page={currentPage}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
      {loading && (
        <div className="spinner-border" aria-busy="true" aria-live="polite">
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
                {columns.map((c) => (
                  <th key={c.header}>{c.header}</th>
                ))}
                {actions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, idx) => (
                <tr
                  key={
                    row.nurse_id ||
                    row.receptionist_id ||
                    row.user_id ||
                    row.doctor_id ||
                    row.manager_id ||
                    row.referral_id ||
                    row.prescription_id ||
                    row.examination_id ||
                    idx
                  }
                >
                  <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                  {columns.map((c) => (
                    <td key={c.header}>{c.render(row)}</td>
                  ))}
                  {actions && (
                    <td>
                      {actions(row, (currentPage - 1) * pageSize + idx, {
                        reload,
                        navigate,
                      })}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListScaffold;

ListScaffold.propTypes = {
  title: PropTypes.string.isRequired,
  fetchFn: PropTypes.func.isRequired,
  createLabel: PropTypes.string,
  createPath: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      render: PropTypes.func.isRequired,
    })
  ).isRequired,
  pageSize: PropTypes.number,
  actions: PropTypes.func,
};

ListScaffold.defaultProps = {
  pageSize: 20,
  createLabel: null,
  createPath: null,
  actions: null,
};
