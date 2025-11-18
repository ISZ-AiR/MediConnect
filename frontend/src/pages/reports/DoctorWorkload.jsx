import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import { statsService } from "../../services/statsService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const DoctorWorkload = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "doctor_id", direction: "asc" });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef();

  const reportRef = useRef();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctors = await statsService.getDoctors();
        setDoctorsList(Array.isArray(doctors) ? doctors : []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setDoctorsList([]);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
      const reportData = await statsService.getDoctorWorkload(startDate, endDate);
      setData(reportData);
    } catch (err) {
      console.error(err);
      alert("Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorCheckbox = (doctor_id) => {
    setSelectedDoctors(prev =>
      prev.includes(doctor_id)
        ? prev.filter(id => id !== doctor_id)
        : [...prev, doctor_id]
    );
  };

  const toggleAllDoctors = () => {
    if (selectedDoctors.length === doctorsList.length) {
      setSelectedDoctors([]);
    } else {
      setSelectedDoctors(doctorsList.map(doc => doc.doctor_id));
    }
  };

  const sortedData = [...data]
    .filter(d => selectedDoctors.length === 0 || selectedDoctors.includes(d.doctor_id))
    .sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

const doctorChartData = sortedData.map(d => {
  const totalReservations = d.daily.reduce((sum, day) => sum + (day.reservations || 0), 0);
  const totalVisits = d.daily.reduce((sum, day) => sum + (day.visits || 0), 0);

  return {
    doctor: `${d.first_name} ${d.last_name}`,
    reservations: totalReservations,
    visits: totalVisits
  };
});


const exportReportPDF = async () => {
  if (!reportRef.current) return;

  const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4"
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

  pdf.addImage(imgData, "PNG", margin, margin + headerHeight, imgWidth, imgHeight);

  pdf.save("reservations_summary_report.pdf");
};

const exportReportExcel = () => {
  if (!sortedData || sortedData.length === 0) {
    alert("No data to export");
    return;
  }

  const excelData = sortedData.map(d => ({
    Doctor: `${d.first_name} ${d.last_name}`,
    Reservations: d.daily.reduce((sum, day) => sum + (day.reservations || 0), 0),
    Completed_Visits: d.daily.reduce((sum, day) => sum + (day.visits || 0), 0),
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Doctor Workload");

  // Generujemy plik Excel
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "doctor_workload.xlsx");
};


  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

        <div className="container py-5">
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="display-5 fw-bold">Doctor Workload Report</h1>
                </div>
            </div>

            {/* FILTERS */}
            <div className="card mb-4 p-4">
                <h5 className="mb-3">Select Filters</h5>
                <div className="row g-3 align-items-end">
                    <div className="col-md-2">
                        <label className="form-label">Start Date</label>
                        <input type="date" className="form-control" value={startDate}
                               onChange={e => setStartDate(e.target.value)}/>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label">End Date</label>
                        <input type="date" className="form-control" value={endDate}
                               onChange={e => setEndDate(e.target.value)}/>
                    </div>

                    <div className="col-md-4" ref={dropdownRef}>
                        <label className="form-label">Doctors</label>
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-secondary w-100 text-start"
                                type="button"
                                onClick={() => setDropdownOpen(prev => !prev)}
                            >
                                {selectedDoctors.length === 0 || selectedDoctors.length === doctorsList.length
                                    ? "All"
                                    : `${selectedDoctors.length} selected`}
                            </button>
                            {dropdownOpen && (
                                <div className="dropdown-menu show p-3" style={{maxHeight: "200px", overflowY: "auto"}}>
                                    {doctorsList.length === 0 ? (
                                        <div>Loading doctors...</div>
                                    ) : (
                                        <>
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
                                            {doctorsList.map(doc => (
                                                <div key={doc.doctor_id} className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`doc-${doc.doctor_id}`}
                                                        checked={selectedDoctors.includes(doc.doctor_id)}
                                                        onChange={() => handleDoctorCheckbox(doc.doctor_id)}
                                                    />
                                                    <label className="form-check-label"
                                                           htmlFor={`doc-${doc.doctor_id}`}>
                                                        {doc.doctor_id} - {doc.first_name} {doc.last_name}
                                                    </label>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="col-md-4 d-flex gap-2">
                        <button className="btn btn-primary" onClick={fetchReport}>Generate</button>
                        <div className="dropdown">
                            <button className="btn btn-secondary dropdown-toggle" type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false">
                                Export
                            </button>
                            <ul className="dropdown-menu">
                                <li>
                                    <button className="dropdown-item" onClick={exportReportPDF}>PDF</button>
                                </li>
                                <li>
                                    <button className="dropdown-item" onClick={exportReportExcel}>Excel</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div ref={reportRef}>
                {/* TABLE */}
                {loading ? (
                    <p>Loading...</p>
                ) : sortedData.length === 0 ? (
                    <p>No data</p>
                ) : (
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th onClick={() => requestSort("doctor_id")} style={{cursor: "pointer"}}>Doctor</th>
                            <th>Reservations</th>
                            <th>Completed Visits</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedData.map(d => {
                            const totalReservations = d.daily.reduce((sum, day) => sum + day.reservations, 0);
                            const totalVisits = d.daily.reduce((sum, day) => sum + day.visits, 0);

                            return (
                                <tr key={d.doctor_id}>
                                    <td>{d.doctor_id} - {d.first_name} {d.last_name}</td>
                                    <td>{totalReservations}</td>
                                    <td>{totalVisits}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}

                {/* CHART */}
                {data.length > 0 && (
                    <div className="card p-3 mt-4">
                        <h5>Reservations vs Completed Visits</h5>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={
                                    // sumujemy wszystkie doctors' daily w jeden obiekt po dacie
                                    (() => {
                                        const dateMap = {};
                                        sortedData.forEach(doc => {
                                            doc.daily.forEach(day => {
                                                if (!dateMap[day.date]) dateMap[day.date] = {
                                                    date: day.date,
                                                    reservations: 0,
                                                    visits: 0
                                                };
                                                dateMap[day.date].reservations += day.reservations;
                                                dateMap[day.date].visits += day.visits;
                                            });
                                        });
                                        return Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
                                    })()
                                }
                                margin={{top: 20, right: 30, left: 0, bottom: 5}}
                            >
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="date"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Bar dataKey="reservations" fill="#8884d8" name="Reservations"/>
                                <Bar dataKey="visits" fill="#82ca9d" name="Completed Visits"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
                {data.length > 0 && (
                    <div className="card p-3 mt-4">
                        <h5>Reservations vs Completed Visits per Doctor</h5>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={doctorChartData}
                                margin={{top: 20, right: 30, left: 0, bottom: 5}}
                            >
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="doctor"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Bar dataKey="reservations" fill="#8884d8" name="Reservations"/>
                                <Bar dataKey="visits" fill="#82ca9d" name="Completed Visits"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
        </div>
        );
        };

        export default DoctorWorkload;
