export interface StructuredAnswerData {
  templateKey: 'her2_low' | 'cervical_immune' | 'bcs_omit_rt';
  question: string;
  contextLine: string;
  guidelineTocId?: string;
  summaryCards: {
    kicker: string;
    title: string;
    desc: string;
    tone: 'teal' | 'blue' | 'amber' | 'violet';
  }[];
  pathways: {
    primary: string;
    alternative: string;
  };
  evidence: {
    grade: 'high' | 'moderate' | 'boundary';
    gradeLabel: string;
    text: string;
    evidenceId?: string;
  }[];
  execution: {
    phase: '治疗前' | '治疗中' | '治疗后';
    text: string;
    tone: 'teal' | 'blue' | 'amber';
  }[];
  openQuestions: string[];
  mdtDraft: {
    kicker: string;
    text: string;
    highlight?: boolean;
  }[];
}

const HER2_LOW: StructuredAnswerData = {
  templateKey: 'her2_low',
  question: 'HER2-low 晚期乳腺癌在内分泌经治后，何时优先选择 ADC？',
  contextLine:
    'HER2-low 晚期乳腺癌患者在内分泌治疗失败后，ADC 治疗应如何把握最佳介入时机？',
  guidelineTocId: 'tumor-breast',
  summaryCards: [
    { kicker: '首选', title: 'ADC 升级路径', tone: 'teal', desc: '内分泌经治进展后优先' },
    { kicker: '备选', title: '标准化疗序贯', tone: 'blue', desc: 'HER2-low 复核不一致时' },
    { kicker: '触发阈值', title: 'ILD 风险 + 复核', tone: 'amber', desc: '切换备选路径的条件' },
    { kicker: '下次复评', title: '2 周 · 6–8 周', tone: 'violet', desc: '症状监测 · 疗效复评节点' },
  ],
  pathways: {
    primary:
      '内分泌经治进展后，优先比较"ADC 升级"与"标准化疗序贯"两条路径，前置条件是 HER2-low 判读可重复。',
    alternative:
      '若 HER2-low 复核不一致或肺毒性风险高，转入标准化疗/内分泌后线并保留再评估窗口。',
  },
  evidence: [
    {
      grade: 'high',
      gradeLabel: '高',
      text: 'DESTINY-Breast04 提示 HER2-low 人群在关键终点上可获益。',
      evidenceId: 'ev-003',
    },
    {
      grade: 'moderate',
      gradeLabel: '中',
      text: '获益与病理判读稳定性、既往治疗线数、毒性可管理性相关。',
      evidenceId: 'ev-003',
    },
    {
      grade: 'boundary',
      gradeLabel: '边界',
      text: 'IHC/ISH 灰区、既往肺部基础病或无法密切监测时，外推需谨慎。',
      evidenceId: 'ev-003',
    },
  ],
  execution: [
    { phase: '治疗前', tone: 'teal', text: '完成 HER2-low 复核、基线胸部评估与风险分层。' },
    { phase: '治疗中', tone: 'blue', text: '每周期评估呼吸症状与影像必要性，出现疑似 ILD 立即暂停并分级处置。' },
    { phase: '治疗后', tone: 'amber', text: '按疗效—毒性平衡决定维持、换线或回退到标准序贯方案。' },
  ],
  openQuestions: [
    '本例 HER2-low 判读是否稳定可复现？',
    '当前获益预期是否足以覆盖 ILD 等关键风险？',
    '若早期停药，备选路径是否已经前置规划？',
  ],
  mdtDraft: [
    { kicker: '本次需拍板', text: '主路径是否升级、何时复评、何时切换' },
    { kicker: '优先呈现材料', text: '分层依据、关键症状、近期疗效与毒性曲线' },
    { kicker: '讨论建议', text: '适应证 → 风险边界 → 降阶预案' },
    { kicker: '输出格式', text: '首选 + 备选 + 触发阈值 + 下次复评时间点', highlight: true },
  ],
};

