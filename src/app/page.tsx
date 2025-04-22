// app/page.tsx
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex justify-center items-center h-screen">
      <Card className="w-[350px]">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2">Hallo!</h2>
          <p className="text-sm text-muted-foreground">
            Willkommen bei flood-dash
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
