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
import { fetchAdminCompanies, deleteCompany } from "@services/apiCrud";
import type { Company } from "@/types";
import CompanyFormModal from "@modules/admin/components/CompanyFormModal";
import DeleteConfirmModal from "@modules/admin/components/DeleteConfirmModal";

export default function CompaniesTab() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    const [editing, setEditing] = useState<Company | null>(null);

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [deleting, setDeleting] = useState<Company | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminCompanies();
            setCompanies(data);
        } catch {
            addToast({ title: "Error", description: "Failed to load companies.", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        if (!search.trim()) return companies;
        const q = search.toLowerCase();
        return companies.filter(
            (c) => c.key.toLowerCase().includes(q) || c.label.toLowerCase().includes(q),
        );
    }, [companies, search]);

    const handleCreateOpen = () => {
        setEditing(null);
        onFormOpen();
    };

    const handleEditOpen = (c: Company) => {
        setEditing(c);
        onFormOpen();
    };

    const handleDeleteOpen = (c: Company) => {
        setDeleting(c);
        onDeleteOpen();
    };

    const handleDeleteConfirm = async () => {
        if (!deleting) return;
        setIsDeleting(true);
        try {
            await deleteCompany(deleting.id);
            setCompanies((prev) => prev.filter((c) => c.id !== deleting.id));
            addToast({
                title: "Company deleted",
                description: `${deleting.label} has been removed.`,
                color: "success",
            });
            onDeleteClose();
        } catch {
            addToast({ title: "Error", description: "Failed to delete company.", color: "danger" });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="mb-4 flex items-center gap-4">
                <Input
                    placeholder="Search companies..."
                    value={search}
                    onValueChange={setSearch}
                    startContent={<Search size={16} className="text-default-400" />}
                    className="max-w-sm"
                    isClearable
                    onClear={() => setSearch("")}
                />
                <span className="text-sm text-default-500">
                    {filtered.length} compan{filtered.length !== 1 ? "ies" : "y"}
                </span>
                <div className="ml-auto">
                    <Button color="primary" startContent={<Plus size={16} />} onPress={handleCreateOpen}>
                        New Company
                    </Button>
                </div>
            </div>

            <Table aria-label="Companies table">
                <TableHeader>
                    <TableColumn>KEY</TableColumn>
                    <TableColumn>LABEL</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                    isLoading={isLoading}
                    loadingContent={<Spinner label="Loading companies..." />}
                    emptyContent="No companies found."
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
                                        aria-label="Edit company"
                                        onPress={() => handleEditOpen(c)}
                                    >
                                        <Pencil size={14} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="danger"
                                        isIconOnly
                                        aria-label="Delete company"
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

            <CompanyFormModal
                company={editing}
                isOpen={isFormOpen}
                onClose={onFormClose}
                onSaved={(saved, isNew) => {
                    if (isNew) {
                        setCompanies((prev) => [...prev, saved]);
                    } else {
                        setCompanies((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
                    }
                }}
            />

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                title="Delete Company"
                name={deleting?.label ?? ""}
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}
