import React, { useState, useMemo } from "react";
import { Star, GitFork, AlertCircle, Search, ArrowUpDown, ExternalLink } from "lucide-react";

interface Repo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  size_kb: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  open_issues: number;
}

interface RepositoryListProps {
  repos: Repo[];
}

export const RepositoryList: React.FC<RepositoryListProps> = ({ repos }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "forks" | "size">("updated");
  const [visibleCount, setVisibleCount] = useState(6);

  // Dynamic list of languages
  const languages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return ["All", ...Array.from(langs)];
  }, [repos]);

  // Handle Filtering & Sorting
  const filteredAndSortedRepos = useMemo(() => {
    return repos
      .filter((r) => {
        const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (r.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
        const matchesLang = selectedLanguage === "All" || r.language === selectedLanguage;
        return matchesSearch && matchesLang;
      })
      .sort((a, b) => {
        if (sortBy === "stars") return b.stars - a.stars;
        if (sortBy === "forks") return b.forks - a.forks;
        if (sortBy === "size") return b.size_kb - a.size_kb;
        // Default: updated_at (date sort)
        const dateA = new Date(a.updated_at || a.pushed_at || "").getTime();
        const dateB = new Date(b.updated_at || b.pushed_at || "").getTime();
        return dateB - dateA;
      });
  }, [repos, searchQuery, selectedLanguage, sortBy]);

  // Format date
  const formatLastUpdated = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Format Size
  const formatSize = (sizeKb: number) => {
    if (sizeKb >= 1024) {
      return `${(sizeKb / 1024).toFixed(1)} MB`;
    }
    return `${sizeKb} KB`;
  };

  // Language colors mapping (simplified)
  const getLanguageColor = (lang: string | null) => {
    if (!lang) return "#475569";
    const colors: { [key: string]: string } = {
      JavaScript: "#f1e05a",
      TypeScript: "#3178c6",
      HTML: "#e34c26",
      CSS: "#563d7c",
      Python: "#3572A5",
      Go: "#00ADD8",
      Rust: "#dea584",
      Java: "#b07219",
      C: "#555555",
      "C++": "#f34b7d",
      "C#": "#178600",
      PHP: "#4F5D95",
      Ruby: "#701516",
      Shell: "#89e051",
      Swift: "#F05138",
      Kotlin: "#A97BFF",
    };
    return colors[lang] || "#cbd5e1";
  };

  return (
    <div className="repos-section animate-fade-in">
      <div className="repos-header">
        <h3 className="section-title">Repositories</h3>
        <span className="repos-count-badge badge badge-info">{filteredAndSortedRepos.length} found</span>
      </div>

      {/* Filter Toolbar */}
      <div className="filters-toolbar glass-card">
        <div className="filter-search-group">
          <Search className="search-icon-small" size={16} />
          <input
            type="text"
            placeholder="Search repos..."
            className="search-input-small"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(6); // Reset pagination on search
            }}
          />
        </div>
        
        <div className="filter-controls">
          {/* Language filter */}
          <div className="select-container">
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setVisibleCount(6); // Reset pagination on language change
              }}
              className="glass-select"
            >
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l === "All" ? "All Languages" : l}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selection */}
          <div className="select-container">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="glass-select"
            >
              <option value="updated">Recently Updated</option>
              <option value="stars">Stars Count</option>
              <option value="forks">Forks Count</option>
              <option value="size">Size</option>
            </select>
          </div>
        </div>
      </div>

      {/* Repo Grid */}
      {filteredAndSortedRepos.length === 0 ? (
        <div className="empty-repos glass-card">
          <AlertCircle size={24} className="text-muted" />
          <p>No repositories found matching current filters.</p>
        </div>
      ) : (
        <>
          <div className="repos-grid">
            {filteredAndSortedRepos.slice(0, visibleCount).map((repo) => (
              <div key={repo.name} className="repo-card glass-card glass-card-interactive">
                <div className="repo-card-header">
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-name-link">
                    {repo.name} <ExternalLink size={12} className="external-icon" />
                  </a>
                  <span className="repo-size">{formatSize(repo.size_kb)}</span>
                </div>
                
                <p className="repo-desc">{repo.description || "No description provided."}</p>
                
                <div className="repo-card-footer">
                  {repo.language && (
                    <div className="repo-language">
                      <span className="lang-dot" style={{ backgroundColor: getLanguageColor(repo.language) }}></span>
                      <span>{repo.language}</span>
                    </div>
                  )}
                  
                  <div className="repo-stats">
                    <span className="repo-stat" title="Stars">
                      <Star size={14} /> {repo.stars}
                    </span>
                    <span className="repo-stat" title="Forks">
                      <GitFork size={14} /> {repo.forks}
                    </span>
                    <span className="repo-updated" title="Last updated">
                      Updated {formatLastUpdated(repo.updated_at || repo.pushed_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < filteredAndSortedRepos.length && (
            <div className="load-more-container">
              <button className="btn-secondary" onClick={() => setVisibleCount((prev) => prev + 6)}>
                Show More Repositories
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .repos-section {
          width: 100%;
        }
        .repos-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 700;
        }
        .repos-count-badge {
          font-size: 11px;
        }
        .filters-toolbar {
          display: flex;
          flex-wrap: wrap;
          padding: 12px 16px;
          gap: 16px;
          align-items: center;
          margin-bottom: 20px;
          background: rgba(15, 23, 42, 0.3);
        }
        .filter-search-group {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 200px;
        }
        .search-icon-small {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .search-input-small {
          width: 100%;
          padding: 8px 12px;
          padding-left: 36px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          outline: none;
          font-family: inherit;
          font-size: 14px;
          transition: var(--transition-smooth);
        }
        .search-input-small:focus {
          border-color: var(--accent-primary);
        }
        .filter-controls {
          display: flex;
          gap: 12px;
        }
        .select-container {
          position: relative;
        }
        .glass-select {
          appearance: none;
          -webkit-appearance: none;
          background-color: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          padding: 8px 30px 8px 12px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .glass-select:focus {
          border-color: var(--accent-primary);
        }
        .select-container::after {
          content: "▾";
          font-size: 12px;
          color: var(--text-muted);
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .glass-select option {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }
        .repos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .repo-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 160px;
          background: rgba(15, 23, 42, 0.3);
        }
        .repo-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }
        .repo-name-link {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .repo-name-link:hover {
          color: var(--accent-secondary);
        }
        .external-icon {
          opacity: 0.5;
        }
        .repo-size {
          font-size: 11px;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid var(--border-glass);
          white-space: nowrap;
        }
        .repo-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          flex-grow: 1;
        }
        .repo-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-glass);
          padding-top: 12px;
          font-size: 12px;
        }
        .repo-language {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
        }
        .lang-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .repo-stats {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
        }
        .repo-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-secondary);
        }
        .repo-updated {
          border-left: 1px solid var(--border-glass);
          padding-left: 12px;
        }
        .empty-repos {
          padding: 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
        }
        .load-more-container {
          display: flex;
          justify-content: center;
          margin-top: 10px;
        }
        @media (max-width: 640px) {
          .filters-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-controls {
            justify-content: space-between;
          }
          .glass-select {
            width: 100%;
          }
          .select-container {
            flex: 1;
          }
          .repos-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
