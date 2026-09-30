import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { connectRepository } from "../../services/project.service";

export default function ConnectRepository() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [branch, setBranch] = useState("main");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!projectId) {
      alert("Project ID is missing");
      return;
    }

    try {
      await connectRepository(Number(projectId), {
        provider: "GITHUB",
        url,
        branch,
      });

      alert("Repository connected successfully!");

      navigate("/projects");
    } catch (error) {
      console.error(error);
      alert("Failed to connect repository");
    }
  };

  return (
    <div style={{ width: "500px", margin: "50px auto" }}>
      <h1>Connect Repository</h1>

      <p>Project ID: {projectId}</p>

      <form onSubmit={handleSubmit}>
        <label>Provider</label>

        <select
          value="GITHUB"
          disabled
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
          }}
        >
          <option value="GITHUB">GitHub</option>
        </select>

        <label>Repository URL</label>

        <input
          type="url"
          placeholder="https://github.com/user/repository"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
          }}
        />

        <label>Branch</label>

        <input
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
          }}
        />

        <button type="submit">
          Connect Repository
        </button>
      </form>
    </div>
  );
}