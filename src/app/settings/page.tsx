export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Application Settings</h3>
          <p className="text-sm text-muted-foreground">Settings will be available in future updates.</p>
        </div>
      </div>
    </div>
  );
}
