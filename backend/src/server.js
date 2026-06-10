require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const ENV = require('./config/env');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ alter: true });
    console.log('Models synchronized');

    app.listen(ENV.PORT, () => {
      console.log(`Server running on http://localhost:${ENV.PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
