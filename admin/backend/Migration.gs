const MIGRATION_DATABASE_ID = "1jUPjOacuZw0sLD1EAfAar9FphcZCwdy8PkvQNsRG-98";
function migrateLinkedDatabase() { PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", MIGRATION_DATABASE_ID); return setupDatabase(); }
