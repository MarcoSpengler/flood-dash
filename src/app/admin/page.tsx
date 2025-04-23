"use client";

import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AdminPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

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

  const handleCreateUser = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pw,
    });
    if (error) alert(error.message);
    else alert("Benutzer angelegt!");
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-xl mx-auto mt-12 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Neuen Nutzer anlegen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pw">Passwort</Label>
            <Input
              id="pw"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateUser}>Anlegen</Button>
        </CardContent>
      </Card>
    </div>
  );
}
