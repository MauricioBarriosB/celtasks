import { useNavigate, useParams } from "react-router-dom";
import { Button, Chip } from "@heroui/react";
import { Plus, ArrowLeft, Filter, User, List, LayoutGrid } from "lucide-react";
import type { Project, ProjectStatus } from "@/types";
import { PROJECT_STATUS_COLOR_MAP } from "@/types";

interface KanbanHeaderProps {
    project: Project | null;
    view: "board" | "list";
    canEdit: boolean;
    isProjectLocked: boolean;
    isAdmin: boolean;
    showOnlyMine: boolean;
    onToggleShowOnlyMine: () => void;
    onAddTask: () => void;
}

export default function KanbanHeader({
    project,
    view,
    canEdit,
    isProjectLocked,
    isAdmin,
    showOnlyMine,
    onToggleShowOnlyMine,
    onAddTask,
}: Readonly<KanbanHeaderProps>) {
    const navigate = useNavigate();
    const { id: projectId } = useParams<{ id: string }>();

    return (
        <>
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold truncate">Kanban | {project?.name ?? "Project"}</h1>
                    <div className="text-sm text-default-500 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{project?.creatorName ?? "Sin info."}</span>
                        <Chip
                            size="sm"
                            variant="flat"
                            color={
                                PROJECT_STATUS_COLOR_MAP[(project?.status ?? "active") as ProjectStatus] ?? "default"
                            }
                        >
                            {project?.status ?? "Sin info."}
                        </Chip>
                    </div>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Button
                        variant="flat"
                        startContent={<ArrowLeft className="w-5 h-5" />}
                        onPress={() => navigate("/projects")}
                        isDisabled={!canEdit}
                    >
                        Projects
                    </Button>

                    {view === "board" ? (
                        <Button
                            variant="flat"
                            startContent={<List className="w-4 h-4" />}
                            onPress={() => navigate(`/projects/${projectId}/list`)}
                        >
                            List View
                        </Button>
                    ) : (
                        <Button
                            variant="flat"
                            startContent={<LayoutGrid className="w-4 h-4" />}
                            onPress={() => navigate(`/projects/${projectId}/board`)}
                        >
                            Board View
                        </Button>
                    )}

                    <Button
                        variant={showOnlyMine ? "solid" : "flat"}
                        color={showOnlyMine ? "primary" : "default"}
                        startContent={<Filter className="w-4 h-4" />}
                        onPress={onToggleShowOnlyMine}
                    >
                        {showOnlyMine ? "My Tasks" : "All Tasks"}
                    </Button>
                    <Button
                        color="primary"
                        startContent={<Plus className="w-4 h-4" />}
                        onPress={onAddTask}
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
        </>
    );
}
