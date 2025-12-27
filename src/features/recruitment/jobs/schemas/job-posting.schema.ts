import { z } from "zod";

export const JobPostingSchema = z.object({
    // Step 1: General
    title: z.string().min(5, "Job Title must be at least 5 characters"),
    departmentId: z.string().min(1, "Please select a department"),
    location: z.string().min(1, "Location is required"),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),

    // Step 2: Details
    description: z.string().min(20, "Description is too short (min 20 chars)"),
    benefits: z.string().optional(),

    // Step 3: Requirements (AI Context)
    skills: z.array(z.object({
        id: z.string(), // If customized, this might be the name itself or a 'new:' ID
        name: z.string(),
        level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
        isMandatory: z.boolean().default(false)
    })).min(1, "At least one skill is required"),

    experienceYears: z.number().min(0),
    educationLevel: z.enum(["HIGH_SCHOOL", "BACHELOR", "MASTER", "PHD", "OTHER"]),

    // Step 4: Salary
    salary: z.object({
        min: z.number().min(0),
        max: z.number().min(0),
        currency: z.enum(["VND", "USD"]),
        isVisible: z.boolean().default(true)
    }).refine((data) => data.max >= data.min, {
        message: "Max salary must be greater than Min salary",
        path: ["max"],
    }),
});

export type JobPostingFormValues = z.infer<typeof JobPostingSchema>;
