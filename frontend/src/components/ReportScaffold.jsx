import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Navbar from "./Navbar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

// Generic scaffold for reports to reduce duplication across date range, doctor multi-select, export (PDF/Excel), table & charts.
// Props:
// - title: heading text
// - generate: async function ({ startDate, endDate, selectedDoctors }) => data
// - renderTable: (data, ctx) => JSX table
// - charts: array of { title, render: (data, ctx) => JSX (chart) }
// - buildExcelSheets: (data, ctx) => [{ name, rows }] for Excel export
// - fileBase: base filename without extension
// - includeDateRange: bool
// - includeDoctors: bool (fetch doctors via getDoctorsFn)
// - getDoctorsFn: async () => array of doctors (required if includeDoctors)
// Data context passed to renderers includes { startDate, endDate, selectedDoctors, doctorsList }
export default function ReportScaffold({
  title,
  generate,
  renderTable,
  charts = [],
  buildExcelSheets,
  fileBase = "report",
  includeDateRange = true,
  includeDoctors = false,
  getDoctorsFn,
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef();
  const reportRef = useRef();

  // Fetch doctors if needed
  useEffect(() => {
    let ignore = false;
    const loadDoctors = async () => {
      if (!includeDoctors || !getDoctorsFn) return;
      try {
        const docs = await getDoctorsFn();
        if (!ignore) setDoctorsList(Array.isArray(docs) ? docs : []);
      } catch (e) {
        console.error(e);
        if (!ignore) setDoctorsList([]);
      }
    };
    loadDoctors();
    return () => {
      ignore = true;
    };
  }, [includeDoctors, getDoctorsFn]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const ctx = {
    startDate,
    endDate,
    selectedDoctors,
    doctorsList,
  };

  const generateReport = async () => {
    if (includeDateRange && (!startDate || !endDate)) {
      alert("Select start and end date");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generate({ startDate, endDate, selectedDoctors });
      setData(result || []);
    } catch (e) {
      console.error(e);
      setError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  // Doctor selection helpers
  const toggleDoctor = (id) => {
    setSelectedDoctors((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };
  const toggleAllDoctors = () => {
    if (selectedDoctors.length === doctorsList.length) {
      setSelectedDoctors([]);
    } else {
      setSelectedDoctors(doctorsList.map((d) => d.doctor_id));
    }
  };

  const filteredData = (() => {
    if (!data) return [];
    if (!includeDoctors || selectedDoctors.length === 0) return data;
    return data.filter((d) => selectedDoctors.includes(d.doctor_id));
  })();

  // Excel export (multi-sheet) using builder
  const exportExcel = () => {
    if (!data || !buildExcelSheets) return alert("No data to export");
    try {
      const sheets = buildExcelSheets(data, { ...ctx, filteredData });
      if (!Array.isArray(sheets) || sheets.length === 0)
        return alert("Nothing to export");
      const wb = XLSX.utils.book_new();
      sheets.forEach((s) => {
        const ws = XLSX.utils.json_to_sheet(s.rows || []);
        XLSX.utils.book_append_sheet(wb, ws, s.name || "Sheet");
      });
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        `${fileBase}.xlsx`
      );
    } catch (e) {
      console.error(e);
      alert("Excel export failed");
    }
  };

  // PDF export with multi-page slicing
  const exportPDF = async () => {
    if (!reportRef.current) return alert("Nothing to export");
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgWidthAvailable = 595.28 - 80; // A4 width (pt) - margins (2*40)
      const scale = imgWidthAvailable / canvas.width;
      const imgHeight = canvas.height * scale;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const headerHeight = 60;
      const dateRangeText = `From: ${startDate || "-"}  To: ${endDate || "-"}`;

      const drawHeader = () => {
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, margin, margin + 10);
        if (includeDateRange) {
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          pdf.text(dateRangeText, margin, margin + 30);
        }
        pdf.setFontSize(12);
        pdf.setTextColor("#0d6efd");
        pdf.setFont("helvetica", "bold");
        pdf.text(
          "MediConnect",
          pdf.internal.pageSize.getWidth() - margin,
          margin + 10,
          { align: "right" }
        );
      };

      let remaining = imgHeight;
      let sourceY = 0;
      const pxPerPt = canvas.height / imgHeight;
      drawHeader();
      let y = margin + headerHeight;
      while (remaining > 0) {
        const sliceHeightPt = Math.min(remaining, pageHeight - y - margin);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.round(sliceHeightPt * pxPerPt);
        const ctx2 = sliceCanvas.getContext("2d");
        ctx2.drawImage(
          canvas,
          0,
          Math.round(sourceY * pxPerPt),
          canvas.width,
          sliceCanvas.height,
          0,
          0,
          canvas.width,
          sliceCanvas.height
        );
        const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.85);
        pdf.addImage(
          sliceData,
          "JPEG",
          margin,
          y,
          imgWidthAvailable,
          sliceHeightPt
        );
        remaining -= sliceHeightPt;
        sourceY += sliceHeightPt;
        if (remaining > 0) {
          pdf.addPage();
          drawHeader();
          y = margin + headerHeight;
        }
      }
      pdf.save(`${fileBase}.pdf`);
    } catch (e) {
      console.error(e);
      alert("PDF export failed");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="display-5 fw-bold">{title}</h1>
          </div>
        </div>
        <div className="card mb-4 p-4">
          <h5 className="mb-3">Select Filters</h5>
          <div className="row g-3 align-items-end">
            {includeDateRange && (
              <>
                <div className="col-md-2">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
            {includeDoctors && (
              <div className="col-md-4" ref={dropdownRef}>
                <label className="form-label">Doctors</label>
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary w-100 text-start"
                    type="button"
                    onClick={() => setDropdownOpen((p) => !p)}
                  >
                    {selectedDoctors.length === 0 ||
                    selectedDoctors.length === doctorsList.length
                      ? "All"
                      : `${selectedDoctors.length} selected`}
                  </button>
                  {dropdownOpen && (
                    <div
                      className="dropdown-menu show p-3"
                      style={{ maxHeight: 240, overflowY: "auto" }}
                    >
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="select-all"
                          checked={
                            selectedDoctors.length === doctorsList.length &&
                            doctorsList.length > 0
                          }
                          onChange={toggleAllDoctors}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="select-all"
                        >
                          All
                        </label>
                      </div>
                      {doctorsList.length === 0 ? (
                        <div>Loading doctors...</div>
                      ) : (
                        doctorsList.map((doc) => (
                          <div key={doc.doctor_id} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`doc-${doc.doctor_id}`}
                              checked={selectedDoctors.includes(doc.doctor_id)}
                              onChange={() => toggleDoctor(doc.doctor_id)}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`doc-${doc.doctor_id}`}
                            >
                              {doc.doctor_id} - {doc.first_name} {doc.last_name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div
              className={
                includeDoctors
                  ? "col-md-4 d-flex gap-2"
                  : includeDateRange
                  ? "col-md-8 d-flex gap-2"
                  : "col-md-4 d-flex gap-2"
              }
            >
              <button className="btn btn-primary" onClick={generateReport}>
                Generate
              </button>
              <div className="dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Export
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button className="dropdown-item" onClick={exportPDF}>
                      PDF
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={exportExcel}>
                      Excel
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div ref={reportRef}>
          {loading && <p>Loading...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading &&
            !error &&
            (!data || (Array.isArray(data) && data.length === 0)) && (
              <p>No data</p>
            )}
          {!loading &&
            !error &&
            data &&
            renderTable &&
            renderTable(filteredData, ctx)}
          {!loading &&
            !error &&
            charts &&
            charts.length > 0 &&
            charts.map((c, i) => (
              <div key={i} className="card p-3 mt-4">
                <h5>{c.title}</h5>
                {c.render(filteredData, ctx)}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

ReportScaffold.propTypes = {
  title: PropTypes.string.isRequired,
  generate: PropTypes.func.isRequired,
  renderTable: PropTypes.func,
  charts: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      render: PropTypes.func.isRequired,
    })
  ),
  buildExcelSheets: PropTypes.func,
  fileBase: PropTypes.string,
  includeDateRange: PropTypes.bool,
  includeDoctors: PropTypes.bool,
  getDoctorsFn: PropTypes.func,
};
