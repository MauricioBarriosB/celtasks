import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Input, Button, Chip, useDisclosure, Spinner, addToast,
} from "@heroui/react";
import { Plus, Pencil, Trash2, UserPlus, KanbanSquare, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchAllProjects } from "@services/apiCrud";
import type { Project, ProjectStatus } from "@/types";
import { PROJECT_STATUS_COLOR_MAP } from "@/types";
import ProjectFormModal from "@modules/admin/components/ProjectFormModal";
import DeleteProjectModal from "@modules/admin/components/DeleteProjectModal";

export default function ProjectsTab() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [search, setSearch] = useState("");
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

    const filteredProjects = useMemo(() => {
        if (!search.trim()) return projects;
        const q = search.toLowerCase();
        return projects.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.description ?? "").toLowerCase().includes(q) ||
                (p.creatorName ?? "").toLowerCase().includes(q),
        );
    }, [projects, search]);

    const statusColor = (status: string) =>
        PROJECT_STATUS_COLOR_MAP[status as ProjectStatus] ?? "default";

    return (
        <>
            <div className="mb-4 flex items-center gap-4">
                <Input
                    placeholder="Search projects..."
                    value={search}
                    onValueChange={setSearch}
                    startContent={<Search size={16} className="text-default-400" />}
                    className="max-w-sm"
                    isClearable
                    onClear={() => setSearch("")}
                />
                <span className="text-sm text-default-500">{filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}</span>
                <div className="ml-auto">
                    <Button color="primary" startContent={<Plus size={16} />} onPress={handleCreateOpen}>
                        New Project
                    </Button>
                </div>
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
                    {filteredProjects.map((project) => (
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
