# Frontend Components Documentation

## Navbar Component

The Navbar component is a responsive navigation bar designed for the MediConnect healthcare management system.

**Location:** `/components/Navbar.jsx`

**Features:**

- Fully responsive design with mobile menu toggle
- Bootstrap 5 styling with medical-themed icons
- Quick access links to main sections:
  - Home
  - Appointments
  - Doctors
  - Patients
  - About
- Call-to-action buttons for Login and Register
- Professional medical branding with MediConnect logo

**Usage:**

```jsx
import Navbar from "../../components/Navbar";

function YourPage() {
  return (
    <div>
      <Navbar />
      {/* Your page content */}
    </div>
  );
}
```

## Homepage Component

The Homepage component is a comprehensive landing page for the MediConnect system.

**Location:** `/src/pages/Homepage.jsx`

**Sections:**

1. **Hero Section** - Eye-catching introduction with call-to-action buttons
2. **Services Section** - Six feature cards showcasing main functionalities:
   - Appointment Management
   - Electronic Health Records
   - Prescription Management
   - Medical Examinations
   - Doctor Directory
   - Security & Compliance
3. **Statistics Section** - Key metrics displayed prominently
4. **Call-to-Action Section** - Encourages user registration
5. **Footer** - Contact information and quick links

**Features:**

- Fully responsive design
- Bootstrap 5 components and utilities
- Medical-themed icons from Bootstrap Icons
- Hover effects on cards
- Professional color scheme suitable for healthcare
- Gradient backgrounds for visual appeal

## Styling

**Bootstrap 5:** All components use Bootstrap 5 classes for consistent styling and responsiveness.

**Bootstrap Icons:** Medical and UI icons from the Bootstrap Icons library.

**Custom CSS:** Additional styling in `/src/styles/custom.css` for:

- Smooth transitions and hover effects
- Custom color scheme
- Enhanced button and card interactions
- Responsive typography
- Custom scrollbar

## Dependencies

Make sure these are included in your project:

- React Router DOM (for navigation)
- Bootstrap 5.3.2 (via CDN in index.html)
- Bootstrap Icons 1.11.1 (via CDN in index.html)

## Customization

To customize the components:

1. **Colors:** Modify CSS variables in `/src/styles/custom.css`
2. **Content:** Edit text and statistics in `Homepage.jsx`
3. **Navigation:** Update links in `Navbar.jsx` as routes are implemented
4. **Icons:** Change Bootstrap Icon classes to match your preferences

## Future Enhancements

Consider adding:

- User authentication state in Navbar
- Dynamic content loading for statistics
- Image gallery or testimonials section
- Interactive appointment booking modal
- Blog or news section
- Contact form
