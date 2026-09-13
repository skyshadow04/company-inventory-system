"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BreakdownDatum = {
  label: string;
  count: number;
};

type InventoryBreakdownChartProps = {
  data: BreakdownDatum[];
  color: string;
  emptyMessage: string;
};

export function InventoryBreakdownChart({
  data,
  color,
  emptyMessage,
}: InventoryBreakdownChartProps) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="h-64 w-full" aria-label="Inventory breakdown chart" role="img">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
          barCategoryGap="22%"
        >
          <CartesianGrid horizontal={false} stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            axisLine={false}
            tickLine={false}
            width={92}
            tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "var(--color-muted)" }}
            contentStyle={{
              backgroundColor: "var(--color-popover)",
              borderColor: "var(--color-border)",
              borderRadius: "0.75rem",
              color: "var(--color-popover-foreground)",
            }}
            formatter={(value) => [value, "Count"]}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
