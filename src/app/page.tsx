import Link from 'next/link';
import {
  Inbox,
  FolderKanban,
  CalendarDays,
  Eye,
  Moon,
  Smartphone,
} from 'lucide-react';

const features = [
  {
    icon: Inbox,
    title: 'Inbox',
    description: 'Capture tasks quickly and process them when you are ready.',
  },
  {
    icon: FolderKanban,
    title: 'Projects',
    description: 'Organize work into folders and projects with sequential or parallel flows.',
  },
  {
    icon: CalendarDays,
    title: 'Forecast',
    description: 'See defer, due, and planned dates in a timeline view.',
  },
  {
    icon: Eye,
    title: 'Custom Perspectives',
    description: 'Build saved views with filters, grouping, and sorting.',
  },
  {
    icon: Moon,
    title: 'Dark Mode',
    description: 'System-aware theming that looks great day or night.',
  },
  {
    icon: Smartphone,
    title: 'PWA Ready',
    description: 'Install on desktop or mobile and work offline-friendly.',
  },
];

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" width={32} height={32} style={{ borderRadius: '8px' }} />
          <span style={{ fontWeight: 700, fontSize: '18px' }}>ClearDeck</span>
        </div>
        <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            href="/login"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              color: 'var(--foreground)',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '64px 24px 80px' }}>
        <section style={{ textAlign: 'center', marginBottom: '72px' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
            }}
          >
            Clear your deck.
            <br />
            Ship your work.
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--muted-text)',
              maxWidth: '540px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            A self-hostable, GTD-inspired task manager with inbox capture, project
            planning, forecast views, and custom perspectives.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              Get Started Free
            </Link>
            <a
              href="https://github.com/cleardeck/cleardeck"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                color: 'var(--foreground)',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              View on GitHub
            </a>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                style={{
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                }}
              >
                <Icon
                  size={22}
                  style={{ color: '#0ea5e9', marginBottom: '12px' }}
                  strokeWidth={2}
                />
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600 }}>
                  {feature.title}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted-text)', lineHeight: 1.5 }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </section>
      </main>

      <footer
        style={{
          padding: '24px 32px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--muted-text)',
          lineHeight: 1.6,
        }}
      >
          ClearDeck is an independent open-source project. It is not affiliated with,
          endorsed by, or associated with The Omni Group.
      </footer>
    </div>
  );
}
