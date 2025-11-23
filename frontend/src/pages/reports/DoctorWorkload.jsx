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

const DoctorWorkload = () => {
  const generate = async ({ startDate, endDate }) =>
    await statsService.getDoctorWorkload(startDate, endDate);

  const renderTable = (rows) => (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Doctor</th>
          <th>Reservations</th>
          <th>Completed Visits</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((d) => {
          const totalReservations = d.daily.reduce(
            (sum, day) => sum + (day.reservations || 0),
            0
          );
          const totalVisits = d.daily.reduce(
            (sum, day) => sum + (day.visits || 0),
            0
          );
          return (
            <tr key={d.doctor_id}>
              <td>
                {d.doctor_id} - {d.first_name} {d.last_name}
              </td>
              <td>{totalReservations}</td>
              <td>{totalVisits}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const charts = [
    {
      title: "Reservations vs Completed Visits (Daily)",
      render: (filtered) => {
        const dateMap = {};
        filtered.forEach((doc) => {
          doc.daily.forEach((day) => {
            if (!dateMap[day.date])
              dateMap[day.date] = {
                date: day.date,
                reservations: 0,
                visits: 0,
              };
            dateMap[day.date].reservations += day.reservations;
            dateMap[day.date].visits += day.visits;
          });
        });
        const chartData = Object.values(dateMap).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reservations" fill="#8884d8" name="Reservations" />
              <Bar dataKey="visits" fill="#82ca9d" name="Completed Visits" />
            </BarChart>
          </ResponsiveContainer>
        );
      },
    },
    {
      title: "Reservations vs Completed Visits per Doctor",
      render: (filtered) => {
        const doctorChartData = filtered.map((d) => {
          const totalReservations = d.daily.reduce(
            (sum, day) => sum + (day.reservations || 0),
            0
          );
          const totalVisits = d.daily.reduce(
            (sum, day) => sum + (day.visits || 0),
            0
          );
          return {
            doctor: `${d.first_name} ${d.last_name}`,
            reservations: totalReservations,
            visits: totalVisits,
          };
        });
        return (
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
              <Bar dataKey="reservations" fill="#8884d8" name="Reservations" />
              <Bar dataKey="visits" fill="#82ca9d" name="Completed Visits" />
            </BarChart>
          </ResponsiveContainer>
        );
      },
    },
  ];

  const buildExcelSheets = (all, { selectedDoctors }) => {
    const filtered = selectedDoctors.length
      ? all.filter((d) => selectedDoctors.includes(d.doctor_id))
      : all;
    const rows = filtered.map((d) => ({
      Doctor: `${d.first_name} ${d.last_name}`,
      Reservations: d.daily.reduce(
        (sum, day) => sum + (day.reservations || 0),
        0
      ),
      Completed_Visits: d.daily.reduce(
        (sum, day) => sum + (day.visits || 0),
        0
      ),
    }));
    return [{ name: "Doctor Workload", rows }];
  };

  return (
    <ReportScaffold
      title="Doctor Workload Report"
      generate={generate}
      renderTable={renderTable}
      charts={charts}
      buildExcelSheets={buildExcelSheets}
      fileBase="doctor_workload_report"
      includeDateRange
      includeDoctors
      getDoctorsFn={statsService.getDoctors}
    />
  );
};

export default DoctorWorkload;
