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

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();

        setProjects(data);

        // Check repository for every project
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
      }
    }

    loadProjects();
  }, []);

  return (
    <div
      style={{
        width: "700px",
        margin: "40px auto",
      }}
    >
      <h1>My Projects</h1>

      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        projects.map((project) => {
          const repository = repositories[project.id];

          return (
            <div
              key={project.id}
              style={{
                border: "1px solid #ccc",
                padding: "20px",
                marginBottom: "20px",
                borderRadius: "8px",
              }}
            >
              <h2>{project.name}</h2>

              <p>{project.description}</p>

      ${repository ? (
        <>
          <p>
            🟢 Repository connected
          </p>

          <p>
            <strong>Provider:</strong>{" "}
            {repository.provider}
          </p>

          <p>
            <strong>Branch:</strong>{" "}
            {repository.branch}
          </p>

          <button
            onClick={() =>
              alert(`Repository: ${repository.url}`)
            }
          >
            View Repository
          </button>

          <button
            onClick={() =>
              navigate(`/projects/${project.id}/deploy`)
            }
            style={{ marginLeft: "10px" }}
          >
            🚀 Deploy
          </button>

          <button
            onClick={() =>
              navigate(`/projects/${project.id}/deployments`)
            }
            style={{ marginLeft: "10px" }}
          >
            📜 History
          </button>
        </>
      ) : (
        <>
          <p>
            🟡 Repository not connected
          </p>

          <button
            onClick={() =>
              navigate(`/projects/${project.id}/repository`)
            }
          >
            Connect Repository
          </button>
        </>
      )}
            </div>
          );
        })
      )}
    </div>
  );
}