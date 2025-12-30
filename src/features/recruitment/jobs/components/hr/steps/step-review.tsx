"use client"

import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JobPostingFormValues } from "@/features/recruitment/jobs/schemas/job-posting.schema";

export function StepReview() {
    const { getValues } = useFormContext<JobPostingFormValues>();
    const values = getValues();

    return (
        <div className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-xl font-bold">{values.title || "Untitled Job"}</h3>
                <p className="text-muted-foreground">{values.location} • {values.employmentType}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <section>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="whitespace-pre-wrap text-sm">{values.description}</p>
                    </section>

                    <section>
                        <h4 className="font-semibold mb-2">Benefits</h4>
                        <p className="whitespace-pre-wrap text-sm">{values.benefits || "No specific benefits listed."}</p>
                    </section>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Required Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {values.skills?.map(skill => (
                                        <Badge key={skill.id} variant="secondary">
                                            {skill.name} ({skill.level})
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Requirements</h4>
                                <ul className="text-sm space-y-1">
                                    <li>Experience: {values.experienceYears} years</li>
                                    <li>Education: {values.educationLevel}</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
