import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AiMatchProvider } from "./context/AiMatchContext";
import { ApplicationProvider } from "./context/ApplicationContext";
import { AuthProvider } from "./context/AuthContext";
// import { ChatProvider } from "./context/ChatContext";
import { PropertyProvider } from "./context/PropertyContext";
import "./index.css";
import { ApplicationsPage } from "./pages/ApplicationsPage";
// import { ChatPage } from "./pages/ChatPage";
import { CreatePropertyPage } from "./pages/CreatePropertyPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MatchesPage } from "./pages/MatchesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PropertiesPage } from "./pages/PropertiesPage";
import { PropertyDetailPage } from "./pages/PropertyDetailPage";
import { SignupPage } from "./pages/SignupPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PropertyProvider>
          <ApplicationProvider>
            <AiMatchProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route
                    path="/properties"
                    element={
                      <ProtectedRoute>
                        <PropertiesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/properties/:propertyId"
                    element={
                      <ProtectedRoute>
                        <PropertyDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/properties/create"
                    element={
                      <ProtectedRoute>
                        <CreatePropertyPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/matches"
                    element={
                      <ProtectedRoute>
                        <MatchesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/applications"
                    element={
                      <ProtectedRoute>
                        <ApplicationsPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    }
                  /> */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            </AiMatchProvider>
          </ApplicationProvider>
        </PropertyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