const CERVICAL_IMMUNE: StructuredAnswerData = {
  templateKey: 'cervical_immune',
  question: '局部晚期宫颈癌同步放化疗时，哪些患者可以考虑免疫联合？',
  contextLine:
    '局部晚期宫颈癌同步放化疗阶段，哪些患者最有可能从免疫联合治疗中获益？',
  guidelineTocId: 'tumor-cervical',
  summaryCards: [
    { kicker: '首选', title: '放化疗 + 免疫', tone: 'teal', desc: '适应证满足、禁忌可控' },
    { kicker: '备选', title: '标准放化疗', tone: 'blue', desc: '回到放化疗主路径' },
    { kicker: '触发阈值', title: 'irAE / 禁忌', tone: 'amber', desc: '免疫不耐受时切换路径' },
    { kicker: '下次复评', title: '6–12 周', tone: 'violet', desc: '影像与症状复评' },
  ],
  pathways: {
    primary:
      '首选"根治性放疗 + 同期含铂化疗"，在适应证满足且禁忌可控时进入"放化疗 + 免疫"升级分支。',
    alternative:
      '若出现免疫禁忌或无法耐受，可回到放化疗主路径并加强局部控制与支持治疗。',
  },
  evidence: [
    {
      grade: 'high',
      gradeLabel: '高',
      text: 'KEYNOTE 类随机研究显示联合免疫可改善关键结局，获益与人群筛选强相关。',
      evidenceId: 'ev-002',
    },
    {
      grade: 'moderate',
      gradeLabel: '中',
      text: '真实世界中获益受放疗执行质量、并发症负担与依从性影响，需动态复评。',
      evidenceId: 'ev-002',
    },
    {
      grade: 'boundary',
      gradeLabel: '边界',
      text: '活动性自身免疫病、未控感染或器官储备不足时，不宜机械升级。',
      evidenceId: 'ev-002',
    },
  ],
  execution: [
    {
      phase: '治疗前',
      tone: 'teal',
      text: '完成免疫禁忌筛查、感染评估、放疗靶区与近距离治疗可执行性核对。',
    },
    {
      phase: '治疗中',
      tone: 'blue',
      text: '每周期监测血象、肾功能、免疫相关不良事件；达到 2 级以上持续毒性即复盘治疗线。',
    },
    {
      phase: '治疗后',
      tone: 'amber',
      text: '按 6–12 周复评影像与症状，明确持续治疗、降阶或转后线方案。',
    },
  ],
  openQuestions: [
    '本例是否真正满足免疫升级标准，还是仅满足"可尝试"条件？',
    '若发生 irAE，暂停/停药阈值和替代路径是否已预先定义？',
    '局部控制失败风险来自分期、靶区覆盖还是治疗连续性？',
  ],
  mdtDraft: [
    { kicker: '本次需拍板', text: '是否进入免疫升级分支、何时复评' },
    { kicker: '优先呈现材料', text: '分期依据、禁忌筛查结果、放疗执行质量' },
    { kicker: '讨论建议', text: '适应证 → 禁忌边界 → 不良事件预案' },
    { kicker: '输出格式', text: '首选 + 备选 + 触发阈值 + 下次复评时间点', highlight: true },
  ],
};

const BCS_OMIT_RT: StructuredAnswerData = {
  templateKey: 'bcs_omit_rt',
  question: '保乳术后高龄 HR+ 低危患者，省略放疗的边界条件是什么？',
  contextLine:
    '对于保乳术后的高龄 HR+ 低危乳腺癌患者，省略放疗的临床边界应如何界定？',
  guidelineTocId: 'tumor-breast',
  summaryCards: [
    { kicker: '首选', title: '标准全乳放疗', tone: 'teal', desc: '保乳术后默认路径' },
    { kicker: '备选', title: '省略放疗（讨论）', tone: 'blue', desc: '严格低危人群' },
    { kicker: '触发阈值', title: '依从性 + 切缘', tone: 'amber', desc: '不可保证时回归放疗' },
    { kicker: '下次复评', title: '6 月 · 12 月', tone: 'violet', desc: '随访密度需提升' },
  ],
  pathways: {
    primary: '标准路径是保乳术后全乳放疗；仅在严格低危条件下，进入"省略放疗"分支评估。',
    alternative: '若低危条件不完整或依从性不可保证，回归放疗标准路径，不建议"边缘省略"。',
  },
  evidence: [
    {
      grade: 'high',
      gradeLabel: '中',
      text: '老年 HR+ 低危人群可讨论省略放疗，但局部复发风险通常高于放疗组。',
      evidenceId: 'ev-004',
    },
    {
      grade: 'moderate',
      gradeLabel: '中',
      text: '总生存差异不显著不等于所有亚组都可省略，需要严格人群匹配。',
      evidenceId: 'ev-004',
    },
    {
      grade: 'boundary',
      gradeLabel: '边界',
      text: '年轻患者、三阴性、切缘高风险或依从性不足者不宜外推省略策略。',
      evidenceId: 'ev-004',
    },
  ],
  execution: [
    {
      phase: '治疗前',
      tone: 'teal',
      text: '核对低危定义、切缘状态、内分泌可行性与患者偏好。',
    },
    {
      phase: '治疗中',
      tone: 'blue',
      text: '若省略放疗，需提高随访密度并强化影像与症状追踪。',
    },
    {
      phase: '治疗后',
      tone: 'amber',
      text: '出现复发风险信号时应快速回到强化局部控制路径。',
    },
  ],
  openQuestions: [
    '该患者是否同时满足"生物学低危 + 治疗依从性高"双条件？',
    '省略放疗后，随访频次和触发回切标准是否被明确记录？',
    '患者是否充分理解"绝对风险差异"而非只看相对风险？',
  ],
  mdtDraft: [
    { kicker: '本次需拍板', text: '是否省略放疗、随访频次、回切触发条件' },
    { kicker: '优先呈现材料', text: '切缘状态、肿瘤生物学、内分泌依从性' },
    { kicker: '讨论建议', text: '低危条件 → 患者偏好 → 随访保障' },
    { kicker: '输出格式', text: '首选 + 备选 + 触发阈值 + 下次复评时间点', highlight: true },
  ],
};

export const FIXED_AGENT_ANSWERS: StructuredAnswerData[] = [
  HER2_LOW,
  CERVICAL_IMMUNE,
  BCS_OMIT_RT,
];

export function findFixedAnswer(question: string): StructuredAnswerData | null {
  const q = question.trim();
  return FIXED_AGENT_ANSWERS.find((a) => a.question === q) ?? null;
}
