import { Response, Request } from "express";
import { CallbackError } from "mongoose";
import moment from "moment";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const mongoose = require("mongoose");
import { environmnet } from "../environment/environment";

// Interface
import { WorkerModelInterface } from "../interfaces/worker";

// Modelos
import workerModel from "../models/workerModel";

export class WorkkerClass {
  private token: string;
  private duracionToken = 36000;

  constructor() {
    this.token = "";
  }

  async nuevoUsuario(req: any, resp: Response): Promise<any> {
    // const idCreador = new mongoose.Types.ObjectId(req.usuario._id);
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const identificacion = req.body.identificacion;
    const telefono: string = req.body.telefono;
    const correo = req.body.correo;
    const password = bcrypt.hashSync("12345678", 10);
    const fecha_alta = moment().format("DD-MM-YYYY");
    const role = new mongoose.Types.ObjectId(req.body.role);
    const sucursal = new mongoose.Types.ObjectId(req.body.sucursal);

    const nuevoUsuario = new workerModel({
      // idCreador,
      nombre,
      apellido,
      identificacion,
      telefono,
      correo,
      password,
      fecha_alta,
      role,
      sucursal,
    });

    nuevoUsuario.save((err: CallbackError, usuarioDB: WorkerModelInterface) => {
      if (err) {
        return resp.json({
          ok: false,
          mensaje: `No se pudo guardar el usuario la DB`,
          err,
        });
      } else {
        usuarioDB.password = ";)";
        return resp.json({
          ok: true,
          mensaje: `Usuario Creado`,
          usuarioDB,
        });
      }
    });
  }

  editarUsuario(req: any, res: Response): void {
    const id = new mongoose.Types.ObjectId(req.get("id"));

    const query = {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      identificacion: req.body.identificacion,
      correo: req.body.correo,
      telefono: req.body.telefono,
      sucursal: new mongoose.Types.ObjectId(req.body.sucursal),
      role: new mongoose.Types.ObjectId(req.body.role),
      estado: req.body.estado,
    };

    workerModel.findById(
      id,
      (err: CallbackError, usuarioDB: WorkerModelInterface) => {
        if (err) {
          return res.json({
            ok: false,
            mensaje: `Error interno`,
            err,
          });
        }

        if (!usuarioDB) {
          return res.json({
            ok: false,
            mensaje: `No se encontró un usuario con ese ID en la base de datos`,
          });
        }

        if (!req.body.nombre) {
          query.nombre = usuarioDB.nombre;
        }
        if (!req.body.apellido) {
          query.apellido = usuarioDB.apellido;
        }
        if (!req.body.telefono) {
          query.telefono = usuarioDB.telefono;
        }
        if (!req.body.identificacion) {
          query.identificacion = usuarioDB.identificacion;
        }
        if (!req.body.sucursal) {
          query.sucursal = usuarioDB.sucursal;
        }
        if (!req.body.role) {
          query.role = usuarioDB.role;
        }
        if (!req.body.correo) {
          query.correo = usuarioDB.correo;
        }

        workerModel.findByIdAndUpdate(
          id,
          query,
          { new: true },
          (err: CallbackError, usuarioDB: any) => {
            if (err) {
              return res.json({
                ok: false,
                mensaje: `Error interno`,
                err,
              });
            }

            usuarioDB.password = ";)";

            return res.json({
              ok: true,
              mensaje: `Usuario actualizado`,
              usuarioDB,
            });
          }
        );
      }
    );
  }

  eliminarUsuario(req: any, resp: Response): void {
    const id = new mongoose.Types.ObjectId(req.get("id"));

    workerModel.findByIdAndDelete(id, (err: any, usuarioDB: any) => {
      if (err) {
        return resp.json({
          ok: false,
          mensaje: "Error interno",
          err,
        });
      } else {
        return resp.json({
          ok: true,
          usuarioDB,
        });
      }
    });
  }

