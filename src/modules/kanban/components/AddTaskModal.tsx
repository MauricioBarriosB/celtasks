import { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Textarea,
    Select,
    SelectItem,
    Button,
    addToast,
} from "@heroui/react";
import { createTask } from "@services/apiCrud";
import type { Task, TaskStatus, TaskPriority, TaskFormData, User as UserType } from "@/types";
import { KANBAN_COLUMNS, PRIORITY_OPTIONS } from "@/types";

interface AddTaskModalProps {
    projectId: number;
    users: UserType[];
    isOpen: boolean;
    onClose: () => void;
    onCreated: (task: Task) => void;
}

const emptyForm = (projectId: number): TaskFormData => ({
    projectId,
    title: "",
    description: "",
    assignees: [],
    priority: "medium",
    dateStart: null,
    dateEnd: null,
    hhTask: 0,
    costTask: 0,
    status: "backlog",
});

export default function AddTaskModal({ projectId, users, isOpen, onClose, onCreated }: Readonly<AddTaskModalProps>) {
    const [form, setForm] = useState<TaskFormData>(emptyForm(projectId));
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) setForm(emptyForm(projectId));
    }, [isOpen, projectId]);

    async function handleCreate() {
        if (!form.title.trim()) {
            addToast({ title: "Title is required", color: "warning" });
            return;
        }

        try {
            setSubmitting(true);
            const created = await createTask(form);
            addToast({ title: "Task created", color: "success" });
            onCreated(created);
            onClose();
        } catch {
            addToast({ title: "Failed to create task", color: "danger" });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalContent>
                <ModalHeader>New Task</ModalHeader>
                <ModalBody className="gap-4">
                    <Input
                        label="Title"
                        placeholder="Task title"
                        isRequired
                        value={form.title}
                        onValueChange={(val) => setForm((prev) => ({ ...prev, title: val }))}
                    />
                    <Textarea
                        label="Description"
                        placeholder="Describe the task..."
                        value={form.description ?? ""}
                        onValueChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Assignees"
                            placeholder="Select assignees"
                            selectionMode="multiple"
                            selectedKeys={new Set((form.assignees ?? []).map(String))}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys).map(Number);
                                setForm((prev) => ({ ...prev, assignees: arr }));
                            }}
                        >
                            {users.map((u) => (
                                <SelectItem key={String(u.id)}>{u.name}</SelectItem>
                            ))}
                        </Select>
                        <Select
                            label="Priority"
                            placeholder="Select priority"
                            selectedKeys={form.priority ? [form.priority] : ["medium"]}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys);
                                if (arr.length > 0) {
                                    setForm((prev) => ({ ...prev, priority: arr[0] as TaskPriority }));
                                }
                            }}
                        >
                            {PRIORITY_OPTIONS.map((p) => (
                                <SelectItem key={p.key}>{p.label}</SelectItem>
                            ))}
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Status"
                            placeholder="Select status"
                            selectedKeys={form.status ? [form.status] : ["backlog"]}
                            onSelectionChange={(keys) => {
                                const arr = Array.from(keys);
                                if (arr.length > 0) {
                                    setForm((prev) => ({ ...prev, status: arr[0] as TaskStatus }));
                                }
                            }}
                        >
                            {KANBAN_COLUMNS.map((c) => (
                                <SelectItem key={c.key}>{c.label}</SelectItem>
                            ))}
                        </Select>
                        <Input
                            type="date"
                            label="Date Start"
                            placeholder=" "
                            value={form.dateStart ?? ""}
                            onValueChange={(val) => setForm((prev) => ({ ...prev, dateStart: val || null }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Date End"
                            placeholder=" "
                            value={form.dateEnd ?? ""}
                            onValueChange={(val) => setForm((prev) => ({ ...prev, dateEnd: val || null }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="number"
                            label="HH by Task"
                            placeholder="0"
                            min={0}
                            step={0.5}
                            value={String(form.hhTask ?? 0)}
                            onValueChange={(val) => setForm((prev) => ({ ...prev, hhTask: Number.parseFloat(val) || 0 }))}
                        />
                        <Input
                            type="number"
                            label="Cost by Task"
                            placeholder="0"
                            min={0}
                            step={0.01}
                            value={String(form.costTask ?? 0)}
                            onValueChange={(val) => setForm((prev) => ({ ...prev, costTask: Number.parseFloat(val) || 0 }))}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button color="primary" isLoading={submitting} onPress={handleCreate}>
                        Create Task
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
