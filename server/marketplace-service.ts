import { getDb } from "./db";
import { professionals, posts, users } from "@/drizzle/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export interface ProfessionalProfile {
  id: number;
  userId: number;
  name: string;
  email: string;
  bio: string | null;
  specialties: string[];
  licenseNumber: string | null;
  plan: "free" | "pro" | "enterprise";
  studentCount: number;
  maxStudents: number;
  isVerified: boolean;
  createdAt: Date;
}

export interface ProfessionalShowcase {
  id: number;
  studentName: string;
  postCaption: string | null;
  createdAt: Date;
}

export async function searchProfessionals(
  specialty?: string,
  limit: number = 20,
  offset: number = 0
): Promise<ProfessionalProfile[]> {
  const db = await getDb();

  if (!db) {
    throw new Error("Database connection failed");
  }

  const baseQuery = db
    .select({
      id: professionals.id,
      userId: professionals.userId,
      name: users.name,
      email: users.email,
      bio: professionals.bio,
      specialties: professionals.specialties,
      licenseNumber: professionals.licenseNumber,
      plan: professionals.plan,
      studentCount: professionals.studentCount,
      maxStudents: professionals.maxStudents,
      isVerified: professionals.isVerified,
      createdAt: professionals.createdAt,
    })
    .from(professionals)
    .innerJoin(users, eq(professionals.userId, users.id));

  let results;
  if (specialty) {
    results = await baseQuery
      .where(
        sql`JSON_CONTAINS(${professionals.specialties}, JSON_QUOTE(${specialty}))`
      )
      .orderBy(desc(professionals.isVerified), desc(professionals.studentCount))
      .limit(limit)
      .offset(offset);
  } else {
    results = await baseQuery
      .orderBy(desc(professionals.isVerified), desc(professionals.studentCount))
      .limit(limit)
      .offset(offset);
  }

  return results.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: r.name || "Unknown",
    email: r.email || "",
    bio: r.bio,
    specialties: Array.isArray(r.specialties) ? r.specialties : [],
    licenseNumber: r.licenseNumber,
    plan: r.plan,
    studentCount: r.studentCount,
    maxStudents: r.maxStudents,
    isVerified: r.isVerified,
    createdAt: r.createdAt,
  }));
}

export async function getProfessionalDetails(
  professionalId: number
): Promise<ProfessionalProfile | null> {
  const db = await getDb();

  if (!db) {
    throw new Error("Database connection failed");
  }

  const result = await db
    .select({
      id: professionals.id,
      userId: professionals.userId,
      name: users.name,
      email: users.email,
      bio: professionals.bio,
      specialties: professionals.specialties,
      licenseNumber: professionals.licenseNumber,
      plan: professionals.plan,
      studentCount: professionals.studentCount,
      maxStudents: professionals.maxStudents,
      isVerified: professionals.isVerified,
      createdAt: professionals.createdAt,
    })
    .from(professionals)
    .innerJoin(users, eq(professionals.userId, users.id))
    .where(eq(professionals.id, professionalId))
    .then((results) => results[0]);

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    userId: result.userId,
    name: result.name || "Unknown",
    email: result.email || "",
    bio: result.bio,
    specialties: Array.isArray(result.specialties) ? result.specialties : [],
    licenseNumber: result.licenseNumber,
    plan: result.plan,
    studentCount: result.studentCount,
    maxStudents: result.maxStudents,
    isVerified: result.isVerified,
    createdAt: result.createdAt,
  };
}

export async function getProfessionalShowcase(
  professionalId: number,
  limit: number = 12
): Promise<ProfessionalShowcase[]> {
  const db = await getDb();

  if (!db) {
    throw new Error("Database connection failed");
  }

  const results = await db
    .select({
      id: posts.id,
      studentName: users.name,
      postCaption: posts.caption,
      createdAt: posts.createdAt,
      markedProfessionalIds: posts.markedProfessionalIds,
    })
    .from(posts)
    .innerJoin(users, eq(posts.studentId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  const filteredResults = results.filter((r) =>
    (Array.isArray(r.markedProfessionalIds)
      ? r.markedProfessionalIds
      : []
    ).includes(professionalId)
  );

  return filteredResults.map((r) => ({
    id: r.id as number,
    studentName: r.studentName || "Anonymous",
    postCaption: r.postCaption,
    createdAt: r.createdAt,
  }));
}

export async function connectWithProfessional(
  studentId: number,
  professionalId: number
): Promise<void> {
  const db = await getDb();

  if (!db) {
    throw new Error("Database connection failed");
  }

  const professional = await db
    .select()
    .from(professionals)
    .where(eq(professionals.id, professionalId))
    .then((results) => results[0]);

  if (!professional) {
    throw new Error("Professional not found");
  }

  if (professional.studentCount >= professional.maxStudents) {
    throw new Error(
      `Professional has reached maximum students (${professional.maxStudents})`
    );
  }

  await db
    .update(professionals)
    .set({
      studentCount: professional.studentCount + 1,
    })
    .where(eq(professionals.id, professionalId));
}

export async function getSpecialties(): Promise<string[]> {
  return [
    "Personal Trainer",
    "Nutricionista",
    "Fisioterapeuta",
    "Coach de Fitness",
    "Médico Esportivo",
    "Psicólogo do Esporte",
    "Preparador Físico",
  ];
}

export async function getProfessionalsByPlan(
  plan: "free" | "pro" | "enterprise"
): Promise<ProfessionalProfile[]> {
  const db = await getDb();

  if (!db) {
    throw new Error("Database connection failed");
  }

  const results = await db
    .select({
      id: professionals.id,
      userId: professionals.userId,
      name: users.name,
      email: users.email,
      bio: professionals.bio,
      specialties: professionals.specialties,
      licenseNumber: professionals.licenseNumber,
      plan: professionals.plan,
      studentCount: professionals.studentCount,
      maxStudents: professionals.maxStudents,
      isVerified: professionals.isVerified,
      createdAt: professionals.createdAt,
    })
    .from(professionals)
    .innerJoin(users, eq(professionals.userId, users.id))
    .where(eq(professionals.plan, plan))
    .orderBy(desc(professionals.isVerified), desc(professionals.studentCount));

  return results.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: r.name || "Unknown",
    email: r.email || "",
    bio: r.bio,
    specialties: Array.isArray(r.specialties) ? r.specialties : [],
    licenseNumber: r.licenseNumber,
    plan: r.plan,
    studentCount: r.studentCount,
    maxStudents: r.maxStudents,
    isVerified: r.isVerified,
    createdAt: r.createdAt,
  }));
}
