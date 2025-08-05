import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/homepage/Homepage.jsx";
import "./styles/global.scss";
import Login from "./pages/login/Login.jsx";
import Register from "./pages/register/Register.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Explore from "./pages/explore/Explore.jsx";
import CreateEvent from "./pages/create-event/CreateEvent.jsx";
import Announcements from "./pages/announcements/Announcements.jsx";
import AnnouncementDetail from "./pages/announcements/AnnouncementDetail.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminRegister from "./pages/admin/AdminRegister.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import CreateGroup from "./pages/create-group/CreateGroup.jsx";
import GroupChat from "./pages/group/GroupChat.jsx";
import GroupDetails from "./pages/group/GroupDetails.jsx";
import ShareResource from "./pages/share-resource/ShareResource.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Books from "./pages/books/Books.jsx";

// Protected Route Component with role-based access
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Admin Public Route Component (for admin login/register)
const AdminPublicRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  console.log("AdminPublicRoute - Token check:", adminToken ? "Token exists" : "No token");
  
  if (adminToken) {
    console.log("Admin token found, redirecting to dashboard");
    return <Navigate to="/admin/dashboard" replace />;
  }

  console.log("No admin token, showing login/register page");
  return children;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  console.log("AdminProtectedRoute - Token check:", adminToken ? "Token exists" : "No token");
  
  if (!adminToken) {
    console.log("No admin token, redirecting to login");
    return <Navigate to="/admin/login" replace />;
  }

  console.log("Admin token found, allowing access to dashboard");
  return children;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="global-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/admin/login" element={
          <AdminPublicRoute>
            <AdminLogin />
          </AdminPublicRoute>
        } />
        <Route path="/admin/register" element={
          <AdminPublicRoute>
            <AdminRegister />
          </AdminPublicRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        } />
        <Route path="/create-event" element={
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        } />
        <Route path="/create-group" element={
          <ProtectedRoute>
            <CreateGroup />
          </ProtectedRoute>
        } />
        <Route path="/announcements" element={
          <ProtectedRoute>
            <Announcements />
          </ProtectedRoute>
        } />
        <Route path="/announcement/:id" element={
          <ProtectedRoute>
            <AnnouncementDetail />
          </ProtectedRoute>
        } />
        <Route path="/group/:id" element={
          <ProtectedRoute>
            <GroupDetails />
          </ProtectedRoute>
        } />
        <Route path="/group/:id/chat" element={
          <ProtectedRoute>
            <GroupChat />
          </ProtectedRoute>
        } />
        <Route path="/share-resource" element={
          <ProtectedRoute>
            <ShareResource />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/books" element={
          <ProtectedRoute>
            <Books />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
