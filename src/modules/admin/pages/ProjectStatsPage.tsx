import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader, Button, Chip, Progress, Spinner, addToast } from "@heroui/react";
import {
    ArrowLeft,
    ListTodo,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Play,
    Search,
    Rocket,
    Users,
    Timer,
    DollarSign,
    Calendar,
    TrendingUp,
    UserCheck,
    UserX,
} from "lucide-react";
import { fetchProjectStats } from "@services/apiCrud";
import { useAuthContext } from "@modules/user/context/AuthContext";
import {
    type ProjectStatsData,
    type TaskPriority,
    type TaskStatus,
    type TaskTag,
    type ProjectStatus,
    type ProjectFeeStatus,
    PROJECT_STATUS_COLOR_MAP,
    PRIORITY_COLOR_MAP,
    TASK_STATUS_COLOR_MAP,
    TAG_OPTIONS,
    FEE_STATUS_OPTIONS,
} from "@/types";
import { formatCurrency, formatNumber, percentage } from "@/helpers/number";
import { formatDate, formatDateTime } from "@/helpers/date";

const STATUS_LABELS: Record<TaskStatus, string> = {
    backlog: "Backlog",
    in_progress: "In Progress",
    rev_qa: "Rev QA",
    finished: "Finished",
    in_production: "In Production",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
};

const TAG_LABEL_MAP: Record<TaskTag | "none", string> = TAG_OPTIONS.reduce<Record<TaskTag | "none", string>>(
    (acc, opt) => ({ ...acc, [opt.key]: opt.label }),
    { none: "Untagged" } as Record<TaskTag | "none", string>,
);

const FEE_LABELS: Record<ProjectFeeStatus | "none", string> = {
    ...FEE_STATUS_OPTIONS.reduce(
        (acc, opt) => ({ ...acc, [opt.key]: opt.label }),
        {} as Record<ProjectFeeStatus, string>,
    ),
    none: "Not set",
};

