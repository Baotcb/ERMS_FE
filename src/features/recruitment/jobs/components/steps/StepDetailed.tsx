"use client"

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { JobPostingFormValues } from "../../schemas/job-posting.schema";

export function StepDetailed() {
    const { control } = useFormContext<JobPostingFormValues>();

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Describe the main responsibilities..."
                                className="min-h-[200px]"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            Detailed description of the role. AI will use this to match candidates.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="benefits"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Benefits & Perks</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Health insurance, Remote work..."
                                className="min-h-[100px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
