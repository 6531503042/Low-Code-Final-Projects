// MongoDB initialization script
db = db.getSiblingDB('meerai');

// Create a user for the application
db.createUser({
  user: 'meerai_user',
  pwd: 'meerai_password',
  roles: [
    {
      role: 'readWrite',
      db: 'meerai'
    }
  ]
});

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('menus');
db.createCollection('preferences');
db.createCollection('schedules');
db.createCollection('dailysuggestions');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.menus.createIndex({ mealType: 1 });
db.menus.createIndex({ isActive: 1 });
db.preferences.createIndex({ userId: 1 }, { unique: true });
db.schedules.createIndex({ userId: 1 }, { unique: true });
db.dailysuggestions.createIndex({ userId: 1, date: 1 }, { unique: true });

print('MongoDB initialization completed');
