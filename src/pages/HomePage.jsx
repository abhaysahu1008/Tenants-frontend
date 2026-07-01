import { Home, MessageSquare, Search, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="space-y-16">
      <section className="text-center py-16 lg:py-24">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
          Find Your Perfect<span className="text-primary-600"> Roommate</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Smart matching based on lifestyle, preferences, and budget. AI-powered
          compatibility analysis.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {isAuthenticated ? (
            <>
              <Link to="/properties">
                <Button size="lg">
                  <Search className="h-5 w-5 mr-2" />
                  Find Properties
                </Button>
              </Link>
              <Link to="/chat">
                <Button size="lg" variant="secondary">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Open Chat
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-8">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Smart Matching</h3>
          <p className="mt-2 text-gray-600">
            Algorithm-based matching considering budget, location, and
            lifestyle.
          </p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900">AI Compatibility</h3>
          <p className="mt-2 text-gray-600">
            Advanced AI analysis of roommate compatibility.
          </p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Home className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Verified Listings</h3>
          <p className="mt-2 text-gray-600">
            Browse verified properties with detailed amenities.
          </p>
        </div>
      </section>
    </div>
  );
};
