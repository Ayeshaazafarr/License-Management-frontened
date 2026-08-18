
import { NavLink } from "react-router-dom";

import "./SideBar.css";

function Sidebar({ collapsed, onToggle }) {
  const primaryItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "⌂",
    },
  ];

  const managementItems = [
    {
      path: "/software",
      label: "Software",
      icon: "▣",
    },
    {
      path: "/vendors",
      label: "Vendors",
      icon: "▤",
    },
    {
      path: "/licenses",
      label: "Licenses",
      icon: "▥",
    },
    {
      path: "/departments",
      label: "Departments",
      icon: "▦",
    },
    {
      path: "/employees",
      label: "Employees",
      icon: "♙",
    },
  ];

  const operationsItems = [
    {
      path: "/assignments",
      label: "Assignments",
      icon: "↔",
    },
    {
      path: "/renewals",
      label: "Renewals",
      icon: "↻",
    },
  ];

  const insightItems = [
    {
      path: "/reports",
      label: "Reports",
      icon: "▥",
    },
    {
      path: "/audit-log",
      label: "Audit Log",
      icon: "☷",
    },
  ];

  const renderItems = (items) =>
    items.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}`
        }
      >
        <span className="sidebar-icon">
          {item.icon}
        </span>

        {!collapsed && (
          <span className="sidebar-label">
            {item.label}
          </span>
        )}
      </NavLink>
    ));

  return (
    <aside
      className={`sidebar ${
        collapsed ? "sidebar-collapsed" : ""
      }`}
    >
      {/* =========================
          BRAND
      ========================= */}

      <div className="sidebar-brand">

        <div className="brand-logo">
          LM
        </div>

        {!collapsed && (
          <div className="brand-content">
            <div className="brand-title">
              License
            </div>

            <div className="brand-subtitle">
              Management
            </div>
          </div>
        )}

      </div>


      {/* =========================
          NAVIGATION
      ========================= */}

      <nav className="sidebar-navigation">

        {/* MAIN */}

        <div className="sidebar-section">

          {!collapsed && (
            <div className="sidebar-section-title">
              MAIN
            </div>
          )}

          {renderItems(primaryItems)}

        </div>


        {/* MANAGEMENT */}

        <div className="sidebar-section">

          {!collapsed && (
            <div className="sidebar-section-title">
              MANAGEMENT
            </div>
          )}

          {renderItems(managementItems)}

        </div>


        {/* OPERATIONS */}

        <div className="sidebar-section">

          {!collapsed && (
            <div className="sidebar-section-title">
              OPERATIONS
            </div>
          )}

          {renderItems(operationsItems)}

        </div>


        {/* INSIGHTS */}

        <div className="sidebar-section">

          {!collapsed && (
            <div className="sidebar-section-title">
              INSIGHTS
            </div>
          )}

          {renderItems(insightItems)}

        </div>


        {/* SETTINGS */}

        <div className="sidebar-section sidebar-settings">

          {!collapsed && (
            <div className="sidebar-section-title">
              SYSTEM
            </div>
          )}

          <NavLink
            to="/settings"
            title={collapsed ? "Settings" : undefined}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              ⚙
            </span>

            {!collapsed && (
              <span className="sidebar-label">
                Settings
              </span>
            )}
          </NavLink>

        </div>

      </nav>


      {/* =========================
          USER AREA
      ========================= */}

      <div className="sidebar-footer">

        <div className="sidebar-user">

          <div className="sidebar-user-avatar">
            A
          </div>

          {!collapsed && (
            <div className="sidebar-user-info">

              <strong>
                Admin User
              </strong>

              <span>
                Administrator
              </span>

            </div>
          )}

        </div>


        {/* COLLAPSE */}

        <button
          className="sidebar-collapse-button"
          onClick={onToggle}
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          <span>
            {collapsed ? "›" : "‹"}
          </span>

          {!collapsed && (
            <span>
              Collapse
            </span>
          )}
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;

