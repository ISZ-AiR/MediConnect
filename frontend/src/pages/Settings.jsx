import React from "react";
import Navbar from "../components/Navbar";

const Settings = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h1 className="display-6">Settings</h1>
        <p className="text-muted">
          Basic account and application settings will appear here.
        </p>
      </div>
    </div>
  );
};

export default Settings;
