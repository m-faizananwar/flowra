"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { PrVerificationContent } from "@/components/pr/PrVerificationContent";

export default function PrPage() {
    return (
        <DashboardLayout>
            <PrVerificationContent />
        </DashboardLayout>
    );
}
