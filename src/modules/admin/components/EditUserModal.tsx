import { useState, useEffect } from "react";
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
    const [form, setForm] = useState({ name: "", email: "", role: "", password: "", confirmPassword: "" });
    const [isSaving, setIsSaving] = useState(false);

    const passwordMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;
    const passwordTooShort = form.password.length > 0 && form.password.length < 8;

    useEffect(() => {
        if (isOpen && user) {
            setForm({ name: user.name, email: user.email, role: user.role, password: "", confirmPassword: "" });
        }
    }, [isOpen, user]);

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!user) return;
        if (form.password && (passwordMismatch || passwordTooShort)) return;
        setIsSaving(true);
        try {
            const payload: { name: string; email?: string; role: string; password?: string } = { name: form.name, role: form.role };
            if (form.email !== user.email) {
                payload.email = form.email;
            }
            if (form.password) {
                payload.password = form.password;
            }
            const updated = await updateUser(user.id, payload);
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
        <Modal isOpen={isOpen} onClose={onClose}>
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
                        <Input
                            label="New Password"
                            type="password"
                            value={form.password}
                            onValueChange={(val) => setForm((f) => ({ ...f, password: val }))}
                            minLength={8}
                            isInvalid={passwordTooShort}
                            errorMessage={passwordTooShort ? "Minimum 8 characters" : undefined}
                            description="Leave blank to keep current password"
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            value={form.confirmPassword}
                            onValueChange={(val) => setForm((f) => ({ ...f, confirmPassword: val }))}
                            isInvalid={passwordMismatch}
                            errorMessage={passwordMismatch ? "Passwords do not match" : undefined}
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
