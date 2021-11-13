import type { ActionsLayout } from '../ActionsLayout';

export interface PersistActionsContainer<T extends string> {
  updateText: (newMessage: string) => Promise<void>;
  updateKeyboard: (newActions: ActionsLayout<T>) => Promise<void>;
  delete: () => Promise<void>;
}
