"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Banknote, Hash, TrendingUp, Shield } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Rental {
  created_at: string;
  revenue: number | null;
  deposit_status: string | null;
  deposit_amount: number | null;
}

interface DashboardChartsProps {
  rentals: Rental[];
}

interface ChartDataPoint {
  name: string;
  revenue: number;
  rides: number;
  date: Date;
}

type FilterOption = "ytd" | "90_days" | "30_days";

export default function DashboardCharts({ rentals }: DashboardChartsProps) {
  const [filter, setFilter] = useState<FilterOption>("ytd");

  const { chartData, totalRevenue, totalRides, avgRevenue, totalDepositsHeld } = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (filter) {
      case "30_days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90_days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "ytd":
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Filter rentals based on selected time range
    const filteredRentals = rentals.filter((rental) => {
      const rentalDate = new Date(rental.created_at);
      return rentalDate >= startDate && rentalDate <= now;
    });

    // aggregate totals
    const totalRevenue = filteredRentals.reduce((sum, rental) => sum + (rental.revenue ?? 0), 0);
    const totalRides = filteredRentals.length;
    const avgRevenue = totalRides > 0 ? totalRevenue / totalRides : 0;
    const totalDepositsHeld = filteredRentals.reduce((sum, rental) => {
      if (rental.deposit_status === "collected") {
        return sum + Number(rental.deposit_amount ?? 0);
      }
      return sum;
    }, 0);

    // Group rentals by day or month
    const grouped = new Map<string, { revenue: number; rides: number; date: Date }>();

    filteredRentals.forEach((rental) => {
      const rentalDate = new Date(rental.created_at);
      let key: string;
      let groupDate: Date;

      if (filter === "30_days") {
        // Group by day
        const month = rentalDate.toLocaleString("en-US", { month: "short" });
        const day = rentalDate.getDate();
        key = `${month} ${day}`;
        groupDate = new Date(rentalDate.getFullYear(), rentalDate.getMonth(), rentalDate.getDate());
      } else {
        // Group by month
        key = rentalDate.toLocaleString("en-US", { month: "short" });
        groupDate = new Date(rentalDate.getFullYear(), rentalDate.getMonth(), 1);
      }

      const existing = grouped.get(key);
      if (existing) {
        existing.revenue += rental.revenue ?? 0;
        existing.rides += 1;
      } else {
        grouped.set(key, {
          revenue: rental.revenue ?? 0,
          rides: 1,
          date: groupDate,
        });
      }
    });

    // Convert to array and sort chronologically
    const result: ChartDataPoint[] = Array.from(grouped.entries()).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      rides: data.rides,
      date: data.date,
    }));

    result.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      chartData: result,
      totalRevenue,
      totalRides,
      avgRevenue,
      totalDepositsHeld,
    };
  }, [rentals, filter]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
    valuePrefix = "",
    valueSuffix = "",
  }: {
    active?: boolean;
    payload?: { value: number; name: string }[];
    label?: string;
    valuePrefix?: string;
    valueSuffix?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            {valuePrefix}
            {payload[0].value.toLocaleString()}
            {valueSuffix}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Performance Trends</h2>
        <div className="flex justify-end">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ytd">Year to Date</option>
            <option value="90_days">Last 3 Months</option>
            <option value="30_days">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex h-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Revenue</p>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50/80">
              <Banknote className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="flex h-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Rides</p>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{totalRides}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50/80">
              <Hash className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="flex h-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Avg Revenue per Ride</p>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(avgRevenue)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50/80">
              <TrendingUp className="h-5 w-5 text-sky-600" />
            </div>
          </div>
        </div>
        <div className="flex h-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Deposits Held</p>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(totalDepositsHeld)}</p>
              <Link href="/dashboard/history" className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline block">
                Manage in History →
              </Link>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50/80">
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Revenue</h3>
          {chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available for selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip valuePrefix="$" />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ride Volume Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Ride Volume</h3>
          {chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available for selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="ridesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip valueSuffix=" rides" />} />
                <Area
                  type="monotone"
                  dataKey="rides"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#ridesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
