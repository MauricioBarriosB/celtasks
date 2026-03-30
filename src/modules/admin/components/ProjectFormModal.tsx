import { useState, type FormEvent } from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Input, Button, Select, SelectItem, Textarea, addToast,
} from "@heroui/react";
import { createProject, updateProject } from "@services/apiCrud";
import type { Project } from "@/types";

interface ProjectFormModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onSaved: (project: Project, isNew: boolean) => void;
}

export default function ProjectFormModal({ project, isOpen, onClose, onSaved }: Readonly<ProjectFormModalProps>) {
    const [form, setForm] = useState({ name: "", description: "", status: "active", totalHhs: 0, totalCost: 0 });
    const [isSaving, setIsSaving] = useState(false);

    const isEditing = !!project;

    const handleOpen = () => {
        if (project) {
            setForm({
                name: project.name,
                description: project.description ?? "",
                status: project.status,
                totalHhs: project.totalHhs ?? 0,
                totalCost: project.totalCost ?? 0,
            });
        } else {
            setForm({ name: "", description: "", status: "active", totalHhs: 0, totalCost: 0 });
        }
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditing && project) {
                const updated = await updateProject(project.id, form);
                addToast({ title: "Project updated", description: `${updated.name} has been updated.`, color: "success" });
                onSaved(updated, false);
            } else {
                const created = await createProject(form);
                addToast({ title: "Project created", description: `${created.name} has been created.`, color: "success" });
                onSaved(created, true);
            }
            onClose();
        } catch {
            addToast({ title: "Error", description: `Failed to ${isEditing ? "update" : "create"} project.`, color: "danger" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} onOpenChange={(open) => { if (open) handleOpen(); }}>
            <ModalContent>
                <form onSubmit={handleSave}>
                    <ModalHeader>{isEditing ? "Edit Project" : "New Project"}</ModalHeader>
                    <ModalBody className="flex flex-col gap-4">
                        <Input
                            label="Name"
                            value={form.name}
                            onValueChange={(val) => setForm((f) => ({ ...f, name: val }))}
                            isRequired
                        />
                        <Textarea
                            label="Description"
                            value={form.description}
                            onValueChange={(val) => setForm((f) => ({ ...f, description: val }))}
                        />
                        <Select
                            label="Status"
                            selectedKeys={[form.status]}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as string;
                                if (selected) setForm((f) => ({ ...f, status: selected }));
                            }}
                        >
                            <SelectItem key="active">Active</SelectItem>
                            <SelectItem key="archived">Archived</SelectItem>
                            <SelectItem key="completed">Completed</SelectItem>
                        </Select>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="number"
                                label="Total HHs"
                                placeholder="0"
                                min={0}
                                step={0.5}
                                value={String(form.totalHhs)}
                                onValueChange={(val) => setForm((f) => ({ ...f, totalHhs: Number.parseFloat(val) || 0 }))}
                            />
                            <Input
                                type="number"
                                label="Total Cost"
                                placeholder="0"
                                min={0}
                                step={0.01}
                                value={String(form.totalCost)}
                                onValueChange={(val) => setForm((f) => ({ ...f, totalCost: Number.parseFloat(val) || 0 }))}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={onClose}>Cancel</Button>
                        <Button color="primary" type="submit" isLoading={isSaving}>
                            {isEditing ? "Save" : "Create"}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
