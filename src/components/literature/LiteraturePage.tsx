import { useMemo, useState, useEffect, useRef } from 'react';
import type {
  EvidenceGradeCode,
  LiteratureEvidenceCategory,
  LiteratureEvidenceItem,
  StudyDesignCode,
} from '../../types';
import { LITERATURE_EVIDENCE } from '../../data/literature';
import { EVIDENCE_GRADE_LABEL, STUDY_DESIGN_LABEL } from '../../constants/literatureEbm';
import { useAppStore } from '../../store';
import { roleButtonActivate } from '../../utils/keyboard';
import '../../styles/literature.css';

const CATEGORY_OPTIONS: { value: LiteratureEvidenceCategory | ''; label: string }[] = [
  { value: '', label: '全部归纳类型' },
  { value: 'special_pop', label: '特殊人群策略' },
  { value: 'scheme_compare', label: '方案比较依据' },
  { value: 'boundary', label: '适用边界提示' },
  { value: 'outcome', label: '关键结局摘要' },
];

const DIMENSION_META: {
  key: keyof Pick<
    LiteratureEvidenceItem,
    'researchObject' | 'strategy' | 'applicableConditions' | 'keyResults'
  >;
  title: string;
  hint: string;
  tone: 'blue' | 'teal' | 'amber' | 'violet';
}[] = [
  { key: 'researchObject', title: '研究对象', hint: '什么患者 / 阶段 / 特征', tone: 'blue' },
  { key: 'strategy', title: '处理策略', hint: '检查、治疗或管理动作', tone: 'teal' },
  { key: 'applicableConditions', title: '适用条件', hint: '何时适用 / 不适用 / 前提', tone: 'amber' },
  { key: 'keyResults', title: '关键结果', hint: '疗效、安全性、转归或策略差异', tone: 'violet' },
];

function categoryBadgeClass(cat: LiteratureEvidenceCategory): string {
  const m: Record<LiteratureEvidenceCategory, string> = {
    special_pop: 'lit-cat lit-cat--pop',
    scheme_compare: 'lit-cat lit-cat--compare',
    boundary: 'lit-cat lit-cat--boundary',
    outcome: 'lit-cat lit-cat--outcome',
  };
  return m[cat];
}

function categoryLabel(cat: LiteratureEvidenceCategory): string {
  const m: Record<LiteratureEvidenceCategory, string> = {
    special_pop: '特殊人群策略',
    scheme_compare: '方案比较依据',
    boundary: '适用边界提示',
    outcome: '关键结局摘要',
  };
  return m[cat];
}

const GRADE_OPTIONS: { value: EvidenceGradeCode | ''; label: string }[] = [
  { value: '', label: '全部证据等级' },
  ...(['high', 'moderate', 'low', 'very_low'] as const).map((g) => ({
    value: g,
    label: EVIDENCE_GRADE_LABEL[g],
  })),
];

const STUDY_DESIGN_ORDER: StudyDesignCode[] = [
  'rct',
  'systematic_review_meta',
  'cohort',
  'case_control',
  'case_series',
  'narrative_review',
  'pooled_analysis',
];

const DESIGN_OPTIONS: { value: StudyDesignCode | ''; label: string }[] = [
  { value: '', label: '全部研究设计' },
  ...STUDY_DESIGN_ORDER.map((value) => ({ value, label: STUDY_DESIGN_LABEL[value] })),
];

