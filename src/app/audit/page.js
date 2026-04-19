"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { AuditLogsContent } from "@/components/activity/AuditLogsContent";

export default function AuditLogsPage() {
    return (
        <DashboardLayout>
            <AuditLogsContent />
        </DashboardLayout>
    );
}
