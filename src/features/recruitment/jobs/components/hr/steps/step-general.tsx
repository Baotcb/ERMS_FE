"use client"

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobPostingFormValues } from "@/features/recruitment/jobs/schemas/job-posting.schema";

export function StepGeneral() {
    const { control } = useFormContext<JobPostingFormValues>();

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Senior Frontend Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="departmentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="dept-1">Engineering</SelectItem>
                                    <SelectItem value="dept-2">Human Resources</SelectItem>
                                    <SelectItem value="dept-3">Sales</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="employmentType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Employment Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                                    <SelectItem value="CONTRACT">Contract</SelectItem>
                                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Hanoi Office, Remote" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
