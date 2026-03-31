import { Mail, Globe, MessageCircle, KanbanSquare, Users, Tag, Shield, BarChart3, GripVertical } from "lucide-react";
import { Card, CardBody, Button, Divider } from "@heroui/react";

export default function Contact() {
    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10 text-center">
                <h1
                    className="text-6xl font-bold text-foreground mb-3"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                    Contact & Support
                </h1>
                <p className="text-lg text-default-600 font-normal">
                    Have questions about CelTasks or need help with project management? We'd love to hear from you.
                </p>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Email Card */}
                <Card className="border border-default-200">
                    <CardBody className="p-8 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail size={32} className="text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Email Us</h2>
                        <p className="text-default-500">
                            Send us your questions, feedback, or support requests. We typically respond within 24 hours.
                        </p>
                        <Button
                            as="a"
                            href="mailto:info@capacitaenlinea.cl"
                            color="primary"
                            variant="shadow"
                            size="lg"
                            className="font-semibold mt-2"
                            startContent={<MessageCircle size={20} />}
                        >
                            info@capacitaenlinea.cl
                        </Button>
                    </CardBody>
                </Card>

                {/* Website Card */}
                <Card className="border border-default-200">
                    <CardBody className="p-8 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Globe size={32} className="text-secondary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Visit Our Website</h2>
                        <p className="text-default-500">
                            Explore our catalog of several demo aplications, mvp's , certifications, and educational
                            resources.
                        </p>
                        <Button
                            as="a"
                            href="https://capacitaenlinea.cl/"
                            target="_blank"
                            rel="noopener noreferrer"
                            color="secondary"
                            variant="shadow"
                            size="lg"
                            className="font-semibold mt-2"
                            startContent={<Globe size={20} />}
                        >
                            capacitaenlinea.cl
                        </Button>
                    </CardBody>
                </Card>
            </div>

            <Divider className="my-8" />

            {/* What We Can Help With */}
            <div className="mb-10">
                <h2
                    className="text-3xl font-bold text-foreground mb-6 text-center"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                    Platform Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <Card className="border border-default-100">
                        <CardBody className="p-6 flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <KanbanSquare size={24} className="text-primary" />
                            </div>
                            <h3 className="text-lg font-bold">Kanban Board</h3>
                            <p className="text-sm text-default-500">
                                Visualize your workflow with drag-and-drop columns. Move tasks through Backlog, In
                                Progress, QA, and Production stages effortlessly.
                            </p>
                        </CardBody>
                    </Card>

                    <Card className="border border-default-100">
                        <CardBody className="p-6 flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                                <GripVertical size={24} className="text-secondary" />
                            </div>
                            <h3 className="text-lg font-bold">Drag & Drop Reorder</h3>
                            <p className="text-sm text-default-500">
                                Reorder tasks within columns or move them across stages with intuitive drag-and-drop.
                                Positions sync instantly with the server.
                            </p>
                        </CardBody>
                    </Card>

                    <Card className="border border-default-100">
                        <CardBody className="p-6 flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                                <Users size={24} className="text-success" />
                            </div>
                            <h3 className="text-lg font-bold">Team Collaboration</h3>
                            <p className="text-sm text-default-500">
                                Assign multiple team members to tasks, filter by your own assignments, and keep everyone
                                aligned on project goals.
                            </p>
                        </CardBody>
                    </Card>

                    <Card className="border border-default-100">
                        <CardBody className="p-6 flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                                <Tag size={24} className="text-warning" />
                            </div>
                            <h3 className="text-lg font-bold">Tags & Priorities</h3>
                            <p className="text-sm text-default-500">
                                Categorize tasks by department tags (Frontend, Backend, QA, UX/UI, and more) and set
                                priority levels from low to urgent.
                            </p>
                        </CardBody>
                    </Card>

                    <Card className="border border-default-100">
                        <CardBody className="p-6 flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                                <Shield size={24} className="text-danger" />
                            </div>
                            <h3 className="text-lg font-bold">Admin Dashboard</h3>
                            <p className="text-sm text-default-500">
                                Manage users, projects, and all tasks from a centralized admin panel. Control access
                                with role-based permissions.
                            </p>
                        </CardBody>
                    </Card>

                    <Card className="border border-default-100">
                        <CardBody className="p-6 flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-default/10 flex items-center justify-center">
                                <BarChart3 size={24} className="text-default-500" />
                            </div>
                            <h3 className="text-lg font-bold">Project Tracking</h3>
                            <p className="text-sm text-default-500">
                                Track hours, costs, deadlines, and task counts per project. Get a clear overview of
                                progress and resource allocation.
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
