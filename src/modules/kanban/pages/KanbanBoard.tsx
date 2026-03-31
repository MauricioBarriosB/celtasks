import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TaskCard from "@/modules/kanban/components/TaskCard";
import { Button, Chip, Spinner, useDisclosure, addToast } from "@heroui/react";
import { Plus, ArrowLeft, Filter, User } from "lucide-react";
import { useAuthContext } from "@modules/user/context/AuthContext";
import { fetchProject, fetchProjectTasks, fetchProjectUsers, reorderTasks } from "@services/apiCrud";
import type { Task, TaskStatus, Project, ProjectStatus, User as UserType, TaskReorderItem } from "@/types";
import { KANBAN_COLUMNS, PROJECT_STATUS_COLOR_MAP } from "@/types";
import AddTaskModal from "@modules/kanban/components/AddTaskModal";

export default function KanbanBoard() {
    const { id: projectId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAdmin } = useAuthContext();

    const isProjectLocked = project?.status === "archived" || project?.status === "completed";
    const canEdit = !isProjectLocked || isAdmin;

    const [dragOverInfo, setDragOverInfo] = useState<{ taskId: number; position: "before" | "after" } | null>(null);
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

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

    function getColumnTasks(status: TaskStatus): Task[] {
        return tasks
            .filter((t) => t.status === status)
            .filter((t) => !showOnlyMine || t.assignees.some((a) => a.id === user?.id))
            .sort((a, b) => a.position - b.position);
    }

    function handleDragStart(e: React.DragEvent, task: Task) {
        e.dataTransfer.setData("taskId", String(task.id));
        e.dataTransfer.effectAllowed = "move";
        setDraggedTaskId(task.id);
    }

    function handleDragEnd() {
        setDraggedTaskId(null);
        setDragOverInfo(null);
    }

    function handleColumnDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        e.currentTarget.classList.add("bg-primary/5");
    }

    function handleColumnDragLeave(e: React.DragEvent) {
        e.currentTarget.classList.remove("bg-primary/5");
    }

    function handleCardDragOver(e: React.DragEvent, targetTask: Task) {
        e.preventDefault();
        if (targetTask.id === draggedTaskId) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = e.clientY < midY ? "before" : "after";
        setDragOverInfo((prev) =>
            prev?.taskId === targetTask.id && prev?.position === position ? prev : { taskId: targetTask.id, position },
        );
    }

    function handleCardDragLeave() {
        setDragOverInfo(null);
    }

    async function handleReorder(
        movedTaskId: number,
        targetStatus: TaskStatus,
        targetTaskId?: number,
        position?: "before" | "after",
    ) {
        setDragOverInfo(null);
        setDraggedTaskId(null);

        const movedTask = tasks.find((t) => t.id === movedTaskId);
        if (!movedTask) return;

        // Build the new column task list with the moved task inserted
        const columnTasks = tasks
            .filter((t) => t.status === targetStatus && t.id !== movedTaskId)
            .sort((a, b) => a.position - b.position);

        const updatedMovedTask = { ...movedTask, status: targetStatus };

        if (targetTaskId && position) {
            const targetIndex = columnTasks.findIndex((t) => t.id === targetTaskId);
            if (targetIndex !== -1) {
                const insertAt = position === "before" ? targetIndex : targetIndex + 1;
                columnTasks.splice(insertAt, 0, updatedMovedTask);
            } else {
                columnTasks.push(updatedMovedTask);
            }
        } else {
            // Dropped on empty area — append at end
            columnTasks.push(updatedMovedTask);
        }

        // Assign new positions
        const reorderItems: TaskReorderItem[] = columnTasks.map((t, i) => ({
            id: t.id,
            position: i,
            status: targetStatus,
        }));

        // Optimistic update
        setTasks((prev) => {
            const otherTasks = prev.filter((t) => !reorderItems.some((r) => r.id === t.id));
            const updatedTasks = reorderItems.map((r) => {
                const original = prev.find((t) => t.id === r.id)!;
                return { ...original, position: r.position, status: r.status };
            });
            return [...otherTasks, ...updatedTasks];
        });

        try {
            await reorderTasks(reorderItems);
        } catch (err) {
            loadData();
            const message =
                err && typeof err === "object" && "userMessage" in err
                    ? (err as { userMessage: string }).userMessage
                    : "Failed to reorder tasks";
            addToast({
                title: "Failed to reorder tasks",
                description: message,
                color: "danger",
            });
        }
    }

    function handleCardDrop(e: React.DragEvent, targetTask: Task) {
        e.preventDefault();
        const taskId = Number(e.dataTransfer.getData("taskId"));
        if (taskId === targetTask.id) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const pos = e.clientY < midY ? "before" : "after";
        handleReorder(taskId, targetTask.status, targetTask.id, pos);
    }

    function handleColumnDrop(e: React.DragEvent, columnStatus: TaskStatus) {
        e.preventDefault();
        e.currentTarget.classList.remove("bg-primary/5");
        const taskId = Number(e.dataTransfer.getData("taskId"));
        handleReorder(taskId, columnStatus);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Spinner size="lg" label="Loading board..." />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Kanban | {project?.name ?? "Project"}</h1>
                    <p className="text-sm text-default-500">
                        <User className="inline w-4 h-4 mr-1 align-text-bottom" />
                        {project?.creatorName ?? "Sin info."}{" "}
                        <Chip
                            size="sm"
                            variant="flat"
                            color={
                                PROJECT_STATUS_COLOR_MAP[(project?.status ?? "active") as ProjectStatus] ?? "default"
                            }
                        >
                            {project?.status ?? "Sin info."}
                        </Chip>
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="flat"
                        startContent={<ArrowLeft className="w-5 h-5" />}
                        onPress={() => navigate("/projects")}
                        isDisabled={!canEdit}
                    >
                        My Projects
                    </Button>

                    <Button
                        variant={showOnlyMine ? "solid" : "flat"}
                        color={showOnlyMine ? "primary" : "default"}
                        startContent={<Filter className="w-4 h-4" />}
                        onPress={toggleShowOnlyMine}
                    >
                        {showOnlyMine ? "My Tasks" : "All Tasks"}
                    </Button>
                    <Button
                        color="primary"
                        startContent={<Plus className="w-4 h-4" />}
                        onPress={onOpen}
                        isDisabled={!canEdit}
                    >
                        Add Task
                    </Button>
                </div>
            </div>

            {isProjectLocked && !isAdmin && (
                <div className="mb-4 px-4 py-2 rounded-lg bg-warning-50 text-warning-700 text-sm font-medium flex items-center gap-2">
                    <span>
                        This project is <strong>{project?.status}</strong>. Tasks are read-only.
                    </span>
                </div>
            )}

            {/* Board columns */}
            <div className="flex-1 overflow-x-auto flex justify-center lg:-mx-25">
                <div className="flex gap-4 h-full min-h-[500px] shrink-0">
                    {KANBAN_COLUMNS.map((col) => {
                        const colTasks = getColumnTasks(col.key);
                        return (
                            <fieldset
                                key={col.key}
                                aria-label={`${col.label} column`}
                                className="flex flex-col min-w-[235px] w-[235px] 2xl:min-w-75 2xl:w-75 bg-default-100/50 rounded-xl transition-colors backdrop-brightness-50 border-none p-0 m-0"
                                onDragOver={canEdit ? handleColumnDragOver : undefined}
                                onDragLeave={canEdit ? handleColumnDragLeave : undefined}
                                onDrop={canEdit ? (e) => handleColumnDrop(e, col.key) : undefined}
                            >
                                {/* Column header */}
                                <div className="flex items-center justify-between px-3 py-3">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-semibold text-sm">{col.label}</h2>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color={col.color as "default" | "primary" | "warning" | "success"}
                                        >
                                            {colTasks.length}
                                        </Chip>
                                    </div>
                                </div>

                                {/* Task list */}
                                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2" onDragEnd={handleDragEnd}>
                                    {colTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            canEdit={canEdit}
                                            onDragStart={handleDragStart}
                                            dropPosition={
                                                dragOverInfo?.taskId === task.id ? dragOverInfo.position : null
                                            }
                                            onCardDragOver={handleCardDragOver}
                                            onCardDragLeave={handleCardDragLeave}
                                            onCardDrop={handleCardDrop}
                                        />
                                    ))}

                                    {colTasks.length === 0 && (
                                        <div className="flex items-center justify-center h-24 text-default-300 text-sm border-2 border-dashed border-default-200 rounded-lg">
                                            Drop tasks here
                                        </div>
                                    )}
                                </div>
                            </fieldset>
                        );
                    })}
                </div>
            </div>

            <AddTaskModal
                projectId={Number(projectId)}
                users={users}
                isOpen={isOpen}
                onClose={onClose}
                onCreated={(task) => setTasks((prev) => [...prev, task])}
            />
        </div>
    );
}
