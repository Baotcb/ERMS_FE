"use client"

import { useFormContext, useFieldArray } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { JobPostingFormValues } from "../../schemas/job-posting.schema";

export function StepRequirements() {
    const { control, register } = useFormContext<JobPostingFormValues>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "skills",
    });

    const addSkill = () => {
        append({ id: `new-${Date.now()}`, name: "", level: "INTERMEDIATE", isMandatory: false });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Skills & Competencies</h3>
                <p className="text-sm text-muted-foreground">Add skills required for this position. AI uses these to match candidates.</p>

                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-3 items-start p-3 border rounded-md bg-muted/50">
                            <div className="flex-1 space-y-2">
                                <Input
                                    placeholder="Skill Name (e.g. React, Negotiation)"
                                    {...register(`skills.${index}.name`)}
                                />
                            </div>

                            <div className="w-[150px]">
                                <Select
                                    defaultValue={field.level}
                                    onValueChange={(val: any) => {
                                        // Creating a synthetic event or usingsetValue is cleaner, but for raw UI this works if we bind properly
                                        // React Hook Form Controller is better here, but register is used above.
                                        // Let's stick to Controller for Select
                                    }}
                                >
                                    {/* Simplified for demo, ideally wrap in Controller */}
                                </Select>
                                {/* Re-doing this part with FormField for proper connection */}
                                <FormField
                                    control={control}
                                    name={`skills.${index}.level`}
                                    render={({ field: selectField }) => (
                                        <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="BASIC">Basic</SelectItem>
                                                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                <SelectItem value="ADVANCED">Advanced</SelectItem>
                                                <SelectItem value="EXPERT">Expert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                <Button type="button" variant="outline" onClick={addSkill} className="w-full border-dashed">
                    <Plus className="mr-2 h-4 w-4" /> Add Skill
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="experienceYears"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="educationLevel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Education Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Level" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                                    <SelectItem value="BACHELOR">Bachelor's Degree</SelectItem>
                                    <SelectItem value="MASTER">Master's Degree</SelectItem>
                                    <SelectItem value="PHD">PhD</SelectItem>
                                    <SelectItem value="OTHER">Other / Certificate</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
