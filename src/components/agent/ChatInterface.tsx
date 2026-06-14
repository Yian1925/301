import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import StructuredAnswer from './StructuredAnswer';
import { findFixedAnswer, FIXED_AGENT_ANSWERS } from '../../data/agentAnswers';
import type { StructuredAnswerData } from '../../data/agentAnswers';
import type { ChatMessage as ChatMessageType, ChatSourceLink } from '../../types';
import { useAppStore } from '../../store';

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  loading: boolean;
  onSendMessage: (content: string) => void;
  onResetChat: () => void;
  onOpenPatientSelector: () => void;
  patientLabel: string;
}

const QUICK_CARD_TITLES = ['ADC用药时机', '宫颈癌免疫联合', '保乳放疗省略条件'] as const;

const STAGE_LABELS = [
  '问题重述',
  '路径对照',
  '证据归纳',
  '执行要点',
  '待决策',
  'MDT 草案',
] as const;

const LOADING_MS = 1200;
const STAGE_GAP_MS = 350;

function renderQuickAskIcon(idx: number) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (idx === 0) {
    return (
      <svg width="18" height="18" viewBox="0 0 20 20" {...common} aria-hidden="true">
        <path d="M7.5 3.5h5l2 3.5-2 3.5h-5l-2-3.5 2-3.5Z" />
        <path d="M6 11.5v5" />
        <path d="M14 11.5v5" />
      </svg>
    );
  }
  if (idx === 1) {
    return (
      <svg width="18" height="18" viewBox="0 0 20 20" {...common} aria-hidden="true">
        <path d="M10 2.8 16.8 6v6.2c0 3.5-2.7 5.5-6.8 5.9-4.1-.4-6.8-2.4-6.8-5.9V6L10 2.8Z" />
        <path d="M7.2 10.2l1.9 1.9 3.7-4.2" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" {...common} aria-hidden="true">
      <path d="M4.2 12.4c2.2-6 9.4-6.3 11.6 0" />
      <path d="M10 3.3c0 1.8 0 3.4 0 5.2" />
      <path d="M7.1 14.7h5.8" />
    </svg>
  );
}

interface AnswerStepperProps {
  loadingStage: number | null;
  doneStages: Set<number>;
}

function AnswerStepper({ loadingStage, doneStages }: AnswerStepperProps) {
  const doneCount = doneStages.size;
  const total = STAGE_LABELS.length;
  const allDone = doneCount === total;
  const currentLabel = loadingStage ? STAGE_LABELS[loadingStage - 1] : null;

  let statusText = '';
  if (allDone) {
    statusText = `已完成全部 ${total} 个结构模块`;
  } else if (loadingStage) {
    statusText = `回答进度 ${doneCount} / ${total} 已完成 · 正在生成「${currentLabel}」`;
  } else {
    statusText = `回答进度 ${doneCount} / ${total} 已完成`;
  }

  return (
    <div className="ans-stepper-card">
      <div className="ans-stepper-head">
        <span className="ans-stepper-status">{statusText}</span>
        {!allDone && loadingStage && (
          <span className="ans-stepper-timer ans-stepper-timer--running">生成中…</span>
        )}
        {allDone && (
          <span className="ans-stepper-timer">全部完成</span>
        )}
      </div>
      <ol className="ans-stepper">
        {STAGE_LABELS.map((label, i) => {
          const n = i + 1;
          const done = doneStages.has(n);
          const running = loadingStage === n;
          const state = done ? 'done' : running ? 'running' : 'pending';
          const next = n < total;
          const nextDone = doneStages.has(n + 1);
          const connState = done && (nextDone || loadingStage === n + 1)
            ? 'done'
            : done
              ? 'active'
              : 'pending';
          return (
            <li key={label} className={`ans-step ans-step--${state}`}>
              <div className="ans-step-node-wrap">
                <span className={`ans-step-node ans-step-node--${state}`}>
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                      <path
                        d="M3.5 8.5l3 3 6-7"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : running ? (
                    <span className="ans-step-pulse" />
                  ) : (
                    <span className="ans-step-num">{n}</span>
                  )}
                </span>
                {next && <span className={`ans-step-conn ans-step-conn--${connState}`} />}
              </div>
              <span className={`ans-step-label ans-step-label--${state}`}>
                <span className="ans-step-label-no">{['①','②','③','④','⑤','⑥'][i]}</span> {label}
              </span>
            </li>
          );
        })}
      </ol>
      {!allDone && (
        <div className="ans-stepper-foot">
          <span className="ans-stepper-foot-hint">
            {loadingStage
              ? `当前模块生成中，完成后将自动进入下一阶段（${doneCount + 1} / ${total}）`
              : '准备进入下一模块…'}
          </span>
        </div>
      )}
    </div>
  );
}

