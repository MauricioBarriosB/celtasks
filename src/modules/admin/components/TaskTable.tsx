import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip } from "@heroui/react";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Task, TaskPriority } from "@/types";
import { TASK_STATUS_COLOR_MAP, PRIORITY_COLOR_MAP, TAG_OPTIONS } from "@/types";

interface TaskTableProps {
    tasks: Task[];
    label: string;
    onDeleteOpen: (task: Task) => void;
}

export default function TaskTable({ tasks, label, onDeleteOpen }: Readonly<TaskTableProps>) {
    const navigate = useNavigate();

    return (
        <Table
            aria-label={label}
            removeWrapper
            classNames={{ thead: "rounded-none [&>tr]:first:rounded-none", th: "first:rounded-none last:rounded-none" }}
        >
            <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>TASK CODE</TableColumn>
                <TableColumn>TITLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>PRIORITY</TableColumn>
                <TableColumn>TAG</TableColumn>
                <TableColumn>ASSIGNEES</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No tasks.">
                {tasks.map((task) => (
                    <TableRow key={task.id}>
                        <TableCell className="font-mono text-xs text-default-500">{task.id}</TableCell>
                        <TableCell className="font-mono text-xs text-default-500">{task.taskCode}</TableCell>
                        <TableCell className="max-w-xs truncate">{task.title}</TableCell>
                        <TableCell>
                            <Chip size="sm" color={TASK_STATUS_COLOR_MAP[task.status]} variant="flat">
                                {task.status.replace("_", " ")}
                            </Chip>
                        </TableCell>
                        <TableCell>
                            <Chip size="sm" color={PRIORITY_COLOR_MAP[task.priority as TaskPriority]} variant="flat">
                                {task.priority}
                            </Chip>
                        </TableCell>
                        <TableCell className="text-sm text-default-500">
                            {task.tag ? (TAG_OPTIONS.find((t) => t.key === task.tag)?.label ?? task.tag) : "--"}
                        </TableCell>
                        <TableCell className="text-sm text-default-500 max-w-40 truncate">
                            {task.assignees.length > 0 ? task.assignees.map((a) => a.name).join(", ") : "--"}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="flat"
                                    isIconOnly
                                    aria-label="Edit task"
                                    onPress={() => navigate(`/tasks/${task.id}`)}
                                >
                                    <Pencil size={14} />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="danger"
                                    isIconOnly
                                    aria-label="Delete task"
                                    onPress={() => onDeleteOpen(task)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
