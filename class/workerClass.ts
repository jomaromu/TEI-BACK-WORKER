import { Response, Request } from "express";
import { CallbackError } from "mongoose";
import { nanoid } from "nanoid";
import moment from "moment";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const mongoose = require("mongoose");
import { environmnet } from "../environment/environment";

// Interface
import { WorkerModelInterface } from "../interfaces/worker";
import { Historial } from "./../interfaces/historial";

// Modelos
import workerModel from "../models/workerModel";
import pedidoModel from "../models/pedidoModel";
import historialModel from "../models/historialModel";

// Funciones
import { evaluaRole } from "../functions/nivelWorker";
// import { castEstado } from '../functions/castEstado';

export class WorkkerClass {
  private idRef: string;
  private pathIds = `workderIDs.json`;
  private token: string;

  constructor() {
    this.idRef = nanoid(10);
    this.token = "";
  }

  //  Crear un usuario super
  async nuevoUsuarioSuper(req: Request, resp: Response): Promise<any> {
    const email = req.body.correo;
    const pass = req.body.password;
    const role = req.body.colaborador_role;

    if (!email || !pass || !role) {
      return resp.json({
        ok: false,
        mensaje: `Necesita llenar al menos correo, password y role`,
      });
    } else {
      if (
        email === environmnet.emailSuper &&
        pass === environmnet.passSuper &&
        role === environmnet.colaborador_role
      ) {
        const nombre: string = req.body.nombre;
        const apellido: string = req.body.apellido;
        const identificacion: string = req.body.identificacion;
        const telefono: string = req.body.telefono;
        const correo: string = req.body.correo;
        const password: string = bcrypt.hashSync(req.body.password, 10);
        const fecha_alta: string = moment().format("MMM Do YY");
        const colaborador_role: string = req.body.colaborador_role;
        const sucursal = req.body.sucursal;

        const nuevoUsuario = new workerModel({
          idReferencia: this.idRef,
          nombre: nombre,
          apellido: apellido,
          identificacion: identificacion,
          telefono: telefono,
          correo: correo,
          password: password,
          fecha_alta: fecha_alta,
          colaborador_role: colaborador_role,
          sucursal: sucursal,
        });

        // console.log(nombre);

        // return;
        // Insertar usuario en la DB
        nuevoUsuario.save(
          (err: CallbackError, usuarioDB: WorkerModelInterface) => {
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
          }
        );
      }
    }
  }

  //  Crear un usuario
  async nuevoUsuario(req: Request, resp: Response): Promise<any> {
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const identificacion = req.body.identificacion;
    const telefono: string = req.body.telefono;
    const correo = req.body.correo;
    const password = bcrypt.hashSync(req.body.password, 10);
    const fecha_alta = moment().format("MMM Do YY");
    const colaborador_role = req.body.colaborador_role;
    const sucursal = req.body.sucursal;

    const nuevoUsuario = new workerModel({
      idReferencia: this.idRef,
      nombre: nombre,
      apellido: apellido,
      identificacion: identificacion,
      telefono: telefono,
      correo: correo,
      password: password,
      fecha_alta: fecha_alta,
      colaborador_role: colaborador_role,
      sucursal: sucursal,
    });

    // console.log(nombre);

    // return;
    // Insertar usuario en la DB
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

  // Editar un usuario
  editarUsuario(req: any, res: Response): void {
    const id = req.get("id") || "";
    const colaborador_role = req.get("colaborador_role") || "";

    // const permitidas: Array<any> = req.body.permitidas;

    const datosNuevos = {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      telefono: req.body.telefono,
      sucursal: req.body.sucursal,
      estado: req.body.estado,
      identificacion: req.body.identificacion,
      colaborador_role: colaborador_role,
      correo: req.body.correo,
      // permitidas
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

        // console.log(permitidas);

        // return;
        // const mapPermitidos = permitidas.map(permitida => {

        //     if (permitida !== null) {

        //         if (permitida.check === false || !permitida) {
        //             permitida = null;
        //             return permitida;
        //         } else {
        //             return permitida.id;
        //         }
        //     }

        // });

        // const filterPermitida = mapPermitidos.filter(permitida => {
        //     return permitida !== undefined;
        // });

        // console.log(filterPermitida);

        // datosNuevos.permitidas = filterPermitida;

        // if (req.usuario.correo === usuarioDB.correo) {

        //     return res.json({
        //         ok: false,
        //         mensaje: `No puede editar su mismo usuario`
        //     });
        // }

        // return;
        if (!req.body.nombre) {
          datosNuevos.nombre = usuarioDB.nombre;
        }
        if (!req.body.apellido) {
          datosNuevos.apellido = usuarioDB.apellido;
        }
        if (!req.body.telefono) {
          datosNuevos.telefono = usuarioDB.telefono;
        }
        if (!req.body.sucursal) {
          datosNuevos.sucursal = usuarioDB.sucursal;
        }
        if (!req.body.estado) {
          datosNuevos.estado = usuarioDB.estado;
        }
        if (!req.body.correo) {
          datosNuevos.correo = usuarioDB.correo;
        }
        if (!req.get("colaborador_role")) {
          datosNuevos.colaborador_role = usuarioDB.colaborador_role;
        }

        workerModel.findByIdAndUpdate(
          id,
          datosNuevos,
          { new: true },
          (err: CallbackError, usuarioDBActualizado: any) => {
            if (err) {
              return res.json({
                ok: false,
                mensaje: `Error interno`,
                err,
              });
            }

            if (!usuarioDBActualizado) {
              return res.json({
                ok: false,
                mensaje: `No se encontró un usuario con ese ID en la base de datos`,
              });
            }

            usuarioDBActualizado.password = ";)";

            return res.json({
              ok: true,
              mensaje: `Usuario actualizado`,
              usuarioDBActualizado,
            });
          }
        );
      }
    );
  }

