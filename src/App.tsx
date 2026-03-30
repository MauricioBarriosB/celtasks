import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@components/Layout";
import { AuthProvider } from "@modules/user/context/AuthContext";
import ProtectedRoute from "@components/ProtectedRoute";

const Home = lazy(() => import("@modules/home/pages/Home"));
const Login = lazy(() => import("@modules/user/pages/Login"));
const Register = lazy(() => import("@modules/user/pages/Register"));
const UserAccount = lazy(() => import("@modules/user/pages/UserAccount"));

const ProjectList = lazy(() => import("@modules/project/pages/ProjectList"));
const KanbanBoard = lazy(() => import("@modules/kanban/pages/KanbanBoard"));
const TaskDetail = lazy(() => import("@modules/task/pages/TaskDetail"));

const AdminDashboard = lazy(() => import("@modules/admin/pages/AdminDashboard"));
const ProjectUsers = lazy(() => import("@modules/admin/pages/ProjectUsers"));

function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-default-500">Loading...</p>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter basename="/celtasks">
            <AuthProvider>
                <Layout>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected user routes */}
                            <Route
                                path="/account"
                                element={
                                    <ProtectedRoute>
                                        <UserAccount />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Projects */}
                            <Route
                                path="/projects"
                                element={
                                    <ProtectedRoute>
                                        <ProjectList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/projects/:id/board"
                                element={
                                    <ProtectedRoute>
                                        <KanbanBoard />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Tasks */}
                            <Route
                                path="/tasks/:id"
                                element={
                                    <ProtectedRoute>
                                        <TaskDetail />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Admin routes */}
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute requireAdmin>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/projects/:id/users"
                                element={
                                    <ProtectedRoute requireAdmin>
                                        <ProjectUsers />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </Suspense>
                </Layout>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
