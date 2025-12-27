import React from "react";
import { statsService } from "../../services/statsService";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";
import ReportScaffold from "../../components/ReportScaffold";

const ReservationsSummary = () => {
  const generate = async ({ startDate, endDate }) =>
    await statsService.getReservationsSummary(startDate, endDate);

  const renderTable = (rows) => (
    <div className="card border-0 shadow-sm overflow-hidden mb-4">
      <div className="card-header bg-white py-3 border-0">
        <h5 className="mb-0 fw-bold"><i className="bi bi-table me-2 text-success"></i>Data Details</h5>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light text-uppercase small fw-bold text-muted">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="py-3">Total</th>
              <th className="py-3 text-danger">Cancelled</th>
              <th className="px-4 py-3 text-end text-success">Completed</th>
            </tr>
          </thead>
          <tbody>
            {rows?.filter(d => d.total_reservations > 0).map((day) => (
              <tr key={day.date}>
                <td className="px-4 fw-bold">{day.date}</td>
                <td><span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">{day.total_reservations}</span></td>
                <td className="text-danger">{day.cancelled_reservations}</td>
                <td className="px-4 text-end text-success fw-bold">{day.completed_visits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const charts = [
    {
      title: "Activity Visualization",
      render: (rows) => (
        <div className="p-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'}} />
              <Legend />
              <Bar dataKey="total_reservations" name="Total" fill="#0d6efd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled_reservations" name="Cancelled" fill="#dc3545" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed_visits" name="Completed" fill="#198754" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    }
  ];

  return (
    <ReportScaffold
      title="Reservations Summary"
      generate={generate}
      renderTable={renderTable}
      charts={charts}
      buildExcelSheets={(all) => [{ name: "Summary", rows: all }]}
      fileBase="reservations_report"
    />
  );
};

export default ReservationsSummary;