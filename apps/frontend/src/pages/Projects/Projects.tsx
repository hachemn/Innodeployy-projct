
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProjects,
  getRepository,
} from "../../services/project.service";

interface Project {
  id: number;
  name: string;
  description?: string;
}

interface Repository {
  id: number;
  provider: string;
  url: string;
  branch: string;
  projectId: number;
}

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [repositories, setRepositories] = useState<
    Record<number, Repository | null>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);

        const data = await getProjects();

        setProjects(data);

        const repositoryResults: Record<
          number,
          Repository | null
        > = {};

        await Promise.all(
          data.map(async (project: Project) => {
            try {
              const repository = await getRepository(project.id);

              repositoryResults[project.id] = repository;
            } catch (error) {
              console.error(
                `Failed to get repository for project ${project.id}`,
                error
              );

              repositoryResults[project.id] = null;
            }
          })
        );

        setRepositories(repositoryResults);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
        padding: "40px 25px",
      }}
    >
      <main
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            gap: "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#111827",
                fontSize: "30px",
              }}
            >
              My Projects
            </h1>

            <p
              style={{
                marginTop: "8px",
                color: "#6b7280",
              }}
            >
              Manage your projects, repositories and deployments.
            </p>
          </div>

          <button
            onClick={() => navigate("/projects/create")}
            style={{
              padding: "11px 18px",
              border: "none",
              borderRadius: "7px",
              backgroundColor: "#111827",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            + Create Project
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "30px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Loading projects...
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "50px 30px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px" }}>📁</div>

            <h2
              style={{
                marginTop: "15px",
                color: "#111827",
              }}
            >
              No projects yet
            </h2>

            <p
              style={{
                color: "#6b7280",
                marginTop: "8px",
              }}
            >
              Create your first project to start deploying with
              InnoDeploy.
            </p>

            <button
              onClick={() => navigate("/projects/create")}
              style={{
                marginTop: "20px",
                padding: "10px 18px",
                border: "none",
                borderRadius: "7px",
                backgroundColor: "#111827",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Create Project
            </button>
          </div>
        )}

        {/* Projects */}
        {!loading &&
          projects.map((project) => {
            const repository = repositories[project.id];

            return (
              <div
                key={project.id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "25px",
                  marginBottom: "20px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                }}
              >
                {/* Project header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        color: "#111827",
                      }}
                    >
                      {project.name}
                    </h2>

                    <p
                      style={{
                        marginTop: "8px",
                        color: "#6b7280",
                      }}
                    >
                      {project.description || "No description provided."}
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b7280",
                      backgroundColor: "#f3f4f6",
                      padding: "5px 9px",
                      borderRadius: "15px",
                    }}
                  >
                    Project #{project.id}
                  </span>
                </div>

                {/* Repository */}
                <div
                  style={{
                    marginTop: "22px",
                    padding: "18px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  {repository ? (
                    <>
                      <p
                        style={{
                          margin: 0,
                          color: "#166534",
                          fontWeight: "600",
                        }}
                      >
                        🟢 Repository connected
                      </p>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "20px",
                          marginTop: "12px",
                          color: "#4b5563",
                          fontSize: "14px",
                        }}
                      >
                        <span>
                          <strong>Provider:</strong>{" "}
                          {repository.provider}
                        </span>

                        <span>
                          <strong>Branch:</strong>{" "}
                          {repository.branch}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                          marginTop: "18px",
                        }}
                      >
                        <button
                          onClick={() =>
                            window.open(
                              repository.url,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          style={{
                            padding: "9px 14px",
                            border: "1px solid #d1d5db",
                            borderRadius: "7px",
                            backgroundColor: "#ffffff",
                            color: "#374151",
                            cursor: "pointer",
                          }}
                        >
                          View Repository
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/projects/${project.id}/deploy`)
                          }
                          style={{
                            padding: "9px 14px",
                            border: "none",
                            borderRadius: "7px",
                            backgroundColor: "#111827",
                            color: "#ffffff",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          🚀 Deploy
                        </button>

                        <button
                          onClick={() =>
                            navigate(
                              `/projects/${project.id}/deployments`
                            )
                          }
                          style={{
                            padding: "9px 14px",
                            border: "1px solid #d1d5db",
                            borderRadius: "7px",
                            backgroundColor: "#ffffff",
                            color: "#374151",
                            cursor: "pointer",
                          }}
                        >
                          📜 History
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p
                        style={{
                          margin: 0,
                          color: "#92400e",
                          fontWeight: "600",
                        }}
                      >
                        🟡 Repository not connected
                      </p>

                      <p
                        style={{
                          marginTop: "8px",
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        Connect a Git repository before deploying this
                        project.
                      </p>

                      <button
                        onClick={() =>
                          navigate(
                            `/projects/${project.id}/repository`
                          )
                        }
                        style={{
                          marginTop: "15px",
                          padding: "9px 14px",
                          border: "none",
                          borderRadius: "7px",
                          backgroundColor: "#111827",
                          color: "#ffffff",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Connect Repository
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </main>
    </div>
  );
}
