import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Input, Button, Chip, useDisclosure, Spinner, addToast,
} from "@heroui/react";
import { Search, KanbanSquare, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchAllTasks, deleteTask } from "@services/apiCrud";
import type { Task } from "@/types";
import DeleteConfirmModal from "@modules/admin/components/DeleteConfirmModal";
import TaskTable from "@modules/admin/components/TaskTable";

interface ProjectGroup {
    projectId: number;
    projectName: string;
    tasks: Task[];
}

export default function TasksTab() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllTasks();
            setTasks(data);
        } catch {
            addToast({ title: "Error", description: "Failed to load tasks.", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const handleDeleteOpen = (task: Task) => {
        setDeletingTask(task);
        onDeleteOpen();
    };

    const handleDeleteConfirm = async () => {
        if (!deletingTask) return;
        setIsDeleting(true);
        try {
            await deleteTask(deletingTask.id);
            setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
            addToast({
                title: "Task deleted",
                description: `"${deletingTask.title}" has been removed.`,
                color: "success",
            });
            onDeleteClose();
        } catch {
            addToast({ title: "Error", description: "Failed to delete task.", color: "danger" });
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleProject = (projectId: number) => {
        setExpandedProjects((prev) => {
            const next = new Set(prev);
            if (next.has(projectId)) {
                next.delete(projectId);
            } else {
                next.add(projectId);
            }
            return next;
        });
    };

    const projectGroups: ProjectGroup[] = useMemo(() => {
        const filtered = search.trim()
            ? tasks.filter((t) => {
                  const q = search.toLowerCase();
                  return (
                      t.title.toLowerCase().includes(q) ||
                      (t.projectName ?? "").toLowerCase().includes(q) ||
                      t.status.toLowerCase().includes(q) ||
                      t.priority.toLowerCase().includes(q)
                  );
              })
            : tasks;

        const groupMap = new Map<number, ProjectGroup>();
        for (const task of filtered) {
            const pid = task.projectId;
            if (!groupMap.has(pid)) {
                groupMap.set(pid, {
                    projectId: pid,
                    projectName: task.projectName ?? "Unknown",
                    tasks: [],
                });
            }
            groupMap.get(pid)!.tasks.push(task);
        }

        return Array.from(groupMap.values()).sort((a, b) =>
            a.projectName.localeCompare(b.projectName),
        );
    }, [tasks, search]);

    const totalTasks = projectGroups.reduce((sum, g) => sum + g.tasks.length, 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-40">
                <Spinner label="Loading tasks..." />
            </div>
        );
    }

    return (
        <>
            <div className="mb-4 flex items-center gap-4">
                <Input
                    placeholder="Search tasks or projects..."
                    value={search}
                    onValueChange={setSearch}
                    startContent={<Search size={16} className="text-default-400" />}
                    className="max-w-sm"
                    isClearable
                    onClear={() => setSearch("")}
                />
                <span className="text-sm text-default-500">
                    {totalTasks} task{totalTasks !== 1 ? "s" : ""} in {projectGroups.length} project{projectGroups.length !== 1 ? "s" : ""}
                </span>
            </div>

            {projectGroups.length === 0 ? (
                <p className="text-default-400 text-center py-8">No tasks found.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {projectGroups.map((group) => {
                        const isExpanded = expandedProjects.has(group.projectId);
                        return (
                            <div key={group.projectId} className="border border-default-200 rounded-xl overflow-hidden">
                                {/* Project row */}
                                <div className="flex items-center gap-3 px-4 py-3 bg-default-100/50">
                                    <Button
                                        size="sm"
                                        variant="light"
                                        isIconOnly
                                        aria-label={isExpanded ? "Collapse" : "Expand"}
                                        onPress={() => toggleProject(group.projectId)}
                                    >
                                        {isExpanded
                                            ? <ChevronDown size={16} />
                                            : <ChevronRight size={16} />}
                                    </Button>
                                    <span className="font-semibold text-sm flex-1">{group.projectName}</span>
                                    <Chip size="sm" variant="flat" color="default">
                                        {group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""}
                                    </Chip>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="secondary"
                                        startContent={<KanbanSquare size={14} />}
                                        onPress={() => navigate(`/projects/${group.projectId}/board`)}
                                    >
                                        Board
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={isExpanded ? "solid" : "flat"}
                                        color="primary"
                                        onPress={() => toggleProject(group.projectId)}
                                    >
                                        {isExpanded ? "Hide Tasks" : "See Tasks"}
                                    </Button>
                                </div>

                                {/* Task table (collapsible) */}
                                {isExpanded && (
                                    <TaskTable
                                        tasks={group.tasks}
                                        label={`Tasks for ${group.projectName}`}
                                        onDeleteOpen={handleDeleteOpen}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                title="Delete Task"
                name={deletingTask?.title ?? ""}
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}
