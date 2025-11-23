import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useParams, useNavigate } from "react-router-dom";

const PatientRecordsDetail = () => {
const { id } = useParams(); // visit_id
const navigate = useNavigate();

const [record, setRecord] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
const loadRecord = async () => {
try {
setLoading(true);
const res = await apiRequest(`/visits/${id}`);
if (res.success) {
setRecord(res.data);
} else {
setRecord(null);
setError("Record not found");
}
} catch (err) {
console.error(err);
setError("Failed to load record");
} finally {
setLoading(false);
}
};
loadRecord();
}, [id]);

if (loading) return <div className="min-vh-100"><Navbar /><div className="container py-5">Loading...</div></div>;
if (error) return <div className="min-vh-100"><Navbar /><div className="container py-5"><div className="alert alert-danger">{error}</div></div></div>;
if (!record) return <div className="min-vh-100"><Navbar /><div className="container py-5">Record not found</div></div>;

return ( <div className="min-vh-100 bg-light"> <Navbar /> <div className="container py-5"> <div className="row justify-content-center"> <div className="col-md-9 col-lg-8"> <div className="card shadow-sm border-0"> <div className="card-body p-5"> <h2 className="fw-bold mb-3">Visit Details</h2>


            <div className="mb-3"><strong>Visit ID:</strong> {record.visit_id}</div>
            <div className="mb-3"><strong>Reservation ID:</strong> {record.reservation?.reservation_id}</div>
            <div className="mb-3"><strong>Doctor:</strong> {record.reservation?.doctor_name || record.reservation?.doctor_id}</div>
            <div className="mb-3"><strong>Visit Date:</strong> {new Date(record.visit_date).toLocaleDateString()}</div>
            <div className="mb-3"><strong>Nurse ID:</strong> {record.nurse_id || "—"}</div>
            <div className="mb-3"><strong>Notes:</strong> {record.visit_note}</div>

            <div className="mt-4 d-grid gap-2">
              <button className="btn btn-outline-secondary btn-lg" onClick={() => navigate(-1)}>Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


);
};

export default PatientRecordsDetail;
