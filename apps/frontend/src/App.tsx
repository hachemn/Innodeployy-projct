import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import CreateProject from "./pages/Projects/CreateProject";
import Projects from "./pages/Projects/Projects";
import ConnectRepository from "./pages/Projects/ConnectRepository";
import Deploy from "./pages/Deployments/Deploy";
import DeploymentHistory from "./pages/Deployments/DeploymentHistory";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/create"
          element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/repository"
          element={
            <ProtectedRoute>
              <ConnectRepository />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/deploy"
          element={
            <ProtectedRoute>
              <Deploy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/deployments"
          element={
            <ProtectedRoute>
              <DeploymentHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;