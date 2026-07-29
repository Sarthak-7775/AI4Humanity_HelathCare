import { create } from 'zustand'

interface PrescriptoState {
    user: any | null;
    isAuthenticated: boolean;
    isEmergencyModalOpen: boolean;
    setUser: (userData: any) => void;
    logout: () => void;
    toggleEmergencyModal: () => void;
}

export const useStore = create<PrescriptoState>((set) => ({
    user: null,
    isAuthenticated: false,
    isEmergencyModalOpen: false,
    setUser: (userData) => set({ user: userData, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
    toggleEmergencyModal: () => set((state) => ({ isEmergencyModalOpen: !state.isEmergencyModalOpen })),
}))

interface ChatMessage {
    role: 'user' | 'bot';
    content: string;
    recommended_tests?: string[];
}

interface ChatStore {
    messages: ChatMessage[];
    isTyping: boolean;
    addMessage: (msg: ChatMessage) => void;
    setTyping: (status: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    messages: [],
    isTyping: false,
    addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
    setTyping: (status) => set({ isTyping: status }),
}));