import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Chip,
    Input,
    Spinner,
    addToast,
} from "@heroui/react";
import { UserPlus, UserMinus, ArrowLeft, Search } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "@modules/user/context/AuthContext";
import {
    fetchAdminProjectUsers,
    fetchAllUsers,
    assignProjectUsers,
    removeProjectUser,
    fetchAllProjects,
} from "@services/apiCrud";
import type { User, Project } from "@/types";

export default function ProjectUsers() {
    const { id } = useParams<{ id: string }>();
    const projectId = Number(id);
    const navigate = useNavigate();
    const { isAdmin } = useAuthContext();

    const [project, setProject] = useState<Project | null>(null);
    const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [assigningId, setAssigningId] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);

    useEffect(() => {
        if (!isAdmin) {
            navigate("/projects", { replace: true });
        }
    }, [isAdmin, navigate]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [projectUsers, usersData, projects] = await Promise.all([
                fetchAdminProjectUsers(projectId),
                fetchAllUsers({ limit: 1000 }),
                fetchAllProjects(),
            ]);
            setAssignedUsers(projectUsers);
            setAllUsers(usersData.users);
            const found = projects.find((p) => p.id === projectId) ?? null;
            setProject(found);
        } catch {
            addToast({ title: "Error", description: "Failed to load project data.", color: "danger" });
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const assignedIds = useMemo(() => new Set(assignedUsers.map((u) => u.id)), [assignedUsers]);

    const availableUsers = useMemo(() => {
        return allUsers
            .filter((u) => !assignedIds.has(u.id))
            .filter((u) => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
            });
    }, [allUsers, assignedIds, search]);

    const handleAssign = async (user: User) => {
        setAssigningId(user.id);
        try {
            await assignProjectUsers(projectId, [user.id]);
            setAssignedUsers((prev) => [...prev, user]);
            addToast({ title: "User assigned", description: `${user.name} has been added to the project.`, color: "success" });
        } catch {
            addToast({ title: "Error", description: "Failed to assign user.", color: "danger" });
        } finally {
            setAssigningId(null);
        }
    };

    const handleRemove = async (user: User) => {
        setRemovingId(user.id);
        try {
            await removeProjectUser(projectId, user.id);
            setAssignedUsers((prev) => prev.filter((u) => u.id !== user.id));
            addToast({ title: "User removed", description: `${user.name} has been removed from the project.`, color: "success" });
        } catch {
            addToast({ title: "Error", description: "Failed to remove user.", color: "danger" });
        } finally {
            setRemovingId(null);
        }
    };

    if (!isAdmin) return null;

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Spinner label="Loading project users..." size="lg" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center gap-4">
                <Button
                    variant="flat"
                    isIconOnly
                    aria-label="Back to admin"
                    onPress={() => navigate("/admin")}
                >
                    <ArrowLeft size={18} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">
                        Manage Users{project ? `: ${project.name}` : ""}
                    </h1>
                    <p className="text-sm text-default-500">
                        Assign or remove users from this project
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Assigned Users */}
                <Card>
                    <CardHeader className="flex items-center justify-between pb-2">
                        <h2 className="text-lg font-semibold">Assigned Users</h2>
                        <Chip size="sm" variant="flat" color="primary">
                            {assignedUsers.length}
                        </Chip>
                    </CardHeader>
                    <CardBody>
                        {assignedUsers.length === 0 ? (
                            <p className="py-8 text-center text-default-400">
                                No users assigned yet.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {assignedUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between rounded-lg border border-default-200 p-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium truncate">{user.name}</p>
                                            <p className="text-sm text-default-500 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <div className="ml-2 flex items-center gap-2">
                                            <Chip
                                                size="sm"
                                                color={user.role === "admin" ? "primary" : "default"}
                                                variant="flat"
                                            >
                                                {user.role}
                                            </Chip>
                                            <Button
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                                startContent={<UserMinus size={14} />}
                                                isLoading={removingId === user.id}
                                                onPress={() => handleRemove(user)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Available Users */}
                <Card>
                    <CardHeader className="flex flex-col gap-2 pb-2">
                        <div className="flex w-full items-center justify-between">
                            <h2 className="text-lg font-semibold">Available Users</h2>
                            <Chip size="sm" variant="flat" color="default">
                                {availableUsers.length}
                            </Chip>
                        </div>
                        <Input
                            placeholder="Search available users..."
                            value={search}
                            onValueChange={setSearch}
                            startContent={<Search size={16} className="text-default-400" />}
                            size="sm"
                            isClearable
                            onClear={() => setSearch("")}
                        />
                    </CardHeader>
                    <CardBody>
                        {availableUsers.length === 0 ? (
                            <p className="py-8 text-center text-default-400">
                                {search.trim()
                                    ? "No users match your search."
                                    : "All users are already assigned."}
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {availableUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between rounded-lg border border-default-200 p-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium truncate">{user.name}</p>
                                            <p className="text-sm text-default-500 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <div className="ml-2 flex items-center gap-2">
                                            <Chip
                                                size="sm"
                                                color={user.role === "admin" ? "primary" : "default"}
                                                variant="flat"
                                            >
                                                {user.role}
                                            </Chip>
                                            <Button
                                                size="sm"
                                                color="primary"
                                                variant="flat"
                                                startContent={<UserPlus size={14} />}
                                                isLoading={assigningId === user.id}
                                                onPress={() => handleAssign(user)}
                                            >
                                                Assign
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