export default function LiteraturePage() {
  const {
    page: routePage,
    setPage,
    synthesisEntryTarget,
    setSynthesisEntryTarget,
    chatEntryTarget,
    setChatEntryTarget,
    literatureFocusEvidenceId,
    setLiteratureFocusEvidenceId,
    literatureDeepLink,
    setLiteratureDeepLink,
  } = useAppStore();
  const [q, setQ] = useState('');
  const [cats, setCats] = useState<LiteratureEvidenceCategory[]>([]);
  const [gradeFilters, setGradeFilters] = useState<EvidenceGradeCode[]>([]);
  const [designFilters, setDesignFilters] = useState<StudyDesignCode[]>([]);
  const toggleInArray = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** 综合展示进入时限定列表；null 表示不限制 */
  const [synthesisRestrictIds, setSynthesisRestrictIds] = useState<string[] | null>(null);
  const [showBackToSynthesis, setShowBackToSynthesis] = useState(false);
  const [showBackToChat, setShowBackToChat] = useState(false);
  const prevRouteRef = useRef(routePage);

  useEffect(() => {
    if (routePage === 'literature') {
      setShowBackToSynthesis(prevRouteRef.current === 'synthesis' && synthesisEntryTarget === 'literature');
      setShowBackToChat(prevRouteRef.current === 'chat' && chatEntryTarget === 'literature');
    }
    prevRouteRef.current = routePage;
  }, [routePage, synthesisEntryTarget, chatEntryTarget]);

  useEffect(() => {
    if (routePage !== 'literature') {
      setSynthesisRestrictIds(null);
      return;
    }

    if (literatureDeepLink) {
      const { restrictToEvidenceIds, focusEvidenceId } = literatureDeepLink;
      setLiteratureDeepLink(null);
      setQ('');
      setCats([]);
      setGradeFilters([]);
      setDesignFilters([]);
      const validIds = restrictToEvidenceIds.filter((id) => LITERATURE_EVIDENCE.some((e) => e.id === id));
      setSynthesisRestrictIds(validIds.length > 0 ? validIds : null);
      const focus =
        focusEvidenceId && validIds.includes(focusEvidenceId) ? focusEvidenceId : (validIds[0] ?? null);
      setSelectedId(focus);
      return;
    }

    if (!literatureFocusEvidenceId) return;
    const id = literatureFocusEvidenceId;
    setLiteratureFocusEvidenceId(null);
    if (!LITERATURE_EVIDENCE.some((e) => e.id === id)) return;
    setQ('');
    setCats([]);
    setGradeFilters([]);
    setDesignFilters([]);
    setSynthesisRestrictIds(null);
    setSelectedId(id);
  }, [
    routePage,
    literatureDeepLink,
    literatureFocusEvidenceId,
    setLiteratureDeepLink,
    setLiteratureFocusEvidenceId,
  ]);

  const pool = useMemo(
    () =>
      synthesisRestrictIds != null && synthesisRestrictIds.length > 0
        ? LITERATURE_EVIDENCE.filter((e) => synthesisRestrictIds.includes(e.id))
        : LITERATURE_EVIDENCE,
    [synthesisRestrictIds]
  );

  const matchesQuery = (ev: LiteratureEvidenceItem, qq: string) => {
    if (!qq) return true;
    const blob = `${ev.title} ${ev.thesis} ${ev.keywords.join(' ')} ${ev.citation}`.toLowerCase();
    return blob.includes(qq);
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return pool.filter((ev) => {
      if (cats.length > 0 && !cats.includes(ev.category)) return false;
      if (gradeFilters.length > 0 && !gradeFilters.includes(ev.evidenceGrade)) return false;
      if (designFilters.length > 0 && !designFilters.includes(ev.studyDesign)) return false;
      return matchesQuery(ev, qq);
    });
  }, [q, cats, gradeFilters, designFilters, pool]);

  const countFor = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return {
      category: (val: LiteratureEvidenceCategory) =>
        pool.filter(
          (ev) =>
            ev.category === val &&
            (gradeFilters.length === 0 || gradeFilters.includes(ev.evidenceGrade)) &&
            (designFilters.length === 0 || designFilters.includes(ev.studyDesign)) &&
            matchesQuery(ev, qq)
        ).length,
      grade: (val: EvidenceGradeCode) =>
        pool.filter(
          (ev) =>
            ev.evidenceGrade === val &&
            (cats.length === 0 || cats.includes(ev.category)) &&
            (designFilters.length === 0 || designFilters.includes(ev.studyDesign)) &&
            matchesQuery(ev, qq)
        ).length,
      design: (val: StudyDesignCode) =>
        pool.filter(
          (ev) =>
            ev.studyDesign === val &&
            (cats.length === 0 || cats.includes(ev.category)) &&
            (gradeFilters.length === 0 || gradeFilters.includes(ev.evidenceGrade)) &&
            matchesQuery(ev, qq)
        ).length,
    };
  }, [pool, q, cats, gradeFilters, designFilters]);

  const clearAllFilters = () => {
    setCats([]);
    setGradeFilters([]);
    setDesignFilters([]);
  };
  const hasAnyFilter = cats.length > 0 || gradeFilters.length > 0 || designFilters.length > 0;

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => (prev && filtered.some((e) => e.id === prev) ? prev : filtered[0].id));
  }, [filtered]);

  const selected = useMemo(
    () => (selectedId ? LITERATURE_EVIDENCE.find((e) => e.id === selectedId) ?? null : null),
    [selectedId]
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(() =>
    typeof window === 'undefined' ? 960 : Math.max(480, Math.floor(window.innerWidth / 2))
  );
  const drawerResizingRef = useRef(false);

  const openDetail = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drawerResizingRef.current) return;
      const next = window.innerWidth - e.clientX;
      const min = 360;
      const max = Math.max(min, window.innerWidth - 200);
      setDrawerWidth(Math.min(max, Math.max(min, next)));
    };
    const onUp = () => {
      if (!drawerResizingRef.current) return;
      drawerResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const startDrawerResize = (e: React.MouseEvent) => {
    e.preventDefault();
    drawerResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="lit-page">
      <header className="lit-page-head">
        <div className="lit-page-head-row">
          {showBackToSynthesis ? (
            <button
              type="button"
              className="lit-back-synthesis"
              onClick={() => {
                setSynthesisEntryTarget(null);
                setPage('synthesis');
              }}
            >
              返回综合展示
            </button>
          ) : showBackToChat ? (
            <button
              type="button"
              className="lit-back-synthesis"
              onClick={() => {
                setChatEntryTarget(null);
                setPage('chat');
              }}
            >
              返回Agent问答
            </button>
          ) : null}
        </div>
        <div className="lit-toolbar lit-toolbar--wrap">
          <p className="lit-toolbar-hint">
            按归纳类型、证据等级、研究设计多维筛选，快速定位相关证据
          </p>
          <div className="lit-search-group">
            <div className="lit-search-trigger">
              <input
                type="search"
                className="lit-search-input"
                placeholder="搜索标题、关键词、期刊…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="搜索文献证据"
              />
            </div>
            <button
              type="button"
              className="lit-search-btn"
              aria-label="搜索"
              onClick={() => setQ((s) => s.trim())}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="9" cy="9" r="6" />
                <path d="M14 14l4 4" strokeLinecap="round" />
              </svg>
              <span>搜索</span>
            </button>
          </div>
        </div>
        {synthesisRestrictIds != null && synthesisRestrictIds.length > 0 ? (
          <div className="lit-synthesis-scope" role="status">
            <span className="lit-synthesis-scope-text">
              当前列表已限定为本阶段关联证据（{synthesisRestrictIds.length} 条）
            </span>
            <button type="button" className="lit-synthesis-scope-clear" onClick={() => setSynthesisRestrictIds(null)}>
              显示全部条目
            </button>
          </div>
        ) : null}
      </header>

      <div className="lit-split">
        <aside className="lit-side-filters" aria-label="筛选条件">
          <div className="lit-side-filter">
            <div className="lit-side-filter-label">归纳类型</div>
            <ul className="lit-check-list">
              {CATEGORY_OPTIONS.filter((o) => o.value !== '').map((o) => {
                const v = o.value as LiteratureEvidenceCategory;
                const checked = cats.includes(v);
                const n = countFor.category(v);
                return (
                  <li key={v}>
                    <button
                      type="button"
                      className={`lit-check-item ${checked ? 'lit-check-item--on' : ''}`}
                      onClick={() => setCats((arr) => toggleInArray(arr, v))}
                      aria-pressed={checked}
                    >
                      <span className={`lit-check-box ${checked ? 'lit-check-box--on' : ''}`} aria-hidden>
                        {checked ? (
                          <svg viewBox="0 0 12 12" width="10" height="10">
                            <path d="M2 6.5L5 9.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                      <span className="lit-check-label">{o.label}</span>
                      <span className="lit-check-count">({n})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="lit-side-filter">
            <div className="lit-side-filter-label">证据等级</div>
            <ul className="lit-check-list">
              {GRADE_OPTIONS.filter((o) => o.value !== '').map((o) => {
                const v = o.value as EvidenceGradeCode;
                const checked = gradeFilters.includes(v);
                const n = countFor.grade(v);
                return (
                  <li key={v}>
                    <button
                      type="button"
                      className={`lit-check-item ${checked ? 'lit-check-item--on' : ''}`}
                      onClick={() => setGradeFilters((arr) => toggleInArray(arr, v))}
                      aria-pressed={checked}
                    >
                      <span className={`lit-check-box ${checked ? 'lit-check-box--on' : ''}`} aria-hidden>
                        {checked ? (
                          <svg viewBox="0 0 12 12" width="10" height="10">
                            <path d="M2 6.5L5 9.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                      <span className="lit-check-label">{o.label}</span>
                      <span className="lit-check-count">({n})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="lit-side-filter">
            <div className="lit-side-filter-label">研究设计</div>
            <ul className="lit-check-list">
              {DESIGN_OPTIONS.filter((o) => o.value !== '').map((o) => {
                const v = o.value as StudyDesignCode;
                const checked = designFilters.includes(v);
                const n = countFor.design(v);
                return (
                  <li key={v}>
                    <button
                      type="button"
                      className={`lit-check-item ${checked ? 'lit-check-item--on' : ''}`}
                      onClick={() => setDesignFilters((arr) => toggleInArray(arr, v))}
                      aria-pressed={checked}
                    >
                      <span className={`lit-check-box ${checked ? 'lit-check-box--on' : ''}`} aria-hidden>
                        {checked ? (
                          <svg viewBox="0 0 12 12" width="10" height="10">
                            <path d="M2 6.5L5 9.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                      <span className="lit-check-label">{o.label}</span>
                      <span className="lit-check-count">({n})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <div className="lit-list-col">
          <div className="lit-chips-row" role="status">
            <span className="lit-chips-label">已选筛选：</span>
            <span className="lit-chips-list">
              {cats.map((v) => (
                <span key={`cat-${v}`} className="lit-chip">
                  {CATEGORY_OPTIONS.find((o) => o.value === v)?.label}
                  <button
                    type="button"
                    aria-label="移除"
                    className="lit-chip-close"
                    onClick={() => setCats((arr) => arr.filter((x) => x !== v))}
                  >
                    ×
                  </button>
                </span>
              ))}
              {gradeFilters.map((v) => (
                <span key={`grade-${v}`} className="lit-chip">
                  {GRADE_OPTIONS.find((o) => o.value === v)?.label}
                  <button
                    type="button"
                    aria-label="移除"
                    className="lit-chip-close"
                    onClick={() => setGradeFilters((arr) => arr.filter((x) => x !== v))}
                  >
                    ×
                  </button>
                </span>
              ))}
              {designFilters.map((v) => (
                <span key={`design-${v}`} className="lit-chip">
                  {DESIGN_OPTIONS.find((o) => o.value === v)?.label}
                  <button
                    type="button"
                    aria-label="移除"
                    className="lit-chip-close"
                    onClick={() => setDesignFilters((arr) => arr.filter((x) => x !== v))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </span>
            <button
              type="button"
              className="lit-chips-clear"
              onClick={clearAllFilters}
              disabled={!hasAnyFilter}
            >
              清空全部
            </button>
            <span className="lit-chips-total">共 {filtered.length} 篇</span>
          </div>

        <nav className="lit-list lit-list--full" aria-label="证据条目列表">
          {filtered.length === 0 ? (
            <div className="lit-list-empty">无匹配条目，请调整筛选或关键词。</div>
          ) : (
            <ul className="lit-list-ul">
              {filtered.map((ev) => (
                <li key={ev.id}>
                  <button
                    type="button"
                    className={`lit-list-item ${selectedId === ev.id && drawerOpen ? 'lit-list-item--active' : ''}`}
                    onClick={() => openDetail(ev.id)}
                    onKeyDown={(e) => roleButtonActivate(e, () => openDetail(ev.id))}
                  >
                    <span className="lit-list-tags">
                      <span className={categoryBadgeClass(ev.category)}>{categoryLabel(ev.category)}</span>
                      <span className={`lit-grade lit-grade--${ev.evidenceGrade}`}>{EVIDENCE_GRADE_LABEL[ev.evidenceGrade]}</span>
                      <span className="lit-design">{STUDY_DESIGN_LABEL[ev.studyDesign]}</span>
                    </span>
                    <span className="lit-list-item-title">{ev.title}</span>
                    <span className="lit-list-item-thesis">{ev.thesis}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
        </div>
      </div>

      {drawerOpen && selected ? (
        <>
          <div
            className="lit-drawer-mask"
            onClick={closeDrawer}
            role="presentation"
          />
          <section
            className="lit-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="文献详情"
            style={{ width: drawerWidth }}
          >
            <div
              className="lit-drawer-resizer"
              role="separator"
              aria-orientation="vertical"
              aria-label="拖拽调整抽屉宽度"
              onMouseDown={startDrawerResize}
            />
            <header className="lit-drawer-head">
              <span className="lit-drawer-title-text">文献详情</span>
              <button
                type="button"
                className="lit-drawer-close"
                onClick={closeDrawer}
                aria-label="关闭"
              >
                ×
              </button>
            </header>
            <div className="lit-drawer-body">
              <div className="lit-detail-header">
                <div className="lit-detail-badges">
                  <span className={categoryBadgeClass(selected.category)}>{categoryLabel(selected.category)}</span>
                  <span className={`lit-grade lit-grade--${selected.evidenceGrade}`}>{EVIDENCE_GRADE_LABEL[selected.evidenceGrade]}</span>
                  <span className="lit-design lit-design--inline">{STUDY_DESIGN_LABEL[selected.studyDesign]}</span>
                </div>
                <h3 className="lit-detail-title">{selected.title}</h3>
                <p className="lit-detail-thesis">{selected.thesis}</p>
                <div className="lit-detail-kw">
                  {selected.keywords.map((k) => (
                    <span key={k} className="lit-kw">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lit-dim-grid">
                {DIMENSION_META.map((dim) => (
                  <article key={dim.key} className={`lit-dim lit-dim--${dim.tone}`}>
                    <div className="lit-dim-head">
                      <span className="lit-dim-title">{dim.title}</span>
                      <span className="lit-dim-hint">{dim.hint}</span>
                    </div>
                    <p className="lit-dim-body">{selected[dim.key]}</p>
                  </article>
                ))}
              </div>

              <footer className="lit-source">
                <div className="lit-source-label">来源</div>
                <p className="lit-source-cite">{selected.citation}</p>
                <p className="lit-source-meta">
                  {selected.journal && <span>{selected.journal}</span>}
                  {selected.year != null && <span> · {selected.year}</span>}
                  {selected.doi && (
                    <span>
                      {' '}
                      · DOI{' '}
                      <a href={`https://doi.org/${selected.doi}`} target="_blank" rel="noreferrer">
                        {selected.doi}
                      </a>
                    </span>
                  )}
                </p>
              </footer>

              {selected.guidelineAlignment ? (
                <aside className="lit-alignment" aria-label="指南路径对齐元数据">
                  <div className="lit-alignment-title">指南路径对齐（元数据）</div>
                  <p className="lit-alignment-note">
                    供多源路径匹配与<strong>综合展示层</strong>使用：将文献片段与指南目录、阶段/节点语义对齐，而非在本页跳转。
                  </p>
                  <dl className="lit-alignment-dl">
                    <div>
                      <dt>目录挂载 tocId</dt>
                      <dd><code className="lit-code">{selected.guidelineAlignment.tocId}</code></dd>
                    </div>
                    {selected.guidelineAlignment.stageHint ? (
                      <div>
                        <dt>路径阶段 hint</dt>
                        <dd>{selected.guidelineAlignment.stageHint}</dd>
                      </div>
                    ) : null}
                    {selected.guidelineAlignment.nodeHint ? (
                      <div>
                        <dt>节点 / 主题 hint</dt>
                        <dd>{selected.guidelineAlignment.nodeHint}</dd>
                      </div>
                    ) : null}
                  </dl>
                </aside>
              ) : null}
            </div>
          </section>
        </>
      ) : null}

      <p className="lit-footnote">
        证据等级采用 GRADE 四档示意；正式环境应经系统评价流程降级/升级并记录依据。研究设计标签用于分层，不等同于证据确定性本身。
      </p>
    </div>
  );
}
