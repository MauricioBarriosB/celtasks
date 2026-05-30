import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, Chip, Spinner, addToast } from "@heroui/react";
import { Check } from "lucide-react";
import { useAuthContext } from "@modules/user/context/AuthContext";
import { fetchProject, fetchProjectTasks, fetchProjectUsers } from "@services/apiCrud";
import type { Task, TaskStatus, Project, User as UserType } from "@/types";
import { KANBAN_COLUMNS, PRIORITY_COLOR_MAP, STATUS_BORDER_LEFT_MAP } from "@/types";
import AddTaskModal from "@modules/kanban/components/AddTaskModal";
import KanbanHeader from "@modules/kanban/components/KanbanHeader";
import { formatCurrency } from "@/helpers/number";
import { getTimeStamp } from "@/helpers/date";

export default function KanbanList() {
    const navigate = useNavigate();
    const { id: projectId } = useParams<{ id: string }>();
    const { user, isAdmin } = useAuthContext();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const isProjectLocked = project?.status === "archived" || project?.status === "completed";
    const canEdit = !isProjectLocked || isAdmin;

    const filterKey = `celtasks_filter_mine_${projectId}`;
    const [showOnlyMine, setShowOnlyMine] = useState(() => {
        return localStorage.getItem(filterKey) === "true";
    });

    function toggleShowOnlyMine() {
        setShowOnlyMine((prev) => {
            const next = !prev;
            localStorage.setItem(filterKey, String(next));
            return next;
        });
    }

    const loadData = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const [proj, taskList, userList] = await Promise.all([
                fetchProject(Number(projectId)),
                fetchProjectTasks(Number(projectId)),
                fetchProjectUsers(Number(projectId)),
            ]);
            setProject(proj);
            setTasks(taskList);
            setUsers(userList);
        } catch {
            addToast({
                title: "Error loading board data",
                color: "danger",
            });
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (projectId) localStorage.setItem(`celtasks_kanban_view_${projectId}`, "list");
    }, [projectId]);

    function getColumnTasks(status: TaskStatus): Task[] {
        return tasks
            .filter((t) => t.status === status)
            .filter((t) => !showOnlyMine || t.assignees.some((a) => a.id === user?.id))
            .sort((a, b) => getTimeStamp(b.createdAt) - getTimeStamp(a.createdAt));
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Spinner size="lg" label="Loading list..." />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <KanbanHeader
                project={project}
                view="list"
                canEdit={canEdit}
                isProjectLocked={isProjectLocked}
                isAdmin={isAdmin}
                showOnlyMine={showOnlyMine}
                onToggleShowOnlyMine={toggleShowOnlyMine}
                onAddTask={() => setIsOpen(true)}
            />

            {/* Grouped task list */}
            <div className="flex-1 overflow-y-auto space-y-6 pb-4 max-w-390 w-full mx-auto">
                {KANBAN_COLUMNS.map((col) => {
                    const colTasks = getColumnTasks(col.key);
                    return (
                        <section key={col.key}>
                            {/* Group header */}
                            <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">
                                <h2 className="font-semibold text-sm">{col.label}</h2>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    color={col.color as "default" | "primary" | "warning" | "success" | "secondary"}
                                >
                                    {colTasks.length}
                                </Chip>
                            </div>

                            {/* Tasks */}
                            <div className="space-y-2">
                                {colTasks.map((task) => (
                                    <Card
                                        key={task.id}
                                        isPressable
                                        onPress={() => navigate(`/tasks/${task.id}`)}
                                        className={`w-full border-l-3 ${STATUS_BORDER_LEFT_MAP[task.status]}`}
                                    >
                                        <CardBody className="p-3 gap-2___">
                                            <div className="flex items-start gap-2">
                                                <p className="font-medium text-sm leading-tight flex-1">{task.title}</p>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={PRIORITY_COLOR_MAP[task.priority]}
                                                >
                                                    {task.priority}
                                                </Chip>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {task.costTask > 0 && (
                                                    <div className="flex items-center">
                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            color={task.feeStatus === "paid" ? "success" : "warning"}
                                                        >
                                                            {formatCurrency(task.costTask)}
                                                        </Chip>
                                                        {task.feeStatus === "paid" && (
                                                            <Check className="w-4 h-4 text-green-500 -ml-1" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}

                                {colTasks.length === 0 && (
                                    <div className="flex items-center justify-center h-10 text-default-300 text-sm border-2 border-dashed border-default-200 rounded-lg">
                                        No tasks
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })}
            </div>

            <AddTaskModal
                projectId={Number(projectId)}
                enableCost={project?.enableCost ?? false}
                users={users}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onCreated={(task) => setTasks((prev) => [...prev, task])}
            />
        </div>
    );
}
