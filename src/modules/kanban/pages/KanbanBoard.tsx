import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TaskCard from "@modules/project/components/TaskCard";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Spinner,
  useDisclosure,
  addToast,
} from "@heroui/react";
import { Plus, ArrowLeft, Filter } from "lucide-react";
import { useAuthContext } from "@modules/user/context/AuthContext";
import {
  fetchProject,
  fetchProjectTasks,
  fetchProjectUsers,
  createTask,
  updateTaskStatus,
} from "@services/apiCrud";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskFormData,
  Project,
  User as UserType,
} from "@/types";
import { KANBAN_COLUMNS, PRIORITY_OPTIONS } from "@/types";

export default function KanbanBoard() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAdmin } = useAuthContext();

  const isProjectLocked = project?.status === "archived" || project?.status === "completed";
  const canEdit = !isProjectLocked || isAdmin;

  const filterKey = `celtasks_filter_mine_${projectId}`;
  const [showOnlyMine, setShowOnlyMine] = useState(() => {
    return localStorage.getItem(filterKey) === "true";
  });

  function toggleShowOnlyMine() {
    setShowOnlyMine((prev) => {
      const next = !prev;
      localStorage.setItem(filterKey, String(next));
      return next;
    });
  }

  // New task form state
  const [newTask, setNewTask] = useState<TaskFormData>({
    projectId: Number(projectId),
    title: "",
    description: "",
    assignees: [],
    priority: "medium",
    dueDate: null,
    hhTask: 0,
    costTask: 0,
    status: "backlog",
  });

  const loadData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const [proj, taskList, userList] = await Promise.all([
        fetchProject(Number(projectId)),
        fetchProjectTasks(Number(projectId)),
        fetchProjectUsers(Number(projectId)),
      ]);
      setProject(proj);
      setTasks(taskList);
      setUsers(userList);
    } catch {
      addToast({
        title: "Error loading board data",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function getColumnTasks(status: TaskStatus): Task[] {
    return tasks
      .filter((t) => t.status === status)
      .filter((t) => !showOnlyMine || t.assignees.some((a) => a.id === user?.id))
      .sort((a, b) => a.position - b.position);
  }

  async function handleMoveTask(taskId: number, newStatus: TaskStatus) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch {
      // Revert on error
      await loadData();
      addToast({
        title: "Failed to move task",
        color: "danger",
      });
    }
  }

  function handleDragStart(e: React.DragEvent, task: Task) {
    e.dataTransfer.setData("taskId", String(task.id));
    e.dataTransfer.setData("sourceStatus", task.status);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("bg-primary/5");
  }

  function handleDragLeave(e: React.DragEvent) {
    e.currentTarget.classList.remove("bg-primary/5");
  }

  function handleDrop(e: React.DragEvent, columnStatus: TaskStatus) {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-primary/5");
    const taskId = Number(e.dataTransfer.getData("taskId"));
    const sourceStatus = e.dataTransfer.getData("sourceStatus") as TaskStatus;
    if (sourceStatus !== columnStatus) {
      handleMoveTask(taskId, columnStatus);
    }
  }

  function openAddModal() {
    setNewTask({
      projectId: Number(projectId),
      title: "",
      description: "",
      assignees: [],
      priority: "medium",
      dueDate: null,
      hhTask: 0,
      status: "backlog",
    });
    onOpen();
  }

  async function handleCreateTask() {
    if (!newTask.title.trim()) {
      addToast({ title: "Title is required", color: "warning" });
      return;
    }

    try {
      setSubmitting(true);
      const created = await createTask(newTask);
      setTasks((prev) => [...prev, created]);
      addToast({ title: "Task created", color: "success" });
      onClose();
    } catch {
      addToast({ title: "Failed to create task", color: "danger" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="lg" label="Loading board..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-divider shrink-0">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => navigate("/projects")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">{project?.name ?? "Board"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showOnlyMine ? "solid" : "flat"}
            color={showOnlyMine ? "primary" : "default"}
            startContent={<Filter className="w-4 h-4" />}
            onPress={toggleShowOnlyMine}
          >
            {showOnlyMine ? "My Tasks" : "All Tasks"}
          </Button>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={openAddModal}
            isDisabled={!canEdit}
          >
            Add Task
          </Button>
        </div>
      </div>

      {isProjectLocked && !isAdmin && (
        <div className="mx-4 mt-2 px-4 py-2 rounded-lg bg-warning-50 text-warning-700 text-sm font-medium flex items-center gap-2">
          <span>This project is <strong>{project?.status}</strong>. Tasks are read-only.</span>
        </div>
      )}

      {/* Board columns */}
      <div className="flex-1 overflow-x-auto p-4 flex justify-center">
        <div className="flex gap-4 h-full min-h-[500px] shrink-0">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = getColumnTasks(col.key);
            return (
              <div
                key={col.key}
                className="flex flex-col min-w-[280px] w-[280px] bg-default-100/50 rounded-xl transition-colors backdrop-brightness-50"
                onDragOver={canEdit ? handleDragOver : undefined}
                onDragLeave={canEdit ? handleDragLeave : undefined}
                onDrop={canEdit ? (e) => handleDrop(e, col.key) : undefined}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-sm">{col.label}</h2>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={col.color as "default" | "primary" | "warning" | "success"}
                    >
                      {colTasks.length}
                    </Chip>
                  </div>
                </div>

                {/* Task list */}
                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      canEdit={canEdit}
                      onDragStart={handleDragStart}
                    />
                  ))}

                  {colTasks.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-default-300 text-sm border-2 border-dashed border-default-200 rounded-lg">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>New Task</ModalHeader>
          <ModalBody className="gap-4">
            <Input
              label="Title"
              placeholder="Task title"
              isRequired
              value={newTask.title}
              onValueChange={(val) =>
                setNewTask((prev) => ({ ...prev, title: val }))
              }
            />
            <Textarea
              label="Description"
              placeholder="Describe the task..."
              value={newTask.description ?? ""}
              onValueChange={(val) =>
                setNewTask((prev) => ({ ...prev, description: val }))
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Assignees"
                placeholder="Select assignees"
                selectionMode="multiple"
                selectedKeys={new Set((newTask.assignees ?? []).map(String))}
                onSelectionChange={(keys) => {
                  const arr = Array.from(keys).map(Number);
                  setNewTask((prev) => ({ ...prev, assignees: arr }));
                }}
              >
                {users.map((u) => (
                  <SelectItem key={String(u.id)}>{u.name}</SelectItem>
                ))}
              </Select>
              <Select
                label="Priority"
                placeholder="Select priority"
                selectedKeys={newTask.priority ? [newTask.priority] : ["medium"]}
                onSelectionChange={(keys) => {
                  const arr = Array.from(keys);
                  if (arr.length > 0) {
                    setNewTask((prev) => ({
                      ...prev,
                      priority: arr[0] as TaskPriority,
                    }));
                  }
                }}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p.key}>{p.label}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Status"
                placeholder="Select status"
                selectedKeys={newTask.status ? [newTask.status] : ["backlog"]}
                onSelectionChange={(keys) => {
                  const arr = Array.from(keys);
                  if (arr.length > 0) {
                    setNewTask((prev) => ({
                      ...prev,
                      status: arr[0] as TaskStatus,
                    }));
                  }
                }}
              >
                {KANBAN_COLUMNS.map((c) => (
                  <SelectItem key={c.key}>{c.label}</SelectItem>
                ))}
              </Select>
              <Input
                type="date"
                label="Due Date"
                placeholder="Select date"
                value={newTask.dueDate ?? ""}
                onValueChange={(val) =>
                  setNewTask((prev) => ({
                    ...prev,
                    dueDate: val || null,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="HH by Task"
                placeholder="0"
                min={0}
                step={0.5}
                value={String(newTask.hhTask ?? 0)}
                onValueChange={(val) =>
                  setNewTask((prev) => ({
                    ...prev,
                    hhTask: Number.parseFloat(val) || 0,
                  }))
                }
              />
              <Input
                type="number"
                label="Cost by Task"
                placeholder="0"
                min={0}
                step={0.01}
                value={String(newTask.costTask ?? 0)}
                onValueChange={(val) =>
                  setNewTask((prev) => ({
                    ...prev,
                    costTask: Number.parseFloat(val) || 0,
                  }))
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={submitting}
              onPress={handleCreateTask}
            >
              Create Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
