import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { House, Settings, Users } from "lucide-react";

import { AppProvider } from "./context/AppContext";
import { GlobalLayout } from "./Layout.tsx";

import { CustomerPage } from "./components/legacy/customer/CustomerPage";
import Details from "./views/CustomerDetails/CustomerDetailsPage";
import { DashboardPage } from "./views/Dashboard/index.tsx";
import SettingsPage from "./views/Settings/SettingsPage.tsx";

import "./App.css";

const LeftNavItems = [
  { path: "/dashboard", label: "Dashboard", icon: <House size={20} /> },
  { path: "/customers", label: "Customers", icon: <Users size={20} /> },
  { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
];

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<GlobalLayout navList={LeftNavItems} />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomerPage />} />
            <Route path="/customer-details" element={<Details />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/:tab" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
