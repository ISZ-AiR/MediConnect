import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import '../styles/calendar.css';
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

const VisitsCalendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pobieranie wizyt dla lekarza/pielęgniarki
  useEffect(() => {
    const loadVisits = async () => {
      try {
        setLoading(true);
        let visitsRes;

        if (user?.role === "doctor") {
          const myDoctorRes = await apiRequest("/doctor/me");
          const myDoctor = myDoctorRes.data;
          visitsRes = await apiRequest(`/visits/detailed/doctor/${myDoctor.doctor_id}`);
        } else if (user?.role === "nurse") {
          const myNurseRes = await apiRequest("/nurse/me");
          const myNurse = myNurseRes.data;
          visitsRes = await apiRequest(`/visits/detailed/nurse/${myNurse.nurse_id}`);
        } else {
          visitsRes = await apiRequest("/visits/detailed");
        }

        setVisits(visitsRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load visits");
      } finally {
        setLoading(false);
      }
    };

    loadVisits();
  }, [user]);

  // Przygotowanie wydarzeń do FullCalendar
  const events = visits.map(v => ({
    title: `${v.patient.first_name} ${v.patient.last_name}`,
    start: v.visit_date + "T" + (v.visit_time || "09:00"),
    end: v.visit_date + "T" + (v.visit_time_end || "09:30"),
    url: `/${user.role}/visits/${v.visit_id}`
  }));

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning"></div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-5">
        <div className="card shadow-sm border-0 p-4 mb-4">
          <div className="text-center mb-4">
            <i className="bi bi-calendar-week text-warning" style={{ fontSize: "3rem" }}></i>
            <h2 className="fw-bold mt-2 mb-2">{user?.role === "doctor" ? "My Calendar" : "Visits Calendar"}</h2>
            <p className="text-muted">{user?.role === "doctor" ? "Your scheduled visits" : "View all visits"}</p>
          </div>

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridDay,timeGridWeek,listWeek"
            }}
            events={events}
            themeSystem="bootstrap"
            height="auto"
            eventClick={(info) => {
              info.jsEvent.preventDefault(); // nie otwieraj nowej karty
              navigate(info.event.url);
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VisitsCalendar;
