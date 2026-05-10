export type AbilityType = "A" | "B" | "C" | "D" | "E";
export type TrackType = "Knowledge" | "Lifestyle" | "Creativity" | "Business";

export interface QuizOption {
  text: string;
  scores: Record<AbilityType, number>;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export const abilityLabels: Record<AbilityType, string> = {
  A: "逻辑规划力",
  B: "表达感染力",
  C: "审美制作力",
  D: "专业知识度",
  E: "执行自律性",
};

export interface TrackData {
  name: string;
  focus: string;
  abilities: AbilityType[];
  persona: string;
  rivals: string[];
  analysis: string[];
}

export const tracks: Record<TrackType, TrackData> = {
  Knowledge: {
    name: "🚀 知识付费/深度教育赛道",
    focus: "理性分析，专业深度、系统化",
    abilities: ["D", "A", "E"],
    persona: "严谨的学者、耐心的导师、行业分析师",
    rivals: ["李永乐老师", "半佛仙人", "秋叶PPT"],
    analysis: [
      "该赛道以<strong>高价值内容</strong>驱动，用户付费意愿强，但门槛高，需要持续学习和极强的逻辑体系。",
      "竞争主要集中在知识的<strong>权威性</strong>和<strong>系统性</strong>。",
      "<strong>核心策略：</strong>深耕细分领域，通过系列化、结构化的内容输出建立<strong>专家人设</strong>和<strong>知识壁垒</strong>。"
    ]
  },
  Lifestyle: {
    name: "💖 亲和力/生活美学赛道",
    focus: "情感共鸣、高颜值、亲切互动",
    abilities: ["B", "C", "E"],
    persona: "邻家朋友、生活家、穿搭博主、美食达人",
    rivals: ["大嘴妹", "多肉", "小小莎老师"],
    analysis: [
      "该赛道以<strong>人设</strong>和<strong>审美</strong>驱动，易于快速积累粉丝，变现路径多样（广告、带货）。",
      "竞争激烈，内容同质化严重，需要持续的<strong>创意和亲和力</strong>来维护高粘度社群。",
      "<strong>核心策略：</strong>稳定输出<strong>高品质视觉内容</strong>，通过<strong>真实、亲和的Vlog</strong>建立强情感连接，快速尝试短视频种草。"
    ]
  },
  Creativity: {
    name: "💡 创意/娱乐才艺赛道",
    focus: "新奇有趣、表演天赋、病毒式传播",
    abilities: ["C", "B", "A"],
    persona: "喜剧人、才艺表演者、创意策划师、野生艺术家",
    rivals: ["手工耿", "papi酱", "李子柒"],
    analysis: [
      "该赛道以<strong>创意</strong>和<strong>天赋</strong>驱动，内容容易突破圈层，实现爆发式传播。",
      "对<strong>灵感持续性</strong>要求极高，变现模式不稳定（多依赖广告和直播）。",
      "<strong>核心策略：</strong>坚持<strong>内容差异化</strong>，利用表演天赋和剪辑能力，制作<strong>强视觉冲击、反转</strong>的短视频，以内容引爆流量。"
    ]
  },
  Business: {
    name: "💰 商业实战/效率变现赛道",
    focus: "实用落地、高效执行、结果导向",
    abilities: ["E", "A", "D"],
    persona: "效率黑客、赚钱项目拆解师、职场实战专家",
    rivals: ["秋招求职", "张琦", "老张聊创业"],
    analysis: [
      "该赛道强调<strong>实用性和商业价值</strong>，粉丝变现效率极高，多以中高客单价课程或服务为主。",
      "要求创作者具备<strong>极强的执行力、商业敏感度</strong>和<strong>清晰的变现路径</strong>。",
      "<strong>核心策略：</strong>输出<strong>可落地、结果导向</strong>的干货，用数据和案例构建信任，直接以<strong>解决痛点</strong>为导向进行内容设计。"
    ]
  }
};

export interface PlanData {
  pre: string;
  mid: string;
  post: string;
}

function getExampleTopic(key: TrackType): PlanData {
  switch (key) {
    case "Knowledge":
      return {
        pre: "一个概念的深度解读、一个工具的专业使用教程。",
        mid: "系列课程的免费试听章节、行业分析与趋势预测。",
        post: "高端访谈、付费私董会案例拆解、年度行业白皮书。"
      };
    case "Lifestyle":
      return {
        pre: "沉浸式Vlog、每日穿搭技巧、高性价比好物分享。",
        mid: "跨城市探店Vlog、与品牌联名深度测评，家居改造系列。",
        post: "个人IP品牌周边、高端生活方式体验活动、粉丝见面会。"
      };
    case "Creativity":
      return {
        pre: "用一个新梗做二次创作、15秒反转小剧场，手绘/歌曲挑战。",
        mid: "创作系列IP角色短剧、每周一个视觉/才艺挑战、深度创意拆解教程。",
        post: "品牌创意广告定制、电影/游戏配音配乐合作、个人艺术作品展。"
      };
    case "Business":
      return {
        pre: "一个赚钱小项目的实操步骤、一个高效工具的使用教程。",
        mid: "月度收入拆解报告、职场干货系列（如PPT/Excel）、付费社群引流课程。",
        post: "企业内训服务、高客单价商业咨询、自研商业工具或模板销售。"
      };
  }
}

function getMonetization(key: TrackType): { basic: string; advanced: string } {
  switch (key) {
    case "Knowledge":
      return { basic: "付费专栏，知识星球（社群）", advanced: "高客单价训练营、企业内训、1V1咨询" };
    case "Lifestyle":
      return { basic: "电商带货（橱窗）、低客单价品牌植入", advanced: "深度品牌合作（代言）、个人品牌联名、线下体验店引流" };
    case "Creativity":
      return { basic: "平台打赏、流量激励、创意定制小订单", advanced: "中高端品牌创意广告合作、IP授权、衍生品开发" };
    case "Business":
      return { basic: "付费模板/工具销售、中低价位线上课程", advanced: "高客单价私董会、创业项目孵化、商业服务外包" };
  }
}

function getCostAnalysis(key: TrackType): { focus: string; time: string } {
  switch (key) {
    case "Knowledge":
      return { focus: "时间（研究、学习）、知识付费。", time: "3-4" };
    case "Lifestyle":
      return { focus: "形象（服饰、化妆）、场景搭建、拍摄设备。", time: "2-3" };
    case "Creativity":
      return { focus: "时间（创意构思）、后期制作软件、道具。", time: "4-5" };
    case "Business":
      return { focus: "时间（实践、数据分析）、测试成本，行业报告。", time: "3-5" };
  }
}

export interface FinalScores {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
}

export interface TrackScores {
  Knowledge: number;
  Lifestyle: number;
  Creativity: number;
  Business: number;
}

// Original scoring calculation
export function calculateScores(answers: FinalScores): TrackScores {
  return {
    Knowledge: answers.D * 0.4 + answers.A * 0.3 + answers.E * 0.3,
    Lifestyle: answers.B * 0.4 + answers.C * 0.3 + answers.E * 0.3,
    Creativity: answers.C * 0.4 + answers.B * 0.3 + answers.A * 0.3,
    Business: answers.E * 0.4 + answers.A * 0.3 + answers.D * 0.3,
  };
}

export function getDominantTrack(scores: TrackScores): TrackType {
  let maxScore = -1;
  let topTrack: TrackType = "Knowledge";

  for (const key in scores) {
    if (scores[key as TrackType] > maxScore) {
      maxScore = scores[key as TrackType];
      topTrack = key as TrackType;
    }
  }

  return topTrack;
}

// Helper to build result report data
export function buildReportData(topTrack: TrackType, finalScores: FinalScores) {
  const track = tracks[topTrack];
  const sortedAbilities = (Object.entries(finalScores) as [AbilityType, number][])
    .sort(([, a], [, b]) => b - a)
    .map(([key, score]) => ({ label: abilityLabels[key], score }));

  const maxScorePossible = 50 * 4;
  const getPercent = (score: number) => Math.round((score / maxScorePossible) * 100);

  const exampleTopic = getExampleTopic(topTrack);
  const monetization = getMonetization(topTrack);
  const costAnalysis = getCostAnalysis(topTrack);

  return {
    track,
    sortedAbilities,
    getPercent,
    exampleTopic,
    monetization,
    costAnalysis,
  };
}

// Questions (50 questions with original scoring)
export const mediaTalentQuiz: QuizQuestion[] = [
  // 核心能力与性格驱动 (10题)
  {
    id: 1,
    question: "当你开始一个新任务时，你最先做的事情是？",
    options: [
      { text: "列出详细步骤和时间表。", scores: { A: 3, B: 0, C: 0, D: 0, E: 2 } },
      { text: "思考如何让它有趣或独特。", scores: { A: 0, B: 2, C: 1, D: 0, E: 0 } },
      { text: "马上动手，边做边想。", scores: { A: 0, B: 0, C: 0, D: 0, E: 3 } },
      { text: "查找资料，理解其背景和原理。", scores: { A: 2, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 2,
    question: "你对情绪管理和抗压能力的评价是？",
    options: [
      { text: "冷静理性，几乎不受外界干扰。", scores: { A: 2, B: 0, C: 0, D: 0, E: 3 } },
      { text: "能自我调节，但需要时间。", scores: { A: 0, B: 1, C: 0, D: 0, E: 1 } },
      { text: "容易受情绪影响，但能很快恢复。", scores: { A: 0, B: 3, C: 2, D: 0, E: 0 } },
      { text: "我擅长将压力转化为动力。", scores: { A: 0, B: 0, C: 0, D: 1, E: 3 } },
    ],
  },
  {
    id: 3,
    question: "你更擅长哪种信息输出方式？",
    options: [
      { text: "撰写结构严谨、论据充分的文章。", scores: { A: 3, B: 0, C: 0, D: 3, E: 0 } },
      { text: "用生动的语言和肢体动作进行口头讲述。", scores: { A: 0, B: 4, C: 0, D: 0, E: 0 } },
      { text: "制作精美图片或视频来展示。", scores: { A: 0, B: 2, C: 4, D: 0, E: 0 } },
      { text: "整理要点，形成清晰的流程图或清单。", scores: { A: 4, B: 0, C: 0, D: 0, E: 3 } },
    ],
  },
  {
    id: 4,
    question: "你对日常环境中的色彩搭配、排版布局的敏感度如何？",
    options: [
      { text: "非常高，有强烈的审美要求。", scores: { A: 0, B: 0, C: 4, D: 0, E: 0 } },
      { text: "有所关注，但不会过度纠结。", scores: { A: 0, B: 1, C: 2, D: 0, E: 0 } },
      { text: "只关注实用性和功能性。", scores: { A: 0, B: 0, C: 0, D: 2, E: 2 } },
      { text: "不太关注，内容有趣更重要。", scores: { A: 0, B: 3, C: 0, D: 0, E: 0 } },
    ],
  },
  {
    id: 5,
    question: "在遇到一个陌生且复杂的问题时，你的第一反应是？",
    options: [
      { text: "立刻上网搜索权威解答和教程。", scores: { A: 2, B: 0, C: 0, D: 3, E: 0 } },
      { text: "尝试拆解，用逻辑推理找出突破口。", scores: { A: 4, B: 0, C: 0, D: 3, E: 0 } },
      { text: "找人讨论，寻求新的视角。", scores: { A: 0, B: 3, C: 0, D: 0, E: 0 } },
      { text: "靠直觉或过去经验进行大胆假设。", scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
    ],
  },
  {
    id: 6,
    question: "你是否享受在陌生人面前展示自我（如演讲、表演）？",
    options: [
      { text: "非常享受，喜欢被关注。", scores: { A: 0, B: 4, C: 2, D: 0, E: 0 } },
      { text: "如果主题是我擅长的，我会很自信。", scores: { A: 0, B: 3, C: 0, D: 3, E: 0 } },
      { text: "有些紧张，但可以应对。", scores: { A: 0, B: 0, C: 0, D: 0, E: 2 } },
      { text: "倾向于幕后，不喜欢被关注。", scores: { A: 3, B: 0, C: 0, D: 4, E: 0 } },
    ],
  },
  {
    id: 7,
    question: "你更倾向于做哪种类型的分享者？",
    options: [
      { text: "传授知识，帮助他人提升技能。", scores: { A: 3, B: 0, C: 0, D: 4, E: 0 } },
      { text: "分享生活，记录美好日常。", scores: { A: 0, B: 3, C: 3, D: 0, E: 0 } },
      { text: "提供娱乐，让人感到轻松快乐。", scores: { A: 0, B: 4, C: 2, D: 0, E: 0 } },
      { text: "拆解项目，教人如何赚钱或变现。", scores: { A: 3, B: 0, C: 0, D: 0, E: 4 } },
    ],
  },
  {
    id: 8,
    question: "你认为你的时间管理能力是？",
    options: [
      { text: "非常出色，能严格遵守计划。", scores: { A: 3, B: 0, C: 0, D: 0, E: 4 } },
      { text: "一般，需要外部监督或激励。", scores: { A: 0, B: 2, C: 0, D: 0, E: 0 } },
      { text: "不喜欢计划，更喜欢灵活应对。", scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: "能规划，但执行过程中常有拖延。", scores: { A: 3, B: 0, C: 0, D: 0, E: 1 } },
    ],
  },
  {
    id: 9,
    question: "你认为什么能让你获得最大的成就感？",
    options: [
      { text: "通过思考，解决了一个逻辑难题。", scores: { A: 4, B: 0, C: 0, D: 3, E: 0 } },
      { text: "创造了一个新颖、有趣的创意作品。", scores: { A: 0, B: 3, C: 4, D: 0, E: 0 } },
      { text: "帮助他人在现实中解决了问题。", scores: { A: 0, B: 0, C: 0, D: 4, E: 3 } },
      { text: "获得大量观众的喜欢和共鸣。", scores: { A: 0, B: 4, C: 2, D: 0, E: 0 } },
    ],
  },
  {
    id: 10,
    question: "你更愿意投入时间和金钱在哪方面？",
    options: [
      { text: "学习专业知识和课程。", scores: { A: 3, B: 0, C: 0, D: 4, E: 0 } },
      { text: "购买更好的设备（相机、电脑等）。", scores: { A: 0, B: 0, C: 4, D: 0, E: 3 } },
      { text: "社交和维护人脉关系。", scores: { A: 0, B: 3, C: 0, D: 0, E: 2 } },
      { text: "制定详细的商业计划。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
    ],
  },
  // 经验履历与人群定位 (15题)
  {
    id: 11,
    question: "你的最高学历（或目前学习阶段）是？",
    options: [
      { text: "本科及以上（或在读）。", scores: { A: 2, B: 0, C: 0, D: 3, E: 0 } },
      { text: "大专/职业技术学院（或在读）。", scores: { A: 0, B: 0, C: 0, D: 2, E: 2 } },
      { text: "高中/中专及以下（或在读）。", scores: { A: 0, B: 2, C: 0, D: 0, E: 3 } },
      { text: "我通过自学掌握了许多专业技能。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
    ],
  },
  {
    id: 12,
    question: "你是否有任何全职或兼职工作经验？",
    options: [
      { text: "有，长期在某一专业领域工作。", scores: { A: 0, B: 0, C: 0, D: 4, E: 3 } },
      { text: "有，但工作内容多样，涉及多个领域。", scores: { A: 3, B: 3, C: 0, D: 0, E: 0 } },
      { text: "没有，我主要在校或刚毕业。", scores: { A: 0, B: 0, C: 0, D: 2, E: 1 } },
      { text: "我主要通过自雇/自由职业积累经验。", scores: { A: 0, B: 0, C: 3, D: 0, E: 4 } },
    ],
  },
  {
    id: 13,
    question: "你拥有的或正在积累的，最核心的技能是？",
    options: [
      { text: "专业理论知识或技术（如编程、金融）。", scores: { A: 3, B: 0, C: 0, D: 4, E: 0 } },
      { text: "艺术创作或设计技能（如绘画、剪辑）。", scores: { A: 0, B: 3, C: 4, D: 0, E: 0 } },
      { text: "与人打交道、销售或沟通能力。", scores: { A: 0, B: 4, C: 0, D: 0, E: 3 } },
      { text: "流程管理、效率优化或执行操作。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
    ],
  },
  {
    id: 14,
    question: "你目前的生活状态最接近以下哪种？",
    options: [
      { text: "职场白领或专业技术人员。", scores: { A: 0, B: 0, C: 0, D: 4, E: 3 } },
      { text: "学生或处于探索阶段的年轻人。", scores: { A: 0, B: 3, C: 3, D: 0, E: 0 } },
      { text: "自由职业者或独立创业者。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "家庭主妇或生活体验丰富的人。", scores: { A: 0, B: 3, C: 3, D: 0, E: 0 } },
    ],
  },
  {
    id: 15,
    question: "你目前最常使用的自媒体平台是哪个？",
    options: [
      { text: "知乎、B站、公众号等中长文/学习类平台。", scores: { A: 3, B: 0, C: 0, D: 3, E: 0 } },
      { text: "抖音、快手等短视频娱乐平台。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
      { text: "小红书、微博等图文/社交平台。", scores: { A: 0, B: 3, C: 3, D: 0, E: 0 } },
      { text: "以上都用，但主要用于获取资讯。", scores: { A: 3, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 16,
    question: `你过去是否有过"社群"或"圈子"的运营经验？`,
    options: [
      { text: "有，我曾组织或管理过粉丝群/兴趣群。", scores: { A: 0, B: 4, C: 0, D: 0, E: 3 } },
      { text: "有过，但只是在其中担任普通成员。", scores: { A: 0, B: 2, C: 0, D: 0, E: 0 } },
      { text: "没有，我更喜欢独来独往。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "我擅长建立关系，但不擅长管理。", scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
    ],
  },
  {
    id: 17,
    question: "你最想通过自媒体解决以下哪个问题？",
    options: [
      { text: "实现知识变现，成为领域内专家。", scores: { A: 3, B: 0, C: 0, D: 4, E: 0 } },
      { text: "扩大影响力，找到志同道合的圈子。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
      { text: "将现有技能或产品进行商业推广。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "记录生活，实现自我价值的表达。", scores: { A: 0, B: 3, C: 3, D: 0, E: 0 } },
    ],
  },
  {
    id: 18,
    question: "你更希望你的内容受众是哪一类群体？",
    options: [
      { text: "高学历、高收入的知识分子或职场精英。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "追求时尚、注重生活品质的年轻人。", scores: { A: 0, B: 3, C: 4, D: 0, E: 0 } },
      { text: "对娱乐和新鲜事物充满好奇的大众群体。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
      { text: "渴望提升效率、解决实际问题的实干家。", scores: { A: 3, B: 0, C: 0, D: 0, E: 4 } },
    ],
  },
  {
    id: 19,
    question: "你对目前所在行业的了解深度是？",
    options: [
      { text: "非常了解，能提供独家洞察和分析。", scores: { A: 3, B: 0, C: 0, D: 4, E: 0 } },
      { text: "比较熟悉，能分享经验和基础知识。", scores: { A: 0, B: 0, C: 0, D: 3, E: 2 } },
      { text: "一般，我的知识主要来自兴趣。", scores: { A: 0, B: 3, C: 3, D: 0, E: 0 } },
      { text: "不了解，我打算跨行/跨界。", scores: { A: 2, B: 2, C: 0, D: 0, E: 0 } },
    ],
  },
  {
    id: 20,
    question: `你对"镜头感"的适应程度是？`,
    options: [
      { text: "非常自然，甚至享受被拍摄。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
      { text: "可以接受，但需要提前准备。", scores: { A: 0, B: 3, C: 0, D: 0, E: 3 } },
      { text: "不太适应，更喜欢录制屏幕或声音。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "完全抗拒，宁愿只做幕后。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
    ],
  },
  {
    id: 21,
    question: "你认为以下哪个主题更容易让你持续产生创作热情？",
    options: [
      { text: "分享你长期钻研的专业知识。", scores: { A: 3, B: 0, C: 0, D: 4, E: 0 } },
      { text: "记录你的有趣生活和体验。", scores: { A: 0, B: 3, C: 4, D: 0, E: 0 } },
      { text: "拆解成功商业案例和赚钱方法。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "展示你的艺术才华或动手能力。", scores: { A: 0, B: 4, C: 4, D: 0, E: 0 } },
    ],
  },
  {
    id: 22,
    question: "你在进行内容制作时，更看重：",
    options: [
      { text: "内容的知识密度和深度。", scores: { A: 3, B: 0, C: 0, D: 4, E: 0 } },
      { text: "视觉效果和画面美感。", scores: { A: 0, B: 2, C: 4, D: 0, E: 0 } },
      { text: "能否引起共鸣和广泛传播。", scores: { A: 0, B: 4, C: 0, D: 0, E: 3 } },
      { text: "制作效率和低成本。", scores: { A: 3, B: 0, C: 0, D: 0, E: 4 } },
    ],
  },
  {
    id: 23,
    question: "你对粉丝互动和社区运营的态度是？",
    options: [
      { text: "非常积极，主动建立社群和维护关系。", scores: { A: 0, B: 4, C: 0, D: 0, E: 3 } },
      { text: "只回复有价值的评论和提问。", scores: { A: 3, B: 0, C: 0, D: 3, E: 0 } },
      { text: "有需要就互动，但精力主要在内容。", scores: { A: 0, B: 0, C: 3, D: 3, E: 0 } },
      { text: "交给工具或团队，我更喜欢独创。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
    ],
  },
  {
    id: 24,
    question: `你是否有任何可以作为自媒体内容的"个人独家资源"？`,
    options: [
      { text: "有，如独家行业数据、内部经验、小众技能。", scores: { A: 3, B: 0, C: 0, D: 4, E: 0 } },
      { text: "有，如高颜值、独特的穿搭品味、生活方式。", scores: { A: 0, B: 3, C: 4, D: 0, E: 0 } },
      { text: "有，如丰富的人脉资源，合作渠道。", scores: { A: 0, B: 4, C: 0, D: 0, E: 3 } },
      { text: "没有特别的，我打算从零开始。", scores: { A: 3, B: 0, C: 0, D: 0, E: 4 } },
    ],
  },
  {
    id: 25,
    question: "你认为你的内容最大的优势是？",
    options: [
      { text: "逻辑严谨，能提供系统化解决方案。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "有感染力，能让人感到快乐或被治愈。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
      { text: "制作精美，画面感强。", scores: { A: 0, B: 3, C: 4, D: 0, E: 0 } },
      { text: "非常实用，能直接指导用户行动。", scores: { A: 0, B: 0, C: 0, D: 3, E: 4 } },
    ],
  },
  // 深度驱动与变现意愿 (15题)
  {
    id: 26,
    question: `你对"变现"的紧迫程度是？`,
    options: [
      { text: "非常紧迫，希望尽快获得收入。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "中等，先积累一定粉丝和影响力。", scores: { A: 0, B: 0, C: 0, D: 3, E: 2 } },
      { text: "不紧迫，先以兴趣和价值为主。", scores: { A: 0, B: 3, C: 3, D: 0, E: 0 } },
      { text: "变现是长期目标，初期专注内容质量。", scores: { A: 3, B: 0, C: 0, D: 4, E: 0 } },
    ],
  },
  {
    id: 27,
    question: "如果让你分享一个失败经验，你会重点强调什么？",
    options: [
      { text: "总结经验教训和理论模型。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "幽默地讲述过程，将失败变成段子。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
      { text: "自己如何坚持和克服困难的过程。", scores: { A: 0, B: 3, C: 0, D: 0, E: 4 } },
      { text: "失败背后的深层行业原因。", scores: { A: 3, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 28,
    question: "你对热点事件的态度是？",
    options: [
      { text: "理性分析，深挖热点背后的本质。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "快速跟进，用自己的方式进行趣味解读。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
      { text: "只追与自己领域强相关的热点。", scores: { A: 0, B: 0, C: 0, D: 3, E: 3 } },
      { text: "不追热点，只做长青内容。", scores: { A: 0, B: 0, C: 0, D: 4, E: 4 } },
    ],
  },
  {
    id: 29,
    question: "你认为自媒体最大的风险是？",
    options: [
      { text: "花费大量精力，但无法变现。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "创意枯竭，内容无法持续创新。", scores: { A: 0, B: 0, C: 4, D: 0, E: 0 } },
      { text: "数据造假，影响专业口碑。", scores: { A: 3, B: 0, C: 0, D: 4, E: 0 } },
      { text: "遇到负面舆论或被攻击。", scores: { A: 0, B: 3, C: 0, D: 0, E: 3 } },
    ],
  },
  {
    id: 30,
    question: "你对视频、图片制作软件（如剪映、PS）的学习意愿是？",
    options: [
      { text: "非常高，乐于投入时间学习复杂功能。", scores: { A: 0, B: 0, C: 4, D: 0, E: 4 } },
      { text: "中等，能满足基本制作需求即可。", scores: { A: 0, B: 3, C: 0, D: 0, E: 3 } },
      { text: "低，倾向于找人合作或使用简单工具。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "我只关注内容，制作是次要的。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
    ],
  },
  {
    id: 31,
    question: "你更愿意以什么身份出现在大众面前？",
    options: [
      { text: "传道者/导师（知识输出）。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "朋友/生活家（亲和力输出）。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
      { text: "实干家/效率专家（方法输出）。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "艺术家/表演者（创意输出）。", scores: { A: 0, B: 4, C: 4, D: 0, E: 0 } },
    ],
  },
  {
    id: 32,
    question: "如果你的内容不被市场接受，你会怎么做？",
    options: [
      { text: "理性分析数据，调整内容结构和选题。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "坚持自我风格，相信总有人欣赏。", scores: { A: 0, B: 3, C: 4, D: 0, E: 0 } },
      { text: "立刻停止，快速尝试新的赛道或方向。", scores: { A: 0, B: 4, C: 0, D: 0, E: 4 } },
      { text: "寻求导师或专家的帮助进行诊断。", scores: { A: 3, B: 0, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 33,
    question: `你对"系统化"和"结构化"的偏好程度是？`,
    options: [
      { text: "极高，所有信息都必须有体系。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "中等，能有体系最好，没有也无妨。", scores: { A: 0, B: 2, C: 0, D: 0, E: 3 } },
      { text: "较低，更喜欢碎片化和即时性的灵感。", scores: { A: 0, B: 4, C: 4, D: 0, E: 0 } },
      { text: "我只对我的专业领域要求系统化。", scores: { A: 0, B: 0, C: 0, D: 4, E: 4 } },
    ],
  },
  {
    id: 34,
    question: "你认为你的粉丝付费的最大理由是？",
    options: [
      { text: "我的知识解决了他们工作或生活中的大难题。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "我的个人魅力和风格让他们愿意为爱买单。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
      { text: "我的产品能帮他们省钱或赚到钱。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "我的内容让他们感到愉悦或审美满足。", scores: { A: 0, B: 4, C: 4, D: 0, E: 0 } },
    ],
  },
  {
    id: 35,
    question: "你在进行内容制作时，是否会主动研究竞争对手？",
    options: [
      { text: "会，定期进行竞品分析，寻找差异化。", scores: { A: 0, B: 0, C: 0, D: 0, E: 4 } },
      { text: "只看头部大号，学习其成功经验。", scores: { A: 0, B: 3, C: 0, D: 3, E: 0 } },
      { text: "偶尔看看，但主要还是靠自己灵感。", scores: { A: 0, B: 0, C: 3, D: 0, E: 0 } },
      { text: "很少，更相信垂直深耕的力量。", scores: { A: 0, B: 0, C: 0, D: 4, E: 4 } },
    ],
  },
  {
    id: 36,
    question: "你对数字营销、流量算法的了解程度是？",
    options: [
      { text: "非常了解，知道如何利用算法。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "一般，只知道基础的规则。", scores: { A: 0, B: 0, C: 0, D: 3, E: 3 } },
      { text: "不太了解，但愿意学习。", scores: { A: 3, B: 0, C: 0, D: 3, E: 0 } },
      { text: "不了解，更关注内容带来的自然流量。", scores: { A: 0, B: 3, C: 3, D: 0, E: 0 } },
    ],
  },
  {
    id: 37,
    question: "你更希望你的内容被称为：",
    options: [
      { text: "深度、洞察，知识密集型。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "温暖、治愈、亲切有趣。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
      { text: "实战、高效、快速落地。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "惊艳、新颖、创意十足。", scores: { A: 0, B: 4, C: 4, D: 0, E: 0 } },
    ],
  },
  {
    id: 38,
    question: "你对自媒体的长期目标是？",
    options: [
      { text: "将IP打造成个人品牌，拥有高价值社群。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "实现流量自由，拥有多种被动收入。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "成为某一细分领域的意见领袖（KOL）。", scores: { A: 0, B: 4, C: 0, D: 3, E: 0 } },
      { text: "通过作品享受创作过程，实现自我表达。", scores: { A: 0, B: 3, C: 4, D: 0, E: 0 } },
    ],
  },
  {
    id: 39,
    question: "你在内容创作的投入上，最不能接受的是？",
    options: [
      { text: "投入时间但内容被指责不专业。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "投入金钱但画面或制作效果很差。", scores: { A: 0, B: 0, C: 4, D: 0, E: 4 } },
      { text: "投入精力但内容无人观看。", scores: { A: 0, B: 4, C: 0, D: 0, E: 4 } },
      { text: "为了迎合市场而改变自己的创作风格。", scores: { A: 0, B: 4, C: 4, D: 0, E: 0 } },
    ],
  },
  {
    id: 40,
    question: `你对"人设"的看法是？`,
    options: [
      { text: "人设需要精心策划，是商业策略的一部分。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "保持真实，但要突出核心优势。", scores: { A: 0, B: 3, C: 0, D: 3, E: 0 } },
      { text: "无所谓，内容有趣最重要。", scores: { A: 0, B: 4, C: 4, D: 0, E: 0 } },
      { text: "人设应完全服务于专业度或知识性。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
    ],
  },
  // 补充题 (10题)
  {
    id: 41,
    question: "你更喜欢以什么为起点进行创作？",
    options: [
      { text: "一个复杂的问题或需要拆解的理论。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "一个有趣的经历或一个打动你的故事。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
      { text: "一个高效的工具或一个实用的小技巧。", scores: { A: 3, B: 0, C: 0, D: 0, E: 4 } },
      { text: "一个精美的视觉素材或一段音乐。", scores: { A: 0, B: 3, C: 4, D: 0, E: 0 } },
    ],
  },
  {
    id: 42,
    question: "你对小众、垂直领域的兴趣程度是？",
    options: [
      { text: "非常高，喜欢深耕细分领域。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "一般，更喜欢大众热门话题。", scores: { A: 0, B: 3, C: 3, D: 0, E: 0 } },
      { text: "只在能带来价值时才关注。", scores: { A: 0, B: 0, C: 0, D: 3, E: 4 } },
      { text: "我的兴趣很广，难以局限于小众。", scores: { A: 0, B: 3, C: 3, D: 0, E: 0 } },
    ],
  },
  {
    id: 43,
    question: "你的朋友最常向你咨询哪方面的问题？",
    options: [
      { text: "关于学习、职业规划、人生选择。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "关于穿搭、旅游、娱乐八卦。", scores: { A: 0, B: 0, C: 4, D: 0, E: 0 } },
      { text: "关于效率、工具、如何解决某个实际困难。", scores: { A: 3, B: 0, C: 0, D: 0, E: 4 } },
      { text: "关于情绪、人际关系、心理困惑。", scores: { A: 0, B: 4, C: 0, D: 3, E: 0 } },
    ],
  },
  {
    id: 44,
    question: "你更愿意与哪种类型的粉丝互动？",
    options: [
      { text: "喜欢学习、提出深度问题的粉丝。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "热情追随、注重情感连接的粉丝。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
      { text: "积极参与、爱玩梗的粉丝。", scores: { A: 0, B: 4, C: 4, D: 0, E: 0 } },
      { text: "能提供专业反馈和合作机会的粉丝。", scores: { A: 0, B: 0, C: 0, D: 3, E: 4 } },
    ],
  },
  {
    id: 45,
    question: "你对自己的学习速度满意吗？",
    options: [
      { text: "非常满意，能快速掌握新知识。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "一般，需要大量练习才能掌握。", scores: { A: 0, B: 0, C: 0, D: 0, E: 3 } },
      { text: "我擅长深挖，但不擅长泛学。", scores: { A: 0, B: 0, C: 0, D: 4, E: 3 } },
      { text: "我的学习效率取决于我是否喜欢。", scores: { A: 0, B: 3, C: 3, D: 0, E: 0 } },
    ],
  },
  {
    id: 46,
    question: "你认为什么能让你坚持创作下去？",
    options: [
      { text: "看到自己的知识体系不断完善。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "创作过程本身的乐趣和表达欲。", scores: { A: 0, B: 0, C: 4, D: 0, E: 0 } },
      { text: "创作带来的收入和影响力。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "粉丝的反馈和情感支持。", scores: { A: 0, B: 4, C: 3, D: 0, E: 0 } },
    ],
  },
  {
    id: 47,
    question: "你在进行内容制作时，最容易遇到的困难是？",
    options: [
      { text: "选题策划和结构搭建。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "克服镜头恐惧或口才表达。", scores: { A: 0, B: 4, C: 0, D: 0, E: 3 } },
      { text: "视觉素材和后期制作。", scores: { A: 0, B: 0, C: 4, D: 0, E: 3 } },
      { text: "坚持日更或周更的自律性。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
    ],
  },
  {
    id: 48,
    question: "你对内容变现的偏好是？",
    options: [
      { text: "知识付费、高客单价服务。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "广告植入，品牌合作。", scores: { A: 0, B: 4, C: 4, D: 0, E: 0 } },
      { text: "电商带货、性价比商品推荐。", scores: { A: 3, B: 0, C: 0, D: 0, E: 4 } },
      { text: "直播打赏、靠内容吸引赞助。", scores: { A: 0, B: 4, C: 4, D: 0, E: 0 } },
    ],
  },
  {
    id: 49,
    question: "你对使用AI工具来辅助创作的态度是？",
    options: [
      { text: "积极拥抱，能提高效率和质量。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "谨慎使用，担心影响内容的真实性和原创性。", scores: { A: 0, B: 0, C: 4, D: 4, E: 0 } },
      { text: "无所谓，我更依赖于自己的大脑。", scores: { A: 0, B: 3, C: 0, D: 3, E: 0 } },
      { text: "如果能提高创意，会尝试。", scores: { A: 0, B: 3, C: 4, D: 0, E: 0 } },
    ],
  },
  {
    id: 50,
    question: "你更喜欢以什么为目标进行学习？",
    options: [
      { text: "成为某一领域的大师。", scores: { A: 4, B: 0, C: 0, D: 4, E: 0 } },
      { text: "学会新的创作和表达形式。", scores: { A: 0, B: 0, C: 4, D: 0, E: 0 } },
      { text: "提升效率，更好地管理工作和生活。", scores: { A: 4, B: 0, C: 0, D: 0, E: 4 } },
      { text: "增加人脉和社交技能。", scores: { A: 0, B: 4, C: 0, D: 0, E: 3 } },
    ],
  },
];

// Calculate final scores from user answers (answer is option index)
export function calculateFinalScores(answers: number[]): FinalScores {
  const finalScores: FinalScores = { A: 0, B: 0, C: 0, D: 0, E: 0 };

  answers.forEach((answerIndex, questionIndex) => {
    const question = mediaTalentQuiz[questionIndex];
    if (!question) return;
    const option = question.options[answerIndex];
    if (!option) return;
    for (const key in option.scores) {
      finalScores[key as AbilityType] += option.scores[key as AbilityType];
    }
  });

  return finalScores;
}

// Process answers: array of option indices
export function processQuizResults(answerIndices: number[]): {
  finalScores: FinalScores;
  trackScores: TrackScores;
  topTrack: TrackType;
} {
  const finalScores = calculateFinalScores(answerIndices);
  const trackScores = calculateScores(finalScores);
  const topTrack = getDominantTrack(trackScores);

  return { finalScores, trackScores, topTrack };
}