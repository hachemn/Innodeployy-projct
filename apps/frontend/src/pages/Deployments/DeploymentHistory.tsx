import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDeployments } from "../../services/deployment.service";

interface Deployment {
  id: number;
  status: string;
  createdAt: string;
}

export default function DeploymentHistory() {
  const { projectId } = useParams();

  const [deployments, setDeployments] = useState<Deployment[]>([]);

  useEffect(() => {
    async function loadDeployments() {
      try {
        if (!projectId) return;

        const data = await getDeployments(Number(projectId));

        setDeployments(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadDeployments();
  }, [projectId]);

  return (
    <div
      style={{
        width: "700px",
        margin: "40px auto",
      }}
    >
      <h1>📜 Deployment History</h1>

      {deployments.length === 0 ? (
        <p>No deployments yet.</p>
      ) : (
        deployments.map((deployment) => (
          <div
            key={deployment.id}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              marginBottom: "15px",
              borderRadius: "8px",
            }}
          >
            <h2>Deployment #{deployment.id}</h2>

            <p>
              <strong>Status:</strong>{" "}
              {deployment.status}
            </p>

            <p>
              <strong>Created:</strong>{" "}
              {new Date(deployment.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}