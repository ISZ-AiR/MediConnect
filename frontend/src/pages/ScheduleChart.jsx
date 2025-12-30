import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Rectangle,
} from "recharts";
import { apiRequest } from "../services/apiClient";

const CustomBar = (props) => {
  const { x, y, width, height, startHour, fill } = props;
  const newX = (startHour / 24) * width;
  return (
    <Rectangle
      x={x + newX}
      y={y}
      width={width * (props.value / 24)}
      height={height}
      fill={fill}
    />
  );
};

const ScheduleChart = () => {
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [schedulesResp, usersResp, doctorsResp] = await Promise.all([
          apiRequest("/schedules"),
          apiRequest("/users"),
          apiRequest("/doctor"),
        ]);
        setSchedules(Array.isArray(schedulesResp) ? schedulesResp : []);
        setUsers(usersResp?.data || []);
        setDoctors(doctorsResp?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getDoctorName = (doctor_id) => {
    const doc = doctors.find((d) => d.doctor_id === doctor_id);
    if (!doc) return `Doctor ${doctor_id}`;
    const user = users.find((u) => u.user_id === doc.user_id);
    return user
      ? `${user.first_name} ${user.last_name}`
      : `Doctor ${doctor_id}`;
  };

  const doctorColors = {};
  doctors.forEach((d, idx) => {
    doctorColors[d.doctor_id] = `hsl(${(idx * 50) % 360}, 70%, 50%)`;
  });

  const chartData = schedules
    .map((s) => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      if (isNaN(start) || isNaN(end)) return null;
      return {
        date: s.schedule_date,
        doctor: getDoctorName(s.doctor_id),
        startHour: start.getHours() + start.getMinutes() / 60,
        duration: (end - start) / (1000 * 60 * 60),
        color: doctorColors[s.doctor_id],
      };
    })
    .filter(Boolean);

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning"></div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div style={{ width: "100%", height: 600 }}>
      {" "}
      <ResponsiveContainer>
        <BarChart
          layout="horizontal"
          data={chartData}
          margin={{ top: 20, right: 30, left: 80, bottom: 50 }}
        >
          {" "}
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, 24]}
            tickFormatter={(v) => `${Math.floor(v)}:00`}
            label={{ value: "Hour", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            type="category"
            dataKey="date"
            width={120}
            label={{
              value: "Date",
              angle: -90,
              position: "insideLeft",
              offset: 10,
            }}
          />
          <Tooltip
            formatter={(value, name, props) => {
              const start = props.payload.startHour;
              const end = start + props.payload.duration;
              const formatHour = (h) =>
                `${Math.floor(h)}:${Math.round((h % 1) * 60)
                  .toString()
                  .padStart(2, "0")}`;
              return [
                `${formatHour(start)} - ${formatHour(end)}`,
                props.payload.doctor,
              ];
            }}
          />{" "}
          <Legend />
          {chartData.map((entry, idx) => (
            <Bar
              key={idx}
              dataKey="duration"
              fill={entry.color}
              isAnimationActive={false}
              shape={
                <CustomBar startHour={entry.startHour} fill={entry.color} />
              }
            />
          ))}{" "}
        </BarChart>{" "}
      </ResponsiveContainer>{" "}
    </div>
  );
};

export default ScheduleChart;
