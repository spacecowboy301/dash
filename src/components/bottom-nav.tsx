import { Bell, Binoculars, Home, Settings } from "lucide-react";

const navItems = [
  { label: "Home", href: "#top", icon: Home, active: true },
  { label: "Watchlists", href: "#watchlists", icon: Binoculars },
  { label: "Activity", href: "#activity", icon: Bell },
  { label: "Settings", href: "#settings", icon: Settings },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {navItems.map(({ label, href, icon: Icon, active }) => (
        <a key={label} href={href} aria-current={active ? "page" : undefined}>
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
