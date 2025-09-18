// Main application file - last updated by dev3
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { CustomerPage } from "./components/legacy/customer/CustomerPage";
import Details from "./views/CustomerDetails/CustomerDetailsPage";
import DashboardPage from "./views/dashboard/DashboardPage";
import SettingsPage from "./views/settings/SettingsPage";
import { AppProvider } from "./context/AppContext";
import "./App.css";

// Navigation component with inconsistent styling and mixed concerns
const Navigation = () => {
  // Inline styles that recreate objects on every render
  const linkStyle = {
    margin: "0 10px",
    textDecoration: "none",
    color: "#333",
    padding: "5px 10px",
    borderRadius: "4px",
    transition: "all 0.3s ease",
  };

  // Active state logic that should be in CSS
  const isActive = (path: string) => {
    return window.location.pathname === path
      ? {
          ...linkStyle,
          backgroundColor: "#007bff",
          color: "white",
        }
      : linkStyle;
  };

  return (
    <nav
      style={{
        marginBottom: "20px",
        padding: "10px",
        backgroundColor: "#f8f9fa",
        borderRadius: "4px",
      }}
    >
      <Link to="/" style={isActive("/")}>
        Home
      </Link>
      <Link to="/dashboard" style={isActive("/dashboard")}>
        Dashboard
      </Link>
      <Link to="/customers" style={isActive("/customers")}>
        Customers
      </Link>
      <Link to="/customer-details" style={isActive("/customer-details")}>
        Customer Details
      </Link>
      <Link to="/settings" style={isActive("/settings")}>
        Settings
      </Link>
    </nav>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App" style={{ padding: "20px" }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<h1>Customer Portal</h1>} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomerPage />} />
            <Route path="/customer-details" element={<Details />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/:tab" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
