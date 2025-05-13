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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Share2, Clock, Droplets, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

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

  const [range, setRange] = useState<"1h" | "6h" | "24h" | "7d">("24h");
  const [isLoading, setIsLoading] = useState(true);
  const [latestLevel, setLatestLevel] = useState<number | null>(null);
  const sensorInfo = {
    name: "Prototype",
    location: "portable",
    coordinates: { lat: 47.7148527772346, lng: 10.314041233282435 },
  };

  const getFromDate = () => {
    const now = new Date();
    if (range === "1h") now.setHours(now.getHours() - 1);
    else if (range === "6h") now.setHours(now.getHours() - 6);
    else if (range === "24h") now.setHours(now.getHours() - 24);
    else now.setDate(now.getDate() - 7);
    return now;
  };

  const [data, setData] = useState<WaterLevel[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const fromDate = getFromDate();

      const { data, error } = await supabase
        .from("water_levels")
        .select("*")
        .eq("device_id", "flood-logger-01")
        .gte("created_at", fromDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) console.error(error);
      else {
        setData(data ?? []);
        if (data && data.length > 0) {
          setLatestLevel(data[data.length - 1].water_level);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [range]);

  const handleShare = async () => {
    const url = `${window.location.origin}/sensor/${sensorInfo.name}?range=${range}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
      console.error(err);
    }
  };

  const handleLocationClick = () => {
    window.open(
      `https://www.google.com/maps?q=${sensorInfo.coordinates.lat},${sensorInfo.coordinates.lng}`,
      "_blank"
    );
  };

  // Calculate time range for chart x-axis
  const fromDate = getFromDate();
  const toDate = new Date();

  const chartData = {
    labels: data.map((d) => new Date(d.created_at)),
    datasets: [
      {
        label: "Water Level (mm)",
        data: data.map((d) => d.water_level),
        fill: true,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.6,
        borderWidth: 2,
        cubicInterpolationMode: "monotone" as const,
        pointRadius: 2,
        pointHitRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: "easeInOutQuart" as const
    },
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
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Time (HH:mm)",
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        title: {
          display: true,
          text: "Water Level (mm)",
        },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Water Level Monitor</h1>
          <div className="flex items-center gap-2 bg-card rounded-full p-1 shadow-sm">
            {["1h", "6h", "24h", "7d"].map((r) => (
              <Button
                key={r}
                onClick={() => setRange(r as "1h" | "6h" | "24h" | "7d")}
                variant={range === r ? "default" : "ghost"}
                className={`rounded-full transition-all duration-200 ${
                  range === r ? "scale-105" : "hover:bg-muted hover:scale-102"
                }`}
                size="sm"
              >
                <Clock className={`w-4 h-4 mr-1 transition-transform duration-200 ${
                  range === r ? "rotate-180" : ""
                }`} />
                {r}
              </Button>
            ))}
          </div>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Droplets className="h-6 w-6 text-blue-500" />
                {sensorInfo.name}
              </CardTitle>
              <button
                onClick={handleLocationClick}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <MapPin className="h-4 w-4" />
                {sensorInfo.location}
              </button>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              {latestLevel && (
                <div className="flex items-center gap-2 text-sm">
                  <ArrowUpDown className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{latestLevel}mm</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">
                    Loading data...
                  </div>
                </div>
              ) : data.length > 0 ? (
                <Line data={chartData} options={options} />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
