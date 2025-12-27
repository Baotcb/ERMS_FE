"use client"

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobPostingSchema, JobPostingFormValues } from "../schemas/job-posting.schema";
import { StepGeneral } from "./steps/StepGeneral";
import { StepDetailed } from "./steps/StepDetailed";
import { StepRequirements } from "./steps/StepRequirements";
import { StepReview } from "./steps/StepReview";
import { JobPosting, JobStatus, JobCategory } from "../types";
import { MockJobService } from "../data/mock-jobs";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ChevronRight, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Type-safe step definition
interface StepDef {
    id: string;
    title: string;
    description: string;
    component: React.ComponentType;
    fields: (keyof JobPostingFormValues)[];
}

const STEPS: StepDef[] = [
    { id: "general", title: "General Info", description: "Basic job details and location", component: StepGeneral, fields: ["title", "departmentId", "location", "employmentType"] },
    { id: "detailed", title: "Job Description", description: "Roles, responsibilities, and benefits", component: StepDetailed, fields: ["description"] },
    { id: "requirements", title: "Requirements", description: "Skills and experience needed", component: StepRequirements, fields: ["skills", "experienceYears"] },
    { id: "review", title: "Review & Publish", description: "Verify all details", component: StepReview, fields: [] },
];

interface CreateJobWizardProps {
    initialData?: JobPosting;
    isEditMode?: boolean;
}

export function CreateJobWizard({ initialData, isEditMode = false }: CreateJobWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const defaultValues: Partial<JobPostingFormValues> = initialData ? {
        title: initialData.title,
        departmentId: initialData.departmentId,
        location: initialData.location,
        employmentType: initialData.employmentType,
        description: initialData.description,
        skills: initialData.requirements.skills as JobPostingFormValues['skills'],
        experienceYears: initialData.requirements.experienceYears,
        educationLevel: initialData.requirements.educationLevel as JobPostingFormValues['educationLevel'],
        salary: initialData.salary
    } : {
        skills: [{ id: "1", name: "", level: "INTERMEDIATE", isMandatory: false }],
        experienceYears: 0,
        educationLevel: "BACHELOR",
        salary: { isVisible: true, min: 0, max: 0, currency: "VND" }
    };

    const methods = useForm<JobPostingFormValues>({
        resolver: zodResolver(JobPostingSchema),
        defaultValues,
        mode: "onChange"
    });

    const { trigger, handleSubmit } = methods;

    const nextStep = async () => {
        const fieldsToValidate = STEPS[currentStep].fields;
        const isValid = await trigger(fieldsToValidate);

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const onSubmit = async (data: JobPostingFormValues) => {
        setIsSubmitting(true);
        try {
            // Transform form data to JobPosting structure for API
            const jobPayload = {
                ...data,
                departmentName: "Software Dept (Mock)", // Mock department lookup
                requirements: {
                    skills: data.skills,
                    experienceYears: data.experienceYears,
                    educationLevel: data.educationLevel as string
                },
                category: initialData?.category || JobCategory.OTHER,
                status: JobStatus.PUBLISHED
            };

            if (isEditMode && initialData) {
                await MockJobService.update(initialData.id, jobPayload);
                toast({
                    title: "Job updated successfully",
                    description: `${data.title} has been updated.`,
                });
            } else {
                await MockJobService.create({
                    ...jobPayload,
                    status: JobStatus.PUBLISHED
                } as Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'applicantsCount'>);
                toast({
                    title: "Job posted successfully",
                    description: "Your new job posting is now live.",
                });
            }
            router.push("/recruitment/jobs");
        } catch (error) {
            console.error(error);
            toast({
                title: "Failed to submit job",
                description: "There was a problem saving your changes. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const CurrentComponent = STEPS[currentStep].component;

    return (
        <FormProvider {...methods}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
                {/* Left Sidebar - Stepper */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="rounded-xl border bg-card p-6 shadow-sm sticky top-24">
                        <div className="flex items-center gap-2 mb-6 text-primary font-semibold">
                            <LayoutDashboard className="h-5 w-5" />
                            <span>Progress</span>
                        </div>
                        <div className="space-y-6 relative">
                            {/* Connector Line */}
                            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-muted -z-10" />

                            {STEPS.map((step, index) => {
                                const isCompleted = index < currentStep;
                                const isCurrent = index === currentStep;

                                return (
                                    <div key={step.id} className="flex gap-4 relative">
                                        <div
                                            className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 z-10 border-2 
                                            ${isCompleted ? "bg-primary text-primary-foreground border-primary" :
                                                    isCurrent ? "bg-background text-primary border-primary ring-4 ring-primary/10" :
                                                        "bg-background text-muted-foreground border-muted"}`}
                                        >
                                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                                        </div>
                                        <div className={`pt-1 transition-colors duration-300 ${isCurrent ? "opacity-100" : "opacity-60"}`}>
                                            <p className={`text-sm font-semibold ${isCurrent ? "text-primary" : "text-foreground"}`}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground hidden xl:block">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Content - Form */}
                <div className="lg:col-span-9">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Card className="shadow-md border-muted/60 overflow-hidden">
                            <CardHeader className="bg-muted/10 border-b pb-8 pt-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">{STEPS[currentStep].title}</CardTitle>
                                        <p className="text-muted-foreground mt-1 text-sm">{STEPS[currentStep].description}</p>
                                    </div>
                                    <div className="hidden sm:block text-xs font-medium bg-secondary px-3 py-1 rounded-full text-secondary-foreground">
                                        Step {currentStep + 1} of {STEPS.length}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 min-h-[400px]">
                                <CurrentComponent />
                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-6 bg-muted/5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                    className="w-24"
                                >
                                    Back
                                </Button>

                                {currentStep === STEPS.length - 1 ? (
                                    <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-700 min-w-[140px]" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isEditMode ? "Update Job" : "Publish Job"}
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={nextStep} className="min-w-[140px]">
                                        Next Step
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </FormProvider>
    );
}
