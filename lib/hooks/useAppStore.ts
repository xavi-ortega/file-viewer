import { create } from "zustand";

type State = {
  knowledgeBaseId: string;
};

type Actions = {
  setKnowledgeBaseId: (knowledgeBaseId: string) => void;
};

export const useAppStore = create<State & Actions>((set) => ({
  knowledgeBaseId: "",
  setKnowledgeBaseId: (knowledgeBaseId: string) => {
    set((state) => ({ ...state, knowledgeBaseId }));
  },
}));
