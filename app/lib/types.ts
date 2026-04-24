export type MenuItemWithSelections = {
  id: string;
  name: string;
  notes: string | null;
  sortOrder: number;
  selections: {
    id: string;
    personName: string;
  }[];
};

export type MenuWithItems = {
  id: string;
  date: string;
  creatorName: string;
  isLocked: boolean;
  items: MenuItemWithSelections[];
};

export type CreateMenuRequest = {
  date: string;
  creatorName: string;
  items: {
    name: string;
    notes?: string;
  }[];
};

export type CreateSelectionRequest = {
  menuItemId: string;
  personName: string;
};

export type SelectionSummary = {
  itemId: string;
  itemName: string;
  totalCount: number;
  notes: string | null;
  people: string[];
};

export type PersonSummary = {
  personName: string;
  selections: {
    itemName: string;
    notes: string | null;
  }[];
};

export type HistoryMenu = {
  id: string;
  date: string;
  creatorName: string;
  isLocked: boolean;
  totalItems: number;
  totalSelections: number;
};
