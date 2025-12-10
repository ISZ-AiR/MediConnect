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
  const [reservations, setReservations] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pobieranie wizyt dla lekarza/pielęgniarki
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        let visitsRes, reservationsRes;

        if (user?.role === "doctor") {
          const myDoctorRes = await apiRequest("/doctor/me");
          const myDoctor = myDoctorRes.data;
          visitsRes = await apiRequest(`/visits/detailed/doctor/${myDoctor.doctor_id}`);
          reservationsRes = await apiRequest(`/reservation/detailed/doctor/${myDoctor.doctor_id}`);
        } else if (user?.role === "nurse") {
          const myNurseRes = await apiRequest("/nurse/me");
          const myNurse = myNurseRes.data;
          visitsRes = await apiRequest(`/visits/detailed/nurse/${myNurse.nurse_id}`);
          reservationsRes = await apiRequest(`/reservation/detailed/nurse/${myNurse.nurse_id}`);
        } else {
          visitsRes = await apiRequest("/visits/detailed");
          reservationsRes = await apiRequest("/reservation/detailed");
        }

        setVisits(visitsRes.data || []);
        setReservations(reservationsRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load calendar data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  useEffect(() => {
  const loadSchedule = async () => {
    if (!user) return;

    try {
      let res;
      if (user.role === "doctor") {
        const myDoctorRes = await apiRequest("/doctor/me");
        const myDoctor = myDoctorRes.data;
        res = await apiRequest(`/schedules?doctor_id=${myDoctor.doctor_id}`);
      } else if (user.role === "nurse") {
        const myNurseRes = await apiRequest("/nurse/me");
        // jeśli nurse ma też schedule
        res = await apiRequest(`/schedules?nurse_id=${myNurseRes.nurse_id}`);
      }

      setSchedule(res?.data || []);
    } catch (err) {
      console.error("Failed to load schedule", err);
    }
  };

  loadSchedule();
}, [user]);



const visitEvents = visits.map(v => {
  const start = new Date(`${v.visit_date}T${v.visit_time}`);
  const end = new Date(start.getTime() + 15 * 60 * 1000);
  return {
    title: `${v.patient.first_name} ${v.patient.last_name} (Visit)`,
    start,
    end,
    url: `/${user.role}/visits/${v.visit_id}`,
    color: "green"
  };
});

const reservationEvents = reservations
  .filter(r => !visits.some(v => v.reservation.reservation_id === r.reservation_id))
  .map(r => {
    const start = new Date(r.reservation_time);
    const end = new Date(start.getTime() + 15 * 60 * 1000);
    return {
      title: `${r.patient.first_name} ${r.patient.last_name} (Reservation)`,
      start,
      end,
      url: null,
      color: "blue",
      editable: false,
      classNames: ['reservation-event']
    };
  });

const events = [...visitEvents, ...reservationEvents];

const businessHours = user?.role === "doctor" ? schedule.map(s => ({
  daysOfWeek: [new Date(s.schedule_date).getDay()],
  startTime: s.start_time,
  endTime: s.end_time,
  display: 'background',
  className: 'doctor-schedule'
})) : [];

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
            initialView="timeGridDay" // można ustawić default
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridDay,timeGridWeek,listWeek"
            }}
            hiddenDays={[0, 6]}
            events={events}
            themeSystem="bootstrap"
            height="auto"
            businessHours={businessHours}
            slotMinTime="06:00"
            slotMaxTime="22:00"
            slotDuration="00:10:00"
            eventClick={(info) => {
              info.jsEvent.preventDefault();
              if (!info.event.url) return;
              navigate(info.event.url);
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            eventContent={(arg) => (
              <div style={{
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                fontSize: '0.85rem',
                lineHeight: '1.1'
              }}>
                {arg.timeText && <strong>{arg.timeText} - </strong>}
                <span>{arg.event.title}</span>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default VisitsCalendar;
