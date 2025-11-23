import React from "react";

// Generic form field renderer.
// Props:
//  type: input type or 'textarea' or 'select'
//  name, label, value, onChange
//  options: for select [{ value, label }]
//  required, disabled, className, children (for custom help text)
//  inputProps: extra props passed to input/textarea/select
export const FormField = ({
  type = "text",
  name,
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  className = "mb-3",
  inputProps = {},
  children,
}) => {
  const baseProps = {
    name,
    id: name,
    value: value ?? "",
    onChange,
    required,
    disabled,
    className: type === "checkbox" ? "form-check-input" : "form-control",
    ...inputProps,
  };

  const renderControl = () => {
    if (type === "textarea") return <textarea {...baseProps} />;
    if (type === "select")
      return (
        <select {...baseProps} className="form-select">
          <option value="">Select...</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    if (type === "checkbox")
      return (
        <input
          {...baseProps}
          checked={!!value}
          value={undefined}
          type="checkbox"
        />
      );
    return <input {...baseProps} type={type} />;
  };

  if (type === "checkbox") {
    return (
      <div className={`form-check ${className}`}>
        {renderControl()}
        <label htmlFor={name} className="form-check-label">
          {label}
        </label>
        {children}
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="form-label fw-semibold">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      {renderControl()}
      {children}
    </div>
  );
};

export default FormField;
