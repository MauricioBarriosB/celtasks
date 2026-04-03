import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardBody,
    CardHeader,
    Input,
    Textarea,
    Select,
    SelectItem,
    Button,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
    useDisclosure,
    addToast,
} from "@heroui/react";
import { ArrowLeft, Save, Trash2, Clock, UserCircle } from "lucide-react";
import { fetchTask, updateTask, deleteTask, fetchProjectUsers } from "@services/apiCrud";
import type { Task, TaskStatus, TaskPriority, TaskTag, User as UserType } from "@/types";
import { KANBAN_COLUMNS, PRIORITY_OPTIONS, PRIORITY_COLOR_MAP, TAG_OPTIONS, FEE_STATUS_OPTIONS } from "@/types";

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function TaskDetail() {
    const { id: taskId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    const [task, setTask] = useState<Task | null>(null);
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<TaskStatus>("backlog");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [tag, setTag] = useState<TaskTag | null>(null);
    const [assignees, setAssignees] = useState<number[]>([]);
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [hhTask, setHhTask] = useState(0);
    const [costTask, setCostTask] = useState(0);
    const [feeStatus, setFeeStatus] = useState<string | null>(null);

    const loadTask = useCallback(async () => {
        if (!taskId) return;
        try {
            setLoading(true);
            const data = await fetchTask(Number(taskId));
            setTask(data);
            setTitle(data.title);
            setDescription(data.description ?? "");
            setStatus(data.status);
            setPriority(data.priority);
            setTag(data.tag ?? null);
            setAssignees(data.assignees.map((a) => a.id));
            setDateStart(data.dateStart ?? "");
            setDateEnd(data.dateEnd ?? "");
            setHhTask(data.hhTask ?? 0);
            setCostTask(data.costTask ?? 0);
            setFeeStatus(data.feeStatus ?? null);

            const userList = await fetchProjectUsers(data.projectId);
            setUsers(userList);
        } catch {
            addToast({ title: "Failed to load task", color: "danger" });
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        loadTask();
    }, [loadTask]);

    async function handleSave() {
        if (!task) return;
        if (!title.trim()) {
            addToast({ title: "Title is required", color: "warning" });
            return;
        }

        try {
            setSaving(true);
            const updated = await updateTask(task.id, {
                title: title.trim(),
                description: description.trim() || undefined,
                status,
                priority,
                tag,
                assignees,
                dateStart: dateStart || null,
                dateEnd: dateEnd || null,
                hhTask,
                costTask,
                feeStatus,
            });
            setTask(updated);
            addToast({ title: "Task updated", color: "success" });
        } catch {
            addToast({ title: "Failed to update task", color: "danger" });
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!task) return;
        try {
            setDeleting(true);
            await deleteTask(task.id);
            addToast({ title: "Task deleted", color: "success" });
            navigate(`/projects/${task.projectId}/board`);
        } catch {
            addToast({ title: "Failed to delete task", color: "danger" });
        } finally {
            setDeleting(false);
            onDeleteClose();
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Spinner size="lg" label="Loading task..." />
            </div>
        );
    }

    if (!task) {
        return (
            <div className="flex flex-col items-center justify-center min-h-64 gap-4">
                <p className="text-default-500 text-lg">Task not found.</p>
                <Button variant="light" onPress={() => navigate(-1)}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1">
                    <h1 className="text-xl font-bold">{task.taskCode ?? `Task #${task.id}`}</h1>
                    {task.projectName && <p className="text-sm text-default-400">{task.projectName}</p>}
                </div>
                <div className="flex gap-2">
                    <Button variant="flat" onPress={() => navigate(`/projects/${task.projectId}/board`)}>
                        <ArrowLeft className="w-5 h-5" />
                        Back to Project
                    </Button>

                    <Button
                        color="danger"
                        variant="flat"
                        startContent={<Trash2 className="w-4 h-4" />}
                        onPress={onDeleteOpen}
                    >
                        Delete
                    </Button>
                    <Button
                        color="primary"
                        isLoading={saving}
                        startContent={saving ? undefined : <Save className="w-4 h-4" />}
                        onPress={handleSave}
                    >
                        Save
                    </Button>
                </div>
            </div>

            {/* Task form */}
            <Card className="mb-6">
                <CardHeader className="pb-0">
                    <h2 className="font-semibold">Task Details</h2>
                </CardHeader>
                <CardBody className="gap-4">
                    <Input label="Title" isRequired value={title} onValueChange={setTitle} />
                    <Textarea
                        label="Description"
                        placeholder="Add a description..."
                        value={description}
                        onValueChange={setDescription}
                        minRows={3}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Select
                            label="Task Column Status"
                            selectedKeys={[status]}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys);
                                if (arr.length > 0) setStatus(arr[0] as TaskStatus);
                            }}
                        >
                            {KANBAN_COLUMNS.map((c) => (
                                <SelectItem key={c.key}>{c.label}</SelectItem>
                            ))}
                        </Select>
                        <Select
                            label="Priority"
                            selectedKeys={[priority]}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys);
                                if (arr.length > 0) setPriority(arr[0] as TaskPriority);
                            }}
                        >
                            {PRIORITY_OPTIONS.map((p) => (
                                <SelectItem key={p.key}>{p.label}</SelectItem>
                            ))}
                        </Select>
                        <Select
                            label="Tag"
                            placeholder="Select tag"
                            selectedKeys={tag ? [tag] : []}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys);
                                setTag(arr.length > 0 ? (arr[0] as TaskTag) : null);
                            }}
                        >
                            {TAG_OPTIONS.map((t) => (
                                <SelectItem key={t.key}>{t.label}</SelectItem>
                            ))}
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Select
                            label="Assignees"
                            placeholder="Select assignees"
                            selectionMode="multiple"
                            selectedKeys={new Set(assignees.map(String))}
                            onSelectionChange={(keys) => {
                                setAssignees(Array.from(keys).map(Number));
                            }}
                        >
                            {users.map((u) => (
                                <SelectItem key={String(u.id)}>{u.name}</SelectItem>
                            ))}
                        </Select>
                        <Input
                            type="date"
                            label="Date Start"
                            placeholder=" "
                            value={dateStart}
                            onValueChange={setDateStart}
                        />

                        <Input
                            type="date"
                            label="Date End"
                            placeholder=" "
                            value={dateEnd}
                            onValueChange={setDateEnd}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                            type="number"
                            label="HH by Task"
                            placeholder="0"
                            min={0}
                            step={0.5}
                            value={String(hhTask)}
                            onValueChange={(val) => setHhTask(Number.parseFloat(val) || 0)}
                        />
                        <Input
                            type="number"
                            label="Cost by Task"
                            placeholder="0"
                            min={0}
                            step={0.01}
                            value={String(costTask)}
                            onValueChange={(val) => setCostTask(Number.parseFloat(val) || 0)}
                        />

                        <Select
                            label="Fee Status"
                            placeholder="Select fee status"
                            selectedKeys={feeStatus ? [feeStatus] : []}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys);
                                setFeeStatus(arr.length > 0 ? (arr[0] as string) : null);
                            }}
                        >
                            {FEE_STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.key}>{opt.label}</SelectItem>
                            ))}
                        </Select>
                    </div>
                </CardBody>
            </Card>

            {/* Metadata */}
            <Card>
                <CardHeader className="pb-0">
                    <h2 className="font-semibold">Info</h2>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {task.taskCode && (
                            <div className="flex items-center gap-2 sm:col-span-2">
                                <span className="text-default-400">ID code:</span>
                                <span className="font-mono">{task.taskCode}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-default-400">Status:</span>
                            <Chip
                                size="sm"
                                variant="flat"
                                color={
                                    KANBAN_COLUMNS.find((c) => c.key === task.status)?.color as
                                        | "default"
                                        | "primary"
                                        | "warning"
                                        | "success"
                                }
                            >
                                {KANBAN_COLUMNS.find((c) => c.key === task.status)?.label}
                            </Chip>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-default-400">Priority:</span>
                            <Chip size="sm" variant="flat" color={PRIORITY_COLOR_MAP[task.priority]}>
                                {task.priority}
                            </Chip>
                        </div>
                        {task.assignees.length > 0 && (
                            <div className="flex items-center gap-2 sm:col-span-2">
                                <UserCircle className="w-4 h-4 text-default-400" />
                                <span className="text-default-400">Assignees:</span>
                                <span>{task.assignees.map((a) => a.name).join(", ")}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-default-400" />
                            <span className="text-default-400">Created:</span>
                            <span>{formatDateTime(task.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-default-400" />
                            <span className="text-default-400">Updated:</span>
                            <span>{formatDateTime(task.updatedAt)}</span>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Delete confirmation modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
                <ModalContent>
                    <ModalHeader>Delete Task</ModalHeader>
                    <ModalBody>
                        <p>
                            Are you sure you want to delete <strong>&quot;{task.title}&quot;</strong>? This action
                            cannot be undone.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onDeleteClose}>
                            Cancel
                        </Button>
                        <Button color="danger" isLoading={deleting} onPress={handleDelete}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