  obtenerUsuarios(req: any, resp: Response): void {
    workerModel
      .find({})
      .populate("sucursal")
      .populate("role")
      .exec((err: CallbackError, usuariosDB: Array<WorkerModelInterface>) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: "Error interno",
            err,
          });
        } else {
          return resp.json({
            ok: true,
            usuariosDB,
          });
        }
      });
  }

  loguearUsuario(req: Request, resp: Response): void {
    const correo = req.body.correo;
    const password = req.body.password;

    // Actualizar la fecha de login
    const fecha = moment().format("YYYY-MM-DD");

    workerModel.findOne(
      { correo: correo },
      (err: CallbackError, usuarioDB: WorkerModelInterface) => {
        // Error interno
        if (err) {
          return resp.json({
            ok: false,
            mensaje: `Error al Loguear Usuario`,
            err,
          });
        }

        // Verificar correo
        if (!usuarioDB) {
          return resp.json({
            ok: false,
            // mensaje: `Credenciales incorrectas - correo`
            mensaje: `Correo o Contraseña incorrectos`,
          });
        }

        // Verifica password
        if (!bcrypt.compareSync(password, usuarioDB.password)) {
          return resp.json({
            ok: false,
            // mensaje: `Credenciales incorrectas - password`
            mensaje: `Correo o Contraseña incorrectos`,
          });
        }

        const sumaLogin = usuarioDB.cantVisitas + 1;
        workerModel
          .findByIdAndUpdate(
            usuarioDB._id,
            { fecha_login: fecha, cantVisitas: sumaLogin },
            { new: true }
          )
          .populate("role")
          .exec((err: CallbackError, usuarioFechaDB: any) => {
            if (err) {
              resp.json({
                ok: false,
                mensaje: `Error al actualzar fecha de Login, intentelo más tarde`,
                err,
              });
            } else {
              // Crear token
              usuarioFechaDB.password = ":)";
              this.token = jwt.sign(
                { usuario: usuarioFechaDB },
                environmnet.SEED,
                { expiresIn: this.duracionToken }
              ); // Token válido por una hora 3600

              return resp.json({
                ok: true,
                mensaje: `Acceso correcto`,
                usuarioFechaDB,
                token: this.token,
              });
            }
          });
      }
    );
  }

  decodificarToken(req: any, resp: Response): void {
    const token = req.get("token");

    setTimeout(() => {
      // Comprobación del token
      jwt.verify(token, environmnet.SEED, async (err: any, decoded: any) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: `Token incorrecto`,
            err,
          });
        } else {
          const usuarioDB = await workerModel
            .findById(decoded.usuario._id)
            .populate("sucursal")
            .populate("role")
            .exec();

          if (!usuarioDB) {
            return resp.json({
              ok: false,
              mensaje: `Error interno`,
              usuarioDB,
            });
          }

          usuarioDB.password = ":)";

          return resp.json({
            ok: true,
            mensaje: `Token correcto`,
            // usuario: decoded.usuario,
            usuarioDB,
            token,
            iat: decoded.iat,
            exp: decoded.exp,
          });
        }
      });
    }, 500);
  }

  refrescarToken(req: Request, resp: Response): void {
    const idUsuario = req.body.idUsuario;

    workerModel.findById(
      idUsuario,
      (err: CallbackError, usuarioDB: WorkerModelInterface) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: `Error interno`,
            err,
          });
        }

        if (!usuarioDB) {
          return resp.json({
            ok: false,
            mensaje: `No existe un usuario ${idUsuario}`,
          });
        }

        // Crear token
        usuarioDB.password = ":)";
        this.token = jwt.sign({ usuario: usuarioDB }, environmnet.SEED, {
          expiresIn: this.duracionToken,
        }); // Token válido por un dia

        return resp.json({
          ok: true,
          mensaje: `Acceso correcto`,
          usuario: usuarioDB,
          token: this.token,
        });
      }
    );
  }

  // obtenerDistribucion(req: any, resp: Response): void {
  //   /*
  //     1. Buscar pedidos por etapa 1 con populate de asignado_a si existen obviamente
  //     2. Devolver todos los que tengan asignado_a
  //     3. Hacer map o filter regresando el usuario y sus pedidos asignados
  //    */

  //   pedidoModel
  //     .find({ etapa_pedido: 1 })
  //     .populate("asignado_a")
  //     .exec((err: any, pedidosDB: any) => {
  //       if (err) {
  //         return resp.json({
  //           ok: false,
  //           mensaje: "Error Interno",
  //         });
  //       }
  //       const mapPedidos = pedidosDB.map((pedidoMap: any) => {
  //         if (
  //           pedidoMap.asignado_a !== null &&
  //           pedidoMap.asignado_a !== undefined
  //         ) {
  //           return pedidoMap.asignado_a.nombre;
  //         }
  //       });

  //       const filterPedidos = mapPedidos.filter((pedidoFilter: any) => {
  //         return pedidoFilter !== undefined;
  //       });

  //       // console.log(filterPedidos);
  //       // console.log("===================================================");

  //       const counts: any = {};
  //       filterPedidos.forEach((x: any) => {
  //         counts[x] = (counts[x] || 0) + 1;
  //       });

  //       return resp.json({
  //         ok: true,
  //         distribucion: counts,
  //       });

  //       // return;
  //       // const mapPedidos = pedidosDB.map((pedidoMap: any) => {
  //       //   if (pedidoMap.asignado_a.nombre) {
  //       //     return pedidoMap.asignado_a.nombre;
  //       //   }
  //       // });

  //       // const filterPedidos = mapPedidos.filter((pedidoFilter: any) => {
  //       //   return pedidoFilter !== undefined;
  //       // });
  //       // // console.log("===================================================");

  //       // const counts: any = {};
  //       // filterPedidos.forEach((x: any) => {
  //       //   counts[x] = (counts[x] || 0) + 1;
  //       // });

  //       // return resp.json({
  //       //   ok: true,
  //       //   distribucion: counts,
  //       // });
  //     });
  // }
}
