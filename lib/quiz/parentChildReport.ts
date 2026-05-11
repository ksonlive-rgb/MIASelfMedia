import {
  findQuestionByIdInBank,
  questionBank,
  wisdomMap,
  type AgeGroup,
  type DimensionScores,
  type QuizQuestion,
  type WisdomItem,
} from "@/data/quizzes/parentChildEdu";
import { PARENT_CHILD_LS } from "@/lib/quiz/parentChildStorage";

/** 与 `亲子教育画像测试A.html` 一致：按保存的题目顺序 + 答案还原心法 */
export function loadParentChildQuestionSequence(age: AgeGroup): QuizQuestion[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(PARENT_CHILD_LS.questionIds);
  if (raw) {
    try {
      const ids = JSON.parse(raw) as number[];
      const seq = ids
        .map((id) => findQuestionByIdInBank(id))
        .filter((q): q is QuizQuestion => q != null);
      if (seq.length > 0) return seq;
    } catch {
      /* 回落 */
    }
  }
  return [...(questionBank[age] ?? []), ...(questionBank["common"] ?? [])];
}

export function getChildPortraitText(childTotal: number): string {
  if (childTotal <= 15) return "他/她是一位发展均衡、状态良好的孩子。";
  if (childTotal <= 28) return "他/她是一位在某些领域稍显辛苦的孩子，但仍有闪光点。";
  if (childTotal <= 40) return "他/她是一位在多个方面正面临挑战的孩子，需要理解与支持。";
  return "他/她是一位正在经历巨大发展困难的孩子，需要被看见和专业帮助。";
}

export function getParentPortraitText(dimScores: DimensionScores): string {
  let parentPortrait =
    dimScores.parenting >= 8
      ? "你是一位承受很大情绪压力的家长，常因控制不住脾气而后悔。"
      : dimScores.parenting >= 4
        ? "你是一位尽力平衡的家长，偶尔失控但值得被看见。"
        : "你是一位觉察力很强的家长。";
  if (dimScores.family >= 8) parentPortrait += "家庭环境存在摩擦。";
  else if (dimScores.family >= 4) parentPortrait += "家庭氛围尚可。";
  else parentPortrait += "家庭氛围和睦。";
  return parentPortrait;
}

/** 与 HTML 一致：指定题号上用 rev = 3 - score，「家庭和谐」由 dimScores.family 推导 */
export function computeParentRadarFromAnswers(
  dimScores: DimensionScores,
  sequence: Pick<QuizQuestion, "id" | "options">[],
  answers: number[]
): { labels: string[]; scores: number[]; maxScores: number[] } {
  let lS = 0,
    lC = 0,
    eS = 0,
    eC = 0,
    cS = 0,
    cC = 0,
    sS = 0,
    sC = 0;
  sequence.forEach((q, i) => {
    const a = answers[i];
    if (a === null || a === undefined) return;
    const opt = q.options[a];
    if (!opt) return;
    const rev = 3 - opt.score;
    if (q.id === 507 || q.id === 215) {
      lS += rev;
      lC++;
    }
    if (q.id === 510 || q.id === 217) {
      eS += rev;
      eC++;
    }
    if (q.id === 204 || q.id === 211) {
      cS += rev;
      cC++;
    }
    if (q.id === 501 || q.id === 317) {
      sS += rev;
      sC++;
    }
  });
  return {
    labels: ["倾听", "情绪调节", "比较控制", "家庭和谐", "自我关怀"],
    scores: [
      lC ? lS / lC : 2,
      eC ? eS / eC : 2,
      cC ? cS / cC : 2,
      Math.max(0, 5 - dimScores.family / 3),
      sC ? sS / sC : 2,
    ],
    maxScores: [3, 3, 3, 5, 3],
  };
}

export function buildWisdomListFromAnswers(sequence: QuizQuestion[], answers: number[]): WisdomItem[] {
  const seen = new Set<number>();
  const out: WisdomItem[] = [];
  sequence.forEach((q, idx) => {
    const answerIdx = answers[idx];
    if (answerIdx === null || answerIdx === undefined) return;
    const opt = q.options[answerIdx];
    if (!opt || opt.score < 2) return;
    const w = wisdomMap[q.id];
    if (!w || seen.has(q.id)) return;
    seen.add(q.id);
    out.push(w);
  });
  return out;
}

/** 雷达图刻度与 HTML 一致 */
export const CHILD_RADAR_MAX: Record<keyof DimensionScores, number> = {
  focus: 12,
  emotion: 12,
  social: 9,
  development: 9,
  positive: 9,
  family: 15,
  parenting: 15,
};

export function getReportBooks(age: AgeGroup, dimScores: DimensionScores): string[] {
  const books: string[] = [];
  if (age === "3-5") {
    books.push("《我的感觉》系列绘本", "《游戏力》", "《正面管教》");
  } else if (age === "6-8") {
    books.push("《如何说孩子才会听》", "《分心不是我的错》", "《陪孩子走过小学六年》");
  } else if (age === "9-12") {
    books.push("《解码青春期》", "《为什么我的青春期孩子不和我说话》", "《自驱型成长》");
  } else {
    books.push("《为青少年立界线》", "《青春期情绪密码》", "《高成就孩子的教养法则》");
  }
  if (dimScores.emotion >= 7) books.push("《培养高情商的孩子》");
  if (dimScores.focus >= 7) books.push("《聪明却混乱的孩子》");
  return books;
}

export function getReportDocs(age: AgeGroup, dimScores: DimensionScores): string[] {
  const docs: string[] = [];
  if (age === "3-5") {
    docs.push("《婴儿的秘密生活》", "《他乡的童年》");
  } else if (age === "6-8") {
    docs.push("《我不是笨小孩》", "《生命·成长》");
  } else if (age === "9-12") {
    docs.push("《他乡的童年》", "《我们如何对抗抑郁》");
  } else {
    docs.push("《人生七年》", "《大学·城》");
  }
  if (dimScores.emotion >= 7 || dimScores.parenting >= 8) docs.push("《压力的真相》");
  return docs;
}
