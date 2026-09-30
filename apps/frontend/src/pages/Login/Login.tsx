import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth.service";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const data = await login(email, password);
      
      localStorage.setItem("token", data.access_token);

      alert("Login successful!");

      navigate("/dashboard");
    } catch (error) {
      alert("Invalid email or password");
      console.error(error);
    }
  };

  return (
    <div
      style={{
        width: "350px",
        margin: "100px auto",
        textAlign: "center",
      }}
    >
      <h1>InnoDeploy</h1>

      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}