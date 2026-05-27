import { useState } from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, addToast,
} from "@heroui/react";
import { deleteProject } from "@services/apiCrud";
import type { Project } from "@/types";

interface DeleteProjectModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onDeleted: (projectId: number) => void;
}

export default function DeleteProjectModal({ project, isOpen, onClose, onDeleted }: Readonly<DeleteProjectModalProps>) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (!project) return;
        setIsDeleting(true);
        try {
            await deleteProject(project.id);
            addToast({ title: "Project deleted", description: `${project.name} has been deleted.`, color: "success" });
            onDeleted(project.id);
            onClose();
        } catch {
            addToast({ title: "Error", description: "Failed to delete project.", color: "danger" });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>Delete Project</ModalHeader>
                <ModalBody>
                    <p>
                        Are you sure you want to delete{" "}
                        <strong>{project?.name}</strong>? This action cannot be undone.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="flat" onPress={onClose}>Cancel</Button>
                    <Button color="danger" isLoading={isDeleting} onPress={handleConfirm}>Delete</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
