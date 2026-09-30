import { useState } from "react";
import { createProject } from "../../services/project.service";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      await createProject({
        name,
        description,
      });

      alert("Project created successfully!");

      setName("");
      setDescription("");
    } catch (error) {
      console.error(error);
      alert("Failed to create project");
    }
  };

  return (
    <div style={{ width: "500px", margin: "50px auto" }}>
      <h1>Create Project</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
          }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            height: "120px",
            padding: "10px",
            marginBottom: "20px",
          }}
        />

        <button type="submit">
          Create Project
        </button>
      </form>
    </div>
  );
}