import { Sequelize, DataTypes } from 'sequelize';

export class DatabaseFactory {
    private db: Sequelize;

    constructor(host: string) {
        this.db = new Sequelize({
            dialect: 'sqlite',
            //storage: host
            storage: ':memory:'
            //storage: 'path/to/database.sqlite'
        });
    }

    createTable(tableName: string) {
        let databaseModel = this.db.define(tableName, {
            // Model attributes are defined here
            id: {
                type: DataTypes.TEXT,
                allowNull: false,
                primaryKey: true
            },
            page: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        }, {
            // Other model options go here
            timestamps: false,
        });

        databaseModel.sync({ force: true });

        return databaseModel;
    }
}