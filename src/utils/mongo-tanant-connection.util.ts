
import mongoose from 'mongoose';

export function setTanantConnection(db_name, schemaType, TanantSchema) {
    const connection = mongoose.createConnection(`mongodb://root:example@localhost:27017/${db_name}?authSource=admin`);
    return connection.model(schemaType, TanantSchema);
}