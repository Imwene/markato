export async function up(db) {
    // Create collections with validators
    await db.createCollection("vehicletypes", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["id", "label"],
                properties: {
                    id: { bsonType: "string" },
                    label: { bsonType: "string" },
                    isActive: { bsonType: "bool" },
                    sortOrder: { bsonType: "int" }
                }
            }
        }
    });

    await db.createCollection("scents", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["id", "name"],
                properties: {
                    id: { bsonType: "int" },
                    name: { bsonType: "string" },
                    isActive: { bsonType: "bool" },
                    sortOrder: { bsonType: "int" }
                }
            }
        }
    });

    await db.createCollection("optionalservices", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["id", "name", "description", "price"],
                properties: {
                    id: { bsonType: "int" },
                    name: { bsonType: "string" },
                    description: { bsonType: "string" },
                    price: { bsonType: "double" },
                    isActive: { bsonType: "bool" },
                    sortOrder: { bsonType: "int" }
                }
            }
        }
    });

    // Create indexes
    await db.collection("vehicletypes").createIndex({ id: 1 }, { unique: true });
    await db.collection("scents").createIndex({ id: 1 }, { unique: true });
    await db.collection("optionalservices").createIndex({ id: 1 }, { unique: true });
}
export async function down(db) {
    await db.collection("vehicletypes").drop();
    await db.collection("scents").drop();
    await db.collection("optionalservices").drop();
}