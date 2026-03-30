import { useState, type FormEvent } from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Input, Button, Select, SelectItem, addToast,
} from "@heroui/react";
import { updateUser } from "@services/apiCrud";
import type { User } from "@/types";

interface EditUserModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSaved: (updated: User) => void;
}

export default function EditUserModal({ user, isOpen, onClose, onSaved }: Readonly<EditUserModalProps>) {
    const [form, setForm] = useState({ name: "", email: "", role: "" });
    const [isSaving, setIsSaving] = useState(false);

    const handleOpen = () => {
        if (user) setForm({ name: user.name, email: user.email, role: user.role });
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        try {
            const updated = await updateUser(user.id, form);
            addToast({ title: "User updated", description: `${updated.name} has been updated.`, color: "success" });
            onSaved(updated);
            onClose();
        } catch {
            addToast({ title: "Error", description: "Failed to update user.", color: "danger" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} onOpenChange={(open) => { if (open) handleOpen(); }}>
            <ModalContent>
                <form onSubmit={handleSave}>
                    <ModalHeader>Edit User</ModalHeader>
                    <ModalBody className="flex flex-col gap-4">
                        <Input
                            label="Name"
                            value={form.name}
                            onValueChange={(val) => setForm((f) => ({ ...f, name: val }))}
                            isRequired
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={form.email}
                            onValueChange={(val) => setForm((f) => ({ ...f, email: val }))}
                            isRequired
                        />
                        <Select
                            label="Role"
                            selectedKeys={[form.role]}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as string;
                                if (selected) setForm((f) => ({ ...f, role: selected }));
                            }}
                        >
                            <SelectItem key="user">User</SelectItem>
                            <SelectItem key="admin">Admin</SelectItem>
                        </Select>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={onClose}>Cancel</Button>
                        <Button color="primary" type="submit" isLoading={isSaving}>Save</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
