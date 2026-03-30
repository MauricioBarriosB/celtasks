import { useState, useEffect } from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Input, Button, Select, SelectItem, addToast,
} from "@heroui/react";
import { createUser } from "@services/apiCrud";
import type { User } from "@/types";

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (user: User) => void;
}

const emptyForm = { name: "", email: "", password: "", confirmPassword: "", role: "user" };

export default function CreateUserModal({ isOpen, onClose, onCreated }: Readonly<CreateUserModalProps>) {
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    const passwordMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

    useEffect(() => {
        if (isOpen) setForm(emptyForm);
    }, [isOpen]);

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;
        if (form.password !== form.confirmPassword) return;
        setIsSaving(true);
        try {
            const user = await createUser(form);
            addToast({ title: "User created", description: `${user.name} has been created.`, color: "success" });
            onCreated(user);
            onClose();
        } catch {
            addToast({ title: "Error", description: "Failed to create user.", color: "danger" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <form onSubmit={handleSave}>
                    <ModalHeader>New User</ModalHeader>
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
                            label="Password"
                            type="password"
                            value={form.password}
                            onValueChange={(val) => setForm((f) => ({ ...f, password: val }))}
                            isRequired
                            minLength={8}
                            description="Minimum 8 characters"
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            value={form.confirmPassword}
                            onValueChange={(val) => setForm((f) => ({ ...f, confirmPassword: val }))}
                            isRequired
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
                        <Button color="primary" type="submit" isLoading={isSaving}>Create</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
