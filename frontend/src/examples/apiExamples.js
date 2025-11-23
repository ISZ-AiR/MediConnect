// Example: How to make authenticated API calls in your components

import { apiRequest } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

// Example 1: Fetch user data (authenticated)
export const fetchUserProfile = async () => {
  try {
    const response = await apiRequest("/user/profile", {
      method: "GET",
      // includeAuth is true by default, so the token will be automatically included
    });

    if (response.success) {
      return response.data;
    } else {
      console.error("Error fetching profile:", response.error);
      return null;
    }
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
};

// Example 2: Update user data (authenticated POST)
export const updateUserProfile = async (userData) => {
  try {
    const response = await apiRequest("/user/profile/update", {
      method: "PUT",
      body: JSON.stringify(userData),
    });

    if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.error.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Example 3: Using in a React component
export const ProfileComponent = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthenticated) {
        setLoading(true);
        const data = await fetchUserProfile();
        setProfile(data);
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
    </div>
  );
};

// Example 4: Fetch with query parameters
export const fetchAppointments = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = `/appointments${queryParams ? `?${queryParams}` : ""}`;

  try {
    const response = await apiRequest(endpoint, {
      method: "GET",
    });

    return response.success ? response.data : [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
};

// Example 5: POST with form data (e.g., file upload)
export const uploadDocument = async (file, documentData) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", documentData.title);
  formData.append("description", documentData.description);

  try {
    const response = await apiRequest("/documents/upload", {
      method: "POST",
      body: formData,
      // Don't set Content-Type header for FormData - browser will set it automatically
    });

    return response;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

// Example 6: DELETE request
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await apiRequest(`/appointments/${appointmentId}`, {
      method: "DELETE",
    });

    return response.success;
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return false;
  }
};

// Example 7: Handling errors in components
export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await fetchAppointments();
        setAppointments(data);
        setError(null);
      } catch (err) {
        setError("Failed to load appointments");
        console.error(err);
      }
    };

    loadAppointments();
  }, []);

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div>
      {appointments.map((apt) => (
        <div key={apt.id}>{apt.title}</div>
      ))}
    </div>
  );
};

// Example 8: Public API call (no authentication)
export const checkHealth = async () => {
  try {
    const response = await apiRequest("/health", {
      method: "GET",
      includeAuth: false, // Explicitly disable authentication
    });

    return response;
  } catch (error) {
    console.error("Health check failed:", error);
    return null;
  }
};
