"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip
);

export default function Home() {
  interface WaterLevel {
    created_at: string;
    water_level: number;
  }

  const [range, setRange] = useState<"1h" | "24h" | "7d">("24h");

  const getFromDate = () => {
    const now = new Date();
    if (range === "1h") now.setHours(now.getHours() - 1);
    else if (range === "24h") now.setHours(now.getHours() - 24);
    else now.setDate(now.getDate() - 7);
    return now;
  };

  const [data, setData] = useState<WaterLevel[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const fromDate = getFromDate();

      const { data, error } = await supabase
        .from("water_levels")
        .select("*")
        .eq("device_id", "flood-logger-01")
        .gte("created_at", fromDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) console.error(error);
      else setData(data ?? []);
    };

    fetchData();
  }, [range]);

  // Calculate time range for chart x-axis
  const fromDate = getFromDate();
  const toDate = new Date();

  const chartData = {
    labels: data.map((d) => new Date(d.created_at)),
    datasets: [
      {
        label: "Wasserstand (mm)",
        data: data.map((d) => d.water_level),
        fill: true,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.3)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: "time" as const,
        min: fromDate.getTime(),
        max: toDate.getTime(),
        time: {
          unit: "hour" as const,
          displayFormats: {
            hour: "HH:mm",
          },
        },
        title: {
          display: true,
          text: "Zeit (HH:mm)",
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        title: {
          display: true,
          text: "Wasserstand (mm)",
        },
      },
    },
  };

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">flood-logger-01</h1>
      {data.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p>Daten werden geladen...</p>
      )}
      <div className="flex gap-2 mb-4 justify-center mt-10">
        <button
          onClick={() => setRange("1h")}
          className={`px-4 py-2 rounded ${
            range === "1h" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          1h
        </button>
        <button
          onClick={() => setRange("24h")}
          className={`px-4 py-2 rounded ${
            range === "24h" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          24h
        </button>
        <button
          onClick={() => setRange("7d")}
          className={`px-4 py-2 rounded ${
            range === "7d" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          7d
        </button>
      </div>
    </main>
  );
}
