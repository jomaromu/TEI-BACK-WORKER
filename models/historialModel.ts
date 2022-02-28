import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

// Interfaces
import { Historial } from "./../interfaces/historial";

// Crear esquema
const Schema = mongoose.Schema;

const historialSchema = new Schema({
  idUsuario: { type: Schema.Types.ObjectId, ref: "userWorker", unique: true },
  bandeja: { type: String },
  sucursal: { type: String },
  usuario: { type: String },
});

historialSchema.plugin(uniqueValidator, { message: "El {PATH}, ya existe!!" });
export = mongoose.model<Historial>("historial", historialSchema);
