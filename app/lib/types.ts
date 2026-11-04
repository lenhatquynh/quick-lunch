export type MenuItemWithSelections = {
  id: string;
  name: string;
  notes: string | null;
  maxQuantity: number | null;
  isArchived: boolean;
  sortOrder: number;
  selections: {
    id: string;
    personName: string;
    note: string | null;
    isPaid: boolean;
    paidAt: string | null;
  }[];
};

export type MenuWithItems = {
  id: string;
  date: string;
  creatorName: string;
  isLocked: boolean;
  items: MenuItemWithSelections[];
};

export type MenuItemInput = {
  id?: string;
  name: string;
  notes?: string;
  maxQuantity?: number | null;
};

export type CreateMenuRequest = {
  date: string;
  creatorName: string;
  items: MenuItemInput[];
};

export type CreateSelectionRequest = {
  menuItemId: string;
  personName: string;
  quantity?: number;
  note?: string | null;
};

export type SelectionSummary = {
  itemId: string;
  itemName: string;
  totalCount: number;
  maxQuantity: number | null;
  notes: string | null;
  people: string[];
};

export type PersonSummary = {
  personName: string;
  selections: {
    itemName: string;
    notes: string | null;
    count: number;
  }[];
  totalItems: number;
  /** Các note của người này (không trùng lặp) */
  notes: string[];
};

export type HistoryMenu = {
  id: string;
  date: string;
  creatorName: string;
  isLocked: boolean;
  totalItems: number;
  totalSelections: number;
  totalPeople: number;
  paidSelections: number;
};
