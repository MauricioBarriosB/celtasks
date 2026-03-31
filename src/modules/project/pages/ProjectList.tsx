import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { FolderKanban } from "lucide-react";
import { fetchMyProjects } from "@services/apiCrud";
import type { Project } from "@/types";
import ProjectCard from "@modules/project/components/ProjectCard";

export default function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    async function loadProjects() {
        try {
            setLoading(true);
            const data = await fetchMyProjects();
            setProjects(data);
        } catch {
            console.error("loadProjects() Error");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Spinner size="lg" label="Loading projects..." />
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-64 gap-4">
                <FolderKanban className="w-16 h-16 text-default-300" />
                <p className="text-default-500 text-lg">No projects assigned. Contact an admin.</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">My Projects</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>

        </div>
    );
}
