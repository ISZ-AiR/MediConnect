import React from "react";
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
import ReportScaffold from "../../components/ReportScaffold";

const ReservationsSummary = () => {
  const generate = async ({ startDate, endDate }) =>
    await statsService.getReservationsSummary(startDate, endDate);

  const renderTable = (rows) => (
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
        {rows?.length ? (
          rows
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
  );

  const charts = [
    {
      title: "Reservations Overview",
      render: (rows) => {
        const chartData = rows.map((day) => ({
          name: day.date,
          total: day.total_reservations,
          cancelled: day.cancelled_reservations,
          completed: day.completed_visits,
        }));
        return (
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
        );
      },
    },
  ];

  const buildExcelSheets = (all) => [
    {
      name: "Reservations Summary",
      rows: all.map((r) => ({
        Date: r.date,
        Total_Reservations: r.total_reservations,
        Cancelled_Reservations: r.cancelled_reservations,
        Completed_Visits: r.completed_visits,
      })),
    },
  ];

  return (
    <ReportScaffold
      title="Reservations Summary Report"
      generate={generate}
      renderTable={renderTable}
      charts={charts}
      buildExcelSheets={buildExcelSheets}
      fileBase="reservations_summary_report"
      includeDateRange
    />
  );
};

export default ReservationsSummary;
