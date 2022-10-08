import { Router, Request, Response } from "express";
import { WorkkerClass } from "../class/workerClass";

// instanciar el Router
const workerRouter = Router();

// Auth
import { verificaToken } from "../auth/auth";

// ==================================================================== //
// Crear un usuario
// ==================================================================== //
workerRouter.post("/nuevoUsuario", (req: Request, resp: Response) => {
  const nuevoUsuario = new WorkkerClass();
  nuevoUsuario.nuevoUsuario(req, resp);
});

// ==================================================================== //
// Editar un usuario
// ==================================================================== //
workerRouter.put(
  "/editarUsuario",
  [verificaToken],
  (req: Request, resp: Response) => {
    const editarUsuario = new WorkkerClass();
    editarUsuario.editarUsuario(req, resp);
  }
);

// ==================================================================== //
// Eliminar un usuario
// ==================================================================== //
workerRouter.delete(
  "/eliminarUsuario",
  [verificaToken],
  (req: Request, resp: Response) => {
    const eliminarUsuario = new WorkkerClass();
    eliminarUsuario.eliminarUsuario(req, resp);
  }
);

// ==================================================================== //
// Obtener usuarios
// ==================================================================== //
workerRouter.get(
  "/obtenerUsuarios",
  [verificaToken],
  (req: Request, resp: Response) => {
    const obtenerUsuarios = new WorkkerClass();
    obtenerUsuarios.obtenerUsuarios(req, resp);
  }
);

// ==================================================================== //
// Loguear usuario
// ==================================================================== //
workerRouter.post("/loguearUsuario", (req: Request, resp: Response) => {
  const loguearUsuario = new WorkkerClass();
  loguearUsuario.loguearUsuario(req, resp);
});

// ==================================================================== //
// Decodificar token
// ==================================================================== //
workerRouter.get("/decodificarToken", (req: Request, resp: Response) => {
  const decodificarToken = new WorkkerClass();
  decodificarToken.decodificarToken(req, resp);
});

// ==================================================================== //
// Refrescar token
// ==================================================================== //
workerRouter.post("/refrescarToken", (req: Request, resp: Response) => {
  const refrescarToken = new WorkkerClass();
  refrescarToken.refrescarToken(req, resp);
});

export default workerRouter;