export default function ProjectStatsPage() {
    const { id } = useParams<{ id: string }>();
    const projectId = Number(id);
    const navigate = useNavigate();
    const { isAdmin } = useAuthContext();

    const [stats, setStats] = useState<ProjectStatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAdmin) navigate("/projects", { replace: true });
    }, [isAdmin, navigate]);

    const loadStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchProjectStats(projectId);
            setStats(data);
        } catch {
            addToast({ title: "Error", description: "Failed to load project stats.", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    if (!isAdmin) return null;

    if (isLoading) {
        return (
            <div className="flex min-h-100 items-center justify-center">
                <Spinner label="Loading project stats..." size="lg" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-default-500">No stats available.</p>
                <Button className="mt-4" variant="flat" onPress={() => navigate("/admin")}>
                    Back to Admin
                </Button>
            </div>
        );
    }

    const { project, taskStats, priorityStats, tagStats, feeStats, hoursStats, costStats, timeline } = stats;
    const completionRate = percentage(taskStats.finished, taskStats.total);
    const deliveredRate = percentage(taskStats.finished + taskStats.in_production, taskStats.total);
    const activeRate = percentage(taskStats.in_progress, taskStats.total);
    const hoursProgressVsPlan = percentage(hoursStats.completed, hoursStats.planned, true);
    const hoursVsBudget = percentage(hoursStats.planned, hoursStats.estimated, true);
    const costProgressVsPlan = percentage(costStats.completed, costStats.planned, true);
    const costVsBudget = percentage(costStats.planned, costStats.estimated, true);

    const summaryCards = [
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
        { label: "In Progress", value: taskStats.in_progress, icon: Play, color: "text-primary", bg: "bg-primary/10" },
        {
            label: "Pending",
            value: taskStats.backlog + taskStats.rev_qa,
            icon: Clock,
            color: "text-warning",
            bg: "bg-warning/10",
        },
        {
            label: "In Production",
            value: taskStats.in_production,
            icon: Rocket,
            color: "text-secondary",
            bg: "bg-secondary/10",
        },
        { label: "Overdue", value: stats.overdueCount, icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
    ];

    const statusBreakdown = (Object.entries(taskStats) as [TaskStatus | "total", number][])
        .filter((entry): entry is [TaskStatus, number] => entry[0] !== "total")
        .map(([key, value]) => ({
            key,
            label: STATUS_LABELS[key],
            value,
            color: TASK_STATUS_COLOR_MAP[key],
        }));

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold">Stats | {project.name}</h1>
                        <Chip
                            size="sm"
                            color={PROJECT_STATUS_COLOR_MAP[project.status as ProjectStatus] ?? "default"}
                            variant="flat"
                        >
                            {project.status}
                        </Chip>
                        {timeline.isOverdue && (
                            <Chip size="sm" color="danger" variant="flat" startContent={<AlertTriangle size={12} />}>
                                Overdue
                            </Chip>
                        )}
                    </div>
                    <p className="text-sm text-default-500 mt-1">
                        {project.description ?? "Project performance and KPIs"}
                    </p>
                </div>
                <Button variant="flat" startContent={<ArrowLeft size={16} />} onPress={() => navigate("/admin")}>
                    Back to Admin
                </Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
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

            {/* KPI Progress bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border border-default-100">
                    <CardBody className="p-5 gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-success" /> Completion Rate
                            </span>
                            <span className="text-sm font-bold text-success">{completionRate}%</span>
                        </div>
                        <Progress value={completionRate} color="success" size="sm" aria-label="Completion rate" />
                        <p className="text-xs text-default-400">
                            {taskStats.finished} of {taskStats.total} tasks finished
                        </p>
                    </CardBody>
                </Card>
                <Card className="border border-default-100">
                    <CardBody className="p-5 gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold flex items-center gap-2">
                                <Rocket size={16} className="text-secondary" /> Delivered
                            </span>
                            <span className="text-sm font-bold text-secondary">{deliveredRate}%</span>
                        </div>
                        <Progress value={deliveredRate} color="secondary" size="sm" aria-label="Delivered" />
                        <p className="text-xs text-default-400">
                            {taskStats.finished + taskStats.in_production} delivered (finished + in production)
                        </p>
                    </CardBody>
                </Card>
                <Card className="border border-default-100">
                    <CardBody className="p-5 gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold flex items-center gap-2">
                                <Play size={16} className="text-primary" /> Active Work
                            </span>
                            <span className="text-sm font-bold text-primary">{activeRate}%</span>
                        </div>
                        <Progress value={activeRate} color="primary" size="sm" aria-label="Active work" />
                        <p className="text-xs text-default-400">{taskStats.in_progress} tasks currently in progress</p>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Status breakdown */}
                <Card className="border border-default-100">
                    <CardHeader className="pb-2">
                        <span className="text-sm font-semibold">Tasks by Status</span>
                    </CardHeader>
                    <CardBody className="gap-3">
                        {statusBreakdown.map((item) => {
                            const pct = taskStats.total > 0 ? Math.round((item.value / taskStats.total) * 100) : 0;
                            return (
                                <div key={item.key} className="flex items-center gap-3">
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
                    </CardBody>
                </Card>

                {/* Priority breakdown */}
                <Card className="border border-default-100">
                    <CardHeader className="pb-2">
                        <span className="text-sm font-semibold">Tasks by Priority</span>
                    </CardHeader>
                    <CardBody className="gap-3">
                        {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((key) => {
                            const value = priorityStats[key] ?? 0;
                            const pct = taskStats.total > 0 ? Math.round((value / taskStats.total) * 100) : 0;
                            return (
                                <div key={key} className="flex items-center gap-3">
                                    <span className="text-sm w-28 shrink-0">{PRIORITY_LABELS[key]}</span>
                                    <Progress
                                        value={pct}
                                        color={PRIORITY_COLOR_MAP[key]}
                                        size="sm"
                                        className="flex-1"
                                        aria-label={PRIORITY_LABELS[key]}
                                    />
                                    <span className="text-sm font-mono w-12 text-right text-default-500">{value}</span>
                                </div>
                            );
                        })}
                    </CardBody>
                </Card>

                {/* Tag breakdown */}
                <Card className="border border-default-100">
                    <CardHeader className="pb-2">
                        <span className="text-sm font-semibold">Tasks by Tag</span>
                    </CardHeader>
                    <CardBody>
                        <div className="flex flex-wrap gap-2">
                            {(Object.entries(tagStats) as [TaskTag | "none", number][])
                                .filter(([, v]) => v > 0)
                                .sort(([, a], [, b]) => b - a)
                                .map(([key, value]) => (
                                    <Chip key={key} size="sm" variant="flat" color="primary">
                                        {TAG_LABEL_MAP[key]}: {value}
                                    </Chip>
                                ))}
                            {Object.values(tagStats).every((v) => v === 0) && (
                                <span className="text-xs text-default-400">No tasks tagged yet.</span>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Fee status breakdown */}
                <Card className="border border-default-100">
                    <CardHeader className="pb-2">
                        <span className="text-sm font-semibold">Tasks by Fee Status</span>
                    </CardHeader>
                    <CardBody>
                        <div className="flex flex-wrap gap-2">
                            {(Object.entries(feeStats) as [ProjectFeeStatus | "none", number][])
                                .filter(([, v]) => v > 0)
                                .map(([key, value]) => (
                                    <Chip
                                        key={key}
                                        size="sm"
                                        variant="flat"
                                        color={key === "paid" ? "success" : key === "pending" ? "danger" : "default"}
                                    >
                                        {FEE_LABELS[key]}: {value}
                                    </Chip>
                                ))}
                            {Object.values(feeStats).every((v) => v === 0) && (
                                <span className="text-xs text-default-400">No fee data yet.</span>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Hours and Cost */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <Card className="border border-default-100">
                    <CardHeader className="pb-2 flex items-center gap-2">
                        <Timer size={16} className="text-primary" />
                        <span className="text-sm font-semibold">Hours (HH)</span>
                    </CardHeader>
                    <CardBody className="gap-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <KpiRow label="Estimated (project)" value={formatNumber(hoursStats.estimated, 2)} />
                            <KpiRow label="Planned (tasks)" value={formatNumber(hoursStats.planned, 2)} />
                            <KpiRow label="Completed" value={formatNumber(hoursStats.completed, 2)} accent="success" />
                            <KpiRow label="Remaining" value={formatNumber(hoursStats.remaining, 2)} accent="warning" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span>Completion vs Planned</span>
                                <span className="font-bold">{hoursProgressVsPlan}%</span>
                            </div>
                            <Progress value={hoursProgressVsPlan} color="success" size="sm" aria-label="Hours done" />
                        </div>
                        {hoursStats.estimated > 0 && (
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span>Planned vs Estimated</span>
                                    <span className="font-bold">{hoursVsBudget}%</span>
                                </div>
                                <Progress
                                    value={hoursVsBudget}
                                    color={hoursVsBudget > 100 ? "danger" : "primary"}
                                    size="sm"
                                    aria-label="Hours budget"
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card className="border border-default-100">
                    <CardHeader className="pb-2 flex items-center gap-2">
                        <DollarSign size={16} className="text-success" />
                        <span className="text-sm font-semibold">Cost</span>
                    </CardHeader>
                    <CardBody className="gap-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <KpiRow label="Estimated (project)" value={formatCurrency(costStats.estimated)} />
                            <KpiRow label="Planned (tasks)" value={formatCurrency(costStats.planned)} />
                            <KpiRow label="Completed" value={formatCurrency(costStats.completed)} accent="success" />
                            <KpiRow label="Remaining" value={formatCurrency(costStats.remaining)} accent="warning" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span>Completion vs Planned</span>
                                <span className="font-bold">{costProgressVsPlan}%</span>
                            </div>
                            <Progress value={costProgressVsPlan} color="success" size="sm" aria-label="Cost done" />
                        </div>
                        {costStats.estimated > 0 && (
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span>Planned vs Estimated</span>
                                    <span className="font-bold">{costVsBudget}%</span>
                                </div>
                                <Progress
                                    value={costVsBudget}
                                    color={costVsBudget > 100 ? "danger" : "primary"}
                                    size="sm"
                                    aria-label="Cost budget"
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Timeline + Team */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <Card className="border border-default-100">
                    <CardHeader className="pb-2 flex items-center gap-2">
                        <Calendar size={16} className="text-primary" />
                        <span className="text-sm font-semibold">Timeline</span>
                    </CardHeader>
                    <CardBody className="gap-3">
                        {timeline.dateStart && timeline.dateEnd ? (
                            <>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-default-500">Start</span>
                                    <span className="font-medium">{formatDate(timeline.dateStart)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-default-500">End</span>
                                    <span className="font-medium">{formatDate(timeline.dateEnd)}</span>
                                </div>
                                {timeline.totalDays !== null && (
                                    <>
                                        <div className="flex items-center justify-between text-xs mt-2 mb-1">
                                            <span>Time Elapsed</span>
                                            <span className="font-bold">{timeline.percentElapsed}%</span>
                                        </div>
                                        <Progress
                                            value={timeline.percentElapsed ?? 0}
                                            color={timeline.isOverdue ? "danger" : "primary"}
                                            size="sm"
                                            aria-label="Elapsed"
                                        />
                                        <div className="flex items-center justify-between text-xs text-default-400 mt-1">
                                            <span>
                                                {timeline.daysElapsed} / {timeline.totalDays} days
                                            </span>
                                            <span>
                                                {timeline.daysRemaining === null
                                                    ? ""
                                                    : `${timeline.daysRemaining} days remaining`}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-default-400">Project has no start/end dates configured.</p>
                        )}
                        <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={14} className="text-danger" />
                                <span className="text-default-500">Overdue:</span>
                                <span className="font-bold">{stats.overdueCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={14} className="text-warning" />
                                <span className="text-default-500">Due ≤ 7d:</span>
                                <span className="font-bold">{stats.upcomingCount}</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="border border-default-100">
                    <CardHeader className="pb-2 flex items-center gap-2">
                        <Users size={16} className="text-primary" />
                        <span className="text-sm font-semibold">Team</span>
                    </CardHeader>
                    <CardBody className="gap-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <UserCheck size={14} className="text-success" />
                                <span className="text-default-500">Assigned:</span>
                                <span className="font-bold">{stats.assignedUsersCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserX size={14} className="text-warning" />
                                <span className="text-default-500">Unassigned tasks:</span>
                                <span className="font-bold">{stats.unassignedCount}</span>
                            </div>
                        </div>
                        <div className="mt-1">
                            <span className="text-xs font-semibold text-default-600">Top Contributors</span>
                            {stats.topContributors.length === 0 ? (
                                <p className="text-xs text-default-400 mt-2">No contributors yet.</p>
                            ) : (
                                <div className="flex flex-col gap-2 mt-2">
                                    {stats.topContributors.map((c) => {
                                        const pct = c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0;
                                        return (
                                            <div key={c.id} className="flex items-center gap-3">
                                                <span className="text-sm w-32 truncate">{c.name}</span>
                                                <Progress
                                                    value={pct}
                                                    color="success"
                                                    size="sm"
                                                    className="flex-1"
                                                    aria-label={`${c.name} completion`}
                                                />
                                                <span className="text-xs font-mono text-default-500 w-20 text-right">
                                                    {c.completed}/{c.total}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Recent activity */}
            <Card className="border border-default-100">
                <CardHeader className="pb-2 flex items-center gap-2">
                    <Search size={16} className="text-primary" />
                    <span className="text-sm font-semibold">Recent Activity</span>
                </CardHeader>
                <CardBody>
                    {stats.recentTasks.length === 0 ? (
                        <p className="text-sm text-default-400">No tasks yet.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {stats.recentTasks.map((task) => (
                                <button
                                    key={task.id}
                                    type="button"
                                    className="flex items-center justify-between rounded-lg border border-default-200 p-3 hover:bg-default-100 transition text-left cursor-pointer"
                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{task.title}</p>
                                        <p className="text-xs text-default-500 truncate">
                                            {task.taskCode ?? `#${task.id}`} · Updated {formatDateTime(task.updatedAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-2 shrink-0">
                                        <Chip size="sm" variant="flat" color={PRIORITY_COLOR_MAP[task.priority]}>
                                            {PRIORITY_LABELS[task.priority]}
                                        </Chip>
                                        <Chip size="sm" variant="flat" color={TASK_STATUS_COLOR_MAP[task.status]}>
                                            {STATUS_LABELS[task.status]}
                                        </Chip>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

type Accent = "default" | "success" | "warning" | "danger";

function KpiRow({ label, value, accent = "default" }: Readonly<{ label: string; value: string; accent?: Accent }>) {
    const accentClass: Record<Accent, string> = {
        default: "text-foreground",
        success: "text-success",
        warning: "text-warning",
        danger: "text-danger",
    };
    return (
        <div className="flex flex-col">
            <span className="text-xs text-default-500">{label}</span>
            <span className={`text-base font-bold ${accentClass[accent]}`}>{value || "--"}</span>
        </div>
    );
}
