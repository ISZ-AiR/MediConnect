import React, { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/apiClient";
import { useEditableResource } from "../hooks/useEditableResource";
import FormField from "../components/FormField";

const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

const validateBirthDate = () => {
  if (!form.birth_date) return true;

  const today = new Date();
  const birthDate = new Date(form.birth_date);

  if (birthDate > today) {
    alert("Birth date cannot be later than today");
    return false;
  }

  return true;
};

// Stabilne funkcje dla hooka
const stableLoadFn = useCallback(async (pid) => {
const [patientRes, usersRes] = await Promise.all([
apiRequest(`/patients/${pid}`),
apiRequest("/users"),
]);
const patient = patientRes.success ? patientRes.data : patientRes;
const users = usersRes?.data || [];
const user = users.find((u) => u.user_id === patient.user_id);
return { patient, user };
}, []);

const stableCreateFn = useCallback(async (payload) => {
return apiRequest("/patients/register", {
method: "POST",
body: JSON.stringify(payload),
});
}, []);

const stableUpdateFn = useCallback(async (pid, payload) => {
return apiRequest(`/patients/${pid}`, {
method: "PUT",
body: JSON.stringify(payload),
});
}, []);

const { form, handleChange, submit, loading, error } = useEditableResource({
id,
initialValues: {
first_name: "",
last_name: "",
email: "",
phone: "",
password: "",
pesel: "",
birth_date: "",
},
loadFn: stableLoadFn,
mapLoad: useCallback(({ patient, user }) => ({
first_name: user?.first_name || "",
last_name: user?.last_name || "",
email: user?.email || "",
phone: user?.phone || "",
password: "",
pesel: patient.pesel || "",
birth_date: patient.birth_date || "",
}), []),
createFn: stableCreateFn,
updateFn: stableUpdateFn,
buildPayload: useCallback((f) => ({
first_name: f.first_name,
last_name: f.last_name,
email: f.email,
phone: f.phone,
pesel: f.pesel,
birth_date: f.birth_date,
role: "patient",
...(f.password ? { password: f.password } : {}),
}), []),
onSuccess: () => navigate("/receptionist/patients"),
});

return ( <div className="min-vh-100 bg-light"> <Navbar /> <div className="container py-5"> <div className="row justify-content-center"> <div className="col-md-9 col-lg-8"> <div className="card shadow-sm border-0"> <div className="card-body p-5"> <div className="text-center mb-4">
<i className="bi bi-person-circle text-primary" style={{ fontSize: "3rem" }}></i> <h2 className="fw-bold mt-3 mb-2">{id ? "Edit Patient" : "Register Patient"}</h2> <p className="text-muted">Fill in patient information</p> </div>


            {error && (
              <div className="alert alert-danger d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={submit} className="card p-4">
              <h5 className="mb-3"><i className="bi bi-person-vcard me-2"></i>Personal Information</h5>

              <div className="row">
                <div className="col-md-6">
                  <FormField name="first_name" label="First Name" value={form.first_name} onChange={handleChange} required className="mb-3"/>
                </div>
                <div className="col-md-6">
                  <FormField name="last_name" label="Last Name" value={form.last_name} onChange={handleChange} required className="mb-3"/>
                </div>
              </div>

              <FormField type="email" name="email" label={<><i className="bi bi-envelope me-2"></i>Email</>} value={form.email} onChange={handleChange} required />
              <FormField type="tel" name="phone" label={<><i className="bi bi-telephone me-2"></i>Phone</>} value={form.phone} onChange={handleChange} />

              <div className="row">
                <div className="col-md-6">
                  <FormField name="pesel" label="PESEL" value={form.pesel} onChange={handleChange} className="mb-3"/>
                </div>
                <div className="col-md-6">
                  <FormField type="date" name="birth_date" label="Birth Date" value={form.birth_date} onChange={handleChange} inputProps={{max: new Date().toISOString().split("T")[0],}} required className="mb-3"/>
                </div>
              </div>

              <FormField type="password" name="password" label={<><i className="bi bi-lock me-2"></i>Password {id && <small className="text-muted">(leave empty to keep)</small>}</>} value={form.password} onChange={handleChange}/>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? "Saving..." : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


);
};

export default PatientForm;
