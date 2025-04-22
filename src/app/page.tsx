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

  const [data, setData] = useState<WaterLevel[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("water_levels")
        .select("*")
        .eq("device_id", "flood-logger-01")
        .order("created_at", { ascending: true });

      if (error) console.error(error);
      else setData(data ?? []);
    };

    fetchData();
  }, []);

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
    </main>
  );
}
