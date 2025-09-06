export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold">About Route-X</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Route-X helps daily commuters in India’s tier-2 and tier-3 cities track public buses in real time. See live locations, ETA, driver details, fare, and seat availability, and book your ride. Drivers can share live GPS and availability to keep routes accurate and up to date.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-tight">Contact</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Email: support@routex.in</li>
              <li>Focus: Public buses • Rural & small towns</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} Route-X. All rights reserved.</div>
      </div>
    </footer>
  );
}
