/**
 * Exam Analysis Service
 * 
 * Handles OCR extraction and AI analysis of laboratory exams.
 * Uses the LLM to extract biomarker data and generate health insights.
 */

import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { storagePut } from "./storage";

/**
 * Extracted biomarker data from OCR
 */
export interface ExtractedBiomarker {
  name: string;
  value: string;
  unit?: string;
  referenceMin?: string;
  referenceMax?: string;
  status: "normal" | "low" | "high" | "critical";
}

/**
 * Exam analysis result
 */
export interface ExamAnalysisResult {
  examId: number;
  examType: string;
  biomarkers: ExtractedBiomarker[];
  rawText: string;
  insights: {
    title: string;
    content: string;
    category: "nutrition" | "training" | "recovery" | "health" | "warning";
    priority: "low" | "medium" | "high" | "critical";
  }[];
  timestamp: Date;
}

/**
 * Extract biomarkers from exam image using OCR and LLM
 */
export async function extractBiomarkersFromExam(
  examImageUrl: string,
  examType: string
): Promise<{
  biomarkers: ExtractedBiomarker[];
  rawText: string;
}> {
  try {
    console.log(`[ExamAnalysis] Extracting biomarkers from ${examType} exam`);

    // Use LLM to extract text and biomarkers from image
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a medical lab result analyzer. Extract all biomarkers from the lab exam image.
          
For each biomarker, provide:
- name: The biomarker name (e.g., "Hemoglobin", "Glucose")
- value: The measured value
- unit: The unit of measurement (e.g., "g/dL", "mg/dL")
- referenceMin: The minimum normal range
- referenceMax: The maximum normal range
- status: "normal", "low", "high", or "critical" based on the reference range

Also provide the raw extracted text from the exam.

Return JSON with this structure:
{
  "rawText": "Full extracted text from the exam",
  "biomarkers": [
    {
      "name": "Hemoglobin",
      "value": "14.5",
      "unit": "g/dL",
      "referenceMin": "13.5",
      "referenceMax": "17.5",
      "status": "normal"
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Extract all biomarkers from this ${examType} lab exam image from URL: ${examImageUrl}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "exam_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              rawText: {
                type: "string",
                description: "Full extracted text from the exam",
              },
              biomarkers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    value: { type: "string" },
                    unit: { type: "string" },
                    referenceMin: { type: "string" },
                    referenceMax: { type: "string" },
                    status: {
                      type: "string",
                      enum: ["normal", "low", "high", "critical"],
                    },
                  },
                  required: ["name", "value", "status"],
                },
              },
            },
            required: ["rawText", "biomarkers"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);

    console.log(
      `[ExamAnalysis] Extracted ${parsed.biomarkers.length} biomarkers`
    );

    return {
      biomarkers: parsed.biomarkers as ExtractedBiomarker[],
      rawText: parsed.rawText as string,
    };
  } catch (error) {
    console.error("[ExamAnalysis] Error extracting biomarkers:", error);
    throw new Error("Failed to extract biomarkers from exam image");
  }
}

/**
 * Generate AI insights based on exam biomarkers
 */
export async function generateExamInsights(
  studentId: number,
  examType: string,
  biomarkers: ExtractedBiomarker[],
  rawText: string
): Promise<
  {
    title: string;
    content: string;
    category: "nutrition" | "training" | "recovery" | "health" | "warning";
    priority: "low" | "medium" | "high" | "critical";
  }[]
