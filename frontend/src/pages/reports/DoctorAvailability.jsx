import React, { useState, useEffect, useRef } from "react";
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

const DoctorAvailabilityReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [doctorsList, setDoctorsList] = useState([]); // optional: fetch all doctors for dropdown
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [data, setData] = useState([]); // array of doctor availability objects from backend
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef();
  const reportRef = useRef();

  useEffect(() => {
    // fetch doctors for multi-select dropdown (if you have such endpoint)
    const fetchDoctors = async () => {
      try {
        const doctors = await statsService.getDoctors(); // change if different
        setDoctorsList(Array.isArray(doctors) ? doctors : []);
      } catch (err) {
        console.error("Error fetching doctors list:", err);
        setDoctorsList([]);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchReport = async () => {
    if (!startDate || !endDate) return alert("Select start and end date");
    setLoading(true);

    try {
      const [availabilityDataRaw, workloadDataRaw] = await Promise.all([
        statsService.getDoctorAvailability(startDate, endDate),
        statsService.getDoctorWorkload(startDate, endDate),
      ]);

      const availabilityData = Array.isArray(availabilityDataRaw)
        ? availabilityDataRaw
        : availabilityDataRaw.data || [];
      const workloadData = Array.isArray(workloadDataRaw)
        ? workloadDataRaw
        : workloadDataRaw.data || [];

      const workloadMap = {};
      workloadData.forEach((doctor) => {
        workloadMap[doctor.doctor_id] = doctor.daily;
      });

      const combinedData = availabilityData.map((doctor) => {
        const dailyData = doctor.slots.map((slot) => {
          const dayWorkload = workloadMap[doctor.doctor_id]?.find(
            (d) => d.date === slot.date
          ) || { reservations: 0, visits: 0 };
          const reservedHours = (dayWorkload.reservations || 0) * 0.25;
          const freeHours = slot.hours - reservedHours;

          return {
            ...slot,
            reservations: dayWorkload.reservations,
            visits: dayWorkload.visits,
            reservedHours,
            freeHours,
          };
        });

        const totalHours = dailyData.reduce((sum, day) => sum + day.hours, 0);
        const totalReservedHours = dailyData.reduce(
          (sum, day) => sum + day.reservedHours,
          0
        );
        const totalFreeHours = totalHours - totalReservedHours;

        return {
          ...doctor,
          doctor_name: `${doctor.first_name} ${doctor.last_name}`,
          total_hours: totalHours,
          reserved_hours: totalReservedHours,
          free_hours: totalFreeHours,
          slots: dailyData,
        };
      });

      setData(combinedData);
    } catch (err) {
      console.error(err);
      alert("Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorCheckbox = (doctor_id) => {
    setSelectedDoctors((prev) =>
      prev.includes(doctor_id)
        ? prev.filter((id) => id !== doctor_id)
        : [...prev, doctor_id]
    );
  };

  const toggleAllDoctors = () => {
    if (selectedDoctors.length === doctorsList.length) {
      setSelectedDoctors([]);
    } else {
      setSelectedDoctors(doctorsList.map((d) => d.doctor_id));
    }
  };

  const filteredData =
    selectedDoctors.length === 0
      ? data
      : data.filter((d) => selectedDoctors.includes(d.doctor_id));

  const tableData = data.map((doctor) => ({
    doctor_id: doctor.doctor_id,
    doctor_name: doctor.doctor_name,
    specialization: doctor.specialization,
    total_days: doctor.total_days,
    total_hours: doctor.total_hours,
    reserved_hours: doctor.reserved_hours,
    free_hours: doctor.free_hours,
    slots: doctor.slots,
  }));

  // Chart data per doctor (total hours)
  const doctorChartData = filteredData.map((d) => ({
    doctor: `${d.first_name} ${d.last_name}`,
    reserved: d.reserved_hours,
    free: d.free_hours,
  }));

  // Date-aggregated chart: total available hours per date across selected doctors
  const dateAggregated = (() => {
    const map = {};
    filteredData.forEach((doc) => {
      if (Array.isArray(doc.slots)) {
        doc.slots.forEach((s) => {
          const date = s.date;
          if (!map[date]) map[date] = { date, reserved: 0, free: 0 };
          map[date].reserved += s.reservedHours || 0;
          map[date].free += s.freeHours || 0;
        });
      }
    });
    return Object.values(map).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  })();

  // Export to Excel: summary + optional sheet with slots
  const exportReportExcel = () => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    // Summary sheet
    const summaryRows = filteredData.map((d) => ({
      Doctor: `${d.first_name} ${d.last_name}`,
      Specialization: d.specialization || "",
      Total_Days: d.total_days || 0,
      Total_Hours: d.total_hours || 0,
    }));

    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Slots sheet (flattened)
    const slotsRows = [];
    filteredData.forEach((d) => {
      if (Array.isArray(d.slots)) {
        d.slots.forEach((s) => {
          slotsRows.push({
            Doctor: `${d.first_name} ${d.last_name}`,
            Date: s.date,
            Start: s.start_time,
            End: s.end_time,
            Hours: s.hours,
            Available: s.is_available ? "Yes" : "No",
            Location: s.location || "",
          });
        });
      }
    });

    if (slotsRows.length > 0) {
      const wsSlots = XLSX.utils.json_to_sheet(slotsRows);
      XLSX.utils.book_append_sheet(wb, wsSlots, "Slots");
    }

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "doctor_availability.xlsx"
    );
  };

  // Export PDF: render #reportRef with header, margins, logo placeholder, scale and compression
  const exportReportPDF = async () => {
    if (!reportRef.current) return alert("No report to export");

    // Create canvas of report
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
    });
    // use JPEG to reduce size
    const imgData = canvas.toDataURL("image/jpeg", 0.8);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const headerHeight = 60;

    // Header: left = title + date range, right = MediConnect (text)
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Doctor Availability Report", margin, margin + 10);

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const dateRangeText = `From: ${startDate || "-"}  To: ${endDate || "-"}`;
    pdf.text(dateRangeText, margin, margin + 30);

    pdf.setFontSize(12);
    pdf.setTextColor("#0d6efd");
    pdf.setFont("helvetica", "bold");
    pdf.text("MediConnect", pageWidth - margin, margin + 10, {
      align: "right",
    });

    // Calculate scaled image size into available width
    const availableWidth = pageWidth - margin * 2;
    const scaleFactor = availableWidth / canvas.width;
    const imgWidth = canvas.width * scaleFactor;
    const imgHeight = canvas.height * scaleFactor;

    // If content longer than one page, split vertically
    let remainingHeight = imgHeight;
    let positionY = margin + headerHeight;
    let sourceY = 0;
    const pxPerPt = canvas.height / imgHeight; // ratio to map back to canvas pixels

    while (remainingHeight > 0) {
      const sliceHeightPt = Math.min(
        remainingHeight,
        pageHeight - positionY - margin
      );
      // create temporary canvas slice
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.round(sliceHeightPt * pxPerPt);
      const ctx = sliceCanvas.getContext("2d");
      ctx.drawImage(
        canvas,
        0,
        Math.round(sourceY * pxPerPt * (1 / pxPerPt)),
        sliceCanvas.width,
        sliceCanvas.height,
        0,
        0,
        sliceCanvas.width,
        sliceCanvas.height
      );
      const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.8);

      pdf.addImage(
        sliceData,
        "JPEG",
        margin,
        positionY,
        availableWidth,
        sliceHeightPt
      );

      remainingHeight -= sliceHeightPt;
      sourceY += sliceHeightPt;
      if (remainingHeight > 0) {
        pdf.addPage();
        // repeat header on next page
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Doctor Availability Report", margin, margin + 10);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text(dateRangeText, margin, margin + 30);
        pdf.setFontSize(12);
        pdf.setTextColor("#0d6efd");
        pdf.setFont("helvetica", "bold");
        pdf.text("MediConnect", pageWidth - margin, margin + 10, {
          align: "right",
        });
        positionY = margin + headerHeight;
      }
    }

    pdf.save("doctor_availability_report.pdf");
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="display-5 fw-bold">Doctor Availability Report</h1>
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
                        checked={selectedDoctors.length === doctorsList.length}
                        onChange={toggleAllDoctors}
                      />
                      <label className="form-check-label" htmlFor="select-all">
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
                            onChange={() => handleDoctorCheckbox(doc.doctor_id)}
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

        {/* Report area to capture */}
        <div ref={reportRef}>
          {/* TABLE */}
          {loading ? (
            <p>Loading...</p>
          ) : tableData.length === 0 ? (
            <p>No data</p>
          ) : (
            <>
              <table className="table table-striped mb-4">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Total Days</th>
                    <th>Total Hours</th>
                    <th>Reserved Hours</th>
                    <th>Free hours</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((d) => (
                    <tr key={d.doctor_id}>
                      <td>{d.doctor_name}</td>
                      <td>{d.specialization}</td>
                      <td>{d.total_days}</td>
                      <td>{d.total_hours}</td>
                      <td>{d.reserved_hours}</td>
                      <td>{d.free_hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Charts */}
              <div className="card p-3 mt-4">
                <h5>Total Available Hours per Day</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={dateAggregated}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="reserved"
                      stackId="a"
                      fill="#ff6961"
                      name="Reserved Hours"
                    />
                    <Bar
                      dataKey="free"
                      stackId="a"
                      fill="#82ca9d"
                      name="Free Hours"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-3 mt-4">
                <h5>Total Available Hours per Doctor</h5>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={doctorChartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="doctor" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="reserved"
                      stackId="a"
                      fill="#ff6961"
                      name="Reserved Hours"
                    />
                    <Bar
                      dataKey="free"
                      stackId="a"
                      fill="#82ca9d"
                      name="Free Hours"
                    />
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

export default DoctorAvailabilityReport;
