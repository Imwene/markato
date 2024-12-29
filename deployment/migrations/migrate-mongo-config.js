// migrations/migrate-mongo-config.js
const config = {
    mongodb: {
      url: process.env.MONGODB_URI,
      databaseName: "markato",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    migrationsDir: "migrations",
    changelogCollectionName: "changelog",
    migrationFileExtension: ".js",
    useFileHash: false
  };
  
  export default config;