export default function ChatInterface({
  messages,
  loading,
  onSendMessage,
  onResetChat,
}: ChatInterfaceProps) {
  const [quickQuestion, setQuickQuestion] = useState('');
  const [structuredAnswer, setStructuredAnswer] = useState<StructuredAnswerData | null>(null);
  const [activeFixed, setActiveFixed] = useState<StructuredAnswerData | null>(null);
  const [loadingStage, setLoadingStage] = useState<number | null>(null);
  const [doneStages, setDoneStages] = useState<Set<number>>(new Set());
  const streamingRef = useRef(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const loadTimerRef = useRef<number | null>(null);
  const gapTimerRef = useRef<number | null>(null);
  const activeFixedRef = useRef<StructuredAnswerData | null>(null);

  const {
    setPage,
    setGuidelineTocId,
    setLiteratureFocusEvidenceId,
    setLiteratureDeepLink,
    setPatientsListDeepLink,
    setPatientsOpenJourneyAdmissionId,
    setSynthesisEntryTarget,
    setChatEntryTarget,
  } = useAppStore();

  useEffect(() => {
    if (!areaRef.current) return;
    areaRef.current.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (!areaRef.current) return;
    if (messages.length === 0) return;
    areaRef.current.scrollTop = areaRef.current.scrollHeight;
  }, [messages, loading]);

  const clearTimers = () => {
    if (loadTimerRef.current) {
      window.clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
    if (gapTimerRef.current) {
      window.clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
  };

  useEffect(() => () => clearTimers(), []);

  const startStage = (n: number) => {
    const fixed = activeFixedRef.current;
    if (!fixed) return;
    clearTimers();
    setLoadingStage(n);
    loadTimerRef.current = window.setTimeout(() => {
      setDoneStages((prev) => {
        const next = new Set(prev);
        next.add(n);
        return next;
      });
      setLoadingStage(null);
      if (n === 1) {
        setStructuredAnswer(fixed);
      }
      if (n < STAGE_LABELS.length) {
        gapTimerRef.current = window.setTimeout(() => {
          startStage(n + 1);
        }, STAGE_GAP_MS);
      } else {
        streamingRef.current = false;
      }
    }, LOADING_MS);
  };

  const handleQuickAsk = () => {
    const q = quickQuestion.trim();
    if (!q) return;
    setQuickQuestion('');
    const fixed = findFixedAnswer(q);
    if (fixed) {
      setStructuredAnswer(null);
      activeFixedRef.current = fixed;
      setActiveFixed(fixed);
      setDoneStages(new Set());
      setLoadingStage(null);
      streamingRef.current = true;
      startStage(1);
      return;
    }
    onSendMessage(q);
  };

  const handleReset = () => {
    clearTimers();
    streamingRef.current = false;
    activeFixedRef.current = null;
    setStructuredAnswer(null);
    setActiveFixed(null);
    setDoneStages(new Set());
    setLoadingStage(null);
    onResetChat();
  };

  const handleUpdateQuestion = (next: string) => {
    setStructuredAnswer((prev) => (prev ? { ...prev, contextLine: next } : prev));
    if (activeFixedRef.current) {
      activeFixedRef.current = { ...activeFixedRef.current, contextLine: next };
      setActiveFixed(activeFixedRef.current);
    }
  };

  const handleRegenerate = () => {
    if (!activeFixedRef.current) return;
    clearTimers();
    setDoneStages(new Set([1]));
    setLoadingStage(null);
    streamingRef.current = true;
    startStage(2);
  };

  const goToResource = (source: ChatSourceLink) => {
    setSynthesisEntryTarget(null);
    if (source.targetPage === 'guidelines') {
      setChatEntryTarget('guidelines');
      if (source.guidelineTocId) setGuidelineTocId(source.guidelineTocId);
      setPage('guidelines');
      return;
    }
    if (source.targetPage === 'literature') {
      setChatEntryTarget('literature');
      if (source.evidenceId) {
        setLiteratureDeepLink(null);
        setLiteratureFocusEvidenceId(source.evidenceId);
      }
      setPage('literature');
      return;
    }
    setChatEntryTarget('patients');
    if (source.admissionId) {
      setPatientsOpenJourneyAdmissionId(source.admissionId);
    } else {
      setPatientsOpenJourneyAdmissionId(null);
      if (source.diagnosisKeywords && source.diagnosisKeywords.length > 0) {
        setPatientsListDeepLink({ diagnosisKeywords: source.diagnosisKeywords });
      }
    }
    setPage('patients');
  };

  const isStreaming = !!activeFixed && (loadingStage !== null || doneStages.size < STAGE_LABELS.length);
  const showSkeleton = !activeFixed && !structuredAnswer;
  const showAnswer = !!activeFixed;

  return (
    <>
      <div className="chat-area" ref={areaRef}>
        <div className="agent-workbench agent-workbench--v3">
          <div className="agent-workbench-head">
            <div className="agent-workbench-head-text">
              <p className="agent-workbench-subtitle">
                每次回答固定展开为 6 个结构模块，方便医生快速核对与 MDT 讨论
              </p>
            </div>
            <button type="button" className="agent-outline-btn agent-outline-btn--pill" onClick={handleReset}>
              新建问答
            </button>
          </div>

          {!isStreaming && !showAnswer && (
            <div className="agent-input-card">
              <div className="agent-input-row">
                <textarea
                  className="agent-input-textarea"
                  value={quickQuestion}
                  onChange={(e) => setQuickQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleQuickAsk();
                    }
                  }}
                  placeholder="输入临床问题、患者特征、决策或治疗场景，回答将自动展开为固定结构子模块"
                  rows={2}
                />
                <button
                  type="button"
                  className="agent-input-send"
                  onClick={handleQuickAsk}
                  disabled={!quickQuestion.trim()}
                >
                  生成回答
                </button>
              </div>
              <div className="agent-template-row">
                <span className="agent-template-row-label">示例提示词</span>
                <div className="agent-template-chips">
                  {FIXED_AGENT_ANSWERS.map((a, idx) => (
                    <button
                      key={a.templateKey}
                      type="button"
                      className="agent-template-chip"
                      onClick={() => setQuickQuestion(a.question)}
                      title={a.question}
                    >
                      <span className="agent-template-chip-icon" aria-hidden>
                        {renderQuickAskIcon(idx)}
                      </span>
                      <span className="agent-template-chip-text">{QUICK_CARD_TITLES[idx] ?? `示例${idx + 1}`}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showAnswer && (
            <AnswerStepper
              loadingStage={loadingStage}
              doneStages={doneStages}
            />
          )}
        </div>

        {showSkeleton && (
          <StructuredAnswer
            answer={null}
            doneStages={new Set()}
            loadingStage={null}
          />
        )}

        {showAnswer && (
          <StructuredAnswer
            answer={structuredAnswer}
            doneStages={doneStages}
            loadingStage={loadingStage}
            onUpdateQuestion={handleUpdateQuestion}
            onRegenerate={handleRegenerate}
          />
        )}

        {!showAnswer && !showSkeleton &&
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              text={msg.text}
              sources={msg.sources}
              onSourceClick={goToResource}
            />
          ))}
        {!showAnswer && loading && (
          <div className="msg-row ai">
            <div className="avatar ai">AI</div>
            <div className="bubble ai">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
