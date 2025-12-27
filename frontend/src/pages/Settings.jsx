import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const AVAILABLE_BACKGROUNDS = [
  { id: 'none', name: 'None', url: '' },
  { id: 'stethoscope', name: 'Stethoscope', url: '/assets/unsplash_stethoscope.jpg' },
  { id: 'pc', name: 'PC', url: '/assets/unsplash_pc.jpg' },
  { id: 'pills', name: 'Pills', url: '/assets/unsplash_pills.jpg' },
];

const Settings = () => {
  const { theme, backgroundUrl, updateSettings, loading } = useTheme();
  const navigate = useNavigate();

  // Local state for "draft" changes
  const [draftTheme, setDraftTheme] = useState(theme);
  const [draftBg, setDraftBg] = useState(backgroundUrl);

  // Sync draft with current settings when they load
  useEffect(() => {
    setDraftTheme(theme);
    setDraftBg(backgroundUrl);
  }, [theme, backgroundUrl]);

  const handleSave = async () => {
    await updateSettings(draftTheme, draftBg);
    alert("Settings saved successfully!");
  };

  const isDirty = draftTheme !== theme || draftBg !== backgroundUrl;

  return (
      <div className="min-vh-100" style={{backgroundColor: 'transparent'}}>
        <Navbar/>
        <div className="container py-5">
          <div className="row justify-content-center">
            {/* Increased width to col-md-10 */}
            <div className="col-md-10">
              <div className={`card shadow-lg border-0 ${theme === 'dark' ? 'bg-secondary text-white' : ''}`}>
                <div className="card-body p-5">

                  <div className="text-center mb-5">
                    <i className="bi bi-sliders text-primary" style={{fontSize: "3.5rem"}}></i>
                    <h1 className="fw-bold mt-3">Application Settings</h1>
                    <p className={theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}>
                      Customize the look and feel of your workspace. Changes will be applied after saving.
                    </p>
                  </div>

                  {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                      </div>
                  ) : (
                      <div className="row">
                        {/* Left Column: Theme */}
                        <div className="col-lg-5 mb-4 border-end">
                          <h4 className="mb-4">
                            <i className="bi bi-palette2 me-2"></i>Theme Mode
                          </h4>
                          <div className="d-grid gap-3">
                            <div
                                className={`p-3 rounded border cursor-pointer d-flex align-items-center ${draftTheme === 'light' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                                onClick={() => setDraftTheme('light')}
                                style={{cursor: 'pointer'}}
                            >
                              <i className="bi bi-sun-fill fs-3 me-3 text-warning"></i>
                              <div>
                                <div className="fw-bold">Light Mode</div>
                                <small className="text-muted">Classic bright interface</small>
                              </div>
                              {draftTheme === 'light' &&
                                  <i className="bi bi-check-circle-fill ms-auto text-primary"></i>}
                            </div>

                            <div
                                className={`p-3 rounded border cursor-pointer d-flex align-items-center ${draftTheme === 'dark' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                                onClick={() => setDraftTheme('dark')}
                                style={{cursor: 'pointer'}}
                            >
                              <i className="bi bi-moon-stars-fill fs-3 me-3 text-info"></i>
                              <div>
                                <div className="fw-bold">Dark Mode</div>
                                <small className="text-muted">Easier on the eyes at night</small>
                              </div>
                              {draftTheme === 'dark' &&
                                  <i className="bi bi-check-circle-fill ms-auto text-primary"></i>}
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Background */}
                        <div className="col-lg-7 mb-4 ps-lg-4">
                          <h4 className="mb-4">
                            <i className="bi bi-image me-2"></i>Desktop Wallpaper
                          </h4>
                          <div className="row g-3">
                            {AVAILABLE_BACKGROUNDS.map((bg) => (
                                <div key={bg.id} className="col-sm-4">
                                  <div
                                      onClick={() => setDraftBg(bg.url)}
                                      className="position-relative rounded overflow-hidden shadow-sm"
                                      style={{
                                        height: '100px',
                                        background: bg.url ? `url(${bg.url}) center/cover` : '#dee2e6',
                                        cursor: 'pointer',
                                        border: draftBg === bg.url ? '4px solid #0d6efd' : '2px solid transparent'
                                      }}
                                  >
                                    {draftBg === bg.url && (
                                        <div className="position-absolute top-0 end-0 p-1">
                                          <i className="bi bi-check-circle-fill text-primary shadow-sm bg-white rounded-circle"></i>
                                        </div>
                                    )}
                                  </div>
                                  <div className="text-center mt-2 small fw-medium">{bg.name}</div>
                                </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="col-12 mt-5">
                          <hr/>
                          <div className="d-flex justify-content-end gap-3 mt-4">
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-lg px-5"
                                onClick={() => navigate(-1)}
                            >
                              Cancel
                            </button>
                            <button
                                type="button"
                                className={`btn btn-primary btn-lg px-5 ${!isDirty ? 'disabled' : ''}`}
                                onClick={handleSave}
                            >
                              <i className="bi bi-save2 me-2"></i>Save Changes
                            </button>
                          </div>
                        </div>

                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Settings;