export default function DashboardPage() {
  const stats = [
    { label: "Resume Score", value: "85%" },
    { label: "Interviews Done", value: "12" },
    { label: "Leaderboard Rank", value: "#24" },
    { label: "Applications", value: "8" },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 gradient-text">
        Welcome to HirePilot 🚀
      </h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="dashboard-card">
            <h3 className="text-sm text-muted-foreground">
              {item.label}
            </h3>
            <p className="text-3xl font-bold mt-2">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}