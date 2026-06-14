import { useState, useEffect, useRef, useMemo } from 'react';
import GuidelineSearchSelect from './GuidelineSearchSelect';
import { useAppStore } from '../../store';
// @ts-expect-error InvasiveBreastCancerNCCN is JSX, no declaration file
import InvasiveBreastCancerNCCN from './InvasiveBreastCancerNCCN';
import cervicalTreeData from '../../data/guidelines/CervicalCancerCols.json';
import invasiveBreast3LayerData from '../../data/guidelines/nccn_invasive_breast_3layer.json';
import type { LymphomaDoc } from '../../hooks/useGuideline';

interface GuidelineViewerProps {
  doc: LymphomaDoc | null;
  onAskAboutNode?: (nodeTitle: string) => void;
  onNavigateToChat?: () => void;
}

export default function GuidelineViewer({ doc }: GuidelineViewerProps) {
  const [activeTocId, setActiveTocId] = useState<string | null>(null);
  const [showBackToSynthesis, setShowBackToSynthesis] = useState(false);
  const [showBackToChat, setShowBackToChat] = useState(false);
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const {
    page: routePage,
    guidelineTocId,
    setGuidelineTocId,
    setPage,
    synthesisEntryTarget,
    setSynthesisEntryTarget,
    chatEntryTarget,
    setChatEntryTarget,
  } = useAppStore();
  const prevRouteRef = useRef(routePage);

  useEffect(() => {
    if (routePage === 'guidelines') {
      setShowBackToSynthesis(prevRouteRef.current === 'synthesis' && synthesisEntryTarget === 'guidelines');
      setShowBackToChat(prevRouteRef.current === 'chat' && chatEntryTarget === 'guidelines');
    }
    prevRouteRef.current = routePage;
  }, [routePage, synthesisEntryTarget, chatEntryTarget]);

  useEffect(() => {
    if (guidelineTocId) {
      setActiveTocId(guidelineTocId);
      setGuidelineTocId(null);
    }
  }, [guidelineTocId, setGuidelineTocId]);

  if (!doc) return <div className="gl-main">正在加载指南目录…</div>;

  const currentTocId = activeTocId || 'tumor-breast';
  const hasCervicalPathway = currentTocId === 'tumor-cervical';
  const hasEarlyBreastPathway = currentTocId === 'tumor-breast';

  const currentLabel = (() => {
    for (const item of doc.toc) {
      const found = item.children?.find((c) => c.id === currentTocId);
      if (found) return found.label;
    }
    return '';
  })();

  const selectedSearchLabel = useMemo(() => currentLabel, [currentLabel]);

  return (
    <>
      <div className="gl-layout" ref={layoutRef}>
        <div className="gl-main gl-main--stack gl-main--full">
          <div className="gl-doc-header">
            <div className="gl-doc-head-row">
              <span className="gl-doc-title">{currentLabel}</span>
              <div className="gl-doc-head-actions">
                <GuidelineSearchSelect
                  toc={doc.toc}
                  activeId={currentTocId || undefined}
                  selectedLabel={selectedSearchLabel}
                  onSelect={(id) => setActiveTocId(id)}
                />
                {showBackToSynthesis ? (
                <button
                  type="button"
                  className="gl-back-synthesis"
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
                  className="gl-back-synthesis"
                  onClick={() => {
                    setChatEntryTarget(null);
                    setPage('chat');
                  }}
                >
                  返回Agent问答
                </button>
              ) : null}
              </div>
            </div>
            <span className="gl-doc-meta">
              {hasCervicalPathway
                ? 'ESMO Clinical Practice Guidelines · 2017'
                : hasEarlyBreastPathway
                  ? 'NCCN Clinical Practice Guidelines in Oncology · Invasive Breast Cancer (M0)'
                  : '在右侧选择疾病后，将显示对应指南来源与说明'}
            </span>
          </div>
          {hasCervicalPathway ? (
            <div style={{ flex: 1, minHeight: 520 }}>
              <InvasiveBreastCancerNCCN sourceData={cervicalTreeData} embedded />
            </div>
          ) : hasEarlyBreastPathway ? (
            <div style={{ flex: 1, minHeight: 520 }}>
              <InvasiveBreastCancerNCCN sourceData={invasiveBreast3LayerData} embedded />
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
              <div className="journey-empty">
                当前疾病尚未接入诊疗路径。请在右侧选择「宫颈癌」或「浸润性乳腺癌」等已接入病种。
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
