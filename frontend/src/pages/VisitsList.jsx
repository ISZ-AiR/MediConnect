import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

const VisitsList = () => {
const { user } = useAuth();
const [visits, setVisits] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
const loadData = async () => {
try {
setLoading(true);

  if (user?.role === "doctor") {
    const myDoctorRes = await apiRequest("/doctor/me");
    const myDoctor = myDoctorRes.data;

    if (!myDoctor) {
      setVisits([]);
      return;
    }

    const visitsRes = await apiRequest(`/visits/detailed/doctor/${myDoctor.doctor_id}`);
    setVisits(visitsRes.data || []);
    return;
  }

  const visitsRes = await apiRequest("/visits/detailed");
  setVisits(visitsRes.data || []);

} catch (err) {
  console.error(err);
  setError("Failed to load data");
} finally {
  setLoading(false);
}
};
loadData();
}, [user]);


const rolePrefix = user?.role === "doctor" ? "/doctor" : "/receptionist";

const handleDelete = async (visit_id) => {
if (user?.role === "doctor") return;
if (!window.confirm("Delete this visit?")) return;


try {  
  await apiRequest(`/visits/${visit_id}`, { method: "DELETE" });  
  setVisits(prev => prev.filter(v => v.visit_id !== visit_id));  
} catch (err) {  
  console.error(err);  
  alert("Failed to delete visit");  
}  


};

if (loading) return ( <div className="text-center py-5"> <div className="spinner-border text-warning"></div> </div>
);

if (error) return <div className="alert alert-danger">{error}</div>;

return ( <div className="min-vh-100 bg-light"> <Navbar /> <div className="container py-5">


    <div className="card shadow-sm border-0 p-4 mb-4">  
      <div className="text-center mb-3">  
        <i className="bi bi-calendar-check text-warning" style={{ fontSize: "3rem" }}></i>  
        <h2 className="fw-bold mt-2 mb-2">{user?.role === "doctor" ? "My Visits" : "Visits"}</h2>  
        <p className="text-muted">{user?.role === "doctor" ? "Visits assigned to you" : "Manage all visits"}</p>  
      </div>  

      <div className="table-responsive">  
        <table className="table table-striped table-hover">  
          <thead>  
            <tr>  
              <th>#</th>  
              <th>Visit ID</th>  
              <th>Reservation ID</th>  
              <th>Date</th>  
              <th>Nurse</th>  
              <th>Doctor</th>  
              <th>Patient</th>  
              <th>Note</th>  
              <th>Actions</th>  
            </tr>  
          </thead>  
          <tbody>  
            {visits.map((v, idx) => (  
              <tr key={v.visit_id}>  
                <td>{idx + 1}</td>  
                <td>{v.visit_id}</td>  
                <td>{v.reservation.reservation_id}</td>  
                <td>{v.visit_date}</td>  
                <td>{v.nurse.first_name} {v.nurse.last_name}</td>  
                <td>{v.doctor.first_name} {v.doctor.last_name}</td>  
                <td>{v.patient.first_name} {v.patient.last_name}</td>  
                <td>{v.visit_note || ""}</td>  
                <td>  
                  <Link to={`${rolePrefix}/visits/${v.visit_id}`} className="btn btn-sm btn-outline-primary me-2">View</Link>  

                  <Link to={`${rolePrefix}/visits/edit/${v.visit_id}`} className="btn btn-sm btn-outline-secondary me-2">Edit</Link>  

                  {user?.role !== "doctor" && (  
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(v.visit_id)}>Delete</button>  
                  )}  
                </td>  
              </tr>  
            ))}  
          </tbody>  
        </table>  
      </div>  
    </div>  
  </div>  
</div>
);
};

export default VisitsList;
