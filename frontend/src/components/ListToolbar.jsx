import React from "react";

const ListToolbar = ({
  search = "",
  page = 1,
  pageSize = 10,
  total = 0,
  onSearch = () => {},
  onPageChange = () => {},
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="d-flex align-items-center justify-content-between mb-3">
      <div className="input-group w-50">
        <input
          type="search"
          className="form-control"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => onSearch("")}
        >
          Clear
        </button>
      </div>

      <div className="d-flex align-items-center">
        <button
          className="btn btn-sm btn-outline-primary me-2"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <span className="me-2">
          {page} / {totalPages}
        </span>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ListToolbar;
