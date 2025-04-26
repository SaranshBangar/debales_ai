import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/components/theme-provider";

interface DataPoint {
  category: string;
  value: number;
}

interface ActivityMetricsChartProps {
  data: DataPoint[];
}

const ActivityMetricsChart = ({ data }: ActivityMetricsChartProps) => {
  const { theme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const barColor = isDark ? "#3b82f6" : "#2563eb";
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
          <p className="text-primary font-bold">Value: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 12, fill: axisColor }}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12, fill: axisColor }} tickLine={false} axisLine={false} tickCount={5} tickMargin={10} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityMetricsChart;
