import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDeployment } from "../../services/deployment.service";

interface Deployment {
  id: number;
  status: string;
  jenkinsBuildNumber: number | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;

  project: {
    id: number;
    name: string;
    repository: {
      url: string;
      branch: string;
    } | null;
  };
}

export default function DeploymentDetails() {
  const { projectId, deploymentId } = useParams();

  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDeployment() {
      try {
        if (!projectId || !deploymentId) return;

        setLoading(true);
        setError("");

        const data = await getDeployment(
          Number(projectId),
          Number(deploymentId)
        );

        setDeployment(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load deployment details.");
      } finally {
        setLoading(false);
      }
    }

    loadDeployment();
  }, [projectId, deploymentId]);

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

  if (loading) {
    return (
      <div style={{ width: "700px", margin: "40px auto" }}>
        <p>⏳ Loading deployment details...</p>
      </div>
    );
  }

  if (error || !deployment) {
    return (
      <div style={{ width: "700px", margin: "40px auto" }}>
        <p style={{ color: "#991b1b" }}>
          ❌ {error || "Deployment not found."}
        </p>

        <Link to={`/projects/${projectId}/deployments`}>
          ← Back to Deployment History
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "700px",
        maxWidth: "90%",
        margin: "40px auto",
      }}
    >
      <Link to={`/projects/${projectId}/deployments`}>
        ← Back to Deployment History
      </Link>

      <h1 style={{ marginTop: "25px" }}>
        📦 Deployment #{deployment.id}
      </h1>

      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          padding: "25px",
          marginTop: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
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
          <h2>Deployment information</h2>

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
          <strong>Deployment ID:</strong> {deployment.id}
        </p>

        <p style={{ marginTop: "12px" }}>
          <strong>Status:</strong> {deployment.status}
        </p>
        <p style={{ marginTop: "12px" }}>
          <strong>Project:</strong> {deployment.project.name}
        </p>

        <p style={{ marginTop: "12px" }}>
          <strong>Repository:</strong>{" "}
          {deployment.project.repository?.url || "Not available"}
        </p>

        <p style={{ marginTop: "12px" }}>
          <strong>Branch:</strong>{" "}
          {deployment.project.repository?.branch || "Not available"}
        </p>

        <p style={{ marginTop: "12px" }}>
          <strong>Jenkins Build:</strong>{" "}
          {deployment.jenkinsBuildNumber !== null
            ? `#${deployment.jenkinsBuildNumber}`
            : "Not available"}
        </p>

        <p style={{ marginTop: "12px" }}>
          <strong>Created:</strong>{" "}
          {new Date(deployment.createdAt).toLocaleString()}
        </p>

        <p style={{ marginTop: "12px" }}>
          <strong>Last updated:</strong>{" "}
          {new Date(deployment.updatedAt).toLocaleString()}
        </p>

        {deployment.status === "FAILED" && deployment.failureReason && (
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
      </div>
    </div>
  );
}