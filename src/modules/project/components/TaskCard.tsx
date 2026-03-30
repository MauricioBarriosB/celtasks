import { useNavigate } from "react-router-dom";
import { Card, CardBody, Chip } from "@heroui/react";
import { User, Calendar } from "lucide-react";
import type { Task, TaskStatus } from "@/types";
import { PRIORITY_COLOR_MAP } from "@/types";


const STATUS_BORDER_MAP: Record<TaskStatus, string> = {
    backlog: "border-t-default-400",
    in_progress: "border-t-primary",
    rev_qa: "border-t-warning",
    finished: "border-t-success",
    in_production: "border-t-secondary",
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TaskCardProps {
    task: Task;
    canEdit: boolean;
    onDragStart?: (e: React.DragEvent, task: Task) => void;
}

export default function TaskCard({ task, canEdit, onDragStart }: Readonly<TaskCardProps>) {
    const navigate = useNavigate();

    return (
        <button
            type="button"
            draggable={canEdit}
            onDragStart={(e) => canEdit && onDragStart?.(e, task)}
            onKeyDown={(e) => {
                if (canEdit && e.key === "Enter") navigate(`/tasks/${task.id}`);
            }}
            className={`w-full text-left bg-transparent border-none p-0 outline-none ${canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-default opacity-80"}`}
        >
            <Card
                isPressable={canEdit}
                onPress={() => canEdit && navigate(`/tasks/${task.id}`)}
                className={`w-full shadow-xl hover:shadow-md transition-shadow border-t-1 ${STATUS_BORDER_MAP[task.status]} ${canEdit ? "" : "pointer-events-auto"}`}
            >
                <CardBody className="p-3 gap-2">
                    <p className="font-medium text-sm leading-tight">{task.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Chip size="sm" variant="flat" color={PRIORITY_COLOR_MAP[task.priority]}>
                            {task.priority}
                        </Chip>
                        {task.hhTask > 0 && (
                            <Chip size="sm" variant="flat" color="default">
                                {task.hhTask}h
                            </Chip>
                        )}
                        {task.costTask > 0 && (
                            <Chip size="sm" variant="flat" color="success">
                                ${task.costTask}
                            </Chip>
                        )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-default-400 mt-1">
                        {task.assignees.length > 0 && (
                            <span className="flex items-center gap-1 truncate max-w-40">
                                <User className="w-3 h-3 shrink-0" />
                                {task.assignees.map((a) => a.name).join(", ")}
                            </span>
                        )}
                        {task.dateEnd && (
                            <span className="flex items-center gap-1 ml-auto shrink-0">
                                <Calendar className="w-3 h-3" />
                                {formatDate(task.dateEnd)}
                            </span>
                        )}
                    </div>
                </CardBody>
            </Card>
        </button>
    );
}
