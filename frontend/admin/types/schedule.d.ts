export type Schedule = {
  _id: string;
  userId: string;
  mealTime: string;
  dayOfWeek: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateScheduleData = Omit<Schedule, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateScheduleData = Partial<CreateScheduleData>;
