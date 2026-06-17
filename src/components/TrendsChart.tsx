import React, { useState } from "react";
import { TrendingUp } from "lucide-react";

interface TrendData {
  date: string;
  count: number;
  cumulative?: number;
}

interface TrendsChartProps {
  repoCreationTrend: TrendData[];
  followerTrend: TrendData[];
}

export const TrendsChart: React.FC<TrendsChartProps> = ({ repoCreationTrend, followerTrend }) => {
  const [activeTab, setActiveTab] = useState<"repos" | "followers">("repos");
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number; data: TrendData } | null>(null);

  const activeData = activeTab === "repos" ? repoCreationTrend : followerTrend;
  
  // Choose which count to plot (for repos, plot the cumulative growth)
  const getPlottedValue = (item: TrendData) => {
    return activeTab === "repos" && item.cumulative !== undefined ? item.cumulative : item.count;
  };

  const chartParams = React.useMemo(() => {
    if (activeData.length === 0) return null;

    const width = 500;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const values = activeData.map(getPlottedValue);
    const minVal = 0;
    const maxVal = Math.max(...values, 5); // Fallback to 5 to avoid flat charts

    const points = activeData.map((d, index) => {
      const val = getPlottedValue(d);
      const x = paddingLeft + (index / (activeData.length - 1 || 1)) * plotWidth;
      const y = paddingTop + plotHeight - (val / maxVal) * plotHeight;
      return { x, y, data: d, value: val };
    });

    // Generate path descriptions
    // Line path
    let linePath = "";
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
    }

    // Area path (closed at the bottom)
    let areaPath = "";
    if (points.length > 0) {
      areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`;
    }

    // Generate grid lines (y axis ticks)
    const yGridLines = Array.from({ length: 4 }).map((_, i) => {
      const gridVal = (maxVal / 3) * i;
      const y = paddingTop + plotHeight - (gridVal / maxVal) * plotHeight;
      return { y, label: Math.round(gridVal) };
    });

    return { width, height, points, linePath, areaPath, yGridLines, paddingTop, plotHeight, paddingLeft, plotWidth };
  }, [activeData, activeTab]);

  if (!chartParams || activeData.length < 2) {
    return (
      <div className="trends-chart-card glass-card">
        <h3 className="card-title">Growth Analytics</h3>
        <div className="empty-chart">Insufficient historic data to plot trends.</div>
      </div>
    );
  }

  const { width, height, points, linePath, areaPath, yGridLines, paddingTop, plotHeight, paddingLeft, plotWidth } = chartParams;
  const isRepos = activeTab === "repos";
  const accentColor = isRepos ? "#8b5cf6" : "#06b6d4";
  const gradientId = isRepos ? "repos-gradient" : "followers-gradient";

  return (
    <div className="trends-chart-card glass-card animate-fade-in">
      <div className="chart-header">
        <h3 className="card-title">
          <TrendingUp size={18} className="title-icon" style={{ color: accentColor }} /> Analytics Growth
        </h3>
        <div className="tabs">
          <button className={`tab ${isRepos ? "tab-active" : ""}`} onClick={() => { setActiveTab("repos"); setHoveredPoint(null); }}>
            Repos Growth
          </button>
          <button className={`tab ${!isRepos ? "tab-active" : ""}`} onClick={() => { setActiveTab("followers"); setHoveredPoint(null); }}>
            Follower Projection
          </button>
        </div>
      </div>

      <div className="chart-body">
        {/* SVG Custom Responsive Line Graph */}
        <div className="svg-container">
          <svg viewBox={`0 0 ${width} ${height}`} className="trends-svg">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {yGridLines.map((grid, index) => (
              <g key={index} className="grid-group">
                <line x1={paddingLeft} y1={grid.y} x2={width - 20} y2={grid.y} stroke="var(--border-glass)" strokeDasharray="4 4" />
                <text x={paddingLeft - 8} y={grid.y} textAnchor="end" dominantBaseline="middle" fill="var(--text-muted)" style={{ fontSize: "10px" }}>
                  {grid.label}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {points.map((p, index) => {
              // Only render standard spacing of dates to avoid overlapping labels
              const step = Math.ceil(points.length / 4);
              if (index % step !== 0 && index !== points.length - 1) return null;
              return (
                <text
                  key={index}
                  x={p.x}
                  y={height - 12}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  style={{ fontSize: "9px" }}
                >
                  {p.data.date}
                </text>
              );
            })}

            {/* Area Path */}
            <path d={areaPath} fill={`url(#${gradientId})`} />

            {/* Line Path */}
            <path d={linePath} fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Interactive Circles */}
            {points.map((p, index) => (
              <circle
                key={index}
                cx={p.x}
                cy={p.y}
                r="4"
                fill="var(--bg-secondary)"
                stroke={accentColor}
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "r 0.15s ease" }}
                onMouseEnter={() => setHoveredPoint({ index, x: p.x, y: p.y, data: p.data })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}

            {/* Hover Guides */}
            {hoveredPoint && (
              <g>
                <line
                  x1={hoveredPoint.x}
                  y1={paddingTop}
                  x2={hoveredPoint.x}
                  y2={paddingTop + plotHeight}
                  stroke="var(--border-glass)"
                  strokeWidth="1"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="6"
                  fill={accentColor}
                  stroke="white"
                  strokeWidth="1.5"
                  style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }}
                />
              </g>
            )}
          </svg>
          
          {/* Tooltip Overlay */}
          {hoveredPoint && (
            <div
              className="chart-tooltip glass-card animate-fade-in"
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100 - 32}%`,
              }}
            >
              <p className="tooltip-date">{hoveredPoint.data.date}</p>
              <p className="tooltip-value">
                {isRepos ? "Total Repos" : "Followers"}: <strong>{getPlottedValue(hoveredPoint.data)}</strong>
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .trends-chart-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
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
        .tabs {
          display: flex;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          padding: 3px;
        }
        .tab {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 4px;
          font-family: inherit;
          transition: var(--transition-smooth);
        }
        .tab-active {
          background: var(--bg-secondary);
          color: var(--text-primary);
          box-shadow: var(--shadow-glass);
        }
        .chart-body {
          position: relative;
          width: 100%;
        }
        .svg-container {
          position: relative;
          width: 100%;
        }
        .trends-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }
        .chart-tooltip {
          position: absolute;
          background: var(--bg-secondary);
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          font-size: 11px;
          pointer-events: none;
          transform: translate(-50%, -100%);
          z-index: 10;
          border: 1px solid var(--border-glass);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          white-space: nowrap;
        }
        .tooltip-date {
          color: var(--text-muted);
          margin-bottom: 2px;
          font-size: 10px;
        }
        .tooltip-value {
          color: var(--text-primary);
        }
        .empty-chart {
          padding: 60px 0;
          text-align: center;
          color: var(--text-secondary);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};
