import { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Button,
    Select,
    SelectItem,
    Textarea,
    Checkbox,
    addToast,
} from "@heroui/react";
import { createProject, updateProject, fetchContractors, fetchCompanies } from "@services/apiCrud";
import { PROJECT_STATUS_OPTIONS, FEE_STATUS_OPTIONS } from "@/types";
import type { Project, Contractor, Company } from "@/types";
import { formatNumber, parseNumber } from "@/helpers/number";

interface ProjectFormModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onSaved: (project: Project, isNew: boolean) => void;
}

export default function ProjectFormModal({ project, isOpen, onClose, onSaved }: Readonly<ProjectFormModalProps>) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        status: "active",
        contractor: "",
        company: "",
        devLink: "",
        feeStatus: "",
        totalHhs: 0,
        totalCost: 0,
        dateStart: "",
        dateEnd: "",
        enableCost: false,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);

    const isEditing = !!project;

    useEffect(() => {
        if (!isOpen) return;
        Promise.all([fetchContractors(), fetchCompanies()])
            .then(([cs, cos]) => {
                setContractors(cs.filter((c) => c.isActive));
                setCompanies(cos.filter((c) => c.isActive));
            })
            .catch(() => {
                addToast({
                    title: "Error",
                    description: "Failed to load contractor/company options.",
                    color: "danger",
                });
            });
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (project) {
                setForm({
                    name: project.name,
                    description: project.description ?? "",
                    status: project.status,
                    contractor: project.contractor ?? "",
                    company: project.company ?? "",
                    devLink: project.devLink ?? "",
                    feeStatus: project.feeStatus ?? "",
                    totalHhs: project.totalHhs ?? 0,
                    totalCost: project.totalCost ?? 0,
                    dateStart: project.dateStart ?? "",
                    dateEnd: project.dateEnd ?? "",
                    enableCost: project.enableCost ?? false,
                });
            } else {
                setForm({
                    name: "",
                    description: "",
                    status: "active",
                    contractor: "",
                    company: "",
                    devLink: "",
                    feeStatus: "",
                    totalHhs: 0,
                    totalCost: 0,
                    dateStart: "",
                    dateEnd: "",
                    enableCost: false,
                });
            }
        }
    }, [isOpen, project]);

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditing && project) {
                const updated = await updateProject(project.id, form);
                addToast({
                    title: "Project updated",
                    description: `${updated.name} has been updated.`,
                    color: "success",
                });
                onSaved(updated, false);
            } else {
                const created = await createProject(form);
                addToast({
                    title: "Project created",
                    description: `${created.name} has been created.`,
                    color: "success",
                });
                onSaved(created, true);
            }
            onClose();
        } catch {
            addToast({
                title: "Error",
                description: `Failed to ${isEditing ? "update" : "create"} project.`,
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
                        <Input
                            label="Dev Link"
                            value={form.devLink}
                            onValueChange={(val) => setForm((f) => ({ ...f, devLink: val }))}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Contractor"
                                selectedKeys={form.contractor ? [form.contractor] : []}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    setForm((f) => ({ ...f, contractor: selected ?? "" }));
                                }}
                            >
                                {contractors.map((opt) => (
                                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="Company"
                                selectedKeys={form.company ? [form.company] : []}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    setForm((f) => ({ ...f, company: selected ?? "" }));
                                }}
                            >
                                {companies.map((opt) => (
                                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <Select
                                label="Project Status"
                                selectedKeys={[form.status]}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    if (selected) setForm((f) => ({ ...f, status: selected }));
                                }}
                            >
                                {PROJECT_STATUS_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="date"
                                label="Date Start"
                                placeholder=" "
                                value={form.dateStart}
                                onValueChange={(val) => setForm((f) => ({ ...f, dateStart: val }))}
                            />
                            <Input
                                type="date"
                                label="Date End"
                                placeholder=" "
                                value={form.dateEnd}
                                onValueChange={(val) => setForm((f) => ({ ...f, dateEnd: val }))}
                            />
                        </div>
                        <div className={"grid grid-cols-2 gap-4"}>
                            <Input
                                type="text"
                                inputMode="decimal"
                                label="Total HHs"
                                placeholder="0"
                                value={formatNumber(form.totalHhs, 2)}
                                onValueChange={(val) => setForm((f) => ({ ...f, totalHhs: parseNumber(val) }))}
                            />

                            <Checkbox
                                isSelected={form.enableCost}
                                onValueChange={(val) =>
                                    setForm((f) => ({
                                        ...f,
                                        enableCost: val,
                                        ...(val ? {} : { feeStatus: "", totalCost: 0 }),
                                    }))
                                }
                            >
                                Enable cost for project
                            </Checkbox>
                        </div>

                        {form.enableCost && (
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Fee Status"
                                    selectedKeys={form.feeStatus ? [form.feeStatus] : []}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        setForm((f) => ({ ...f, feeStatus: selected ?? "" }));
                                    }}
                                >
                                    {FEE_STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.key}>{opt.label}</SelectItem>
                                    ))}
                                </Select>

                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    label="Total Cost"
                                    placeholder="0"
                                    startContent={<span className="text-default-400">$</span>}
                                    value={formatNumber(form.totalCost)}
                                    onValueChange={(val) => setForm((f) => ({ ...f, totalCost: parseNumber(val) }))}
                                />
                            </div>
                        )}
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
