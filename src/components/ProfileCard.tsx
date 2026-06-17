import React from "react";
import { MapPin, Briefcase, Link as LinkIcon, Twitter, Calendar, Users, Folder, Code } from "lucide-react";

interface ProfileCardProps {
  user: {
    login: string;
    name: string;
    avatar_url: string;
    html_url: string;
    bio: string | null;
    location: string | null;
    blog: string | null;
    twitter: string | null;
    company: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
  };
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  // Format Date (e.g. June 17, 2026)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate detailed account age
  const calculateAccountAge = (dateString: string) => {
    const createdDate = new Date(dateString);
    const now = new Date();
    
    let years = now.getFullYear() - createdDate.getFullYear();
    let months = now.getMonth() - createdDate.getMonth();
    let days = now.getDate() - createdDate.getDate();

    if (days < 0) {
      months -= 1;
      // Get days in previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { years, months, days };
  };

  const age = calculateAccountAge(user.created_at);

  return (
    <div className="profile-card glass-card animate-fade-in">
      <div className="profile-cover"></div>
      
      <div className="profile-header">
        <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="avatar-link">
          <img src={user.avatar_url} alt={user.login} className="profile-avatar" />
        </a>
        <div className="profile-titles">
          <h2 className="profile-name">{user.name}</h2>
          <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="profile-username">
            @{user.login}
          </a>
        </div>
      </div>

      <div className="profile-body">
        {user.bio && <p className="profile-bio">{user.bio}</p>}

        {/* GitHub Anniversary Badge */}
        <div className="anniversary-section">
          <div className="anniversary-badge badge-purple tooltip-trigger">
            <Calendar size={14} />
            <span>
              {age.years > 0 ? `${age.years} Year${age.years > 1 ? "s" : ""} on GitHub` : "Joined GitHub Recently"}
            </span>
            <span className="tooltip">
              Account age: {age.years}y, {age.months}m, {age.days}d
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{user.followers.toLocaleString()}</span>
            <span className="stat-label">
              <Users size={12} /> Followers
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.following.toLocaleString()}</span>
            <span className="stat-label">
              <Users size={12} /> Following
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.public_repos.toLocaleString()}</span>
            <span className="stat-label">
              <Folder size={12} /> Repositories
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.public_gists.toLocaleString()}</span>
            <span className="stat-label">
              <Code size={12} /> Gists
            </span>
          </div>
        </div>

        {/* Meta Info List */}
        <div className="meta-list">
          {user.location && (
            <div className="meta-item">
              <MapPin size={16} className="meta-icon" />
              <span>{user.location}</span>
            </div>
          )}
          {user.company && (
            <div className="meta-item">
              <Briefcase size={16} className="meta-icon" />
              <span>{user.company}</span>
            </div>
          )}
          {user.blog && (
            <div className="meta-item">
              <LinkIcon size={16} className="meta-icon" />
              <a href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer">
                {user.blog.replace(/https?:\/\/(www\.)?/, "")}
              </a>
            </div>
          )}
          {user.twitter && (
            <div className="meta-item">
              <Twitter size={16} className="meta-icon" />
              <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer">
                @{user.twitter}
              </a>
            </div>
          )}
          <div className="meta-item">
            <Calendar size={16} className="meta-icon" />
            <span>Joined {formatDate(user.created_at)}</span>
          </div>
        </div>
      </div>

      <style>{`
        .profile-card {
          overflow: hidden;
          height: fit-content;
        }
        .profile-cover {
          height: 80px;
          background: var(--accent-gradient);
          opacity: 0.8;
          border-bottom: 1px solid var(--border-glass);
        }
        .profile-header {
          display: flex;
          align-items: flex-end;
          padding: 0 24px;
          margin-top: -40px;
          gap: 16px;
          margin-bottom: 20px;
        }
        .profile-avatar {
          width: 96px;
          height: 96px;
          border-radius: 24px;
          border: 4px solid var(--bg-secondary);
          background: var(--bg-secondary);
          box-shadow: var(--shadow-glass);
          object-fit: cover;
          transition: var(--transition-smooth);
        }
        .profile-avatar:hover {
          transform: scale(1.05) rotate(2deg);
        }
        .profile-titles {
          margin-bottom: 8px;
        }
        .profile-name {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .profile-username {
          font-size: 14px;
          color: var(--accent-secondary);
        }
        .profile-body {
          padding: 0 24px 24px 24px;
        }
        .profile-bio {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .anniversary-section {
          margin-bottom: 20px;
        }
        .anniversary-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-weight: 500;
          font-size: 13px;
          cursor: default;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .stat-item {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          padding: 12px;
          text-align: center;
          transition: var(--transition-smooth);
        }
        .stat-item:hover {
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(15, 23, 42, 0.6);
        }
        .stat-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .meta-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-top: 1px solid var(--border-glass);
          padding-top: 20px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .meta-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .meta-item a {
          color: var(--text-secondary);
        }
        .meta-item a:hover {
          color: var(--accent-secondary);
        }
      `}</style>
    </div>
  );
};
