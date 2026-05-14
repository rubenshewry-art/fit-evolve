import { getDb } from "./db";
import { photos, posts } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export interface TimelapseGenerationRequest {
  studentId: number;
  angle?: "front" | "side" | "back";
  startDate?: Date;
  endDate?: Date;
  fps?: number; // frames per second, default 2
}

export interface TimelapseMetadata {
  id: string;
  studentId: number;
  photoCount: number;
  duration: number; // in seconds
  angle: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  videoUrl?: string;
}

/**
 * Get photos for timelapse generation
 */
export async function getPhotosForTimelapse(
  studentId: number,
  angle?: string,
  startDate?: Date,
  endDate?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const conditions: any[] = [eq(photos.studentId, studentId)];

  if (angle) {
    conditions.push(eq(photos.angle, angle));
  }

  if (startDate && endDate) {
    conditions.push(
      and(
        eq(photos.studentId, studentId),
        angle ? eq(photos.angle, angle) : undefined
      )
    );
  }

  const photoList = await db
    .select()
    .from(photos)
    .where(conditions.length > 1 ? and(...conditions) : conditions[0])
    .orderBy(photos.capturedAt)
    .limit(100);

  return photoList;
}

/**
 * Create timelapse metadata record
 */
export async function createTimelapseRecord(
  studentId: number,
  photoCount: number,
  angle: string,
  startDate: Date,
  endDate: Date,
  videoUrl?: string
): Promise<TimelapseMetadata> {
  const db = await getDb();

  const duration = Math.ceil(photoCount / 2); // 2 fps default

  const record: TimelapseMetadata = {
    id: `timelapse_${Date.now()}`,
    studentId,
    photoCount,
    duration,
    angle,
    startDate,
    endDate,
    createdAt: new Date(),
    videoUrl,
  };

  return record;
}

/**
 * Get timelapse history for student
 */
export async function getTimelapseHistory(studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const timelapses = await db
    .select()
    .from(photos)
    .where(eq(photos.studentId, studentId))
    .orderBy(desc(photos.capturedAt))
    .limit(50);

  // Group by month and angle
  const grouped: Record<string, any[]> = {};

  timelapses.forEach((photo) => {
    const month = new Date(photo.capturedAt).toISOString().slice(0, 7);
    const key = `${month}_${photo.angle}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(photo);
  });

  return grouped;
}

/**
 * Share timelapse to feed
 */
export async function shareTimelapseToFeed(
  studentId: number,
  timelapseId: string,
  caption: string,
  isPublic: boolean = true,
  videoUrl?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const post = {
    studentId,
    caption,
    isPublic,
    content: JSON.stringify({
      type: "timelapse",
      timelapseId,
      videoUrl,
    }),
    createdAt: new Date(),
  };

  // Insert post to feed
  const result = await db.insert(posts).values(post as any);

  return post;
}

/**
 * Calculate timelapse statistics
 */
export async function calculateTimelapseStats(
  photoList: any[]
): Promise<{
  totalPhotos: number;
  dateRange: { start: Date; end: Date };
  daysSpanned: number;
  averagePhotosPerDay: number;
  angles: Record<string, number>;
}> {
  if (photoList.length === 0) {
    return {
      totalPhotos: 0,
      dateRange: { start: new Date(), end: new Date() },
      daysSpanned: 0,
      averagePhotosPerDay: 0,
      angles: {},
    };
  }

  const sortedPhotos = photoList.sort(
    (a, b) =>
      new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
  );

  const startDate = new Date(sortedPhotos[0].capturedAt);
  const endDate = new Date(sortedPhotos[sortedPhotos.length - 1].capturedAt);

  const daysSpanned = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const angles: Record<string, number> = {};
  photoList.forEach((photo) => {
    angles[photo.angle] = (angles[photo.angle] || 0) + 1;
  });

  return {
    totalPhotos: photoList.length,
    dateRange: { start: startDate, end: endDate },
    daysSpanned: Math.max(1, daysSpanned),
    averagePhotosPerDay: Math.round(photoList.length / Math.max(1, daysSpanned)),
    angles,
  };
}
