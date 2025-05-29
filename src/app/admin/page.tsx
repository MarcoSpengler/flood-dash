"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Save,
  MapPin,
  AlignVerticalJustifyCenter,
  Ruler,
} from "lucide-react";
import { toast } from "sonner";

interface Device {
  device_id: string;
  name: string | null;
  offset_mm: number | null;
  lat: number | null;
  lng: number | null;
}

export default function DevicesEditor() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      const { data, error } = await supabase
        .from("devices")
        .select("device_id, name, offset_mm, lat, lng");
      if (error) {
        toast.error("Error loading devices");
        console.error(error);
      } else {
        setDevices(data || []);
      }
      setLoading(false);
    };

    fetchDevices();
  }, []);

  const handleChange = (index: number, field: keyof Device, value: string) => {
    const updated = [...devices];
    updated[index] = { ...updated[index], [field]: value };
    setDevices(updated);
  };

  const handleSave = async (index: number) => {
    const device = devices[index];
    const { error } = await supabase
      .from("devices")
      .update({
        name: device.name,
        offset_mm: Number(device.offset_mm),
        lat: Number(device.lat),
        lng: Number(device.lng),
      })
      .eq("device_id", device.device_id);

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
        <h1 className="text-3xl font-bold tracking-tight">Device Editor</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <Button
              onClick={async () => {
                const id = prompt("Enter a new device ID:");
                if (!id) return;

                const { error } = await supabase.from("devices").insert({
                  device_id: id,
                  name: "",
                  offset_mm: 0,
                  lat: 0,
                  lng: 0,
                });

                if (error) {
                  toast.error("Failed to add device");
                  console.error(error);
                } else {
                  toast.success("Device added");
                  const { data, error: fetchError } = await supabase
                    .from("devices")
                    .select("device_id, name, offset_mm, lat, lng");
                  if (!fetchError) setDevices(data || []);
                }
              }}
              className="mb-4"
            >
              + New Device
            </Button>
            {devices.map((device, index) => (
              <Card key={device.device_id} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    {device.device_id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Location
                    </label>
                    <Input
                      value={device.name ?? ""}
                      onChange={(e) =>
                        handleChange(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Offset (mm)
                    </label>
                    <Input
                      type="number"
                      value={device.offset_mm ?? ""}
                      onChange={(e) =>
                        handleChange(index, "offset_mm", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Latitude
                    </label>
                    <Input
                      type="number"
                      value={device.lat ?? ""}
                      onChange={(e) => handleChange(index, "lat", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Longitude
                    </label>
                    <Input
                      type="number"
                      value={device.lng ?? ""}
                      onChange={(e) => handleChange(index, "lng", e.target.value)}
                    />
                  </div>
                  <div className="col-span-full flex justify-end">
                    <Button onClick={() => handleSave(index)}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
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
