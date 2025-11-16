import React from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h1 className="display-6">My Profile</h1>
        {!user ? (
          <p className="text-muted">
            You need to be logged in to view your profile.
          </p>
        ) : (
          <div className="card p-4">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <p>
              <strong>User ID:</strong> {user.user_id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
