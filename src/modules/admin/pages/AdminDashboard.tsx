import { useEffect } from "react";
import { Tabs, Tab } from "@heroui/react";
import { Users, FolderKanban, ListTodo, Briefcase, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@modules/user/context/AuthContext";
import UsersTab from "@modules/admin/components/UsersTab";
import ProjectsTab from "@modules/admin/components/ProjectsTab";
import TasksTab from "@modules/admin/components/TasksTab";
import ContractorsTab from "@modules/admin/components/ContractorsTab";
import CompaniesTab from "@modules/admin/components/CompaniesTab";

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
        <div>
            <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

            <Tabs aria-label="Admin sections" color="primary" variant="underlined">
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
                <Tab
                    key="tasks"
                    title={
                        <div className="flex items-center gap-2">
                            <ListTodo size={16} />
                            <span>Tasks</span>
                        </div>
                    }
                >
                    <div className="mt-4">
                        <TasksTab />
                    </div>
                </Tab>
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
                    key="contractors"
                    title={
                        <div className="flex items-center gap-2">
                            <Briefcase size={16} />
                            <span>Contractors</span>
                        </div>
                    }
                >
                    <div className="mt-4">
                        <ContractorsTab />
                    </div>
                </Tab>
                <Tab
                    key="companies"
                    title={
                        <div className="flex items-center gap-2">
                            <Building2 size={16} />
                            <span>Companies</span>
                        </div>
                    }
                >
                    <div className="mt-4">
                        <CompaniesTab />
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}
