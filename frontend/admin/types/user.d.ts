export type User = {
  _id: string;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  username: string;
  email: string;
  role: 'admin' | 'user';
  timezone: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
};

export type UserName = {
  first: string;
  middle?: string;
  last: string;
};

export type CreateUserData = Omit<User, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserData = Partial<CreateUserData>;
