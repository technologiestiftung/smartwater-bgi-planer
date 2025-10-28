export interface ModalState {
	id: string;
	isOpen: boolean;
}

export interface ModalsState {
	modals: ModalState[];
}

export interface ModalsActions {
	openModal: (id: string) => void;
	closeModal: (id: string) => void;
}
