export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
      <p className="text-muted-foreground mt-2">The page you are looking for does not exist.</p>
      <a href="/" className="mt-4 text-primary hover:underline">Return Home</a>
    </div>
  );
}
