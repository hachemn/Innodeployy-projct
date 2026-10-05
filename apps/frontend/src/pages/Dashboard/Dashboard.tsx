
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/user.service";
import { getProjects } from "../../services/project.service";
import { getDeployments } from "../../services/deployment.service";

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

interface Project {
  id: number;
  name: string;
  description?: string;
}

interface Deployment {
  id: number;
  status: string;
  jenkinsBuildNumber: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  const [loading, setLoading] = useState(true);
  const [, setError] = useState("");
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const userData = await getCurrentUser();
        setUser(userData);

        const projectData = await getProjects();
        setProjects(projectData);

        const allDeployments: Deployment[] = [];

        for (const project of projectData) {
          try {
            const projectDeployments = await getDeployments(project.id);

            allDeployments.push(...projectDeployments);
          } catch (deploymentError) {
            console.error(
              `Unable to load deployments for project ${project.id}`,
              deploymentError
            );
          }
        }

        setDeployments(allDeployments);
      } catch (error) {
        console.error(error);

        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  const totalProjects = projects.length;
  const totalDeployments = deployments.length;

  const successfulDeployments = deployments.filter(
    (deployment) => deployment.status === "SUCCESS"
  ).length;

  const failedDeployments = deployments.filter(
    (deployment) => deployment.status === "FAILED"
  ).length;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#6b7280",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "18px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#111827" }}>
            InnoDeploy 🚀
          </h2>

          <p
            style={{
              marginTop: "4px",
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            DevOps deployment platform
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            padding: "9px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "7px",
            backgroundColor: "#ffffff",
            color: "#374151",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Logout
        </button>
      </header>

      {/* Main content */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 25px",
        }}
      >
        {/* Welcome */}
        <section>
          <h1
            style={{
              margin: 0,
              color: "#111827",
              fontSize: "30px",
            }}
          >
            Welcome back
            {user?.fullName ? `, ${user.fullName}` : ""} 👋
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            Manage your projects and deployments from one place.
          </p>
        </section>

        {/* Account information */}
        {user && (
          <section
            style={{
              marginTop: "30px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "22px",
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
                color: "#111827",
              }}
            >
              Account information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  Name
                </p>

                <p
                  style={{
                    marginTop: "5px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {user.fullName}
                </p>
              </div>

              <div>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  Email
                </p>

                <p
                  style={{
                    marginTop: "5px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {user.email}
                </p>
              </div>

              <div>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  Role
                </p>

                <p
                  style={{
                    marginTop: "5px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {user.role}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Overview */}
        <section style={{ marginTop: "30px" }}>
          <h2
            style={{
              color: "#111827",
              marginBottom: "18px",
            }}
          >
            Overview
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "18px",
            }}
          >
            {/* Projects */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "22px",
              }}
            >
              <div style={{ fontSize: "26px" }}>📁</div>

              <p
                style={{
                  marginTop: "12px",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Projects
              </p>

              <h2
                style={{
                  marginTop: "5px",
                  color: "#111827",
                  fontSize: "28px",
                }}
              >
                {totalProjects}
              </h2>
            </div>

            {/* Deployments */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "22px",
              }}
            >
              <div style={{ fontSize: "26px" }}>🚀</div>

              <p
                style={{
                  marginTop: "12px",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Deployments
              </p>

              <h2
                style={{
                  marginTop: "5px",
                  color: "#111827",
                  fontSize: "28px",
                }}
              >
                {totalDeployments}
              </h2>
            </div>

            {/* Successful */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "22px",
              }}
            >
              <div style={{ fontSize: "26px" }}>✅</div>

              <p
                style={{
                  marginTop: "12px",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Successful
              </p>

              <h2
                style={{
                  marginTop: "5px",
                  color: "#166534",
                  fontSize: "28px",
                }}
              >
                {successfulDeployments}
              </h2>
            </div>

            {/* Failed */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "22px",
              }}
            >
              <div style={{ fontSize: "26px" }}>❌</div>

              <p
                style={{
                  marginTop: "12px",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Failed
              </p>

              <h2
                style={{
                  marginTop: "5px",
                  color: "#991b1b",
                  fontSize: "28px",
                }}
              >
                {failedDeployments}
              </h2>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section style={{ marginTop: "35px" }}>
          <h2
            style={{
              color: "#111827",
              marginBottom: "18px",
            }}
          >
            Quick actions
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Projects */}
            <button
              onClick={() => navigate("/projects")}
              style={{
                textAlign: "left",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "25px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "12px",
                }}
              >
                📁
              </div>

              <h3
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                My Projects
              </h3>

              <p
                style={{
                  marginTop: "8px",
                  color: "#6b7280",
                  lineHeight: "1.5",
                }}
              >
                View and manage your projects.
              </p>
            </button>

            {/* Create project */}
            <button
              onClick={() => navigate("/projects/create")}
              style={{
                textAlign: "left",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "25px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "12px",
                }}
              >
                ➕
              </div>

              <h3
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                Create Project
              </h3>

              <p
                style={{
                  marginTop: "8px",
                  color: "#6b7280",
                  lineHeight: "1.5",
                }}
              >
                Add a new project to InnoDeploy.
              </p>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
