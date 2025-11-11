export type Preference = {
  _id: string;
  userId: string;
  cuisine: string[];
  budget: {
    min: number;
    max: number;
  };
  mealTypes: string[];
  dietaryRestrictions: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreatePreferenceData = Omit<Preference, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdatePreferenceData = Partial<CreatePreferenceData>;
