import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <div><span className="text-muted-foreground">Name:</span> {user.name}</div>
              <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
              <div><span className="text-muted-foreground">Role:</span> {user.role}</div>
            </div>
          ) : (
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
