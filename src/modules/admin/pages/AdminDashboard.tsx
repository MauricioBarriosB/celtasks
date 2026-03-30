import { useState, useEffect, useCallback } from "react";
import {
    Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Input, Button, Chip, useDisclosure, Spinner, addToast,
} from "@heroui/react";
import { Users, FolderKanban, Plus, Pencil, Trash2, UserPlus, KanbanSquare, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@modules/user/context/AuthContext";
import { fetchAllUsers, toggleUserActive, deleteUser, fetchAllProjects } from "@services/apiCrud";
import type { User, Project } from "@/types";
import EditUserModal from "@modules/admin/components/EditUserModal";
import ProjectFormModal from "@modules/admin/components/ProjectFormModal";
import DeleteProjectModal from "@modules/admin/components/DeleteProjectModal";
import DeleteConfirmModal from "@modules/admin/components/DeleteConfirmModal";

// ================================================================
// Users Tab
// ================================================================

function UsersTab() {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<number | null>(null);

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
            addToast({ title: "User deleted", description: `${deletingUser.name} has been removed.`, color: "success" });
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
                <span className="text-sm text-default-500">{total} user{total !== 1 ? "s" : ""}</span>
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
                                    <Button size="sm" variant="flat" isIconOnly aria-label="Edit user" onPress={() => handleEditOpen(user)}>
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
                                    <Button size="sm" variant="flat" color="danger" isIconOnly aria-label="Delete user" onPress={() => handleDeleteOpen(user)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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

// ================================================================
// Projects Tab
// ================================================================

function ProjectsTab() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);

    const loadProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllProjects();
            setProjects(data);
        } catch {
            addToast({ title: "Error", description: "Failed to load projects.", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const handleCreateOpen = () => {
        setEditingProject(null);
        onFormOpen();
    };

    const handleEditOpen = (project: Project) => {
        setEditingProject(project);
        onFormOpen();
    };

    const handleDeleteOpen = (project: Project) => {
        setDeletingProject(project);
        onDeleteOpen();
    };

    const statusColor = (status: string) => {
        switch (status) {
            case "active": return "success";
            case "archived": return "warning";
            case "completed": return "primary";
            default: return "default";
        }
    };

    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-default-500">{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
                <Button color="primary" startContent={<Plus size={16} />} onPress={handleCreateOpen}>
                    New Project
                </Button>
            </div>

            <Table aria-label="Projects table">
                <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>DESCRIPTION</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>CREATOR</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                    isLoading={isLoading}
                    loadingContent={<Spinner label="Loading projects..." />}
                    emptyContent="No projects found."
                >
                    {projects.map((project) => (
                        <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell className="max-w-xs truncate text-default-500">
                                {project.description ?? "--"}
                            </TableCell>
                            <TableCell>
                                <Chip size="sm" color={statusColor(project.status)} variant="flat">
                                    {project.status}
                                </Chip>
                            </TableCell>
                            <TableCell>{project.creatorName}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="flat" isIconOnly aria-label="Edit project" onPress={() => handleEditOpen(project)}>
                                        <Pencil size={14} />
                                    </Button>
                                    <Button size="sm" variant="flat" color="secondary" startContent={<KanbanSquare size={14} />} onPress={() => navigate(`/projects/${project.id}/board`)}>
                                        Tasks
                                    </Button>
                                    <Button size="sm" variant="flat" color="primary" startContent={<UserPlus size={14} />} onPress={() => navigate(`/admin/projects/${project.id}/users`)}>
                                        Users
                                    </Button>
                                    <Button size="sm" variant="flat" color="danger" isIconOnly aria-label="Delete project" onPress={() => handleDeleteOpen(project)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <ProjectFormModal
                project={editingProject}
                isOpen={isFormOpen}
                onClose={onFormClose}
                onSaved={(project, isNew) => {
                    if (isNew) {
                        setProjects((prev) => [...prev, project]);
                    } else {
                        setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
                    }
                }}
            />

            <DeleteProjectModal
                project={deletingProject}
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                onDeleted={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
            />
        </>
    );
}

// ================================================================
// Admin Dashboard
// ================================================================

export default function AdminDashboard() {
    const { isAdmin } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin) {
            navigate("/projects", { replace: true });
        }
    }, [isAdmin, navigate]);

    if (!isAdmin) return null;

    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

            <Tabs aria-label="Admin sections" color="primary" variant="underlined">
                <Tab
                    key="users"
                    title={
                        <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>Users</span>
                        </div>
                    }
                >
                    <div className="mt-4">
                        <UsersTab />
                    </div>
                </Tab>
                <Tab
                    key="projects"
                    title={
                        <div className="flex items-center gap-2">
                            <FolderKanban size={16} />
                            <span>Projects</span>
                        </div>
                    }
                >
                    <div className="mt-4">
                        <ProjectsTab />
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}
