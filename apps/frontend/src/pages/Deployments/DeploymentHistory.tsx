import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDeployments } from "../../services/deployment.service";

interface Deployment {
  id: number;
  status: string;
  jenkinsBuildNumber: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function DeploymentHistory() {
  const { projectId } = useParams();

  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDeployments() {
      try {
        if (!projectId) return;

        setLoading(true);
        setError("");

        const data = await getDeployments(Number(projectId));

        setDeployments(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load deployment history.");
      } finally {
        setLoading(false);
      }
    }

    loadDeployments();
  }, [projectId]);

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

  return (
    <div
      style={{
        width: "700px",
        maxWidth: "90%",
        margin: "40px auto",
      }}
    >
      <h1>📜 Deployment History</h1>

      <p
        style={{
          marginTop: "10px",
          marginBottom: "25px",
          color: "#6b7280",
        }}
      >
        Track the deployments of your project.
      </p>

      {loading && <p>⏳ Loading deployments...</p>}

      {error && (
        <p style={{ color: "#991b1b" }}>
          ❌ {error}
        </p>
      )}

      {!loading && !error && deployments.length === 0 && (
        <p>No deployments yet.</p>
      )}

      {!loading &&
        !error &&
        deployments.map((deployment) => (
          <div
            key={deployment.id}
            style={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              padding: "20px",
              marginBottom: "15px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                <Link
                  to={`/projects/${projectId}/deployments/${deployment.id}`}
                  style={{
                    color: "#111827",
                    textDecoration: "none",
                  }}
                >
                  Deployment #{deployment.id}
                </Link>
              </h2>

              <span
                style={{
                  ...getStatusStyle(deployment.status),
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                {deployment.status}
              </span>
            </div>

            <p>
              <strong>Jenkins Build:</strong>{" "}
              {deployment.jenkinsBuildNumber !== null
                ? `#${deployment.jenkinsBuildNumber}`
                : "Not available"}
            </p>

            <p style={{ marginTop: "8px" }}>
              <strong>Created:</strong>{" "}
              {new Date(deployment.createdAt).toLocaleString()}
            </p>

            <p style={{ marginTop: "8px" }}>
              <strong>Last updated:</strong>{" "}
              {new Date(deployment.updatedAt).toLocaleString()}
            </p>

            <div style={{ marginTop: "15px" }}>
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
          </div>
        ))}
    </div>
  );
}