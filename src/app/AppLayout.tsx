import { type ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { navItems } from './navigation';

type AppLayoutProps = {
  currentPage: string;
  breadcrumbs: string[];
  children: ReactNode;
  onNavigate: (path: string) => void;
};

export function AppLayout({ currentPage, breadcrumbs, children, onNavigate }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas font-sans text-text">
      <aside
        className={`flex shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-[250ms] ease-[var(--ease-default)] ${
          isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
        aria-label="Primary navigation"
      >
        {/* Logo */}
        <div
          className={`flex h-[52px] shrink-0 items-center border-b border-border px-3 ${
            isSidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-2xl leading-none" aria-hidden="true">
              🚀
            </span>
            {!isSidebarCollapsed && (
              <span className="truncate text-sm font-semibold text-text">Rocket Claude</span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.path === `/${currentPage}`;
            const childActive = item.children?.some((c) => c.path === `/${currentPage}`);
            return (
              <div key={item.label}>
                <a
                  href={item.path}
                  aria-current={active ? 'page' : undefined}
                  title={isSidebarCollapsed ? item.label : undefined}
                  onClick={(e) => { e.preventDefault(); onNavigate(item.path); }}
                  className={`flex h-9 items-center gap-[10px] rounded-[6px] px-3 text-sm transition-colors duration-[100ms] ${
                    active
                      ? 'bg-hover font-medium text-text'
                      : 'font-normal text-muted hover:bg-hover hover:text-text'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon
                    size={20}
                    aria-hidden="true"
                    className={active || childActive ? 'text-brand' : 'text-current'}
                  />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </a>
                {!isSidebarCollapsed && (active || childActive) && item.children?.map((child) => {
                  const childIsActive = child.path === `/${currentPage}`;
                  return (
                    <a
                      key={child.label}
                      href={child.path}
                      aria-current={childIsActive ? 'page' : undefined}
                      onClick={(e) => { e.preventDefault(); onNavigate(child.path); }}
                      className={`ml-8 flex h-7 items-center rounded-[6px] px-3 text-xs transition-colors duration-[100ms] ${
                        childIsActive
                          ? 'font-medium text-text bg-hover'
                          : 'font-normal text-muted hover:bg-hover hover:text-text'
                      }`}
                    >
                      {child.label}
                    </a>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border p-2">
          <button
            className={`flex h-9 w-full items-center rounded-[6px] px-3 text-sm text-muted transition-colors duration-[100ms] hover:bg-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
              isSidebarCollapsed ? 'justify-center' : 'justify-between'
            }`}
            type="button"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isSidebarCollapsed}
            onClick={() => setIsSidebarCollapsed((c) => !c)}
          >
            {!isSidebarCollapsed && (
              <span className="text-xs text-subtle">Collapse</span>
            )}
            {isSidebarCollapsed ? (
              <ChevronRight size={16} aria-hidden="true" />
            ) : (
              <ChevronLeft size={16} aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-[52px] shrink-0 items-center border-b border-border bg-canvas px-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              {breadcrumbs.map((breadcrumb, index) => {
                const isCurrentPage = index === breadcrumbs.length - 1;
                return (
                  <li key={breadcrumb} className="flex items-center gap-2">
                    {index > 0 && (
                      <span className="text-sm text-subtle" aria-hidden="true">
                        /
                      </span>
                    )}
                    <span
                      className={
                        isCurrentPage ? 'text-sm font-semibold text-text' : 'text-sm text-subtle'
                      }
                      aria-current={isCurrentPage ? 'page' : undefined}
                    >
                      {breadcrumb}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>
        </header>

        {/* Content */}
        <main className="min-w-0 flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
