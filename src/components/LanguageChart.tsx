import React, { useState } from "react";
import { PieChart } from "lucide-react";

interface LanguageChartProps {
  languages: { [key: string]: number };
}

export const LanguageChart: React.FC<LanguageChartProps> = ({ languages }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Parse languages and calculate percentages
  const parsedLanguages = React.useMemo(() => {
    const total = Object.values(languages).reduce((sum, val) => sum + val, 0);
    if (total === 0) return [];
    
    return Object.entries(languages)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Take top 6 languages
  }, [languages]);

  if (parsedLanguages.length === 0) {
    return (
      <div className="language-chart-card glass-card">
        <h3 className="card-title">Language Distribution</h3>
        <div className="empty-chart">No language statistics available.</div>
      </div>
    );
  }

  // Neon colors matching our design theme
  const colors = ["#8b5cf6", "#06b6d4", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];
  
  // Doughnut properties
  const radius = 70;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius; // ~439.82

  let accumulatedPercentage = 0;

  return (
    <div className="language-chart-card glass-card animate-fade-in">
      <div className="chart-header">
        <h3 className="card-title">
          <PieChart size={18} className="title-icon" /> Language Profile
        </h3>
      </div>

      <div className="chart-body">
        {/* SVG Doughnut Chart */}
        <div className="svg-chart-container">
          <svg width="200" height="200" viewBox="0 0 200 200" className="doughnut-svg">
            <g transform="rotate(-90 100 100)">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke="var(--border-glass)"
                strokeWidth={strokeWidth}
              />
              
              {/* Data Slices */}
              {parsedLanguages.map((lang, index) => {
                const percentage = lang.percentage;
                const strokeLength = (percentage / 100) * circumference;
                const strokeOffset = circumference - (accumulatedPercentage / 100) * circumference;
                accumulatedPercentage += percentage;
                
                const isHovered = hoveredIndex === index;
                const color = colors[index % colors.length];

                return (
                  <circle
                    key={lang.name}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    style={{
                      transition: "stroke-width 0.2s ease, filter 0.2s ease",
                      cursor: "pointer",
                      filter: isHovered ? `drop-shadow(0 0 8px ${color})` : "none",
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </g>
            
            {/* Center label */}
            <circle cx="100" cy="100" r={radius - strokeWidth} fill="var(--bg-secondary)" />
            <text
              x="100"
              y="98"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--text-primary)"
              style={{ fontSize: "20px", fontWeight: 700 }}
            >
              {hoveredIndex !== null 
                ? `${parsedLanguages[hoveredIndex].percentage.toFixed(0)}%` 
                : `${parsedLanguages.length}`}
            </text>
            <text
              x="100"
              y="120"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--text-secondary)"
              style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}
            >
              {hoveredIndex !== null ? parsedLanguages[hoveredIndex].name : "Languages"}
            </text>
          </svg>
        </div>

        {/* Chart Legend List */}
        <div className="chart-legend">
          {parsedLanguages.map((lang, index) => {
            const isHovered = hoveredIndex === index;
            const color = colors[index % colors.length];
            return (
              <div
                key={lang.name}
                className={`legend-item ${isHovered ? "legend-item-active" : ""}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span className="legend-color-dot" style={{ backgroundColor: color }}></span>
                <span className="legend-name">{lang.name}</span>
                <span className="legend-count">{lang.count} repo{lang.count > 1 ? "s" : ""}</span>
                <span className="legend-pct">{lang.percentage.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .language-chart-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          height: fit-content;
        }
        .chart-header {
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
        .chart-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .svg-chart-container {
          position: relative;
          width: 200px;
          height: 200px;
        }
        .doughnut-svg {
          width: 100%;
          height: 100%;
        }
        .chart-legend {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid var(--border-glass);
          padding-top: 16px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          transition: var(--transition-smooth);
          font-size: 13px;
          cursor: pointer;
        }
        .legend-item:hover, .legend-item-active {
          background: rgba(255, 255, 255, 0.04);
        }
        .legend-color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 10px;
          flex-shrink: 0;
        }
        .legend-name {
          font-weight: 500;
          color: var(--text-primary);
          flex-grow: 1;
        }
        .legend-count {
          color: var(--text-muted);
          font-size: 12px;
          margin-right: 12px;
        }
        .legend-pct {
          font-weight: 600;
          color: var(--text-secondary);
        }
        .empty-chart {
          padding: 40px 0;
          text-align: center;
          color: var(--text-secondary);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};
