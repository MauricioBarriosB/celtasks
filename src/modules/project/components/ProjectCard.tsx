import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import type { Project, ProjectStatus } from "@/types";
import { PROJECT_STATUS_COLOR_MAP } from "@/types";

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: Readonly<ProjectCardProps>) {
    const navigate = useNavigate();

    return (
        <Card
            isPressable
            onPress={() => navigate(`/projects/${project.id}/board`)}
            className="hover:shadow-lg transition-shadow"
        >
            <CardHeader className="flex items-center justify-between pb-1">
                <h3 className="text-lg font-semibold truncate">{project.name}</h3>
                {project.status && (
                    <Chip
                        size="sm"
                        color={PROJECT_STATUS_COLOR_MAP[project.status as ProjectStatus] ?? "default"}
                        variant="flat"
                    >
                        {project.status}
                    </Chip>
                )}
            </CardHeader>
            <CardBody className="pt-0">
                {project.description && (
                    <p className="text-default-500 text-sm line-clamp-2 mb-3">{project.description}</p>
                )}
                <div className="flex items-center justify-between">
                    {project.taskCount !== undefined && (
                        <span className="text-xs text-default-400">
                            {project.taskCount} task{project.taskCount === 1 ? "" : "s"}
                        </span>
                    )}
                    <span
                        aria-hidden="true"
                        className="ml-auto flex items-center gap-1 text-sm text-primary font-medium pointer-events-none"
                    >
                        Board
                        <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </CardBody>
        </Card>
    );
}
