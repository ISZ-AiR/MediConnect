import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <Navbar />
      <div className="container py-5 flex-grow-1">
        <h1 className="display-6">About MediConnect</h1>
        <p className="text-muted">
          A lightweight practice management demo built with FastAPI and React.
        </p>
        <p>
          Use the navigation to explore doctors, book appointments, or sign in.
        </p>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default About;
