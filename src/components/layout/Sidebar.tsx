import { useState } from 'react';
import type { PageId } from '../../types';
import { roleButtonActivate } from '../../utils/keyboard';

interface SidebarProps {
  page: PageId;
  onPageChange: (page: PageId) => void;
}

interface IconProps {
  className?: string;
}

const navItems: { id: PageId; label: string; labelZh: string; icon: string }[] = [
  { id: 'chat', label: '智能助手', labelZh: 'AI助手', icon: 'chat' },
  { id: 'guidelines', label: '诊疗路径', labelZh: '指南', icon: 'guidelines' },
  { id: 'patients', label: '真实世界病例库', labelZh: 'RWD', icon: 'patients' },
  { id: 'literature', label: '文献证据库', labelZh: '文献', icon: 'literature' },
  { id: 'synthesis', label: '综合展示', labelZh: '对照', icon: 'synthesis' },
];

function SidebarToggleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.75" y="4.5" width="16.5" height="15" rx="3" />
      <path d="M8.5 4.5V19.5" />
    </svg>
  );
}

function ChatIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 6.25H19V16.75H9L5 19V6.25Z" />
    </svg>
  );
}

function GuidelinesIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="3.75" width="14" height="16.5" rx="2.5" />
      <path d="M8.5 8.5H15.5M8.5 12H15.5M8.5 15.5H13" />
    </svg>
  );
}

function LiteratureIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 5.25H11V18.75H5V5.25Z" />
      <path d="M13 5.25H19V18.75H13V5.25Z" />
      <path d="M7.5 8.75H9M7.5 12H9M7.5 15.25H8.5" />
      <path d="M15.5 8.75H17M15.5 12H17M15.5 15.25H16.5" />
    </svg>
  );
}

function SynthesisIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="4.5" width="6.5" height="15" rx="1.75" />
      <rect x="13" y="4.5" width="6.5" height="6.5" rx="1.75" />
      <rect x="13" y="13" width="6.5" height="6.5" rx="1.75" />
    </svg>
  );
}

function HistoryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M10.5 7v5.5h5" />
    </svg>
  );
}

function ResourcesIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M14.5 9.5l-1.4 4.1-4.1 1.4 1.4-4.1 4.1-1.4z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function Sidebar({ page, onPageChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-ring">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 22H8L12 11L17 37L23 20L27 28L34 15L38 29L40 22H44" />
          </svg>
        </div>
        <div className="sidebar-logo-text">
          <div className="logo-text">MedGuide AI</div>
          <div className="logo-sub">临床决策支持平台</div>
        </div>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <SidebarToggleIcon className="sidebar-icon" />
        </button>
      </div>
      <nav className="sidebar-nav">
        <div
          className={`nav-item ${page === navItems[0].id ? 'active' : ''}`}
          onClick={() => onPageChange(navItems[0].id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => roleButtonActivate(e, () => onPageChange(navItems[0].id))}
        >
          <ChatIcon className="sidebar-icon" />
          {navItems[0].label}
        </div>
        <div
          className={`nav-section nav-section--with-icon nav-section--collapsible ${resourcesOpen ? 'open' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => setResourcesOpen((v) => !v)}
          onKeyDown={(e) => roleButtonActivate(e, () => setResourcesOpen((v) => !v))}
          aria-expanded={resourcesOpen}
        >
          <ResourcesIcon className="sidebar-icon" />
          <span>临床资源</span>
          <ChevronRightIcon className="nav-section-chevron" />
        </div>
        {resourcesOpen && navItems.slice(1).filter((item) => item.id !== 'patients').map((item) => (
          <div
            key={item.id}
            className={`nav-item nav-item--child ${page === item.id ? 'active' : ''}`}
            onClick={() => onPageChange(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => roleButtonActivate(e, () => onPageChange(item.id))}
          >
            {item.icon === 'guidelines' && (
              <GuidelinesIcon className="sidebar-icon" />
            )}
            {item.icon === 'patients' && (
              <svg className="sidebar-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="10" cy="10" r="7" />
                <path d="M10 7v3l2 2" />
              </svg>
            )}
            {item.icon === 'literature' && (
              <LiteratureIcon className="sidebar-icon" />
            )}
            {item.icon === 'synthesis' && (
              <SynthesisIcon className="sidebar-icon" />
            )}
            {item.label}
          </div>
        ))}
        <div
          className={`nav-section nav-section--with-icon nav-section--collapsible ${historyOpen ? 'open' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => setHistoryOpen((v) => !v)}
          onKeyDown={(e) => roleButtonActivate(e, () => setHistoryOpen((v) => !v))}
          aria-expanded={historyOpen}
        >
          <HistoryIcon className="sidebar-icon" />
          <span>历史</span>
          <ChevronRightIcon className="nav-section-chevron" />
        </div>
        {historyOpen && (
          <>
            <div className="nav-item nav-item--child nav-history-item nav-history-demo">
              弥漫大B细胞淋巴瘤诊断…
            </div>
            <div className="nav-item nav-item--child nav-history-item nav-history-demo">
              套细胞淋巴瘤一线治疗方案…
            </div>
            <div className="nav-item nav-item--child nav-history-item nav-history-demo">
              滤泡性淋巴瘤分期评估…
            </div>
          </>
        )}
      </nav>
      <div className="sidebar-account">
        <div className="sidebar-account-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="9" r="3.5" />
            <path d="M5 19.5c1.2-3 4-4.5 7-4.5s5.8 1.5 7 4.5" />
          </svg>
        </div>
        <div className="sidebar-account-email" title="test1@noah.bio">test1@noah.bio</div>
        <button
          type="button"
          className="sidebar-account-more"
          aria-label="账号操作"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <circle cx="4" cy="10" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="16" cy="10" r="1.5" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
