import { Router, Request, Response } from "express";
import { WorkkerClass } from "../class/workerClass";

// instanciar el Router
const historialRouter = Router();

// Auth
import {
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  verificaToken,
} from "../auth/auth";

// ==================================================================== //
// Crear historial
// ==================================================================== //
// historialRouter.post(
//   "/CrearHistorialBusqueda",
//   (req: Request, resp: Response) => {
//     const CrearHistorialBusqueda = new WorkkerClass();
//     CrearHistorialBusqueda.CrearHistorialBusqueda(req, resp);
//   }
// );

// ==================================================================== //
// Actualizar historial
// ==================================================================== //
// historialRouter.put("/actualizarHistorial", (req: Request, resp: Response) => {
//   const actualizarHistorial = new WorkkerClass();
//   actualizarHistorial.actualizarHistorial(req, resp);
// });

// ==================================================================== //
// Crear - Actualizar historial
// ==================================================================== //
historialRouter.post("/historialDB", (req: Request, resp: Response) => {
  const historialDB = new WorkkerClass();
  historialDB.historialDB(req, resp);
});

// ==================================================================== //
// Obtener historial
// ==================================================================== //
historialRouter.get("/obtenerHistorial", (req: Request, resp: Response) => {
  const obtenerHistorial = new WorkkerClass();
  obtenerHistorial.obtenerHistorial(req, resp);
});

export default historialRouter;
