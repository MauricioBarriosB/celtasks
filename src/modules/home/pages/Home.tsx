import { Card, CardBody, Button } from "@heroui/react";
import { Zap, KanbanSquare, CheckSquare, Users, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@modules/user/context/AuthContext";

const features = [
    {
        icon: KanbanSquare,
        title: "Kanban Board",
        description:
            "Visualize your workflow with drag-and-drop kanban boards. Move tasks through stages effortlessly.",
    },
    {
        icon: CheckSquare,
        title: "Task Management",
        description: "Create, assign, and track tasks with priorities, due dates, and detailed descriptions.",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description: "Work together with your team. Assign tasks, share progress, and keep everyone in sync.",
    },
    {
        icon: Shield,
        title: "Admin Dashboard",
        description: "Manage users, roles, and permissions. Monitor activity and keep your workspace organized.",
    },
];

export default function Home() {
    const { isAuthenticated } = useAuthContext();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="flex w-full flex-col items-center justify-center gap-6 px-4 py-12 sm:py-16 text-center">
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl flex items-center gap-2 justify-center">
                    <Zap size={45} />
                    CelTasks
                </h1>
                <p className="text-xl text-default-500 sm:text-2xl">Task Management &amp; Kanban Board</p>
                <p className="max-w-2xl text-default-400">
                    Streamline your projects with an intuitive task management platform. Organize work with kanban
                    boards, collaborate with your team, and deliver results on time.
                </p>

                <div className="mt-4 flex gap-3">
                    {isAuthenticated ? (
                        <Button color="primary" size="lg" onPress={() => navigate("/projects")}>
                            Go to Projects
                        </Button>
                    ) : (
                        <>
                            <Button color="primary" size="lg" onPress={() => navigate("/register")}>
                                Get Started
                            </Button>
                            <Button variant="bordered" size="lg" onPress={() => navigate("/login")}>
                                Sign In
                            </Button>
                        </>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full max-w-5xl px-4 pb-12">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {features.map((feature) => (
                        <Card key={feature.title} className="border-none bg-default-50">
                            <CardBody className="flex flex-row items-start gap-4 p-6">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <feature.icon className="text-primary" size={24} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                                    <p className="text-sm text-default-500">{feature.description}</p>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
