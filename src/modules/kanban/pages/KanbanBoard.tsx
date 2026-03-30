import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TaskCard from "@modules/project/components/TaskCard";
import { Button, Chip, Spinner, useDisclosure, addToast } from "@heroui/react";
import { Plus, ArrowLeft, Filter } from "lucide-react";
import { useAuthContext } from "@modules/user/context/AuthContext";
import { fetchProject, fetchProjectTasks, fetchProjectUsers, updateTask } from "@services/apiCrud";
import type { Task, TaskStatus, Project, User as UserType } from "@/types";
import { KANBAN_COLUMNS } from "@/types";
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

    async function handleMoveTask(taskId: number, newStatus: TaskStatus) {
        // Optimistic update
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

        try {
            await updateTask(taskId, { status: newStatus });
        } catch (err) {
            // Revert on error
            loadData();
            const message =
                err && typeof err === "object" && "userMessage" in err
                    ? (err as { userMessage: string }).userMessage
                    : "Failed to move task";
            addToast({
                title: "Failed to move task",
                description: message,
                color: "danger",
            });
        }
    }

    function handleDragStart(e: React.DragEvent, task: Task) {
        e.dataTransfer.setData("taskId", String(task.id));
        e.dataTransfer.setData("sourceStatus", task.status);
        e.dataTransfer.effectAllowed = "move";
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        e.currentTarget.classList.add("bg-primary/5");
    }

    function handleDragLeave(e: React.DragEvent) {
        e.currentTarget.classList.remove("bg-primary/5");
    }

    function handleDrop(e: React.DragEvent, columnStatus: TaskStatus) {
        e.preventDefault();
        e.currentTarget.classList.remove("bg-primary/5");
        const taskId = Number(e.dataTransfer.getData("taskId"));
        const sourceStatus = e.dataTransfer.getData("sourceStatus") as TaskStatus;
        if (sourceStatus !== columnStatus) {
            handleMoveTask(taskId, columnStatus);
        }
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
                    <h1 className="text-2xl font-bold">Kanban Board | {project?.name ?? "Project"}</h1>
                    <p className="text-sm text-default-500">
                        {project?.creatorName ?? "Sin info."} | {project?.status ?? "Sin info."}
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
                                onDragOver={canEdit ? handleDragOver : undefined}
                                onDragLeave={canEdit ? handleDragLeave : undefined}
                                onDrop={canEdit ? (e) => handleDrop(e, col.key) : undefined}
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
                                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                                    {colTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            canEdit={canEdit}
                                            onDragStart={handleDragStart}
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
