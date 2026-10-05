import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { createDeployment } from "../../services/deployment.service";

interface Deployment {
  id: number;
  status: string;
  jenkinsBuildNumber: number | null;
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
      setMessage("❌ Project ID is missing.");
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
        setMessage("✅ Deployment completed successfully!");
      } else if (result.status === "FAILED") {
        setMessage("❌ Deployment failed.");
      } else if (result.status === "RUNNING") {
        setMessage("⏳ Deployment is still running...");
      } else if (result.status === "PENDING") {
        setMessage("⏳ Deployment is pending...");
      } else {
        setMessage(`Deployment status: ${result.status}`);
      }
    } catch (error) {
      console.error("🔥 Deployment error:", error);

      setMessage(
        "❌ Unable to complete the deployment request. Check the backend logs."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "700px",
        maxWidth: "90%",
        margin: "40px auto",
        padding: "30px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>🚀 Deploy Project</h1>

      <p style={{ color: "#6b7280" }}>
        Start a new deployment for this project.
      </p>

      <p style={{ marginTop: "20px" }}>
        <strong>Project ID:</strong> {projectId}
      </p>

      <button
        onClick={handleDeploy}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          backgroundColor: loading ? "#9ca3af" : "#111827",
          color: "#ffffff",
          fontSize: "15px",
        }}
      >
        {loading ? "⏳ Deploying..." : "🚀 Start Deployment"}
      </button>

      {message && (
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            backgroundColor: "#f9fafb",
          }}
        >
          <p
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "15px",
            }}
          >
            {message}
          </p>

          {deployment && (
            <div>
              <p>
                <strong>Deployment ID:</strong> #{deployment.id}
              </p>

              <p>
                <strong>Status:</strong> {deployment.status}
              </p>

              <p>
                <strong>Jenkins Build:</strong>{" "}
                {deployment.jenkinsBuildNumber !== null
                  ? `#${deployment.jenkinsBuildNumber}`
                  : "Not available"}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {new Date(deployment.createdAt).toLocaleString()}
              </p>

              <p>
                <strong>Updated:</strong>{" "}
                {new Date(deployment.updatedAt).toLocaleString()}
              </p>

              <div style={{ marginTop: "20px" }}>
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
          )}
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <Link
          to={`/projects/${projectId}/deployments`}
          style={{
            textDecoration: "none",
          }}
        >
          ← View Deployment History
        </Link>
      </div>
    </div>
  );
}