export type Menu = {
  _id: string;
  title: string;
  type: string;
  cuisine: string;
  budget: number;
  status: 'active' | 'inactive';
  image?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateMenuData = Omit<Menu, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateMenuData = Partial<CreateMenuData>;
