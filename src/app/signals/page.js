"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { SignalsContent } from "@/components/signals/SignalsContent";

export default function SignalsPage() {
    return (
        <DashboardLayout>
            <SignalsContent />
        </DashboardLayout>
    );
}