  // Editar perfil
  EditarPefil(req: any, res: Response): any {
    const correoToken: string = req.usuario.correo;
    const id: any = req.usuario._id;

    const estado: boolean = req.get("estado");
    // const estado: boolean = castEstado(estadoHeader);

    const query = {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      telefono: req.body.telefono,
      correo: req.body.correo,
      password: req.body.password,
      estado: estado,
    };

    workerModel.findOne(
      { correo: correoToken, _id: id },
      (err: CallbackError, workerDB: WorkerModelInterface) => {
        if (err) {
          return res.json({
            ok: false,
            mensaje: `Error interno`,
            err,
          });
        }

        if (!workerDB) {
          return res.json({
            ok: false,
            mensaje: `No se encontró un usuario`,
          });
        }

        if (!query.nombre) {
          query.nombre = workerDB.nombre;
        }

        if (!query.apellido) {
          query.apellido = workerDB.apellido;
        }

        if (!query.telefono) {
          query.telefono = workerDB.telefono;
        }

        if (!query.correo) {
          query.correo = workerDB.correo;
        }

        if (!query.estado) {
          query.estado = workerDB.estado;
        }

        if (!query.password) {
          query.password = workerDB.password;
        } else {
          query.password = bcrypt.hashSync(req.body.password, 10);
        }

        // return;

        workerModel.findOneAndUpdate(
          { correo: correoToken, _id: id },
          query,
          { new: true },
          (err: CallbackError, workerActualizadoDB: any) => {
            if (err) {
              return res.json({
                ok: false,
                mensaje: `Error interno`,
                err,
              });
            }

            return res.json({
              ok: true,
              mensaje: `Usuario actualizado`,
              workerActualizadoDB,
            });
          }
        );
      }
    );
  }

  // Obtener usuario por ID
  obtenerUsuarioID(req: any, res: Response): void {
    const id = req.get("id") || "";

    workerModel.findById(id, (err: CallbackError, usuario: any) => {
      if (err) {
        return res.json({
          ok: false,
          mensaje: `Error al búscar Usuario o no existe`,
          err,
        });
      }

      if (!usuario) {
        return res.json({
          ok: false,
          mensaje: `No existe el Usuario en la base de datos`,
        });
      }

      return res.json({
        ok: true,
        usuario,
      });

      // const resultado = evaluaRole(req.usuario.colaborador_role, usuario.colaborador_role);

      // if (resultado === 0) {

      //     return res.json({
      //         ok: false,
      //         mensaje: `No está autorizado para realizar esta operación`
      //     });

      // } else if (resultado === 1) {

      //     return res.json({
      //         ok: true,
      //         usuario
      //     });
      // }
    });
  }

