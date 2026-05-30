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
import { createCompany, updateCompany } from "@services/apiCrud";
import type { Company } from "@/types";

interface CompanyFormModalProps {
    company: Company | null;
    isOpen: boolean;
    onClose: () => void;
    onSaved: (company: Company, isNew: boolean) => void;
}

export default function CompanyFormModal({ company, isOpen, onClose, onSaved }: Readonly<CompanyFormModalProps>) {
    const [form, setForm] = useState({ key: "", label: "", isActive: true });
    const [isSaving, setIsSaving] = useState(false);

    const isEditing = !!company;

    useEffect(() => {
        if (!isOpen) return;
        if (company) {
            setForm({
                key: company.key,
                label: company.label,
                isActive: company.isActive,
            });
        } else {
            setForm({ key: "", label: "", isActive: true });
        }
    }, [isOpen, company]);

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const saved = isEditing && company ? await updateCompany(company.id, form) : await createCompany(form);

            addToast({
                title: isEditing ? "Company updated" : "Company created",
                description: `${saved.label} has been ${isEditing ? "updated" : "created"}.`,
                color: "success",
            });
            onSaved(saved, !isEditing);
            onClose();
        } catch {
            addToast({
                title: "Error",
                description: `Failed to ${isEditing ? "update" : "create"} company.`,
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
                    <ModalHeader>{isEditing ? "Edit Company" : "New Company"}</ModalHeader>
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
