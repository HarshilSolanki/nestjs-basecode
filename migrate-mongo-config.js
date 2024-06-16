module.exports = {
    mongodb: {
      url: 'mongodb://root:example@localhost:27017',
      databaseName: 'nestjsmultitanant',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    migrationsDir: 'migrations',
    changelogCollectionName: 'changelog',
  };
  