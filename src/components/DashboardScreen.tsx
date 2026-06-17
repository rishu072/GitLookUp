import React, { useState } from "react";
import { ProfileCard } from "./ProfileCard";
import { RepositoryList } from "./RepositoryList";
import { LanguageChart } from "./LanguageChart";
import { Milestones } from "./Milestones";
import { TrendsChart } from "./TrendsChart";
import { ArrowLeft, Search } from "lucide-react";

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface DashboardScreenProps {
  data: any;
  onBack: () => void;
  onSearch: (username: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ data, onBack, onSearch }) => {
  const [miniQuery, setMiniQuery] = useState("");

  const handleMiniSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (miniQuery.trim()) {
      onSearch(miniQuery.trim());
      setMiniQuery("");
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Top Navbar */}
      <header className="dashboard-header glass-card">
        <div className="header-left">
          <button className="back-btn tooltip-trigger" onClick={onBack}>
            <ArrowLeft size={20} />
            <span className="tooltip">Back to Search</span>
          </button>
          <div className="brand" onClick={onBack}>
            <div className="brand-logo">
              <GithubIcon size={20} />
            </div>
            <span className="brand-name gradient-text">GitPulse</span>
          </div>
        </div>

        {/* Mini Search Input */}
        <form onSubmit={handleMiniSubmit} className="mini-search-form">
          <div className="input-group">
            <Search className="input-icon-mini" size={14} />
            <input
              type="text"
              placeholder="Search another username..."
              className="mini-search-input"
              value={miniQuery}
              onChange={(e) => setMiniQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Cache status badge */}
        <div className="header-right">
          {data.cached && (
            <div className="badge badge-success cache-badge tooltip-trigger">
              <span>Cached</span>
              <span className="tooltip">Served instantly from local backend file cache</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        {/* Left Column (Metadata/Overview) */}
        <div className="grid-column-left">
          <ProfileCard user={data.user} />
          <LanguageChart languages={data.languages} />
        </div>

        {/* Right Column (Analytics details) */}
        <div className="grid-column-right">
          <Milestones milestones={data.milestones} />
          
          <div className="trends-container">
            <TrendsChart repoCreationTrend={data.repo_creation_trend} followerTrend={data.follower_trend} />
          </div>

          <RepositoryList repos={data.repos} />
        </div>
      </div>

      <style>{`
        .dashboard-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          background: var(--bg-glass);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .back-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .brand-logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .brand-name {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .mini-search-form {
          width: 280px;
        }
        .input-icon-mini {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .mini-search-input {
          width: 100%;
          padding: 8px 14px;
          padding-left: 36px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          outline: none;
          font-family: inherit;
          font-size: 13px;
          transition: var(--transition-smooth);
        }
        .mini-search-input:focus {
          border-color: var(--accent-primary);
          background: rgba(15, 23, 42, 0.6);
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cache-badge {
          cursor: help;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
        }
        .grid-column-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .grid-column-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .trends-container {
          width: 100%;
        }
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .grid-column-left {
            max-width: 100%;
          }
        }
        @media (max-width: 640px) {
          .dashboard-header {
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            align-items: stretch;
          }
          .mini-search-form {
            width: 100%;
          }
          .header-right {
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};