  // Obtener usuario por ID Referencia
  obtenerUsuarioIDRef(req: any, res: Response): void {
    const idReferencia = req.get("idReferencia");

    workerModel.findOne(
      { idReferencia: idReferencia },
      (err: CallbackError, usuarioDB: any) => {
        if (err) {
          return res.json({
            ok: false,
            mensaje: `Error al búscar Usuario o no existe`,
            err,
          });
        }

        if (!usuarioDB) {
          return res.json({
            ok: false,
            mensaje: `No existe el Usuario en la base de datos`,
          });
        }

        const resultado = evaluaRole(
          req.usuario.colaborador_role,
          usuarioDB.colaborador_role
        );

        if (resultado === 0) {
          return res.json({
            ok: false,
            mensaje: `No está autorizado para realizar esta operación`,
          });
        } else if (resultado === 1) {
          return res.json({
            ok: true,
            usuarioDB,
          });
        }
      }
    );
  }

  // Obtener usuario por Teléfono
  obtenerUsuarioTel(req: any, res: Response): void {
    const telefono: string = req.get("telefono");

    workerModel.findOne(
      { telefono: telefono },
      (err: CallbackError, usuarioDB: any) => {
        if (err) {
          return res.json({
            ok: false,
            mensaje: `Error al búscar Usuario o no existe`,
            err,
          });
        }

        if (!usuarioDB) {
          return res.json({
            ok: false,
            mensaje: `No existe el Usuario en la base de datos`,
          });
        }

        const resultado = evaluaRole(
          req.usuario.colaborador_role,
          usuarioDB.colaborador_role
        );

        if (resultado === 0) {
          return res.json({
            ok: false,
            mensaje: `No está autorizado para realizar esta operación`,
          });
        } else if (resultado === 1) {
          return res.json({
            ok: true,
            usuarioDB,
          });
        }
      }
    );
  }

  // Obtener usuarios por role
  obtenerUsuariosRole(req: any, res: Response): void {
    // const estadoHeader: string = req.get('estado');
    // const estado: boolean = castEstado(estadoHeader);

    const role = req.get("role");

    workerModel.find(
      { colaborador_role: role },
      (err: CallbackError, usuariosDB: Array<WorkerModelInterface>) => {
        // , { estado: estado }]

        if (err) {
          return res.json({
            ok: false,
            mensaje: `Error interno`,
            err,
          });
        }

        if (!usuariosDB || usuariosDB.length === 0) {
          return res.json({
            ok: false,
            mensaje: `No existen usuarios con ese criterio de búsqueda`,
            usuariosDB,
          });
        }

        return res.json({
          ok: true,
          usuariosDB,
          cantidad: usuariosDB.length,
        });

        // const resultado = evaluaRole(req.usuario.colaborador_role, role);

        // if (resultado === 0) {

        //     return res.json({
        //         ok: false,
        //         mensaje: `No está autorizado para realizar esta operación`
        //     });

        // } else if (resultado === 1) {

        //     return res.json({
        //         ok: true,
        //         usuariosDB,
        //         cantidad: usuariosDB.length
        //     });
        // }
      }
    );
  }

  // Obtener usuarios por criterio nombre
  obtenerUsuarioCriterioNombre(req: any, res: Response): void {
    const estado: boolean = req.get("estado");
    // const estado: boolean = castEstado(estadoHeader);

    const criterioNombre = req.body.criterioNombre;
    const criterio = req.get("criterio");
    const regExpCrit = RegExp(criterio, "i");

    // console.log(regExpCrit);

    // /^[a-zA-ZáéíóúÁÉÍÓU]+$/
    // , estado: estado

    workerModel.find(
      { nombre: regExpCrit, colaborador_role: { $nin: ["SuperRole"] } },
      (err: CallbackError, usuariosDB: Array<WorkerModelInterface>) => {
        if (err) {
          return res.json({
            ok: false,
            mensaje: `Error interno`,
            err,
          });
        }

        if (!usuariosDB || usuariosDB.length === 0) {
          return res.json({
            ok: false,
            mensaje: `No existen usuarios con ese criterio de búsqueda`,
            usuariosDB,
          });
        }

        const usuarios = usuariosDB.filter((usuario) => {
          const roleDB = usuario.colaborador_role;
          const roleToken = req.usuario.colaborador_role;

          const resultado = evaluaRole(roleToken, roleDB);

          if (resultado === 1) {
            return usuario;
          }
        });

        return res.json({
          ok: true,
          usuarios,
          cantidad: usuarios.length,
        });
      }
    );
  }

