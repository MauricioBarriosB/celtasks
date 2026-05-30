import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    Chip,
    useDisclosure,
    Spinner,
    addToast,
} from "@heroui/react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { fetchAdminContractors, deleteContractor } from "@services/apiCrud";
import type { Contractor } from "@/types";
import ContractorFormModal from "@modules/admin/components/ContractorFormModal";
import DeleteConfirmModal from "@modules/admin/components/DeleteConfirmModal";

export default function ContractorsTab() {
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    const [editing, setEditing] = useState<Contractor | null>(null);

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [deleting, setDeleting] = useState<Contractor | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminContractors();
            setContractors(data);
        } catch {
            addToast({ title: "Error", description: "Failed to load contractors.", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        if (!search.trim()) return contractors;
        const q = search.toLowerCase();
        return contractors.filter((c) => c.key.toLowerCase().includes(q) || c.label.toLowerCase().includes(q));
    }, [contractors, search]);

    const handleCreateOpen = () => {
        setEditing(null);
        onFormOpen();
    };

    const handleEditOpen = (c: Contractor) => {
        setEditing(c);
        onFormOpen();
    };

    const handleDeleteOpen = (c: Contractor) => {
        setDeleting(c);
        onDeleteOpen();
    };

    const handleDeleteConfirm = async () => {
        if (!deleting) return;
        setIsDeleting(true);
        try {
            await deleteContractor(deleting.id);
            setContractors((prev) => prev.filter((c) => c.id !== deleting.id));
            addToast({
                title: "Contractor deleted",
                description: `${deleting.label} has been removed.`,
                color: "success",
            });
            onDeleteClose();
        } catch {
            addToast({ title: "Error", description: "Failed to delete contractor.", color: "danger" });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="mb-4 flex items-center gap-4">
                <Input
                    placeholder="Search contractors..."
                    value={search}
                    onValueChange={setSearch}
                    startContent={<Search size={16} className="text-default-400" />}
                    className="max-w-sm"
                    isClearable
                    onClear={() => setSearch("")}
                />
                <span className="text-sm text-default-500">
                    {filtered.length} contractor{filtered.length === 1 ? "" : "s"}
                </span>
                <div className="ml-auto">
                    <Button color="primary" startContent={<Plus size={16} />} onPress={handleCreateOpen}>
                        New Contractor
                    </Button>
                </div>
            </div>

            <Table aria-label="Contractors table">
                <TableHeader>
                    <TableColumn>KEY</TableColumn>
                    <TableColumn>LABEL</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                    isLoading={isLoading}
                    loadingContent={<Spinner label="Loading contractors..." />}
                    emptyContent="No contractors found."
                >
                    {filtered.map((c) => (
                        <TableRow key={c.id}>
                            <TableCell className="font-mono text-default-600">{c.key}</TableCell>
                            <TableCell className="font-medium">{c.label}</TableCell>
                            <TableCell>
                                <Chip size="sm" color={c.isActive ? "success" : "danger"} variant="dot">
                                    {c.isActive ? "Active" : "Inactive"}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        isIconOnly
                                        aria-label="Edit contractor"
                                        onPress={() => handleEditOpen(c)}
                                    >
                                        <Pencil size={14} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="danger"
                                        isIconOnly
                                        aria-label="Delete contractor"
                                        onPress={() => handleDeleteOpen(c)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <ContractorFormModal
                contractor={editing}
                isOpen={isFormOpen}
                onClose={onFormClose}
                onSaved={(saved, isNew) => {
                    if (isNew) {
                        setContractors((prev) => [...prev, saved]);
                    } else {
                        setContractors((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
                    }
                }}
            />

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                title="Delete Contractor"
                name={deleting?.label ?? ""}
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}
