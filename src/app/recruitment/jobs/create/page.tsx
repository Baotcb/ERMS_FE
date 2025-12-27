import { CreateJobWizard } from "@/features/recruitment/jobs/components/CreateJobWizard";

export default function CreateJobPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create New Job Posting</h1>
                <p className="text-muted-foreground mt-2">Follow the steps below to publish a new job vacancy to the recruitment portal.</p>
            </div>

            <CreateJobWizard />
        </div>
    );
}
