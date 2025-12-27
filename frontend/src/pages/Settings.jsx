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
  const {
    theme, backgroundUrl,
    bgOpacity, setBgOpacity,
    bgBlur, setBgBlur,
    bgBrightness, setBgBrightness, // Added brightness from context
    updateSettings, loading
  } = useTheme();

  const navigate = useNavigate();

  // Local state for draft changes (preview before saving)
  const [draftTheme, setDraftTheme] = useState(theme);
  const [draftBg, setDraftBg] = useState(backgroundUrl);
  const [draftOpacity, setDraftOpacity] = useState(bgOpacity);
  const [draftBlur, setDraftBlur] = useState(bgBlur);
  const [draftBrightness, setDraftBrightness] = useState(bgBrightness || 0.4); // Default 0.4

  // Sync draft with global state when data is loaded from API
  useEffect(() => {
    setDraftTheme(theme);
    setDraftBg(backgroundUrl);
    setDraftOpacity(bgOpacity);
    setDraftBlur(bgBlur);
    setDraftBrightness(bgBrightness);
  }, [theme, backgroundUrl, bgOpacity, bgBlur, bgBrightness]);

  // Apply real-time preview to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--app-bg-opacity', draftOpacity);
    document.documentElement.style.setProperty('--app-bg-blur', `${draftBlur}px`);
    document.documentElement.style.setProperty('--app-bg-brightness', draftBrightness);
  }, [draftOpacity, draftBlur, draftBrightness]);

  const handleSave = async () => {
    // Save all settings including brightness
    await updateSettings(draftTheme, draftBg, draftOpacity, draftBlur, draftBrightness);
    alert("Settings saved successfully!");
  };

  // Check if any value differs from the saved state
  const isDirty =
    draftTheme !== theme ||
    draftBg !== backgroundUrl ||
    draftOpacity !== bgOpacity ||
    draftBlur !== bgBlur ||
    draftBrightness !== bgBrightness;

  return (
      <div className="min-vh-100" style={{backgroundColor: 'transparent'}}>
        <Navbar/>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">

                  <div className="text-center mb-5">
                    <i className="bi bi-sliders text-primary" style={{fontSize: "3.5rem"}}></i>
                    <h1 className="fw-bold mt-3">Application Settings</h1>
                    <p className="text-muted">
                      Customize the look and feel of your workspace. Changes will be applied after saving.
                    </p>
                  </div>

                  {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                      </div>
                  ) : (
                      <div className="row">
                        {/* Left Column: Theme & Glass Effects */}
                        <div className="col-lg-5 mb-4 border-end">
                          <h4 className="mb-4"><i className="bi bi-palette2 me-2"></i>Interface</h4>

                          {/* Theme Selection */}
                          <div className="d-grid gap-3 mb-5">
                            <div
                                className={`p-3 rounded border cursor-pointer d-flex align-items-center ${draftTheme === 'light' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                                onClick={() => setDraftTheme('light')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDraftTheme('light'); }}
                                style={{cursor: 'pointer'}}
                            >
                              <i className="bi bi-sun-fill fs-3 me-3 text-warning"></i>
                              <div>
                                <div className="fw-bold">Light Mode</div>
                              </div>
                              {draftTheme === 'light' && <i className="bi bi-check-circle-fill ms-auto text-primary"></i>}
                            </div>

                            <div
                                className={`p-3 rounded border cursor-pointer d-flex align-items-center ${draftTheme === 'dark' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                                onClick={() => setDraftTheme('dark')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDraftTheme('dark'); }}
                                style={{cursor: 'pointer'}}
                            >
                              <i className="bi bi-moon-stars-fill fs-3 me-3 text-info"></i>
                              <div>
                                <div className="fw-bold">Dark Mode</div>
                              </div>
                              {draftTheme === 'dark' && <i className="bi bi-check-circle-fill ms-auto text-primary"></i>}
                            </div>
                          </div>

                          {/* Glassmorphism Sliders */}
                          <h4 className="mb-4"><i className="bi bi-magic me-2"></i>Glass Effects</h4>

                          <div className="mb-4">
                            <label className="form-label d-flex justify-content-between small fw-bold">
                              Tile Opacity <span>{Math.round(draftOpacity * 100)}%</span>
                            </label>
                            <input
                              type="range" className="form-range" min="0.1" max="1" step="0.05"
                              value={draftOpacity}
                              onChange={(e) => setDraftOpacity(parseFloat(e.target.value))}
                            />
                          </div>

                          <div className="mb-4">
                            <label className="form-label d-flex justify-content-between small fw-bold">
                              Background Blur <span>{draftBlur}px</span>
                            </label>
                            <input
                              type="range" className="form-range" min="0" max="25" step="1"
                              value={draftBlur}
                              onChange={(e) => setDraftBlur(parseInt(e.target.value))}
                            />
                          </div>
                        </div>

                        {/* Right Column: Background Selection & Brightness */}
                        <div className="col-lg-7 mb-4 ps-lg-4">
                          <h4 className="mb-4">
                            <i className="bi bi-image me-2"></i>Desktop Wallpaper
                          </h4>
                          <div className="row g-3 mb-4">
                            {AVAILABLE_BACKGROUNDS.map((bg) => (
                                <div key={bg.id} className="col-sm-4">
                                  <div
                                      onClick={() => setDraftBg(bg.url)}
                                      className="position-relative rounded overflow-hidden shadow-sm"
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDraftBg(bg.url); }}
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

                          {/* Wallpaper Brightness/Dimming Slider */}
                          <h4 className="mb-4 mt-5">
                            <i className="bi bi-brightness-high me-2"></i>Wallpaper Intensity
                          </h4>
                          <div className="mb-4">
                            <label className="form-label d-flex justify-content-between small fw-bold">
                              Brightness <span>{Math.round(draftBrightness * 100)}%</span>
                            </label>
                            <input
                              type="range" className="form-range" min="0" max="1" step="0.05"
                              value={draftBrightness}
                              onChange={(e) => setDraftBrightness(parseFloat(e.target.value))}
                            />
                            <small className="text-muted">Adjust how much the background image shines through.</small>
                          </div>

                          {/* Visual Tip */}
                          <div className="mt-4 p-3 bg-light rounded-3 text-dark small">
                            <i className="bi bi-info-circle me-2 text-primary"></i>
                            <strong>Tip:</strong> Reducing brightness makes the text in the cards much easier to read against complex images.
                          </div>
                        </div>

                        {/* Save/Cancel Buttons */}
                        <div className="col-12 mt-4">
                          <hr className="opacity-10"/>
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