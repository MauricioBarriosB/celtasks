import { useState, useEffect, useCallback } from "react";
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
import { fetchAllUsers, toggleUserActive, deleteUser } from "@services/apiCrud";
import type { User } from "@/types";
import CreateUserModal from "@modules/admin/components/CreateUserModal";
import EditUserModal from "@modules/admin/components/EditUserModal";
import DeleteConfirmModal from "@modules/admin/components/DeleteConfirmModal";

export default function UsersTab() {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();

    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [editUser, setEditUser] = useState<User | null>(null);

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllUsers({ search: search || undefined });
            setUsers(data.users);
            setTotal(data.total);
        } catch {
            addToast({ title: "Error", description: "Failed to load users.", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timeout = setTimeout(loadUsers, 300);
        return () => clearTimeout(timeout);
    }, [loadUsers]);

    const handleEditOpen = (user: User) => {
        setEditUser(user);
        onEditOpen();
    };

    const handleDeleteOpen = (user: User) => {
        setDeletingUser(user);
        onDeleteOpen();
    };

    const handleDeleteConfirm = async () => {
        if (!deletingUser) return;
        setIsDeleting(true);
        try {
            await deleteUser(deletingUser.id);
            setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
            setTotal((t) => t - 1);
            addToast({
                title: "User deleted",
                description: `${deletingUser.name} has been removed.`,
                color: "success",
            });
            onDeleteClose();
        } catch {
            addToast({ title: "Error", description: "Failed to delete user.", color: "danger" });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleActive = async (user: User) => {
        setTogglingId(user.id);
        try {
            const updated = await toggleUserActive(user.id);
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            addToast({
                title: updated.isActive ? "User activated" : "User deactivated",
                description: `${updated.name} is now ${updated.isActive ? "active" : "inactive"}.`,
                color: "success",
            });
        } catch {
            addToast({ title: "Error", description: "Failed to toggle user status.", color: "danger" });
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <>
            <div className="mb-4 flex items-center gap-4">
                <Input
                    placeholder="Search users..."
                    value={search}
                    onValueChange={setSearch}
                    startContent={<Search size={16} className="text-default-400" />}
                    className="max-w-sm"
                    isClearable
                    onClear={() => setSearch("")}
                />
                <span className="text-sm text-default-500">
                    {total} user{total !== 1 ? "s" : ""}
                </span>
                <div className="ml-auto">
                    <Button color="primary" startContent={<Plus size={16} />} onPress={onCreateOpen}>
                        New User
                    </Button>
                </div>
            </div>

            <Table aria-label="Users table">
                <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>EMAIL</TableColumn>
                    <TableColumn>ROLE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                    isLoading={isLoading}
                    loadingContent={<Spinner label="Loading users..." />}
                    emptyContent="No users found."
                >
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Chip size="sm" color={user.role === "admin" ? "primary" : "default"} variant="flat">
                                    {user.role}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <Chip size="sm" color={user.isActive ? "success" : "danger"} variant="dot">
                                    {user.isActive ? "Active" : "Inactive"}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        isIconOnly
                                        aria-label="Edit user"
                                        onPress={() => handleEditOpen(user)}
                                    >
                                        <Pencil size={14} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color={user.isActive ? "danger" : "success"}
                                        isLoading={togglingId === user.id}
                                        onPress={() => handleToggleActive(user)}
                                    >
                                        {user.isActive ? "Deactivate" : "Activate"}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="danger"
                                        isIconOnly
                                        aria-label="Delete user"
                                        onPress={() => handleDeleteOpen(user)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <CreateUserModal
                isOpen={isCreateOpen}
                onClose={onCreateClose}
                onCreated={(user) => {
                    setUsers((prev) => [user, ...prev]);
                    setTotal((t) => t + 1);
                }}
            />

            <EditUserModal
                user={editUser}
                isOpen={isEditOpen}
                onClose={onEditClose}
                onSaved={(updated) => setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))}
            />

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                title="Delete User"
                name={deletingUser?.name ?? ""}
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}
