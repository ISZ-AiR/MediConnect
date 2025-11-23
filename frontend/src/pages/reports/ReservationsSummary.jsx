import React, { useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import { statsService } from "../../services/statsService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ReservationsSummary = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportRef = useRef();

  const fetchReport = async () => {
    if (!startDate || !endDate) return alert("Select start and end date");
    setLoading(true);
    try {
      const report = await statsService.getReservationsSummary(
        startDate,
        endDate
      );
      setData(report);
    } catch (err) {
      console.error(err);
      alert("Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  const exportReportPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 40;
    const headerHeight = 60;

    const availableWidth = pageWidth - 2 * margin;
    const scaleFactor = availableWidth / canvas.width;
    const imgWidth = canvas.width * scaleFactor;
    const imgHeight = canvas.height * scaleFactor;

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Reservations Summary Report", margin, margin);

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    const dateRangeText = `From: ${startDate || "-"} || To: ${endDate || "-"}`;
    pdf.text(dateRangeText, margin, margin + 20);

    pdf.setFontSize(16);
    pdf.setTextColor("#0d6efd");
    pdf.setFont("helvetica", "bold");
    pdf.text("MediConnect", pageWidth - margin, margin, { align: "right" });

    pdf.addImage(
      imgData,
      "PNG",
      margin,
      margin + headerHeight,
      imgWidth,
      imgHeight
    );

    pdf.save("reservations_summary_report.pdf");
  };

  const exportReportExcel = () => {
    if (!data) return alert("No data to export");

    const excelData = [
      {
        "Total Reservations": data.total_reservations,
        "Cancelled Reservations": data.cancelled_reservations,
        "Completed Visits": data.completed_visits,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservations Summary");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "reservations_summary.xlsx"
    );
  };

  const chartData =
    data?.map((day) => ({
      name: day.date,
      total: day.total_reservations,
      cancelled: day.cancelled_reservations,
      completed: day.completed_visits,
    })) || [];

  console.log(data);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="display-5 fw-bold">Reservations Summary Report</h1>
          </div>
        </div>

        {/* FILTERS */}
        <div className="card mb-4 p-4">
          <h5 className="mb-3">Select Filters</h5>
          <div className="row g-3 align-items-end">
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

            <div className="col-md-4 d-flex gap-2">
              <button className="btn btn-primary" onClick={fetchReport}>
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
                    <button className="dropdown-item" onClick={exportReportPDF}>
                      PDF
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={exportReportExcel}
                    >
                      Excel
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div ref={reportRef}>
          {loading ? (
            <p>Loading...</p>
          ) : !data ? (
            <p>No data</p>
          ) : (
            <>
              <table className="table table-striped mb-4">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Reservations</th>
                    <th>Cancelled</th>
                    <th>Completed Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.length ? (
                    data
                      .filter((day) => day.total_reservations > 0)
                      .map((day) => (
                        <tr key={day.date}>
                          <td>{day.date}</td>
                          <td>{day.total_reservations}</td>
                          <td>{day.cancelled_reservations}</td>
                          <td>{day.completed_visits}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={4}>No data</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="card p-3">
                <h5>Reservations Overview</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" />
                    <Bar dataKey="cancelled" fill="#ff4d4f" />
                    <Bar dataKey="completed" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationsSummary;
