import { useState } from "react";
import { SearchScreen } from "./components/SearchScreen";
import { DashboardScreen } from "./components/DashboardScreen";

function App() {
  const [statsData, setStatsData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (username: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stats/${username}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setStatsData(data);

      // Add to recent searches in localStorage
      const saved = localStorage.getItem("gitpulse_recent_searches");
      let recentList = [];
      if (saved) {
        try {
          recentList = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }

      // Filter out current username if it already exists, then push to front
      recentList = recentList.filter((item: any) => item.username.toLowerCase() !== username.toLowerCase());
      recentList.unshift({
        username: data.user.login,
        avatar_url: data.user.avatar_url,
      });

      // Keep only top 8 searches
      recentList = recentList.slice(0, 8);
      localStorage.setItem("gitpulse_recent_searches", JSON.stringify(recentList));

    } catch (err: any) {
      console.error("Error analyzing user:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setStatsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStatsData(null);
    setError(null);
  };

  return (
    <div className="app-container">
      {isLoading && !statsData ? (
        <div className="spinner-container animate-fade-in">
          <div className="spinner"></div>
          <h2 className="gradient-text">Analyzing GitHub Profile...</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "14px" }}>
            Aggregating repositories, language profiles, activity events, and milestones.
          </p>
        </div>
      ) : statsData ? (
        <DashboardScreen data={statsData} onBack={handleBack} onSearch={handleSearch} />
      ) : (
        <SearchScreen onSearch={handleSearch} isLoading={isLoading} error={error} />
      )}
    </div>
  );
}

export default App;
