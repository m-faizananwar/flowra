"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { TriageHubContent } from "@/components/triage/TriageHubContent";

export default function TriagePage() {
    return (
        <div className="h-[calc(100vh-8rem)]">
            <TriageHubContent />
        </div>
    );
}
