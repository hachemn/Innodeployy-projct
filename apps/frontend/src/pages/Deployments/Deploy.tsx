import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { createDeployment } from "../../services/deployment.service";

interface Deployment {
  id: number;
  status: string;
  jenkinsBuildNumber: number | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Deploy() {
  const { projectId } = useParams();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [deployment, setDeployment] = useState<Deployment | null>(null);

  async function handleDeploy() {
    if (!projectId) {
      setMessage("Project ID is missing.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setDeployment(null);

      console.log("🚀 Starting deployment...");
      console.log("Project ID:", projectId);

      const result = await createDeployment(Number(projectId));

      console.log("✅ Deployment response:", result);

      setDeployment(result);

      if (result.status === "SUCCESS") {
        setMessage("Deployment completed successfully.");
      } else if (result.status === "FAILED") {
        setMessage("Deployment failed.");
      } else if (result.status === "RUNNING") {
        setMessage("Deployment is still running...");
      } else if (result.status === "PENDING") {
        setMessage("Deployment is pending...");
      } else {
        setMessage(`Deployment status: ${result.status}`);
      }
    } catch (error) {
      console.error("🔥 Deployment error:", error);

      setMessage(
        "Unable to complete the deployment request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "SUCCESS":
        return {
          backgroundColor: "#dcfce7",
          color: "#166534",
        };

      case "FAILED":
        return {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
        };

      case "RUNNING":
        return {
          backgroundColor: "#dbeafe",
          color: "#1e40af",
        };

      case "PENDING":
        return {
          backgroundColor: "#fef3c7",
          color: "#92400e",
        };

      default:
        return {
          backgroundColor: "#e5e7eb",
          color: "#374151",
        };
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "SUCCESS":
        return "✓";

      case "FAILED":
        return "✕";

      case "RUNNING":
        return "⟳";

      case "PENDING":
        return "○";

      default:
        return "•";
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "700px",
          maxWidth: "100%",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              margin: 0,
              color: "#111827",
              fontSize: "30px",
            }}
          >
            🚀 Deploy Project
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            Deploy your application using the connected repository.
          </p>
        </div>

        {/* Deployment card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
            }}
          >
            <div>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "13px",
                  marginBottom: "5px",
                }}
              >
                Project
              </p>

              <h2
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                #{projectId}
              </h2>
            </div>

            <span
              style={{
                padding: "7px 12px",
                borderRadius: "20px",
                backgroundColor: "#ecfdf5",
                color: "#047857",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Ready to deploy
            </span>
          </div>

          <p
            style={{
              color: "#6b7280",
              lineHeight: "1.6",
              marginBottom: "25px",
            }}
          >
            Start a new deployment. InnoDeploy will trigger the CI/CD
            pipeline and deploy the application.
          </p>

          <button
            onClick={handleDeploy}
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              backgroundColor: loading ? "#9ca3af" : "#111827",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            {loading
              ? "⏳ Deployment in progress..."
              : "🚀 Start Deployment"}
          </button>
        </div>

        {/* Result */}
        {message && (
          <div
            style={{
              marginTop: "25px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "25px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                Deployment Result
              </h2>

              {deployment && (
                <span
                  style={{
                    ...getStatusStyle(deployment.status),
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {getStatusIcon(deployment.status)}{" "}
                  {deployment.status}
                </span>
              )}
            </div>

            <p
              style={{
                marginBottom: "20px",
                color:
                  deployment?.status === "FAILED"
                    ? "#991b1b"
                    : deployment?.status === "SUCCESS"
                    ? "#166534"
                    : "#374151",
                fontWeight: "600",
              }}
            >
              {message}
            </p>

            {deployment && (
              <>
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
                      Deployment ID
                    </p>

                    <p
                      style={{
                        marginTop: "5px",
                        fontWeight: "600",
                      }}
                    >
                      #{deployment.id}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                      }}
                    >
                      Jenkins Build
                    </p>

                    <p
                      style={{
                        marginTop: "5px",
                        fontWeight: "600",
                      }}
                    >
                      {deployment.jenkinsBuildNumber !== null
                        ? `#${deployment.jenkinsBuildNumber}`
                        : "Not available"}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                      }}
                    >
                      Created
                    </p>

                    <p
                      style={{
                        marginTop: "5px",
                        fontWeight: "600",
                      }}
                    >
                      {new Date(
                        deployment.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {deployment.status === "FAILED" &&
                  deployment.failureReason && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "15px",
                        border: "1px solid #fecaca",
                        borderRadius: "8px",
                        backgroundColor: "#fef2f2",
                        color: "#991b1b",
                      }}
                    >
                      <strong>Failure Reason</strong>

                      <p
                        style={{
                          marginTop: "8px",
                          marginBottom: 0,
                        }}
                      >
                        {deployment.failureReason}
                      </p>
                    </div>
                  )}

                <div
                  style={{
                    marginTop: "25px",
                  }}
                >
                  <Link
                    to={`/projects/${projectId}/deployments/${deployment.id}`}
                    style={{
                      textDecoration: "none",
                      fontWeight: "600",
                    }}
                  >
                    View Deployment Details →
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* History */}
        <div
          style={{
            marginTop: "25px",
            textAlign: "center",
          }}
        >
          <Link
            to={`/projects/${projectId}/deployments`}
            style={{
              color: "#374151",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            ← View Deployment History
          </Link>
        </div>
      </div>
    </div>
  );
}