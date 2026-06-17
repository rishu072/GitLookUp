import React, { useState, useEffect } from "react";
import { Search, History, Shield, AlertTriangle, Github } from "lucide-react";

interface SearchScreenProps {
  onSearch: (username: string) => void;
  isLoading: boolean;
  error: string | null;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset_time: number;
  authenticated: boolean;
  error?: string;
}

interface RecentSearch {
  username: string;
  avatar_url: string;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onSearch, isLoading, error }) => {
  const [username, setUsername] = useState("");
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    // Fetch rate limit details
    fetch("/api/rate-limit")
      .then((res) => res.json())
      .then((data) => setRateLimit(data))
      .catch((err) => console.error("Error fetching rate limit:", err));

    // Load recent searches from localStorage
    const saved = localStorage.getItem("gitpulse_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  const handleRecentClick = (user: string) => {
    setUsername(user);
    onSearch(user);
  };

  const handleClearRecents = () => {
    localStorage.removeItem("gitpulse_recent_searches");
    setRecentSearches([]);
  };

  // Format rate limit reset time
  const getResetMinutes = () => {
    if (!rateLimit) return "";
    const diffMs = (rateLimit.reset_time * 1000) - Date.now();
    const mins = Math.ceil(diffMs / 60000);
    return mins > 0 ? `${mins}m` : "soon";
  };

  return (
    <div className="search-container animate-fade-in">
      {/* Rate Limit Stats Banner */}
      {rateLimit && (
        <div className="rate-limit-badge glass-card">
          <Shield size={14} className={rateLimit.authenticated ? "text-success" : "text-warning"} />
          <span>
            Rate Limit: <strong>{rateLimit.remaining}</strong>/<strong>{rateLimit.limit}</strong>
          </span>
          {!rateLimit.authenticated && (
            <span className="unauth-warning tooltip-trigger">
              <AlertTriangle size={12} style={{ color: "var(--text-warning)" }} />
              <span className="tooltip">Using unauthenticated requests. Add a GITHUB_TOKEN to raise limit to 5000/hr.</span>
            </span>
          )}
          {rateLimit.remaining < rateLimit.limit && (
            <span className="reset-time">resets in {getResetMinutes()}</span>
          )}
        </div>
      )}

      <div className="search-hero">
        <div className="search-logo">
          <Github size={40} />
        </div>
        <h1 className="search-title gradient-text">GitPulse</h1>
        <p className="search-subtitle">Real-time GitHub profiles, repository stats, milestones & analytics.</p>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          <Search className="input-icon" size={20} />
          <input
            type="text"
            className="glass-input"
            placeholder="Enter GitHub username (e.g. torvalds)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
        </div>
        <button type="submit" className="btn-primary btn-search" disabled={isLoading || !username.trim()}>
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {error && (
        <div className="error-banner glass-card">
          <AlertTriangle size={18} className="text-error" />
          <div className="error-content">
            <p className="error-title">Analysis Failed</p>
            <p className="error-message">{error}</p>
          </div>
        </div>
      )}

      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <div className="recent-header">
            <span className="recent-title-text">
              <History size={16} /> Recent Analyses
            </span>
            <button className="clear-recents-btn" onClick={handleClearRecents}>
              Clear
            </button>
          </div>
          <div className="recent-grid">
            {recentSearches.map((item) => (
              <div
                key={item.username}
                className="recent-card glass-card glass-card-interactive"
                onClick={() => handleRecentClick(item.username)}
              >
                <img src={item.avatar_url} alt={item.username} className="recent-avatar" />
                <span className="recent-name">{item.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Styled JSX for local search screen components */}
      <style>{`
        .search-container {
          max-width: 600px;
          margin: 80px auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 20px;
        }
        .rate-limit-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 40px;
          background: rgba(15, 23, 42, 0.4);
        }
        .text-success {
          color: var(--text-success);
        }
        .text-warning {
          color: var(--text-warning);
        }
        .unauth-warning {
          display: flex;
          align-items: center;
          cursor: help;
        }
        .reset-time {
          font-size: 11px;
          color: var(--text-muted);
          border-left: 1px solid var(--border-glass);
          padding-left: 8px;
        }
        .search-hero {
          text-align: center;
          margin-bottom: 35px;
        }
        .search-logo {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: var(--accent-gradient);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.25);
        }
        .search-title {
          font-size: 44px;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 12px;
        }
        .search-subtitle {
          color: var(--text-secondary);
          font-size: 16px;
          max-width: 440px;
          margin: 0 auto;
          line-height: 1.5;
        }
        .search-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 40px;
        }
        .btn-search {
          width: 100%;
        }
        .error-banner {
          width: 100%;
          display: flex;
          gap: 12px;
          padding: 16px;
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.04);
          margin-bottom: 30px;
        }
        .text-error {
          color: var(--text-error);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .error-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .error-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 14px;
        }
        .error-message {
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.4;
        }
        .recent-searches {
          width: 100%;
        }
        .recent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 8px;
        }
        .recent-title-text {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .clear-recents-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
          transition: var(--transition-smooth);
        }
        .clear-recents-btn:hover {
          color: var(--text-error);
        }
        .recent-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
        }
        .recent-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          cursor: pointer;
          border-radius: var(--radius-md);
          background: rgba(15, 23, 42, 0.3);
        }
        .recent-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--border-glass);
        }
        .recent-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};
