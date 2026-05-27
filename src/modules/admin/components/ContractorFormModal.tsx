import { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Switch,
    Button,
    addToast,
} from "@heroui/react";
import { createContractor, updateContractor } from "@services/apiCrud";
import type { Contractor } from "@/types";

interface ContractorFormModalProps {
    contractor: Contractor | null;
    isOpen: boolean;
    onClose: () => void;
    onSaved: (contractor: Contractor, isNew: boolean) => void;
}

export default function ContractorFormModal({
    contractor,
    isOpen,
    onClose,
    onSaved,
}: Readonly<ContractorFormModalProps>) {
    const [form, setForm] = useState({ key: "", label: "", isActive: true });
    const [isSaving, setIsSaving] = useState(false);

    const isEditing = !!contractor;

    useEffect(() => {
        if (!isOpen) return;
        if (contractor) {
            setForm({
                key: contractor.key,
                label: contractor.label,
                isActive: contractor.isActive,
            });
        } else {
            setForm({ key: "", label: "", isActive: true });
        }
    }, [isOpen, contractor]);

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const saved = isEditing && contractor
                ? await updateContractor(contractor.id, form)
                : await createContractor(form);

            addToast({
                title: isEditing ? "Contractor updated" : "Contractor created",
                description: `${saved.label} has been ${isEditing ? "updated" : "created"}.`,
                color: "success",
            });
            onSaved(saved, !isEditing);
            onClose();
        } catch {
            addToast({
                title: "Error",
                description: `Failed to ${isEditing ? "update" : "create"} contractor.`,
                color: "danger",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} onOpenChange={() => {}}>
            <ModalContent>
                <form onSubmit={handleSave}>
                    <ModalHeader>{isEditing ? "Edit Contractor" : "New Contractor"}</ModalHeader>
                    <ModalBody className="flex flex-col gap-4">
                        <Input
                            label="Key"
                            description="Lowercase identifier (letters, numbers, dash/underscore)."
                            value={form.key}
                            onValueChange={(val) => setForm((f) => ({ ...f, key: val }))}
                            isRequired
                        />
                        <Input
                            label="Label"
                            value={form.label}
                            onValueChange={(val) => setForm((f) => ({ ...f, label: val }))}
                            isRequired
                        />
                        <Switch
                            isSelected={form.isActive}
                            onValueChange={(val) => setForm((f) => ({ ...f, isActive: val }))}
                        >
                            Active
                        </Switch>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button color="primary" type="submit" isLoading={isSaving}>
                            {isEditing ? "Save" : "Create"}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
