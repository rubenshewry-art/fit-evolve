/**
 * Social Service
 * 
 * Handles feed posts, achievements, and social interactions.
 */

import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { posts, badges, studentBadges } from "../drizzle/schema";

export interface CreatePostInput {
  studentId: number;
  caption: string;
  photoId?: number;
  isPublic: boolean;
  markedProfessionalIds?: number[];
}

export interface PostWithDetails {
  id: number;
  studentId: number;
  caption: string;
  photoId?: number;
  isPublic: boolean;
  createdAt: Date;
  markedProfessionalIds: number[];
}

/**
 * Create a new post
 */
export async function createPost(input: CreatePostInput) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    await db.insert(posts).values({
      studentId: input.studentId,
      caption: input.caption,
      photoId: input.photoId,
      isPublic: input.isPublic,
      markedProfessionalIds: input.markedProfessionalIds || [],
    });

    return {
      success: true,
      message: "Post created successfully",
    };
  } catch (error) {
    console.error("[SocialService] Error creating post:", error);
    throw new Error("Failed to create post");
  }
}

/**
 * Get feed posts for student
 */
export async function getFeedPosts(studentId: number, limit = 20) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    const results = await db
      .select()
      .from(posts)
      .where(eq(posts.isPublic, true))
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    return results.map((p: any) => ({
      id: p.id,
      studentId: p.studentId,
      caption: p.caption,
      photoId: p.photoId,
      isPublic: p.isPublic,
      createdAt: p.createdAt,
      markedProfessionalIds: Array.isArray(p.markedProfessionalIds) ? p.markedProfessionalIds : [],
    }));
  } catch (error) {
    console.error("[SocialService] Error getting feed posts:", error);
    return [];
  }
}

/**
 * Get student's own posts
 */
export async function getStudentPosts(studentId: number, limit = 20) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    const results = await db
      .select()
      .from(posts)
      .where(eq(posts.studentId, studentId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    return results.map((p: any) => ({
      id: p.id,
      studentId: p.studentId,
      caption: p.caption,
      photoId: p.photoId,
      isPublic: p.isPublic,
      createdAt: p.createdAt,
      markedProfessionalIds: Array.isArray(p.markedProfessionalIds) ? p.markedProfessionalIds : [],
    }));
  } catch (error) {
    console.error("[SocialService] Error getting student posts:", error);
    return [];
  }
}

/**
 * Get post by ID
 */
export async function getPostById(postId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    const post = await db.select().from(posts).where(eq(posts.id, postId));

    if (!post.length) {
      return null;
    }

    const p = post[0] as any;
    return {
      id: p.id,
      studentId: p.studentId,
      caption: p.caption,
      photoId: p.photoId,
      isPublic: p.isPublic,
      createdAt: p.createdAt,
      markedProfessionalIds: Array.isArray(p.markedProfessionalIds) ? p.markedProfessionalIds : [],
    };
  } catch (error) {
    console.error("[SocialService] Error getting post:", error);
    return null;
  }
}

/**
 * Update post visibility
 */
export async function updatePostVisibility(
  postId: number,
  studentId: number,
  isPublic: boolean
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    const post = await db.select().from(posts).where(eq(posts.id, postId));

    if (!post.length || (post[0] as any).studentId !== studentId) {
      throw new Error("Post not found or unauthorized");
    }

    await db
      .update(posts)
      .set({ isPublic })
      .where(eq(posts.id, postId));

    return { success: true };
  } catch (error) {
    console.error("[SocialService] Error updating post visibility:", error);
    throw new Error("Failed to update post");
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId: number, studentId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    const post = await db.select().from(posts).where(eq(posts.id, postId));

    if (!post.length || (post[0] as any).studentId !== studentId) {
      throw new Error("Post not found or unauthorized");
    }

    await db.delete(posts).where(eq(posts.id, postId));

    return { success: true };
  } catch (error) {
    console.error("[SocialService] Error deleting post:", error);
    throw new Error("Failed to delete post");
  }
}

/**
 * Award achievement to student
 */
export async function awardBadge(
  studentId: number,
  badgeId: number
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    await db.insert(studentBadges).values({
      studentId,
      badgeId,
    });

    return {
      success: true,
      message: "Achievement awarded successfully",
    };
  } catch (error) {
    console.error("[SocialService] Error awarding achievement:", error);
    throw new Error("Failed to award achievement");
  }
}

/**
 * Get student achievements
 */
export async function getStudentBadges(studentId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    const results = await db
      .select()
      .from(studentBadges)
      .where(eq(studentBadges.studentId, studentId))
      .orderBy(desc(studentBadges.earnedAt));

    return results.map((sb: any) => ({
      id: sb.id,
      badgeId: sb.badgeId,
      earnedAt: sb.earnedAt,
    }));
  } catch (error) {
    console.error("[SocialService] Error getting achievements:", error);
    return [];
  }
}

/**
 * Get achievement statistics
 */
export async function getBadgeStats(studentId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    const results = await db
      .select()
      .from(studentBadges)
      .where(eq(studentBadges.studentId, studentId));

    return {
      total: results.length,
      badges: results,
    };
  } catch (error) {
    console.error("[SocialService] Error getting achievement stats:", error);
    return { total: 0, byType: {} };
  }
}

/**
 * Check if achievement should be awarded
 */
export async function checkAndAwardBadges(studentId: number) {
  try {
    const badges_to_award = [];

    // Check for first post
    const posts_result = await getStudentPosts(studentId, 1);
    if (posts_result.length === 1) {
      // Badge ID 1 = First Post (assuming from schema)
      badges_to_award.push(1);
    }

    // Award all pending badges
    for (const badgeId of badges_to_award) {
      await awardBadge(studentId, badgeId);
    }

    return badges_to_award;
  } catch (error) {
    console.error("[SocialService] Error checking achievements:", error);
    return [];
  }
}
