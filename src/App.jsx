
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import Software from "./pages/Software/Software";
import Vendors from "./pages/Vendors/Vendors";
import Licenses from "./pages/Licenses/Licenses";
import Departments from "./pages/Departments/Departments";
import Employees from "./pages/Employees/Employees";
import Assignments from "./pages/Assignments/Assignments";
import Renewals from "./pages/Renewals/Renewals";
import AuditLogs from "./pages/AuditLogs/AuditLogs";
import Settings from "./pages/Settings/Settings";
import Reports from "./pages/Reports/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route element={<PublicRoute />}>
          <Route
            path="/login"
            element={<Login />}
          />
        </Route>


        {/* =========================
            PROTECTED ROUTES
        ========================= */}

        <Route element={<ProtectedRoute />}>

          <Route element={<DashboardLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/software"
              element={<Software />}
            />

            <Route
              path="/vendors"
              element={<Vendors />}
            />

            <Route
              path="/licenses"
              element={<Licenses />}
            />

            <Route
              path="/departments"
              element={<Departments />}
            />

            <Route
              path="/employees"
              element={<Employees />}
            />

            <Route
              path="/assignments"
              element={<Assignments />}
            />

            <Route
              path="/renewals"
              element={<Renewals />}
            />

            <Route
              path="/audit-log"
              element={<AuditLogs />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

          </Route>

        </Route>


        {/* =========================
            DEFAULT ROUTE
        ========================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* =========================
            UNKNOWN ROUTES
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
