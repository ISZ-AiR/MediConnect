import React from "react";
import Navbar from "../components/Navbar";

const About = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <h1 className="display-6">About MediConnect</h1>
        <p className="text-muted">
          A lightweight practice management demo built with FastAPI and React.
        </p>
        <p>
          Use the navigation to explore doctors, book appointments, or sign in.
        </p>
      </div>
    </div>
  );
};

export default About;
