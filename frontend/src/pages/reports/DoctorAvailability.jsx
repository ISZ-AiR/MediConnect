import React from "react";
import { statsService } from "../../services/statsService";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";
import ReportScaffold from "../../components/ReportScaffold";

const DoctorAvailabilityReport = () => {
  const generate = async ({ startDate, endDate }) => {
    const [availabilityDataRaw, workloadDataRaw] = await Promise.all([
      statsService.getDoctorAvailability(startDate, endDate),
      statsService.getDoctorWorkload(startDate, endDate),
    ]);
    const availabilityData = Array.isArray(availabilityDataRaw) ? availabilityDataRaw : availabilityDataRaw.data || [];
    const workloadData = Array.isArray(workloadDataRaw) ? workloadDataRaw : workloadDataRaw.data || [];

    const workloadMap = {};
    workloadData.forEach((doctor) => {
      workloadMap[doctor.doctor_id] = doctor.daily;
    });

    return availabilityData.map((doctor) => {
      const dailyData = (doctor.slots || []).map((slot) => {
        const dayWorkload = workloadMap[doctor.doctor_id]?.find(d => d.date === slot.date) || { reservations: 0 };
        const reservedHours = (dayWorkload.reservations || 0) * 0.25; // 15 min per visit
        return {
          ...slot,
          reservedHours,
          freeHours: Math.max(0, slot.hours - reservedHours),
        };
      });

      const totalHours = dailyData.reduce((sum, day) => sum + day.hours, 0);
      const totalReservedHours = dailyData.reduce((sum, day) => sum + day.reservedHours, 0);

      return {
        ...doctor,
        doctor_name: `${doctor.first_name} ${doctor.last_name}`,
        total_hours: totalHours,
        reserved_hours: totalReservedHours,
        free_hours: Math.max(0, totalHours - totalReservedHours),
        slots: dailyData,
      };
    });
  };

  const renderTable = (rows) => (
    <div className="card border-0 shadow-sm overflow-hidden mb-4">
      <div className="card-header py-3 border-0">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-person-check me-2 text-primary"></i>
          Staff Capacity Overview
        </h5>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-uppercase small fw-bold">
            <tr>
              <th className="px-4 py-3 border-0">Doctor</th>
              <th className="py-3 border-0 text-center">Specialization</th>
              <th className="py-3 border-0 text-center">Total Hours</th>
              <th className="py-3 border-0 text-center text-danger">Reserved</th>
              <th className="px-4 py-3 border-0 text-end text-success">Available</th>
            </tr>
          </thead>
          <tbody className="border-top-0">
            {rows.map((d) => (
              <tr key={d.doctor_id}>
                <td className="px-4 py-3">
                  <div className="fw-bold">{d.doctor_name}</div>
                  <div className="small opacity-75">{d.total_days} scheduled days</div>
                </td>
                <td className="text-center">
                  <span className="badge bg-secondary bg-opacity-10 text-secondary border-0">
                    {d.specialization}
                  </span>
                </td>
                <td className="text-center fw-bold">{d.total_hours.toFixed(1)}h</td>
                <td className="text-center text-danger">{d.reserved_hours.toFixed(1)}h</td>
                <td className="px-4 text-end">
                  <span className="text-success fw-bold">{d.free_hours.toFixed(1)}h</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const charts = [
    {
      title: "Capacity Breakdown by Date",
      render: (filtered) => {
        const dateAggregated = (() => {
          const map = {};
          filtered.forEach((doc) => {
            (doc.slots || []).forEach((s) => {
              if (!map[s.date]) map[s.date] = { date: s.date, reserved: 0, free: 0 };
              map[s.date].reserved += s.reservedHours || 0;
              map[s.date].free += s.freeHours || 0;
            });
          });
          return Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date));
        })();

        return (
          <div className="card border-0 shadow-sm p-4 bg-white mb-4">
            <h6 className="fw-bold mb-4 text-muted text-uppercase small">Total Clinic Hours (Reserved vs Free)</h6>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dateAggregated}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'}} />
                <Legend iconType="circle" />
                <Bar dataKey="reserved" stackId="a" fill="#ff6961" name="Reserved" radius={[0, 0, 0, 0]} />
                <Bar dataKey="free" stackId="a" fill="#198754" name="Free" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      },
    },
    {
      title: "Doctor Individual Utilization",
      render: (filtered) => {
        const doctorChartData = filtered.map((d) => ({
          doctor: d.last_name,
          reserved: d.reserved_hours,
          free: d.free_hours,
        }));
        return (
          <div className="card border-0 shadow-sm p-4 bg-white">
            <h6 className="fw-bold mb-4 text-muted text-uppercase small">Individual Capacity (h)</h6>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={doctorChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="doctor" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="reserved" stackId="a" fill="#ff6961" name="Reserved" radius={[0, 0, 0, 0]} />
                <Bar dataKey="free" stackId="a" fill="#198754" name="Free" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      },
    },
  ];

  const buildExcelSheets = (all, { selectedDoctors }) => {
    const filtered = selectedDoctors.length ? all.filter(d => selectedDoctors.includes(d.doctor_id)) : all;
    return [
      {
        name: "Summary",
        rows: filtered.map(d => ({
          Doctor: d.doctor_name,
          Specialization: d.specialization,
          Total_Hours: d.total_hours,
          Reserved: d.reserved_hours,
          Free: d.free_hours
        }))
      }
    ];
  };

  return (
    <ReportScaffold
      title="Doctor Availability Report"
      generate={generate}
      renderTable={renderTable}
      charts={charts}
      buildExcelSheets={buildExcelSheets}
      fileBase="doctor_availability"
      includeDateRange
      includeDoctors
      getDoctorsFn={statsService.getDoctors}
    />
  );
};

export default DoctorAvailabilityReport;