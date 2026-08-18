
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./DashboardLayout.css";

function DashboardLayout() {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = () => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      setCurrentUser(parsedUser);

    } catch (error) {

      console.error(
        "Unable to load logged-in user:",
        error
      );
    }
  };

  /*
   * Your backend returns role as:
   *
   * Admin
   * Manager
   * Viewer
   *
   * Depending on the login response it may also
   * be nested as role.roleName.
   */
  const getRoleName = () => {

    const role = currentUser?.role;

    if (!role) {
      return "";
    }

    if (typeof role === "string") {
      return role.toUpperCase();
    }

    if (typeof role === "object") {
      return (
        role.roleName ||
        ""
      ).toUpperCase();
    }

    return "";
  };

  const roleName = getRoleName();

  const isAdmin =
    roleName === "ADMIN";

  const menuGroups = [
    {
      title: "MAIN",
      items: [
        {
          path: "/dashboard",
          label: "Dashboard",
          icon: "⌂",
        },
      ],
    },

    {
      title: "MANAGEMENT",
      items: [
        {
          path: "/software",
          label: "Software",
          icon: "▦",
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
      ],
    },

    {
      title: "OPERATIONS",
      items: [
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
      ],
    },

    /*
     * Audit Log is visible ONLY to Admin.
     */
    ...(isAdmin
      ? [
          {
            title: "INSIGHTS",
            items: [
              {
                path: "/audit-log",
                label: "Audit Log",
                icon: "◉",
              },
            ],
          },
        ]
      : []),

    {
      title: "ADMINISTRATION",
      items: [
        {
          path: "/settings",
          label: "Settings",
          icon: "⚙",
        },
      ],
    },
  ];

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.clear();

    navigate("/login");
  };

  const username =
    currentUser?.username ||
    "User";

  const role =
    typeof currentUser?.role === "string"
      ? currentUser.role
      : currentUser?.role?.roleName ||
        "User";

  const avatarLetter =
    username
      .charAt(0)
      .toUpperCase();

  return (
    <div
      className={`dashboard-layout ${
        collapsed
          ? "sidebar-collapsed"
          : ""
      }`}
    >

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-logo">
            LM
          </div>

          {!collapsed && (
            <div className="brand-text">
              <strong>
                License
              </strong>

              <span>
                MANAGEMENT
              </span>
            </div>
          )}

        </div>


        <nav className="sidebar-navigation">

          {menuGroups.map((group) => (

            <div
              className="menu-group"
              key={group.title}
            >

              {!collapsed && (
                <div className="menu-group-title">
                  {group.title}
                </div>
              )}

              {group.items.map((item) => (

                <NavLink
                  key={item.path}
                  to={item.path}
                  title={
                    collapsed
                      ? item.label
                      : undefined
                  }
                  className={({ isActive }) =>
                    `sidebar-link ${
                      isActive
                        ? "active"
                        : ""
                    }`
                  }
                >

                  <span className="sidebar-icon">
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span>
                      {item.label}
                    </span>
                  )}

                </NavLink>

              ))}

            </div>

          ))}

        </nav>


        <div className="sidebar-bottom">

          <div className="profile-wrapper">

            {showProfile && (

              <div className="profile-menu">

                <button
                  onClick={() =>
                    navigate("/settings")
                  }
                >
                  ⚙ Settings
                </button>

                <button
                  onClick={handleLogout}
                >
                  ↪ Logout
                </button>

              </div>

            )}


            <button
              className="sidebar-profile"
              onClick={() =>
                setShowProfile(
                  !showProfile
                )
              }
            >

              <div className="profile-avatar">
                {avatarLetter}
              </div>

              {!collapsed && (

                <div className="profile-details">

                  <strong>
                    {username}
                  </strong>

                  <span>
                    {role}
                  </span>

                </div>

              )}

              {!collapsed && (

                <span className="profile-arrow">
                  ⌄
                </span>

              )}

            </button>

          </div>


          <button
            className="collapse-button"
            onClick={() =>
              setCollapsed(
                !collapsed
              )
            }
          >

            <span>
              {collapsed
                ? "›"
                : "‹"}
            </span>

            {!collapsed &&
              "Collapse"}

          </button>

        </div>

      </aside>


      <main className="dashboard-main">
        <Outlet />
      </main>

    </div>
  );
}

export default DashboardLayout;
