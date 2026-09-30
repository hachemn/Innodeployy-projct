
import { useState } from "react";
import { useParams } from "react-router-dom";
import { createDeployment } from "../../services/deployment.service";

export default function Deploy() {
  const { projectId } = useParams();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [deploymentId, setDeploymentId] = useState<number | null>(null);

  async function handleDeploy() {
    if (!projectId) return;

    try {
      setLoading(true);
      setMessage("");
      setDeploymentId(null);

      const deployment = await createDeployment(Number(projectId));

      console.log("Deployment:", deployment);

      setDeploymentId(deployment.id);

      if (deployment.status === "SUCCESS") {
        setMessage("✅ Deployment completed successfully!");
      } else if (deployment.status === "FAILED") {
        setMessage("❌ Deployment failed.");
      } else {
        setMessage(`⏳ Deployment status: ${deployment.status}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Deployment failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "700px",
        margin: "40px auto",
      }}
    >
      <h1>🚀 Deploy Project</h1>

      <p>
        <strong>Project ID:</strong> {projectId}
      </p>

      <button
        onClick={handleDeploy}
        disabled={loading}
        style={{
          padding: "10px 20px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "⏳ Deploying..." : "🚀 Start Deployment"}
      </button>

      {message && (
        <div style={{ marginTop: "20px" }}>
          <p>{message}</p>

          {deploymentId && (
            <p>
              <strong>Deployment ID:</strong> #{deploymentId}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
