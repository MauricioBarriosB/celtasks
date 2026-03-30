import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
} from "@heroui/react";
import { FolderKanban, ArrowRight } from "lucide-react";
import { fetchMyProjects } from "@services/apiCrud";
import type { Project } from "@/types";

export default function ProjectList() {
  const navigate = useNavigate();
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
      // error handled silently
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
        <p className="text-default-500 text-lg">
          No projects assigned. Contact an admin.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Projects</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            isPressable
            onPress={() => navigate(`/projects/${project.id}/board`)}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader className="flex items-center justify-between pb-1">
              <h3 className="text-lg font-semibold truncate">{project.name}</h3>
              {project.status && (
                <Chip
                  size="sm"
                  color={
                    project.status === "active"
                      ? "success"
                      : project.status === "archived"
                        ? "default"
                        : "primary"
                  }
                  variant="flat"
                >
                  {project.status}
                </Chip>
              )}
            </CardHeader>
            <CardBody className="pt-0">
              {project.description && (
                <p className="text-default-500 text-sm line-clamp-2 mb-3">
                  {project.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                {project.taskCount !== undefined && (
                  <span className="text-xs text-default-400">
                    {project.taskCount} task{project.taskCount !== 1 ? "s" : ""}
                  </span>
                )}
                <span aria-hidden="true" className="ml-auto flex items-center gap-1 text-sm text-primary font-medium pointer-events-none">
                  Board
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
