import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/components/theme-provider";

interface DataPoint {
  hour: number;
  users: number;
}

interface ActiveUsersChartProps {
  data: DataPoint[];
}

const ActiveUsersChart = ({ data }: ActiveUsersChartProps) => {
  const { theme } = useTheme();
  const [formattedData, setFormattedData] = useState<any[]>([]);

  useEffect(() => {
    if (data && data.length) {
      const formatted = data.map((point) => ({
        ...point,
        hour: `${point.hour}:00`,
      }));
      setFormattedData(formatted);
    }
  }, [data]);

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const areaColor = isDark ? "rgba(37, 99, 235, 0.2)" : "rgba(37, 99, 235, 0.1)";
  const strokeColor = isDark ? "#3b82f6" : "#2563eb";
  const axisColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "rgba(107, 114, 128, 0.2)" : "rgba(107, 114, 128, 0.1)";
  const tooltipBackground = isDark ? "#1f2937" : "#ffffff";
  const tooltipTextColor = isDark ? "#ffffff" : "#000000";
  const tooltipBorderColor = isDark ? "#374151" : "#e5e7eb";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="glass shadow-lg rounded-md p-2 text-sm border"
          style={{
            backgroundColor: tooltipBackground,
            color: tooltipTextColor,
            border: `1px solid ${tooltipBorderColor}`,
          }}
        >
          <p className="font-medium">{label}</p>
          <p className="text-primary font-bold">Active Users: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="hour" tick={{ fontSize: 12, fill: axisColor }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12, fill: axisColor }} tickLine={false} axisLine={false} tickCount={5} tickMargin={10} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="users" stroke={strokeColor} strokeWidth={2} fill="url(#colorUsers)" activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActiveUsersChart;