> {
  try {
    console.log(
      `[ExamAnalysis] Generating insights for ${examType} exam (${biomarkers.length} biomarkers)`
    );

    // Build biomarker summary for context
    const biomarkerSummary = biomarkers
      .map(
        (b) =>
          `${b.name}: ${b.value}${b.unit ? " " + b.unit : ""} (status: ${b.status})`
      )
      .join("\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a health and fitness expert AI assistant. Analyze lab exam results and provide personalized insights for fitness and health optimization.

For each insight, provide:
- title: Short insight title (max 50 chars)
- content: Detailed explanation (max 200 chars)
- category: One of "nutrition", "training", "recovery", "health", "warning"
- priority: One of "low", "medium", "high", "critical"

Focus on actionable insights that can improve fitness, recovery, and overall health.
Prioritize critical abnormalities and warning signs.

Return JSON with this structure:
{
  "insights": [
    {
      "title": "Insight Title",
      "content": "Detailed explanation",
      "category": "nutrition",
      "priority": "high"
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Analyze these lab exam results and provide health/fitness insights:

Exam Type: ${examType}
Biomarkers:
${biomarkerSummary}

Raw Text:
${rawText}

Provide 3-5 actionable insights focused on fitness optimization, nutrition, recovery, and health improvements.`,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);

    console.log(`[ExamAnalysis] Generated ${parsed.insights.length} insights`);

    return parsed.insights as Array<{
      title: string;
      content: string;
      category: "nutrition" | "training" | "recovery" | "health" | "warning";
      priority: "low" | "medium" | "high" | "critical";
    }>;
  } catch (error) {
    console.error("[ExamAnalysis] Error generating insights:", error);
    throw new Error("Failed to generate insights from exam data");
  }
}

/**
 * Process exam upload: extract biomarkers and generate insights
 */
export async function processExamUpload(
  studentId: number,
  examImageUrl: string,
  examType: string
): Promise<ExamAnalysisResult> {
  try {
    console.log(
      `[ExamAnalysis] Processing exam upload for student ${studentId}`
    );

    // Step 1: Extract biomarkers from image
    const { biomarkers, rawText } = await extractBiomarkersFromExam(
      examImageUrl,
      examType
    );

    // Step 2: Generate insights
    const insights = await generateExamInsights(
      studentId,
      examType,
      biomarkers,
      rawText
    );

    // Step 3: Save exam to database
    const examId = await db.createExam({
      studentId,
      examType,
      examUrl: examImageUrl,
      extractedData: {
        biomarkers,
        rawText,
        processedAt: new Date().toISOString(),
      },
      examDate: new Date(),
    });

    // Step 4: Save insights to database
    for (const insight of insights) {
      await db.createInsight({
        studentId,
        insightType: "exam_analysis",
        title: insight.title,
        description: insight.content,
        recommendation: `Based on your ${examType} results, consider adjusting your ${insight.category} approach.`,
        priority: (insight.priority === "critical" ? "high" : insight.priority) as "low" | "medium" | "high",
      });
    }

    console.log(`[ExamAnalysis] Exam processing complete (ID: ${examId})`);

    return {
      examId,
      examType,
      biomarkers,
      rawText,
      insights,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[ExamAnalysis] Error processing exam:", error);
    throw error;
  }
}

/**
 * Analyze exam biomarkers against student's fitness data
 */
export async function analyzeExamWithFitnessContext(
  studentId: number,
  examType: string,
  biomarkers: ExtractedBiomarker[],
  fitnessContext?: {
    trainingIntensity?: "low" | "moderate" | "high";
    supplementStack?: string[];
    dietType?: string;
  }
): Promise<string> {
  try {
    console.log(
      `[ExamAnalysis] Analyzing exam with fitness context for student ${studentId}`
    );

    const biomarkerSummary = biomarkers
      .map(
        (b) =>
          `${b.name}: ${b.value}${b.unit ? " " + b.unit : ""} (${b.status})`
      )
      .join("\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert sports nutritionist and fitness coach. Analyze lab results in the context of fitness training and provide personalized recommendations.`,
        },
        {
          role: "user",
          content: `Analyze these lab results in the context of fitness training:

Exam Type: ${examType}
Biomarkers:
${biomarkerSummary}

Training Context:
- Intensity: ${fitnessContext?.trainingIntensity || "unknown"}
- Supplements: ${fitnessContext?.supplementStack?.join(", ") || "none"}
- Diet: ${fitnessContext?.dietType || "unknown"}

Provide a comprehensive analysis with:
1. How these results relate to training adaptations
2. Potential areas of concern
3. Specific recommendations for nutrition, recovery, and training adjustments
4. When to retest and what to monitor`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    return typeof content === 'string' ? content : JSON.stringify(content);
  } catch (error) {
    console.error("[ExamAnalysis] Error analyzing with fitness context:", error);
    throw new Error("Failed to analyze exam with fitness context");
  }
}
