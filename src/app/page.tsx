"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip as ChartTooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Share2,
  Clock,
  Router,
  Droplets,
  ArrowUpDown,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  ChartTooltip
);

interface WaterLevel {
  created_at: string;
  water_level: number;
}

interface Device {
  device_id: string;
  name: string | null;
  offset_mm: number;
  lat: number | null;
  lng: number | null;
}

interface Alert {
  id: number;
  device_id: string;
  type: "high" | "low" | "rate_change" | "battery" | "error";
  value: number | null;
  created_at: string | null;
}

export default function Home() {
  const [range, setRange] = useState<"1h" | "6h" | "24h" | "7d">("24h");
  const [urlDeviceId, setUrlDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [waterLevels, setWaterLevels] = useState<Record<string, WaterLevel[]>>(
    {}
  );
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const r = searchParams.get("range");
    const d = searchParams.get("device");
    if (r && ["1h", "6h", "24h", "7d"].includes(r))
      setRange(r as "1h" | "6h" | "24h" | "7d");
    if (d) setUrlDeviceId(d);
  }, []);

  const getFromDate = useCallback(() => {
    const now = new Date();
    if (range === "1h") now.setHours(now.getHours() - 1);
    else if (range === "6h") now.setHours(now.getHours() - 6);
    else if (range === "24h") now.setHours(now.getHours() - 24);
    else now.setDate(now.getDate() - 7);
    return now;
  }, [range]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: deviceData, error: deviceError } = await supabase
        .from("devices")
        .select("device_id, name, offset_mm, lat, lng");

      if (deviceError) {
        console.error(deviceError);
        return;
      }

      setDevices(deviceData || []);

      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: alertData, error: alertError } = await supabase
        .from("alerts")
        .select("*")
        .not("created_at", "is", null)
        .gte("created_at", twentyFourHoursAgo.toISOString());

      console.log(alertData);

      if (alertError) {
        console.error(alertError);
      } else {
        setRecentAlerts(alertData || []);
      }

      const newLevels: Record<string, WaterLevel[]> = {};
      const fromDate = getFromDate();

      for (const device of deviceData || []) {
        if (urlDeviceId && device.device_id !== urlDeviceId) continue;
        const { data: wlData, error: wlError } = await supabase
          .from("water_levels")
          .select("*")
          .eq("device_id", device.device_id)
          .gte("created_at", fromDate.toISOString())
          .order("created_at", { ascending: true });

        if (wlError) {
          console.error(wlError);
        } else {
          newLevels[device.device_id] = wlData ?? [];
        }
      }

      setWaterLevels(newLevels);
      setIsLoading(false);
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFromDate]);

  const handleShare: (deviceId: string) => Promise<void> = async (deviceId) => {
    const url =
      (typeof window !== "undefined" ? window.location.origin : "") +
      `/?device=${deviceId}&range=${range}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
      console.error(err);
    }
  };
  // Calculate time range for chart x-axis
  const fromDate = getFromDate();
  const toDate = new Date();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: "easeInOutQuart" as const,
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

  const getAlertMessage = (alert: Alert) => {
    switch (alert.type) {
      case "high":
        return `Water level above ${alert.value}mm`;
      case "low":
        return `Water level below ${alert.value}mm`;
      case "rate_change":
        return "Rapid water level change detected";
      case "battery":
        return `Low battery voltage (${(alert.value! / 1000).toFixed(2)}V)`;
      case "error":
        return "Device error detected";
      default:
        return "Alert triggered";
    }
  };

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Water Level Monitor
            </h1>
            <div className="flex gap-2">
              <a href="/devices">
                <Button variant="secondary" className="gap-2">
                  <Router className="h-4 w-4" />
                  Devices
                </Button>
              </a>
              <a href="/alarms">
                <Button variant="secondary" className="gap-2">
                  <ShieldAlert className="inline-block h-4 w-4 mr-1" />
                  Alarms
                </Button>
              </a>
            </div>
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
                  <Clock
                    className={`w-4 h-4 mr-1 transition-transform duration-200 ${
                      range === r ? "rotate-180" : ""
                    }`}
                  />
                  {r}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">
                Loading data...
              </div>
            </div>
          ) : (
            (() => {
              const displayedDevices = urlDeviceId
                ? devices.filter((d) => d.device_id === urlDeviceId)
                : devices;
              return displayedDevices.map((sensor) => {
                const data = waterLevels[sensor.device_id] || [];
                const adjustedData = data.map((d) => ({
                  ...d,
                  water_level:
                    sensor.offset_mm !== 0
                      ? d.water_level - sensor.offset_mm
                      : d.water_level,
                }));

                const latestLevel =
                  adjustedData.length > 0
                    ? adjustedData[adjustedData.length - 1].water_level
                    : null;

                const deviceAlerts = recentAlerts.filter(
                  (alert) => alert.device_id === sensor.device_id
                );

                const chartData = {
                  labels: adjustedData.map((d) => new Date(d.created_at)),
                  datasets: [
                    {
                      label: "Water Level (mm)",
                      data: adjustedData.map((d) => d.water_level),
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

                return (
                  <Card
                    key={sensor.device_id}
                    className={cn(
                      "border-2 shadow-lg",
                      deviceAlerts.length > 0 && "border-destructive/50"
                    )}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                          <Droplets className="h-6 w-6 text-blue-500" />
                          {sensor.name || sensor.device_id}
                          {deviceAlerts.length > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
                              <div className="text-sm text-destructive">
                                {deviceAlerts.map((alert, i) => (
                                  <div key={alert.id}>
                                    {getAlertMessage(alert)}
                                    {i < deviceAlerts.length - 1 && ", "}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardTitle>
                        {sensor.lat !== null && sensor.lng !== null && (
                          <button
                            onClick={() =>
                              window.open(
                                `https://www.openstreetmap.org/?mlat=${sensor.lat}&mlon=${sensor.lng}#map=16/${sensor.lat}/${sensor.lng}`,
                                "_blank"
                              )
                            }
                            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
                          >
                            <MapPin className="h-4 w-4" />(
                            {sensor.lat.toFixed(5)}, {sensor.lng.toFixed(5)})
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleShare(sensor.device_id)}
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                        {latestLevel !== null && (
                          <div className="flex items-center gap-2 text-sm">
                            <ArrowUpDown className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">
                              {latestLevel.toFixed(2)}mm
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] w-full">
                        {adjustedData.length > 0 ? (
                          <Line data={chartData} options={options} />
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                            <Droplets className="w-10 h-10 mb-4 text-blue-300" />
                            <p className="text-lg font-semibold">
                              No water level data
                            </p>
                            <p className="text-sm mt-1">
                              There is no data available for the selected time
                              range.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              });
            })()
          )}
        </div>
      </main>
    </TooltipProvider>
  );
}
