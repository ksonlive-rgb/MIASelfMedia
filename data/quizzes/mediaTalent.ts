export interface QuizOption {
  text: string;
  type: "creator" | "operator" | "storyteller" | "analyst";
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export const mediaTalentQuiz: QuizQuestion[] = [
  {
    id: 1,
    question: "你在刷短视频时，最吸引你停留的内容类型是？",
    options: [
      { text: "视觉惊艳、有创意特效的爆款视频", type: "creator" },
      { text: "信息量足、干货满满的知识分享", type: "analyst" },
      { text: "真实有趣、让人忍不住点赞的故事", type: "storyteller" },
      { text: "热门话题、互动性强的挑战类内容", type: "operator" },
    ],
  },
  {
    id: 2,
    question: "如果让你运营一个账号，你最享受哪个环节？",
    options: [
      { text: "设计独特的视觉风格和封面", type: "creator" },
      { text: "分析数据，优化发布时间和策略", type: "operator" },
      { text: "构思能引发共鸣的选题和脚本", type: "storyteller" },
      { text: "研究平台算法和爆款规律", type: "analyst" },
    ],
  },
  {
    id: 3,
    question: "朋友形容你时，最可能用以下哪个词？",
    options: [
      { text: "点子多，总有新花样", type: "creator" },
      { text: "爱分享，聊天停不下来", type: "storyteller" },
      { text: "逻辑强，看问题很准", type: "analyst" },
      { text: "行动派，执行力超高", type: "operator" },
    ],
  },
  {
    id: 4,
    question: "面对同一件事，你会怎么发朋友圈？",
    options: [
      { text: "精心修图，加滤镜，加表情包", type: "creator" },
      { text: "记录生活日常，分享真实感受", type: "storyteller" },
      { text: "用数据和对比图展示有趣洞察", type: "analyst" },
      { text: "简单直接，最多九宫格拼接", type: "operator" },
    ],
  },
  {
    id: 5,
    question: "你更倾向于如何学习新技能？",
    options: [
      { text: "看教程视频，照着做，动手实践", type: "operator" },
      { text: "研究原理，搞懂底层逻辑", type: "analyst" },
      { text: "找个榜样模仿，再加入自己的风格", type: "creator" },
      { text: "先把知识讲给别人听，边讲边学", type: "storyteller" },
    ],
  },
  {
    id: 6,
    question: "AI工具（如ChatGPT、Midjourney）对你来说意味着什么？",
    options: [
      { text: "灵感触发器，帮我突破创作瓶颈", type: "creator" },
      { text: "效率神器，让繁琐工作自动化", type: "operator" },
      { text: "内容素材库，快速生成脚本思路", type: "storyteller" },
      { text: "研究对象，我想搞懂它的工作原理", type: "analyst" },
    ],
  },
  {
    id: 7,
    question: "你觉得自己在网络上的个人形象更接近？",
    options: [
      { text: "一个有趣的内容创作者", type: "creator" },
      { text: "一个可靠的信息源", type: "analyst" },
      { text: "一个真实的朋友", type: "storyteller" },
      { text: "一个活跃的社区成员", type: "operator" },
    ],
  },
  {
    id: 8,
    question: "当你在创作时遇到灵感枯竭，你会？",
    options: [
      { text: "放下手机出去走走，等灵感自然来", type: "storyteller" },
      { text: "刷同领域爆款，找规律和启发", type: "analyst" },
      { text: "用AI工具生成几个方向再筛选", type: "operator" },
      { text: "尝试完全不同的风格或媒介", type: "creator" },
    ],
  },
  {
    id: 9,
    question: "你更希望自己的内容能给人带来什么？",
    options: [
      { text: "美的享受和视觉冲击", type: "creator" },
      { text: "实用的价值和可操作的建议", type: "analyst" },
      { text: "温暖的陪伴和情感共鸣", type: "storyteller" },
      { text: "参与的快乐和社群归属感", type: "operator" },
    ],
  },
  {
    id: 10,
    question: "如果自媒体是你的副业，你最看重的回报是？",
    options: [
      { text: "作品被认可带来的成就感", type: "creator" },
      { text: "粉丝增长和影响力扩大", type: "operator" },
      { text: "深度连接，读者变成朋友", type: "storyteller" },
      { text: "能力的提升和认知的升级", type: "analyst" },
    ],
  },
];