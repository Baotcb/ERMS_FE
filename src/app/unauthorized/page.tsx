import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-4">
            <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-red-100 p-6">
                    <ShieldAlert className="h-12 w-12 text-red-600" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">401 - Unauthorized</h1>
                <p className="max-w-md text-gray-500">
                    You do not have permission to access this page. If you believe this is an error, please contact your administrator.
                </p>
                <div className="flex gap-4 pt-4">
                    <Button asChild variant="outline">
                        <Link href="/">Go Home</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/login">Log In</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
