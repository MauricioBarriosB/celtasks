import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button,
} from "@heroui/react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    name: string;
    isLoading: boolean;
    onConfirm: () => void;
}

export default function DeleteConfirmModal({ isOpen, onClose, title, name, isLoading, onConfirm }: Readonly<DeleteConfirmModalProps>) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <ModalContent>
                <ModalHeader>{title}</ModalHeader>
                <ModalBody>
                    <p>
                        Are you sure you want to delete{" "}
                        <strong>{name}</strong>? This action cannot be undone.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="flat" onPress={onClose}>Cancel</Button>
                    <Button color="danger" isLoading={isLoading} onPress={onConfirm}>Delete</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
