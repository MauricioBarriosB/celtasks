import { useEffect } from "react";
import { Tabs, Tab } from "@heroui/react";
import { Users, FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@modules/user/context/AuthContext";
import UsersTab from "@modules/admin/components/UsersTab";
import ProjectsTab from "@modules/admin/components/ProjectsTab";

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

            </Tabs>
        </div>
    );
}
