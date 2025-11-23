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

const DoctorAvailabilityReport = () => {
  // Data generation merges availability & workload
  const generate = async ({ startDate, endDate }) => {
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
    return availabilityData.map((doctor) => {
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
  };

  const renderTable = (rows) => (
    <table className="table table-striped mb-4">
      <thead>
        <tr>
          <th>Doctor</th>
          <th>Specialization</th>
          <th>Total Days</th>
          <th>Total Hours</th>
          <th>Reserved Hours</th>
          <th>Free Hours</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((d) => (
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
  );

  const charts = [
    {
      title: "Total Available Hours per Day",
      render: (filtered) => {
        const dateAggregated = (() => {
          const map = {};
          filtered.forEach((doc) => {
            if (Array.isArray(doc.slots)) {
              doc.slots.forEach((s) => {
                if (!map[s.date])
                  map[s.date] = { date: s.date, reserved: 0, free: 0 };
                map[s.date].reserved += s.reservedHours || 0;
                map[s.date].free += s.freeHours || 0;
              });
            }
          });
          return Object.values(map).sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
        })();
        return (
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
        );
      },
    },
    {
      title: "Total Available Hours per Doctor",
      render: (filtered) => {
        const doctorChartData = filtered.map((d) => ({
          doctor: `${d.first_name} ${d.last_name}`,
          reserved: d.reserved_hours,
          free: d.free_hours,
        }));
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
        );
      },
    },
  ];

  const buildExcelSheets = (all, { selectedDoctors }) => {
    const filtered = selectedDoctors.length
      ? all.filter((d) => selectedDoctors.includes(d.doctor_id))
      : all;
    const summaryRows = filtered.map((d) => ({
      Doctor: `${d.first_name} ${d.last_name}`,
      Specialization: d.specialization || "",
      Total_Days: d.total_days || 0,
      Total_Hours: d.total_hours || 0,
      Reserved_Hours: d.reserved_hours || 0,
      Free_Hours: d.free_hours || 0,
    }));
    const slotsRows = [];
    filtered.forEach((d) => {
      (d.slots || []).forEach((s) => {
        slotsRows.push({
          Doctor: `${d.first_name} ${d.last_name}`,
          Date: s.date,
          Start: s.start_time,
          End: s.end_time,
          Hours: s.hours,
          Reserved_Hours: s.reservedHours || 0,
          Free_Hours: s.freeHours || 0,
          Available: s.is_available ? "Yes" : "No",
        });
      });
    });
    const sheets = [{ name: "Summary", rows: summaryRows }];
    if (slotsRows.length) sheets.push({ name: "Slots", rows: slotsRows });
    return sheets;
  };

  return (
    <ReportScaffold
      title="Doctor Availability Report"
      generate={generate}
      renderTable={renderTable}
      charts={charts}
      buildExcelSheets={buildExcelSheets}
      fileBase="doctor_availability_report"
      includeDateRange
      includeDoctors
      getDoctorsFn={statsService.getDoctors}
    />
  );
};

export default DoctorAvailabilityReport;
