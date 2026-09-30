import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/user.service";

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error(error);

        localStorage.removeItem("token");
        navigate("/");
      }
    }

    loadUser();
  }, [navigate]);

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Welcome to InnoDeploy 🚀</h1>

      {user && (
        <>
          <p><strong>Name:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </>
      )}

      <button onClick={logout}>
        Logout
      </button>
      <button onClick={() => navigate("/projects")}>
        My Projects
      </button>

      <button onClick={() => navigate("/projects/create")}>
        Create Project
      </button>
    </div>
  );
}