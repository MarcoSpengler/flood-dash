"use client";

import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function AdminPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    const checkAdmin = async () => {
      const { data } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();
      if (data?.is_admin) setIsAdmin(true);
      else router.push("/");
    };
    checkAdmin();
  }, [session]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Construction className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            This section is currently under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
