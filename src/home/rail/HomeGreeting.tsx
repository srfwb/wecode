function formatDate(now: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
}

export function HomeGreeting() {
  const dateLabel = formatDate(new Date());
  return (
    <div className="home-greet">
      <div className="home-greet-date">{dateLabel}</div>
      <h1 className="home-greet-title">
        Welcome to <span className="home-greet-accent">WeCode</span>.
      </h1>
    </div>
  );
}
