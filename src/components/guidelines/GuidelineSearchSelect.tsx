import { useEffect, useMemo, useRef, useState } from 'react';
import type { TocItem } from '../../types';

interface GuidelineSearchSelectProps {
  toc: TocItem[];
  activeId?: string;
  selectedLabel?: string;
  onSelect?: (id: string) => void;
}

export default function GuidelineSearchSelect({
  toc,
  activeId,
  selectedLabel,
  onSelect,
}: GuidelineSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    toc.forEach((item) => {
      init[item.id] = true;
    });
    return init;
  });
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setKeyword('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [open]);

  const filtered = useMemo(() => {
    const k = keyword.trim();
    if (!k) return toc;
    return toc
      .map((item): TocItem | null => {
        const labelMatch = item.label.includes(k) || item.labelZh?.includes(k);
        const childMatches = (item.children ?? []).filter((c) => c.label.includes(k));
        if (labelMatch) return item;
        if (childMatches.length > 0) return { ...item, children: childMatches };
        return null;
      })
      .filter((x): x is TocItem => x !== null);
  }, [toc, keyword]);

  const handlePick = (id: string) => {
    onSelect?.(id);
    setOpen(false);
    setKeyword('');
    inputRef.current?.blur();
  };

  const displayValue = keyword.length > 0 || open ? keyword : selectedLabel ?? '';

  return (
    <div className="gl-search-select" ref={wrapRef}>
      <div className={`gl-search-select-row ${open ? 'open' : ''}`}>
        <div className="gl-search-select-trigger">
          <input
            ref={inputRef}
            type="text"
            className="gl-search-select-input"
            value={displayValue}
            placeholder={selectedLabel ? selectedLabel : '请输入疾病名称或关键词'}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label="搜索疾病或指南关键词"
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setKeyword(e.target.value);
              if (!open) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setOpen(false);
                inputRef.current?.blur();
              }
            }}
          />
          <button
            type="button"
            className={`gl-search-select-chev-btn ${open ? 'open' : ''}`}
            onClick={() => {
              setOpen((v) => !v);
              if (!open) inputRef.current?.focus();
            }}
            aria-label={open ? '收起列表' : '展开列表'}
            tabIndex={-1}
          >
            <svg className="gl-search-select-chev" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {open && (
            <div className="gl-search-select-pop" role="listbox">
              <div className="gl-search-select-list">
                {filtered.length === 0 ? (
                  <div className="gl-search-select-empty">无匹配项</div>
                ) : (
                  filtered.map((item) => {
                    const isExpanded = expanded[item.id] ?? true;
                    const hasChildren = (item.children ?? []).length > 0;
                    const toggle = () => {
                      if (!hasChildren) return;
                      setExpanded((prev) => ({ ...prev, [item.id]: !isExpanded }));
                    };
                    return (
                      <div key={item.id} className="gl-search-select-group">
                        <div
                          className="gl-search-select-group-head"
                          role={hasChildren ? 'button' : undefined}
                          tabIndex={hasChildren ? 0 : -1}
                          onClick={toggle}
                        >
                          {hasChildren ? (
                            <span className={`gl-search-select-caret ${isExpanded ? 'open' : ''}`} aria-hidden="true">
                              <svg viewBox="0 0 10 10" width="10" height="10">
                                <polygon points="2.5,1 8.5,5 2.5,9" fill="currentColor" />
                              </svg>
                            </span>
                          ) : (
                            <span className="gl-search-select-caret-spacer" aria-hidden="true" />
                          )}
                          <span className="gl-search-select-group-label">{item.label}</span>
                        </div>
                        {isExpanded && (
                          <div className="gl-search-select-children">
                            {[...(item.children ?? [])]
                              .sort((a, b) => a.id.localeCompare(b.id, 'en'))
                              .map((child) => {
                                const childHasChildren = (child.children ?? []).length > 0;
                                return (
                                  <div
                                    key={child.id}
                                    className={`gl-search-select-child ${activeId === child.id ? 'active' : ''}`}
                                    role="option"
                                    aria-selected={activeId === child.id}
                                    tabIndex={0}
                                    onClick={() => handlePick(child.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handlePick(child.id);
                                      }
                                    }}
                                  >
                                    {childHasChildren ? (
                                      <span className="gl-search-select-child-caret" aria-hidden="true">
                                        <svg viewBox="0 0 10 10" width="10" height="10">
                                          <polygon points="2.5,1 8.5,5 2.5,9" fill="currentColor" />
                                        </svg>
                                      </span>
                                    ) : (
                                      <span className="gl-search-select-child-spacer" aria-hidden="true" />
                                    )}
                                    <span>{child.label}</span>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          className="gl-search-select-btn"
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
          aria-label="搜索"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="9" cy="9" r="6" />
            <path d="M14 14l4 4" strokeLinecap="round" />
          </svg>
          <span>搜索</span>
        </button>
      </div>
    </div>
  );
}
