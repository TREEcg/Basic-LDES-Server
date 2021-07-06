const Sequelize = require('sequelize');

// Option 2: Passing parameters separately (sqlite)
module.exports = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:'
    //storage: 'path/to/database.sqlite'
});