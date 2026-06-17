import React from "react";
import { Award, Lock, Calendar, Folder, Star, Users, Code } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  category: "age" | "code" | "stars" | "followers" | "languages";
}

interface MilestonesProps {
  milestones: Milestone[];
}

export const Milestones: React.FC<MilestonesProps> = ({ milestones }) => {
  // Category icon mapping
  const getCategoryIcon = (category: string, unlocked: boolean) => {
    const props = {
      size: 20,
      className: unlocked ? "milestone-icon" : "milestone-icon locked-icon",
    };
    
    switch (category) {
      case "age":
        return <Calendar {...props} />;
      case "code":
        return <Folder {...props} />;
      case "stars":
        return <Star {...props} fill={unlocked ? "currentColor" : "none"} />;
      case "followers":
        return <Users {...props} />;
      case "languages":
        return <Code {...props} />;
      default:
        return <Award {...props} />;
    }
  };

  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  return (
    <div className="milestones-card glass-card animate-fade-in">
      <div className="milestones-header">
        <h3 className="card-title">
          <Award size={18} className="title-icon" /> Account Milestones
        </h3>
        <span className="unlocked-progress badge badge-purple">
          {unlockedCount} / {milestones.length} Unlocked
        </span>
      </div>

      <div className="milestones-grid">
        {milestones.map((m) => {
          const icon = getCategoryIcon(m.category, m.unlocked);
          
          return (
            <div
              key={m.id}
              className={`milestone-item glass-card ${
                m.unlocked ? `milestone-unlocked border-${m.category}` : "milestone-locked"
              }`}
            >
              <div className="milestone-icon-wrapper">
                {icon}
                {!m.unlocked && <Lock size={10} className="lock-overlay" />}
              </div>
              <div className="milestone-details">
                <p className="milestone-name">{m.title}</p>
                <p className="milestone-desc">{m.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .milestones-card {
          padding: 24px;
        }
        .milestones-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .title-icon {
          color: var(--accent-primary);
        }
        .unlocked-progress {
          font-size: 11px;
        }
        .milestones-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .milestone-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(15, 23, 42, 0.25);
          border-radius: var(--radius-md);
          transition: var(--transition-smooth);
        }
        .milestone-unlocked:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          background: rgba(15, 23, 42, 0.45);
        }
        .milestone-locked {
          opacity: 0.5;
          background: rgba(15, 23, 42, 0.15);
          border-color: transparent;
        }
        .milestone-icon-wrapper {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid var(--border-glass);
        }
        .milestone-unlocked .milestone-icon-wrapper {
          background: var(--accent-gradient);
          color: white;
          border-color: rgba(255, 255, 255, 0.1);
        }
        .milestone-icon {
          color: white;
        }
        .locked-icon {
          color: var(--text-muted);
        }
        .lock-overlay {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background: var(--bg-secondary);
          color: var(--text-muted);
          border-radius: 50%;
          padding: 2px;
          width: 14px;
          height: 14px;
          border: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .milestone-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .milestone-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }
        .milestone-desc {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.3;
        }
        /* Custom category border styles for unlocked badges */
        .border-age { border-color: rgba(139, 92, 246, 0.2); }
        .border-code { border-color: rgba(6, 182, 212, 0.2); }
        .border-stars { border-color: rgba(245, 158, 11, 0.2); }
        .border-followers { border-color: rgba(236, 72, 153, 0.2); }
        .border-languages { border-color: rgba(16, 185, 129, 0.2); }
      `}</style>
    </div>
  );
};
