import { getDb } from "./db";
import { photos, exams, posts, insights, studentBadges } from "@/drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export interface MonthlyReport {
  month: string;
  year: number;
  photoStats: {
    total: number;
    byAngle: Record<string, number>;
    trend: Array<{ date: string; count: number }>;
  };
  examStats: {
    total: number;
    byType: Record<string, number>;
    latestValues: Record<string, number>;
  };
  postStats: {
    total: number;
    engagement: number;
    topPost: {
      id: string;
      title: string;
      likes: number;
    } | null;
  };
  insightStats: {
    total: number;
    categories: Record<string, number>;
  };
  badgesEarned: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
  }>;
  progressMetrics: {
    consistency: number; // 0-100
    engagement: number; // 0-100
    completion: number; // 0-100
  };
}

export async function generateMonthlyReport(
  studentId: string,
  month: number,
  year: number
): Promise<MonthlyReport> {
  const db = await getDb();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Get photos for the month
  const monthPhotos = await db
    .select()
    .from(photos)
    .where(
      and(
        eq(photos.studentId, studentId),
        gte(photos.createdAt, startDate),
        lte(photos.createdAt, endDate)
      )
    );

  // Get exams for the month
  const monthExams = await db
    .select()
    .from(exams)
    .where(
      and(
        eq(exams.studentId, studentId),
        gte(exams.createdAt, startDate),
        lte(exams.createdAt, endDate)
      )
    );

  // Get posts for the month
  const monthPosts = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.studentId, studentId),
        gte(posts.createdAt, startDate),
        lte(posts.createdAt, endDate)
      )
    );

  // Get insights for the month
  const monthInsights = await db
    .select()
    .from(insights)
    .where(
      and(
        eq(insights.studentId, studentId),
        gte(insights.createdAt, startDate),
        lte(insights.createdAt, endDate)
      )
    );

  // Get badges earned in the month
  const monthBadges = await db
    .select()
    .from(studentBadges)
    .where(
      and(
        eq(studentBadges.studentId, studentId),
        gte(studentBadges.earnedAt, startDate),
        lte(studentBadges.earnedAt, endDate)
      )
    );

  // Calculate photo stats
  const photoByAngle: Record<string, number> = {};
  monthPhotos.forEach((photo) => {
    const angle = photo.angle || "unknown";
    photoByAngle[angle] = (photoByAngle[angle] || 0) + 1;
  });

  // Calculate daily photo trend
  const photoDailyTrend: Record<string, number> = {};
  monthPhotos.forEach((photo) => {
    const date = new Date(photo.createdAt).toISOString().split("T")[0];
    photoDailyTrend[date] = (photoDailyTrend[date] || 0) + 1;
  });

  const photoTrend = Object.entries(photoDailyTrend)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Calculate exam stats
  const examByType: Record<string, number> = {};
  const latestValues: Record<string, number> = {};

  monthExams.forEach((exam) => {
    const type = exam.examType || "unknown";
    examByType[type] = (examByType[type] || 0) + 1;
  });

  // Extract latest exam values (simplified)
  if (monthExams.length > 0) {
    const latestExam = monthExams[monthExams.length - 1];
    if (latestExam.extractedData) {
      try {
        const data = JSON.parse(String(latestExam.extractedData));
        if (typeof data === "object" && data !== null) {
          Object.assign(latestValues, data);
        }
      } catch (e) {
        console.error("Error parsing exam data:", e);
      }
    }
  }

  // Calculate post stats
  let topPost: { id: string; title: string; likes: number } | null = null;
  if (monthPosts.length > 0) {
    topPost = {
      id: String(monthPosts[0].id),
      title: monthPosts[0].caption || "Post",
      likes: 0,
    };
  }

  // Calculate insight stats
  const insightByCategory: Record<string, number> = {};
  monthInsights.forEach((insight) => {
    const category = insight.insightType || "general";
    insightByCategory[category] = (insightByCategory[category] || 0) + 1;
  });

  // Calculate progress metrics
  const consistency = Math.min(
    100,
    Math.round((monthPhotos.length / 30) * 100)
  );
  const engagement = Math.min(
    100,
    Math.round(((monthPosts.length + monthInsights.length) / 20) * 100)
  );
  const completion = Math.min(
    100,
    Math.round(((monthPhotos.length + monthExams.length) / 40) * 100)
  );

  return {
    month: new Date(year, month - 1).toLocaleString("pt-BR", {
      month: "long",
    }),
    year,
    photoStats: {
      total: monthPhotos.length,
      byAngle: photoByAngle,
      trend: photoTrend,
    },
    examStats: {
      total: monthExams.length,
      byType: examByType,
      latestValues,
    },
    postStats: {
      total: monthPosts.length,
      engagement: 0,
      topPost,
    },
    insightStats: {
      total: monthInsights.length,
      categories: insightByCategory,
    },
    badgesEarned: monthBadges.map((badge) => ({
      id: String(badge.badgeId),
      name: `Badge ${badge.badgeId}`,
      description: "Badge conquistada",
      icon: "🏆",
      earnedAt: badge.earnedAt,
    })),
    progressMetrics: {
      consistency,
      engagement,
      completion,
    },
  };
}

export async function generatePDFReport(report: MonthlyReport): Promise<string> {
  // This will be called from the frontend to generate PDF
  // We'll use a library like react-pdf or pdfkit
  return JSON.stringify(report);
}
