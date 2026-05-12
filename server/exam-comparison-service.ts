import { getDb } from "./db";
import { exams } from "@/drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface ExamComparison {
  current: {
    id: string;
    date: Date;
    type: string;
    values: Record<string, number>;
  };
  previous: {
    id: string;
    date: Date;
    type: string;
    values: Record<string, number>;
  } | null;
  changes: Record<string, {
    currentValue: number;
    previousValue: number;
    change: number;
    percentChange: number;
    trend: "up" | "down" | "stable";
  }>;
  insights: string[];
}

export async function getExamHistory(
  studentId: string,
  examType?: string,
  limit: number = 10
) {
  const db = await getDb();

  if (!db) {
    throw new Error("Database connection failed");
  }

  const studentIdNum = parseInt(studentId);

  const query = db
    .select()
    .from(exams)
    .where(eq(exams.studentId, studentIdNum));

  if (examType && examType !== "all") {
    // Filter by exam type if specified
  }

  const results = await query.orderBy(desc(exams.createdAt)).limit(limit);

  return results.map((exam) => ({
    id: String(exam.id),
    date: exam.createdAt,
    type: exam.examType,
    values: exam.extractedData ? JSON.parse(String(exam.extractedData)) : {},
  }));
}

export async function compareExams(
  currentExamId: string,
  previousExamId?: string
): Promise<ExamComparison> {
  const db = await getDb();

  if (!db) {
    throw new Error("Database connection failed");
  }

  // Get current exam
  const currentExam = await db
    .select()
    .from(exams)
    .where(eq(exams.id, parseInt(currentExamId)))
    .then((results) => results[0]);

  if (!currentExam) {
    throw new Error("Exam not found");
  }

  let previousExam = null;
  if (previousExamId) {
    previousExam = await db
      .select()
      .from(exams)
      .where(eq(exams.id, parseInt(previousExamId)))
      .then((results) => results[0]);
  }

  const currentValues = currentExam.extractedData
    ? JSON.parse(String(currentExam.extractedData))
    : {};
  const previousValues = previousExam
    ? previousExam.extractedData
      ? JSON.parse(String(previousExam.extractedData))
      : {}
    : {};

  // Calculate changes
  const changes: Record<string, {
    currentValue: number;
    previousValue: number;
    change: number;
    percentChange: number;
    trend: "up" | "down" | "stable";
  }> = {};

  Object.entries(currentValues).forEach(([key, value]) => {
    const currentValue = Number(value) || 0;
    const previousValue = previousValues[key] ? Number(previousValues[key]) : currentValue;
    const change = currentValue - previousValue;
    const percentChange = previousValue !== 0 ? (change / previousValue) * 100 : 0;
    const trend = change > 0 ? "up" : change < 0 ? "down" : "stable";

    changes[key] = {
      currentValue,
      previousValue,
      change,
      percentChange,
      trend,
    };
  });

  // Generate insights
  const insights = generateInsights(changes);

  return {
    current: {
      id: String(currentExam.id),
      date: currentExam.createdAt,
      type: currentExam.examType,
      values: currentValues,
    },
    previous: previousExam
      ? {
          id: String(previousExam.id),
          date: previousExam.createdAt,
          type: previousExam.examType,
          values: previousValues,
        }
      : null,
    changes,
    insights,
  };
}

function generateInsights(changes: Record<string, {
  currentValue: number;
  previousValue: number;
  change: number;
  percentChange: number;
  trend: "up" | "down" | "stable";
}>): string[] {
  const insights: string[] = [];

  // Analyze trends
  const upTrends = Object.entries(changes)
    .filter(([_, data]) => data.trend === "up")
    .map(([key]) => key);

  const downTrends = Object.entries(changes)
    .filter(([_, data]) => data.trend === "down")
    .map(([key]) => key);

  if (upTrends.length > 0) {
    insights.push(
      `Atenção: ${upTrends.join(", ")} aumentaram. Considere ajustar sua rotina.`
    );
  }

  if (downTrends.length > 0) {
    insights.push(
      `Ótimo! ${downTrends.join(", ")} diminuíram. Continue assim!`
    );
  }

  if (upTrends.length === 0 && downTrends.length === 0) {
    insights.push("Seus valores estão estáveis. Mantenha a consistência!");
  }

  return insights;
}

export async function exportExamHistory(studentId: string): Promise<string> {
  const examHistory = await getExamHistory(studentId, undefined, 100);

  // Generate PDF content (simplified)
  const content = {
    title: "Histórico Completo de Exames",
    studentId,
    generatedAt: new Date().toISOString(),
    exams: examHistory,
    totalExams: examHistory.length,
  };

  return JSON.stringify(content);
}
