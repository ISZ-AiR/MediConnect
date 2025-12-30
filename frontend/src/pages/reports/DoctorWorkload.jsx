import React from "react";
import { statsService } from "../../services/statsService";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";
import ReportScaffold from "../../components/ReportScaffold";

const DoctorWorkload = () => {
  const generate = async ({ startDate, endDate }) =>
    await statsService.getDoctorWorkload(startDate, endDate);

  const renderTable = (rows) => (
    <div className="card border-0 shadow-sm overflow-hidden mb-4">
      <div className="card-header py-3 border-0">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-briefcase me-2 text-primary"></i>
          Workload Statistics by Staff
        </h5>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-uppercase small fw-bold">
            <tr>
              <th className="px-4 py-3 border-0">Doctor Name</th>
              <th className="py-3 border-0 text-center">Total Reservations</th>
              <th className="px-4 py-3 border-0 text-end">Completed Visits</th>
            </tr>
          </thead>
          <tbody className="border-top-0">
            {rows.map((d) => {
              const totalRes = d.daily.reduce((sum, day) => sum + (day.reservations || 0), 0);
              const totalVis = d.daily.reduce((sum, day) => sum + (day.visits || 0), 0);
              return (
                <tr key={d.doctor_id}>
                  <td className="px-4 py-3">
                    <div className="fw-bold">{d.first_name} {d.last_name}</div>
                    <div className="small opacity-75">ID: #{d.doctor_id}</div>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-medium">
                      {totalRes}
                    </span>
                  </td>
                  <td className="px-4 text-end">
                    <span className="text-success fw-bold fs-6">{totalVis}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const charts = [
    {
      title: "Clinic-wide Activity (Daily)",
      render: (filtered) => {
        const dateMap = {};
        filtered.forEach((doc) => {
          doc.daily.forEach((day) => {
            if (!dateMap[day.date])
              dateMap[day.date] = { date: day.date, res: 0, vis: 0 };
            dateMap[day.date].res += day.reservations;
            dateMap[day.date].vis += day.visits;
          });
        });
        const chartData = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));

        return (
          <div className="card border-0 shadow-sm p-4 bg-white mb-4">
            <h6 className="fw-bold mb-4 text-muted text-uppercase small">Daily Reservations vs Completions</h6>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="res" name="Reservations" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vis" name="Completed" fill="#198754" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      },
    },
    {
      title: "Performance by Doctor",
      render: (filtered) => {
        const doctorChartData = filtered.map((d) => ({
          name: d.last_name,
          res: d.daily.reduce((sum, day) => sum + (day.reservations || 0), 0),
          vis: d.daily.reduce((sum, day) => sum + (day.visits || 0), 0),
        }));

        return (
          <div className="card border-0 shadow-sm p-4 bg-white">
            <h6 className="fw-bold mb-4 text-muted text-uppercase small">Doctor Comparison (Total)</h6>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={doctorChartData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" />
                <Bar dataKey="res" name="Reservations" fill="#0d6efd" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="vis" name="Completed" fill="#198754" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      },
    },
  ];

  const buildExcelSheets = (all, { selectedDoctors }) => {
    const filtered = selectedDoctors.length ? all.filter(d => selectedDoctors.includes(d.doctor_id)) : all;
    return [{
      name: "Doctor Workload",
      rows: filtered.map(d => ({
        Doctor: `${d.first_name} ${d.last_name}`,
        Reservations: d.daily.reduce((sum, day) => sum + (day.reservations || 0), 0),
        Completed_Visits: d.daily.reduce((sum, day) => sum + (day.visits || 0), 0),
      }))
    }];
  };

  return (
    <ReportScaffold
      title="Doctor Workload Report"
      generate={generate}
      renderTable={renderTable}
      charts={charts}
      buildExcelSheets={buildExcelSheets}
      fileBase="doctor_workload"
      includeDateRange
      includeDoctors
      getDoctorsFn={statsService.getDoctors}
    />
  );
};

export default DoctorWorkload;