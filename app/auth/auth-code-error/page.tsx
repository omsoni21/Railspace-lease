import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AuthError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            The authentication link is invalid or has expired. Please try to log in or register again.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}