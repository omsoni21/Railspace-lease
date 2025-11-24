"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { assetUtilizationData } from "@/lib/data";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function AssetUtilizationChart() {
  return (
    <div className="w-full h-[250px]">
      <ChartContainer
        config={{
          utilization: {
            label: "Utilization",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="min-h-[250px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={assetUtilizationData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="type"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis unit="%" />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="utilization"
              fill="var(--color-utilization)"
              radius={4}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
