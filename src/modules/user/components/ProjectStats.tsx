import { useEffect, useState } from "react";
import { Card, CardBody, Spinner, Progress, Button } from "@heroui/react";
import {
    FolderKanban,
    ListTodo,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Play,
    Search,
    Rocket,
    Globe,
    User,
} from "lucide-react";
import { fetchDashboard, fetchGlobalDashboard } from "@services/apiCrud";
import { useAuthContext } from "@modules/user/context/AuthContext";
import type { DashboardStats } from "@/types";

export default function ProjectStats() {
    const { isAdmin } = useAuthContext();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGlobal, setIsGlobal] = useState(false);

    useEffect(() => {
        setLoading(true);
        const fetcher = isGlobal ? fetchGlobalDashboard : fetchDashboard;
        fetcher()
            .then(setStats)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [isGlobal]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-6">
                <Spinner size="sm" label="Loading stats..." />
            </div>
        );
    }

    if (!stats) return null;

    const { taskStats, totalProjects } = stats;
    const completedRate = taskStats.total > 0 ? Math.round((taskStats.finished / taskStats.total) * 100) : 0;
    const inProgressRate = taskStats.total > 0 ? Math.round((taskStats.in_progress / taskStats.total) * 100) : 0;
    const pendingTasks = taskStats.backlog + taskStats.rev_qa;

    const summaryCards = [
        {
            label: "Projects",
            value: totalProjects,
            icon: FolderKanban,
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            label: "Total Tasks",
            value: taskStats.total,
            icon: ListTodo,
            color: "text-secondary",
            bg: "bg-secondary/10",
        },
        {
            label: "Completed",
            value: taskStats.finished,
            icon: CheckCircle2,
            color: "text-success",
            bg: "bg-success/10",
        },
        {
            label: "In Progress",
            value: taskStats.in_progress,
            icon: Play,
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            label: "Pending",
            value: pendingTasks,
            icon: Clock,
            color: "text-warning",
            bg: "bg-warning/10",
        },
        {
            label: "In Production",
            value: taskStats.in_production,
            icon: Rocket,
            color: "text-success",
            bg: "bg-success/10",
        },
    ];

    const statusBreakdown = [
        { label: "Backlog", value: taskStats.backlog, color: "default" as const, icon: AlertTriangle },
        { label: "In Progress", value: taskStats.in_progress, color: "primary" as const, icon: Play },
        { label: "Rev QA", value: taskStats.rev_qa, color: "warning" as const, icon: Search },
        { label: "Finished", value: taskStats.finished, color: "success" as const, icon: CheckCircle2 },
        { label: "In Production", value: taskStats.in_production, color: "secondary" as const, icon: Rocket },
    ];

    return (
        <>
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-2xl font-bold">User Dashboard</h1>
                {isAdmin && (
                    <Button
                        size="sm"
                        variant={isGlobal ? "solid" : "flat"}
                        color={isGlobal ? "primary" : "default"}
                        startContent={isGlobal ? <Globe size={14} /> : <User size={14} />}
                        onPress={() => setIsGlobal((prev) => !prev)}
                    >
                        {isGlobal ? "Global" : "My Stats"}
                    </Button>
                )}
            </div>
            <div className="mb-8 flex flex-col gap-4">
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {summaryCards.map((card) => (
                        <Card key={card.label} className="border border-default-100">
                            <CardBody className="p-4 flex flex-col items-center text-center gap-2">
                                <div className={`w-10 h-10 rounded-full ${card.bg} flex items-center justify-center`}>
                                    <card.icon size={20} className={card.color} />
                                </div>
                                <span className="text-2xl font-bold">{card.value}</span>
                                <span className="text-xs text-default-500">{card.label}</span>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* Progress bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border border-default-100">
                        <CardBody className="p-5 gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">Completion Rate</span>
                                <span className="text-sm font-bold text-success">{completedRate}%</span>
                            </div>
                            <Progress value={completedRate} color="success" size="md" aria-label="Completion rate" />
                            <p className="text-xs text-default-400">
                                {taskStats.finished} of {taskStats.total} tasks completed
                            </p>
                        </CardBody>
                    </Card>

                    <Card className="border border-default-100">
                        <CardBody className="p-5 gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">Active Work</span>
                                <span className="text-sm font-bold text-primary">{inProgressRate}%</span>
                            </div>
                            <Progress value={inProgressRate} color="primary" size="md" aria-label="In progress rate" />
                            <p className="text-xs text-default-400">
                                {taskStats.in_progress} tasks currently in progress
                            </p>
                        </CardBody>
                    </Card>
                </div>

                {/* Status breakdown */}
                <Card className="border border-default-100">
                    <CardBody className="p-5 gap-4">
                        <span className="text-sm font-semibold">Tasks by Status</span>
                        <div className="flex flex-col gap-3">
                            {statusBreakdown.map((item) => {
                                const pct = taskStats.total > 0 ? Math.round((item.value / taskStats.total) * 100) : 0;
                                return (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <item.icon size={16} className="text-default-400 shrink-0" />
                                        <span className="text-sm w-28 shrink-0">{item.label}</span>
                                        <Progress
                                            value={pct}
                                            color={item.color}
                                            size="sm"
                                            className="flex-1"
                                            aria-label={item.label}
                                        />
                                        <span className="text-sm font-mono w-12 text-right text-default-500">
                                            {item.value}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