  // Obtener usuarios por sucursal
  obtenerUsuariosSucursal(req: any, res: Response): void {
    const estado: boolean = req.get("estado");
    // const estado: boolean = castEstado(estadoHeader);

    const sucursal = req.get("sucursal");
    const id = req.usuario._id;

    workerModel.find(
      { $and: [{ sucursal: sucursal }, { estado: estado }] },
      (err: CallbackError, usuariosDB: Array<WorkerModelInterface>) => {
        if (err) {
          return res.json({
            ok: false,
            mensaje: `Error interno`,
            err,
          });
        }

        if (!usuariosDB || usuariosDB.length === 0) {
          return res.json({
            ok: false,
            mensaje: `No existen usuarios con ese criterio de búsqueda`,
            usuariosDB,
          });
        }

        const usuarios = usuariosDB.filter((usuario) => {
          const roleDB = usuario.colaborador_role;
          const roleToken = req.usuario.colaborador_role;

          const resultado = evaluaRole(roleToken, roleDB);

          if (resultado === 1) {
            return usuario;
          }
        });

        return res.json({
          ok: true,
          usuarios,
          cantidad: usuarios.length,
        });
      }
    );
  }

  // Obtener usuario por sucursal
  obtenerUsuarioSucursal(req: any, res: Response): void {
    const sucursal = req.get("sucursal");
    const idUsuario = req.get("idUsuario");

    workerModel.findOne(
      { sucursal: sucursal, _id: idUsuario },
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
            mensaje: `No existen usuarios con ese criterio de búsqueda`,
          });
        }

        const resultado = evaluaRole(
          req.usuario.colaborador_role,
          usuarioDB.colaborador_role
        );

        if (resultado === 0) {
          return res.json({
            ok: false,
            mensaje: `No está autorizado para realizar esta operación`,
          });
        } else if (resultado === 1) {
          return res.json({
            ok: true,
            usuarioDB,
          });
        }
      }
    );
  }

  // Obtener todos los usuarios
  obtenerTodosUsuarios(req: any, res: Response): void {
    const estado: boolean = req.get("estado");
    // const estado: boolean = castEstado(estadoHeader);

    const id = req.usuario._id;

    workerModel.find(
      { $and: [{ _id: { $ne: id }, colaborador_role: { $ne: "SuperRole" } }] },
      (err: CallbackError, usuariosDB: Array<WorkerModelInterface>) => {
        // { estado: estado }

        if (err) {
          return res.json({
            ok: false,
            mensaje: `Error Interno`,
            err,
          });
        }

        if (!usuariosDB) {
          return res.json({
            ok: false,
            mensaje: `No se encontraron Usuarios en la Base de datos`,
          });
        }

        const usuarios = usuariosDB.filter((usuario) => {
          const roleDB = usuario.colaborador_role;
          const roleToken = req.usuario.colaborador_role;

          const resultado = evaluaRole(roleToken, roleDB);

          if (resultado === 1) {
            return usuario;
          }
        });

        return res.json({
          ok: true,
          usuarios: usuariosDB,
          cantidad: usuariosDB.length,
        });
      }
    );
  }

  // Eliminar un usuario
  eliminarUsuario(req: Request, res: Response): void {
    const id = req.get("id") || "";

    workerModel.findByIdAndDelete(
      id,
      {},
      (err: CallbackError, usuarioEliminadoDB: any) => {
        if (err) {
          return res.json({
            ok: false,
            mensaje: "Erro interno",
            err,
          });
        }

        if (!usuarioEliminadoDB) {
          return res.json({
            ok: false,
            mensaje: `No se encontró Usuario con este ID`,
          });
        }

        return res.json({
          ok: true,
          mensaje: `Usuario eliminado`,
          usuarioEliminadoDB,
        });
      }
    );
  }

  // Loguear Usuario
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
        workerModel.findByIdAndUpdate(
          usuarioDB._id,
          { fecha_login: fecha, cantVisitas: sumaLogin },
          { new: true },
          (err: CallbackError, usuarioFechaDB: any) => {
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
                { expiresIn: 3600 }
              ); // Token válido por una hora 3600

              return resp.json({
                ok: true,
                mensaje: `Acceso correcto`,
                usuarioFechaDB,
                token: this.token,
              });
            }
          }
        );
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
          const usuario = await workerModel
            .findById(decoded.usuario._id)
            .populate("sucursal")
            .exec();

          if (!usuario) {
            return resp.json({
              ok: false,
              mensaje: `Error interno`,
              usuario,
            });
          }

          usuario.password = ":)";

          return resp.json({
            ok: true,
            mensaje: `Token correcto`,
            // usuario: decoded.usuario,
            usuario: usuario,
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
          expiresIn: 86400,
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

  async cargarUsuariosSucursalRole(req: any, resp: Response): Promise<any> {
    const role = req.get("role");
    const sucursal = req.get("sucursal");
    const match: any = {
      $match: {},
    };

    if (role !== "null" && sucursal === "null") {
      switch (role) {
        case "prod":
          match.$match = {
            $or: [
              { colaborador_role: "ProduccionVIPRole" },
              { colaborador_role: "ProduccionNormalRole" },
            ],
          };
          break;
        case "vend":
          match.$match = {
            $or: [
              { colaborador_role: "VendedorVIPRole" },
              { colaborador_role: "VendedorNormalRole" },
            ],
          };
          break;
        case "dise":
          match.$match = { colaborador_role: "DiseniadorRole" };
          break;
        case "admin":
          match.$match = { colaborador_role: "AdminRole" };
          break;
      }
    }

    if (role === "null" && sucursal !== "null") {
      match.$match = { sucursal: new mongoose.Types.ObjectId(sucursal) };
    }

    if (sucursal !== "null" && role !== "null") {
      switch (role) {
        case "prod":
          match.$match = {
            $and: [
              {
                $or: [
                  { colaborador_role: "ProduccionVIPRole" },
                  { colaborador_role: "ProduccionNormalRole" },
                ],
              },
              { sucursal: new mongoose.Types.ObjectId(sucursal) },
            ],
          };
          break;
        case "vend":
          match.$match = {
            $and: [
              {
                $or: [
                  { colaborador_role: "VendedorVIPRole" },
                  { colaborador_role: "VendedorNormalRole" },
                ],
              },
              { sucursal: new mongoose.Types.ObjectId(sucursal) },
            ],
          };
          break;
        case "dise":
          match.$match = {
            colaborador_role: "DiseniadorRole",
            sucursal: new mongoose.Types.ObjectId(sucursal),
          };
          break;
        case "admin":
          match.$match = {
            colaborador_role: "AdminRole",
            sucursal: new mongoose.Types.ObjectId(sucursal),
          };
          break;
      }
    }

    if (sucursal === "null" && role === "null") {
      match.$match = {
        $or: [
          { colaborador_role: "ProduccionVIPRole" },
          { colaborador_role: "ProduccionNormalRole" },
          { colaborador_role: "VendedorVIPRole" },
          { colaborador_role: "VendedorNormalRole" },
          { colaborador_role: "DiseniadorRole" },
          { colaborador_role: "AdminRole" },
        ],
      };
    }

    const usuariosDB = await workerModel.aggregate([
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "DiseniadorSucursal",
        },
      },
      match,
    ]);

    if (usuariosDB) {
      return resp.json({
        ok: true,
        usuariosDB,
      });
    }
  }

  obtenerDistribucion(req: any, resp: Response): void {
    /*
      1. Buscar pedidos por etapa 1 con populate de asignado_a si existen obviamente
      2. Devolver todos los que tengan asignado_a
      3. Hacer map o filter regresando el usuario y sus pedidos asignados
     */

    pedidoModel
      .find({ etapa_pedido: 1 })
      .populate("asignado_a")
      .exec((err: any, pedidosDB: any) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: "Error Interno",
          });
        }
        const mapPedidos = pedidosDB.map((pedidoMap: any) => {
          if (
            pedidoMap.asignado_a !== null &&
            pedidoMap.asignado_a !== undefined
          ) {
            return pedidoMap.asignado_a.nombre;
          }
        });

        const filterPedidos = mapPedidos.filter((pedidoFilter: any) => {
          return pedidoFilter !== undefined;
        });

        // console.log(filterPedidos);
        // console.log("===================================================");

        const counts: any = {};
        filterPedidos.forEach((x: any) => {
          counts[x] = (counts[x] || 0) + 1;
        });

        return resp.json({
          ok: true,
          distribucion: counts,
        });

        // return;
        // const mapPedidos = pedidosDB.map((pedidoMap: any) => {
        //   if (pedidoMap.asignado_a.nombre) {
        //     return pedidoMap.asignado_a.nombre;
        //   }
        // });

        // const filterPedidos = mapPedidos.filter((pedidoFilter: any) => {
        //   return pedidoFilter !== undefined;
        // });
        // // console.log("===================================================");

        // const counts: any = {};
        // filterPedidos.forEach((x: any) => {
        //   counts[x] = (counts[x] || 0) + 1;
        // });

        // return resp.json({
        //   ok: true,
        //   distribucion: counts,
        // });
      });
  }

  historialDB(req: any, resp: Response): void {
    const idUsuario = req.body.idUsuario;

    historialModel.findOne(
      { idUsuario },
      (err: any, historialDB: Historial) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: "Error interno",
            err,
          });
        }

        if (!historialDB) {
          this.crearHistorialBusqueda(req, resp);
        } else {
          this.actualizarHistorial(req, resp);
        }
      }
    );
  }

  crearHistorialBusqueda(req: any, resp: Response): void {
    const idUsuario = req.body.idUsuario; // tipo o null
    const bandeja = req.body.bandeja; // tipo o null
    const sucursal = req.body.sucursal; // id o null
    const usuario = req.body.usuario; // id o null

    const crarHistorial = new historialModel({
      idUsuario,
      bandeja,
      sucursal,
      usuario,
    });

    crarHistorial.save((err: CallbackError, historialDB: Historial) => {
      if (err) {
        return resp.json({
          ok: false,
          err,
          mensaje: "No se creó el historial",
        });
      } else {
        return resp.json({
          ok: true,
          mensaje: "Historial creado",
          historialDB,
        });
      }
    });
  }

  actualizarHistorial(req: any, resp: Response): void {
    const idUsuario = new mongoose.Types.ObjectId(req.body.idUsuario); //
    const bandeja = req.body.bandeja; // tipo o null
    let sucursal = req.body.sucursal; // id o null
    let usuario = req.body.usuario; // id o null

    historialModel.findOneAndUpdate(
      {
        idUsuario: idUsuario,
      },
      { bandeja: bandeja, sucursal: sucursal, usuario: usuario },
      { new: true },
      (err: any, historialDB: any) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: "Error al actualizar historial",
            err,
          });
        }

        if (!historialDB) {
          return resp.json({
            ok: true,
            mensaje: "No se encontró historial",
          });
        }

        return resp.json({
          ok: true,
          mensaje: "historial encontrado",
          historialDB,
        });
      }
    );
  }

  obtenerHistorial(req: any, resp: Response): void {
    // const idUsuario = new mongoose.Types.ObjectId(req.body.idUsuario);
    const idUsuario = req.get("idUsuario");

    // console.log(idUsuario);

    historialModel.findOne({ idUsuario }, (err: any, historialDB: any) => {
      if (err) {
        return resp.json({
          ok: false,
          mensaje: "Error al actualizar historial",
          err,
        });
      }

      if (!historialDB) {
        return resp.json({
          ok: true,
          mensaje: "No se encontró historial",
        });
      }

      return resp.json({
        ok: true,
        mensaje: "historial encontrado",
        historialDB,
      });
    });
  }
}

// Interfaz para manejar los datos del archivo usuariosIDs.json
interface Archivo {
  ids: Array<string>;
}

interface RespPromise {
  ok: boolean;
  data: string;
}
