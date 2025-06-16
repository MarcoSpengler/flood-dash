"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Bell, BellRing } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Alarm {
  id?: number;
  device_id: string | null;
  email: string;
  type: "high" | "low" | "rate_change" | "battery" | "error";
  threshold: number | null;
  enabled: boolean;
}

export default function AlarmsEditor() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [devices, setDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch devices for the dropdown
      const { data: deviceData, error: deviceError } = await supabase
        .from("devices")
        .select("device_id");

      if (deviceError) {
        toast.error("Error loading devices");
        console.error(deviceError);
      } else {
        setDevices(deviceData.map((d) => d.device_id));
      }

      // Fetch alarms
      const { data: alarmData, error: alarmError } = await supabase
        .from("alert_rules")
        .select("*");

      if (alarmError) {
        toast.error("Error loading alarms");
        console.error(alarmError);
      } else {
        setAlarms(alarmData || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleChange = (
    index: number,
    field: keyof Alarm,
    value: string | number | boolean | null
  ) => {
    const updated = [...alarms];
    updated[index] = { ...updated[index], [field]: value };
    setAlarms(updated);
  };

  const handleSave = async (index: number) => {
    const alarm = alarms[index];
    const { error } = await supabase.from("alert_rules").upsert({
      id: alarm.id,
      device_id: alarm.device_id,
      email: alarm.email,
      type: alarm.type,
      threshold: alarm.threshold,
      enabled: alarm.enabled,
    });

    if (error) {
      toast.error("Failed to save changes");
      console.error(error);
    } else {
      toast.success("Changes saved");
    }
  };

  return (
    <main className="min-h-screen bg-muted/10 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Alarm Editor</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <Button
              onClick={async () => {
                const newAlarm: Alarm = {
                  device_id: null,
                  email: "",
                  type: "high",
                  threshold: null,
                  enabled: true,
                };

                const { data, error } = await supabase
                  .from("alert_rules")
                  .insert(newAlarm)
                  .select();

                if (error) {
                  toast.error("Failed to add alarm");
                  console.error(error);
                } else {
                  toast.success("Alarm added");
                  setAlarms([...alarms, data[0]]);
                }
              }}
              className="mb-4"
            >
              + New Alarm
            </Button>
            {alarms.map((alarm, index) => (
              <Card key={alarm.id || index} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {alarm.enabled ? (
                      <BellRing className="w-5 h-5 text-primary" />
                    ) : (
                      <Bell className="w-5 h-5 text-muted-foreground" />
                    )}
                    Alarm {alarm.id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Device ID</Label>
                    <Select
                      value={alarm.device_id || ""}
                      onValueChange={(value) =>
                        handleChange(index, "device_id", value || null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a device" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map((deviceId) => (
                          <SelectItem key={deviceId} value={deviceId}>
                            {deviceId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={alarm.email}
                      onChange={(e) =>
                        handleChange(index, "email", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={alarm.type}
                      onValueChange={(value) =>
                        handleChange(index, "type", value as Alarm["type"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="rate_change">Rate Change</SelectItem>
                        <SelectItem value="battery">Battery</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(alarm.type === "high" || alarm.type === "low") && (
                    <div className="space-y-2">
                      <Label>Threshold (mm)</Label>
                      <Input
                        type="number"
                        value={alarm.threshold ?? ""}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "threshold",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </div>
                  )}
                  <div className="col-span-full flex items-center justify-between border-t pt-4 mt-2">
                    <div className="flex items-center gap-3 bg-muted/30 rounded-lg px-4 py-2 border">
                      <Checkbox
                        id={`enabled-${alarm.id || index}`}
                        checked={alarm.enabled}
                        onCheckedChange={(checked) =>
                          handleChange(index, "enabled", checked)
                        }
                        className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label
                        htmlFor={`enabled-${alarm.id || index}`}
                        className="font-medium cursor-pointer select-none"
                      >
                        {alarm.enabled ? "Alarm Enabled" : "Alarm Disabled"}
                      </Label>
                    </div>
                    <Button onClick={() => handleSave(index)} size="lg">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
