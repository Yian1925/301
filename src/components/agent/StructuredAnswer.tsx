import { useState } from 'react';
import type { StructuredAnswerData } from '../../data/agentAnswers';
import { useAppStore } from '../../store';
import type { PageId } from '../../types';

type SectionStatus = 'pending' | 'loading' | 'rendered';

interface StructuredAnswerProps {
  answer: StructuredAnswerData | null;
  doneStages: Set<number>;
  loadingStage: number | null;
  onUpdateQuestion?: (next: string) => void;
  onRegenerate?: () => void;
}

const STAGE_TITLE: Record<number, string> = {
  1: '临床问题重述',
  2: '候选路径对照',
  3: '证据归纳',
  4: '院内执行要点',
  5: '待决策问题',
  6: 'MDT 讨论结论草案',
};

function SectionLoading({ label }: { label: string }) {
  return (
    <div className="ans-section-streaming">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="ans-section-streaming-text">正在生成「{label}」…</span>
    </div>
  );
}

function SectionEmpty({ label }: { label: string }) {
  return (
    <div className="ans-section-empty">
      <span className="ans-section-empty-tag">尚未生成</span>
      <span className="ans-section-empty-hint">问答开始后将自动展开「{label}」</span>
    </div>
  );
}

export default function StructuredAnswer({
  answer,
  doneStages,
  loadingStage,
  onUpdateQuestion,
  onRegenerate,
}: StructuredAnswerProps) {
  const {
    setPage,
    setGuidelineTocId,
    setLiteratureFocusEvidenceId,
    setLiteratureDeepLink,
    setChatEntryTarget,
  } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(answer?.contextLine ?? '');

  const goToGuideline = (tocId: string) => {
    setChatEntryTarget('guidelines');
    setGuidelineTocId(tocId);
    setPage('guidelines' as PageId);
  };
  const goToLiterature = (evidenceId?: string) => {
    setChatEntryTarget('literature');
    if (evidenceId) {
      setLiteratureDeepLink(null);
      setLiteratureFocusEvidenceId(evidenceId);
    }
    setPage('literature' as PageId);
  };

  const startEdit = () => {
    if (!answer) return;
    setDraft(answer.contextLine);
    setEditing(true);
  };
  const cancelEdit = () => {
    setDraft(answer?.contextLine ?? '');
    setEditing(false);
  };
  const saveEdit = () => {
    if (!answer) return;
    const next = draft.trim();
    if (next && next !== answer.contextLine) {
      onUpdateQuestion?.(next);
    }
    setEditing(false);
  };

  const stageStatus = (n: number): SectionStatus => {
    if (doneStages.has(n)) return 'rendered';
    if (loadingStage === n) return 'loading';
    return 'pending';
  };

  const s1 = stageStatus(1);
  const s2 = stageStatus(2);
  const s3 = stageStatus(3);
  const s4 = stageStatus(4);
  const s5 = stageStatus(5);
  const s6 = stageStatus(6);

  return (
    <div className="ans-v3">
      {/* Section 1: 临床问题重述 */}
      <section className={`ans-section ans-section--restate ans-section--${s1}`}>
        <div className="ans-section-head">
          <span className={`ans-section-no ans-section-no--${s1}`}>{s1 === 'rendered' ? '1' : '1'}</span>
          <div className="ans-section-head-text">
            <span className="ans-section-kicker">临床问题重述</span>
            {s1 === 'rendered' && answer && (
              editing ? (
                <textarea
                  className="ans-edit-textarea"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  autoFocus
                />
              ) : (
                <h3 className="ans-section-title">{answer.contextLine}</h3>
              )
            )}
            {s1 === 'loading' && <SectionLoading label={STAGE_TITLE[1]} />}
            {s1 === 'pending' && <SectionEmpty label={STAGE_TITLE[1]} />}
          </div>
        </div>
        {s1 === 'rendered' && answer && (
          <div className="ans-section-foot ans-section-foot--split">
            <span className="ans-foot-hint">若理解不准确，可修改问题保存后重新生成结构化回答</span>
            <div className="ans-foot-actions">
              {editing ? (
                <>
                  <button type="button" className="ans-action ans-action--ghost" onClick={cancelEdit}>
                    取消
                  </button>
                  <button
                    type="button"
                    className="ans-action ans-action--primary"
                    onClick={saveEdit}
                    disabled={!draft.trim()}
                  >
                    保存
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="ans-action ans-action--ghost" onClick={startEdit}>
                    修改问题
                  </button>
                  <button
                    type="button"
                    className="ans-action ans-action--primary"
                    onClick={() => onRegenerate?.()}
                  >
                    重新生成
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Summary cards: shown together with section 2 when rendered */}
      {s2 === 'rendered' && answer && (
        <div className="ans-summary-grid">
          {answer.summaryCards.map((c) => (
            <div key={c.kicker} className={`ans-summary-card ans-summary-card--${c.tone}`}>
              <span className="ans-summary-card-kicker">{c.kicker}</span>
              <span className="ans-summary-card-title">{c.title}</span>
              <span className="ans-summary-card-desc">{c.desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* Section 2: 候选路径对照 */}
      <section className={`ans-section ans-section--${s2}`}>
        <div className="ans-section-head">
          <span className={`ans-section-no ans-section-no--${s2}`}>2</span>
          <div className="ans-section-head-text">
            <span className="ans-section-title">候选路径对照</span>
            {s2 === 'loading' && <SectionLoading label={STAGE_TITLE[2]} />}
            {s2 === 'pending' && <SectionEmpty label={STAGE_TITLE[2]} />}
          </div>
        </div>
        {s2 === 'rendered' && answer && (
          <div className="ans-pathway-row">
            <div className="ans-pathway ans-pathway--primary">
              <div className="ans-pathway-head">
                <span className="ans-pathway-tag ans-pathway-tag--teal">主路径</span>
                <span className="ans-chip ans-chip--teal">指南</span>
              </div>
              <p className="ans-pathway-text">{answer.pathways.primary}</p>
            </div>
            <div className="ans-pathway ans-pathway--alt">
              <div className="ans-pathway-head">
                <span className="ans-pathway-tag ans-pathway-tag--amber">备选</span>
                <span className="ans-chip ans-chip--teal">指南</span>
              </div>
              <p className="ans-pathway-text">{answer.pathways.alternative}</p>
            </div>
          </div>
        )}
      </section>

      {/* Section 3 & 4: 证据归纳 + 院内执行要点 */}
      <div className="ans-twin-row">
        <section className={`ans-section ans-twin ans-section--${s3}`}>
          <div className="ans-section-head">
            <span className={`ans-section-no ans-section-no--${s3}`}>3</span>
            <div className="ans-section-head-text">
              <span className="ans-section-title">证据归纳</span>
              {s3 === 'loading' && <SectionLoading label={STAGE_TITLE[3]} />}
              {s3 === 'pending' && <SectionEmpty label={STAGE_TITLE[3]} />}
            </div>
          </div>
          {s3 === 'rendered' && answer && (
            <ul className="ans-evidence-list">
              {answer.evidence.map((e, i) => (
                <li key={i} className="ans-evidence-item">
                  <span className={`ans-evidence-grade ans-evidence-grade--${e.grade}`}>{e.gradeLabel}</span>
                  <span className="ans-evidence-text">{e.text}</span>
                  <button
                    type="button"
                    className="ans-chip ans-chip--blue ans-chip--btn"
                    onClick={() => goToLiterature(e.evidenceId)}
                  >
                    文献
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`ans-section ans-twin ans-section--${s4}`}>
          <div className="ans-section-head">
            <span className={`ans-section-no ans-section-no--${s4}`}>4</span>
            <div className="ans-section-head-text">
              <span className="ans-section-title">院内执行要点</span>
              {s4 === 'loading' && <SectionLoading label={STAGE_TITLE[4]} />}
              {s4 === 'pending' && <SectionEmpty label={STAGE_TITLE[4]} />}
            </div>
          </div>
          {s4 === 'rendered' && answer && (
            <ul className="ans-timeline">
              {answer.execution.map((step, i) => (
                <li key={i} className={`ans-timeline-item ans-timeline-item--${step.tone}`}>
                  <span className={`ans-timeline-dot ans-timeline-dot--${step.tone}`} aria-hidden />
                  <div className="ans-timeline-body">
                    <span className={`ans-timeline-phase ans-timeline-phase--${step.tone}`}>{step.phase}</span>
                    <span className="ans-timeline-text">{step.text}</span>
                  </div>
                  <div className="ans-timeline-tags">
                    <button
                      type="button"
                      className="ans-chip ans-chip--teal ans-chip--btn"
                      onClick={() => answer.guidelineTocId && goToGuideline(answer.guidelineTocId)}
                    >
                      指南
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Section 5: 待决策问题 */}
      <section className={`ans-section ans-section--amber ans-section--${s5}`}>
        <div className="ans-section-head">
          <span className={`ans-section-no ans-section-no--amber ans-section-no--${s5}`}>5</span>
          <div className="ans-section-head-text">
            <span className="ans-section-title ans-section-title--amber">待决策问题</span>
            {s5 === 'rendered' && answer && (
              <p className="ans-section-hint ans-section-hint--amber">
                以下三点需在 MDT 会上明确决策，智能助手无法自动代替
              </p>
            )}
            {s5 === 'loading' && <SectionLoading label={STAGE_TITLE[5]} />}
            {s5 === 'pending' && <SectionEmpty label={STAGE_TITLE[5]} />}
          </div>
        </div>
        {s5 === 'rendered' && answer && (
          <ul className="ans-question-list">
            {answer.openQuestions.map((q, i) => (
              <li key={i} className="ans-question-item">
                <span className="ans-question-bullet">·</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Section 6: MDT 讨论结论草案 */}
      <section className={`ans-section ans-section--mdt ans-section--${s6}`}>
        <div className="ans-section-head">
          <span className={`ans-section-no ans-section-no--${s6}`}>6</span>
          <div className="ans-section-head-text">
            <span className="ans-section-title">MDT 讨论结论草案</span>
            {s6 === 'loading' && <SectionLoading label={STAGE_TITLE[6]} />}
            {s6 === 'pending' && <SectionEmpty label={STAGE_TITLE[6]} />}
          </div>
        </div>
        {s6 === 'rendered' && answer && (
          <div className="ans-mdt-grid">
            {answer.mdtDraft.map((m, i) => (
              <div
                key={i}
                className={`ans-mdt-card ${m.highlight ? 'ans-mdt-card--highlight' : ''}`}
              >
                <span className="ans-mdt-card-kicker">{m.kicker}</span>
                <span className="ans-mdt-card-text">{m.text}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
