"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { KanbanBoard } from "@/components/board/KanbanBoard";

export default function JiraPage() {
    return (
        <div className="h-[calc(100vh-8rem)]">
            <KanbanBoard />
        </div>
    );
}
