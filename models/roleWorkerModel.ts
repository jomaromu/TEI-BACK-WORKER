import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

// Interfaces
import { RoleColModel } from "../interfaces/role";

const Restricciones = {
  sidebar: {
    catalogo: false,
    sucursales: false,
    colaboradores: false,
    clientes: false,
    categorias: false,
    productos: false,
    roles: false,
    origen: false,
    prioridad: false,
    etapas: false,
    colores: false,
    metodos: false,
  },
};

// Crear esquema
const Schema = mongoose.Schema;

const roleColaboradorSchema = new Schema({
  idCreador: { type: Schema.Types.ObjectId, ref: "userWorker" },
  nombre: { type: String, unique: true },
  estado: { type: Boolean, default: true },
  restricciones: { type: Object, default: Restricciones },
});

// validacion para único elemento
roleColaboradorSchema.plugin(uniqueValidator, {
  message: "El {PATH}, ya existe!!",
});

export = mongoose.model<RoleColModel>("roleColaborador", roleColaboradorSchema);
