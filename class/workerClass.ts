import { Response, Request } from "express";
import { CallbackError } from "mongoose";
import moment from "moment";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const mongoose = require("mongoose");
import { environmnet } from "../environment/environment";
import nodemailer from "nodemailer";
import * as google from "googleapis";
import mjml2html from "mjml";

// Interface
import { WorkerModelInterface } from "../interfaces/worker";

// Modelos
import workerModel from "../models/workerModel";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export class WorkkerClass {
  private token: string;
  private duracionToken = 36000;
  private duracionTokenRecuperarPass = 3600;

  constructor() {
    this.token = "";
  }

  async nuevaEmpresa(req: any, resp: Response): Promise<any> {
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const identificacion = req.body.identificacion;
    const telefono: string = req.body.telefono;
    const correo = req.body.correo;
    const password = bcrypt.hashSync("12345678", 10);
    const fecha_alta = moment().format("DD/MM/YYYY");
    const role = new mongoose.Types.ObjectId(req.body.role);
    const sucursal = new mongoose.Types.ObjectId(req.body.sucursal);
    const empresa = true;

    const objError = {
      mensaje: "",
    };

    const nuevoEmpresa = new workerModel({
      nombre,
      apellido,
      identificacion,
      telefono,
      correo,
      password,
      fecha_alta,
      role,
      sucursal,
      empresa,
    });

    nuevoEmpresa.save((err: CallbackError, usuarioDB: WorkerModelInterface) => {
      if (err) {
        objError.mensaje = err.message;
        return resp.json({
          ok: false,
          mensaje: `No se pudo guardar el usuario la DB`,
          err: objError,
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

  async nuevoUsuario(req: any, resp: Response): Promise<any> {
    const foranea = new mongoose.Types.ObjectId(req.body.foranea);
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const identificacion = req.body.identificacion;
    const telefono: string = req.body.telefono;
    const correo = req.body.correo;
    const password = bcrypt.hashSync("12345678", 10);
    const fecha_alta = moment().format("DD/MM/YYYY");
    const role = new mongoose.Types.ObjectId(req.body.role);
    const sucursal = new mongoose.Types.ObjectId(req.body.sucursal);

    const objError = {
      mensaje: "",
    };

    const nuevoUsuario = new workerModel({
      // idCreador,
      foranea,
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
        objError.mensaje = err.message;
        return resp.json({
          ok: false,
          mensaje: `No se pudo guardar el usuario la DB`,
          err: objError,
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
    const _id = new mongoose.Types.ObjectId(req.get("id"));
    // const foranea = new mongoose.Types.ObjectId(req.get("foranea"));

    const query = {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      identificacion: req.body.identificacion,
      correo: req.body.correo,
      telefono: req.body.telefono,
      sucursal: new mongoose.Types.ObjectId(req.body.sucursal),
      role: new mongoose.Types.ObjectId(req.body.role),
      estado: req.body.estado,
      empresa: req.body.empresa,
      avatar: req.body.avatar,
    };

    const objError = {
      mensaje: "",
    };

    workerModel.findOne(
      { _id },
      (err: CallbackError, usuarioDB: WorkerModelInterface) => {
        if (err) {
          objError.mensaje = err.message;
          return res.json({
            ok: false,
            mensaje: `Error interno`,
            err,
          });
        }

        if (!usuarioDB) {
          objError.mensaje = `No se encontró un usuario con ese ID en la base de datos`;
          return res.json({
            ok: false,
            err: objError.mensaje,
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
        if (!req.body.avatar) {
          query.avatar = usuarioDB.avatar;
        }

        workerModel.findOneAndUpdate(
          { _id },
          query,
          { new: true },
          (err: CallbackError, usuarioDB: any) => {
            if (err) {
              objError.mensaje = err.message;
              return res.json({
                ok: false,
                mensaje: `Error interno`,
                err: objError,
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

  editarPassword(req: any, res: Response): void {
    const _id = new mongoose.Types.ObjectId(req.body.id);

    const query = {
      password: bcrypt.hashSync(req.body.password, 10),
      reset_pass: false,
    };

    const objError = {
      mensaje: "",
    };

    workerModel.findOneAndUpdate(
      { _id },
      query,
      { new: true },
      (err: CallbackError, usuarioDB: any) => {
        if (err) {
          objError.mensaje = err.message;
          return res.json({
            ok: false,
            mensaje: `Error interno`,
            err: objError,
          });
        }

        usuarioDB.password = ";)";

        return res.json({
          ok: true,
          mensaje: `contraseña actualizada`,
          usuarioDB,
        });
      }
    );
  }

  recuperarPassword(req: any, resp: Response): void {
    const correo = req.body.correo;

    const objError = {
      mensaje: "",
    };

    workerModel.findOneAndUpdate(
      { correo },
      { reset_pass: true },
      { new: true },
      (err: any, usuarioDB: any) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: "Error interno",
            err,
          });
        } else {
          // Crear token
          usuarioDB.password = ":)";
          const token = jwt.sign({ usuario: usuarioDB }, environmnet.SEED, {
            expiresIn: this.duracionTokenRecuperarPass,
          }); // Token válido por una hora 3600

          const data = {
            pathRecuperarPass: `https://angie-platform.com/#/recuperar-password?token=${token}`,
            correoUsuario: usuarioDB.correo,
          };

          const CLIENTID: string =
            "521016425534-hqfptiq60j1egd3n97194r14m6fu4au0.apps.googleusercontent.com";
          const CLIENTSECRET: string = "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";
          const REDIRECTURI: string =
            "https://developers.google.com/oauthplayground";
          const REFRESHTOKEN: string =
            "1//04MAGNKFnJ-_WCgYIARAAGAQSNwF-L9IriHfR0tn0vIGh9z42Dn5Rl-dt6tIzZ7o_tnATz2dWH_n0cq_2sGCM-DGF3luLxNPgH9c";

          const oAuth2Client = new google.Auth.OAuth2Client({
            clientId: CLIENTID,
            clientSecret: CLIENTSECRET,
            redirectUri: REDIRECTURI,
          });

          oAuth2Client.setCredentials({ refresh_token: REFRESHTOKEN });

          const sendMail = async () => {
            try {
              const accessToken: any = await oAuth2Client.getAccessToken();

              let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                auth: {
                  type: "OAuth2",
                  user: "roserodevmail@gmail.com",
                  clientId: CLIENTID,
                  clientSecret: CLIENTSECRET,
                  refreshToken: REFRESHTOKEN,
                  accessToken: accessToken,
                },
                tls: {
                  rejectUnauthorized: false,
                },
              });

              const mailOptions: SMTPTransport.Options = {
                from: "BRAND <brand@brand.com>",
                to: `${data.correoUsuario}`,
                // to: `jomaromu2@gmail.com`,
                subject: "Recuperación contraseña",
                html: this.plantillaHTMLRecuperacionPassword(data),
              };

              return await transporter.sendMail(mailOptions);
            } catch (err) {
              return err;
            }
          };

          sendMail()
            .then((res) => {
              return resp.json({
                ok: true,
              });
            })
            .catch((errr) => {
              objError.mensaje =
                "Error al enviar la solicitúd, intente más tarde";
              resp.json({
                ok: false,
                err: objError,
              });
            });
        }
      }
    );
  }

  eliminarUsuario(req: any, resp: Response): void {
    const id = new mongoose.Types.ObjectId(req.get("id"));
    const foranea = new mongoose.Types.ObjectId(req.get("foranea"));

    const objError = {
      mensaje: "",
    };

    workerModel.findOneAndDelete(
      { id, foranea },
      (err: CallbackError, usuarioDB: any) => {
        if (err) {
          objError.mensaje = err.message;
          return resp.json({
            ok: false,
            mensaje: "Error interno",
            err: objError,
          });
        } else {
          return resp.json({
            ok: true,
            usuarioDB,
          });
        }
      }
    );
  }

  obtenerUsuarios(req: any, resp: Response): void {
    const foranea = new mongoose.Types.ObjectId(req.get("foranea"));
    const _id = new mongoose.Types.ObjectId(req.usuario._id);
    const objError = {
      mensaje: "",
    };

    workerModel
      .find({ $or: [{ foranea }, { _id }] })
      .populate("sucursal")
      .populate("role")
      .exec((err: CallbackError, usuariosDB: Array<WorkerModelInterface>) => {
        if (err) {
          objError.mensaje = err.message;
          return resp.json({
            ok: false,
            mensaje: "Error interno",
            err: objError,
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
    const fecha = moment().format("DD/MM/YYYY");

    const objError = {
      mensaje: "",
    };

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
          .exec((err: CallbackError, usuarioDB: any) => {
            if (err) {
              resp.json({
                ok: false,
                mensaje: `Error al actualzar fecha de Login, intentelo más tarde`,
                err,
              });
            } else {
              // Crear token
              usuarioDB.password = ":)";
              this.token = jwt.sign({ usuario: usuarioDB }, environmnet.SEED, {
                expiresIn: this.duracionToken,
              }); // Token válido por una hora 3600

              return resp.json({
                ok: true,
                mensaje: `Acceso correcto`,
                usuarioDB,
                token: this.token,
              });
            }
          });
      }
    );
  }

  decodificarToken(req: any, resp: Response): void {
    const token = req.get("token");

    const objError = {
      mensaje: "",
    };

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
            .populate({
              path: "role",
              model: "roleColaborador",
              populate: {
                path: "restricciones.pedido.informacion.etapa.disponibles",
                model: "etapas",
              },
            })
            .populate({
              path: "role",
              model: "roleColaborador",
              populate: {
                path: "restricciones.pedido.informacion.estado.disponibles",
                model: "colores",
              },
            })
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

    const objError = {
      mensaje: "",
    };

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

  async obtenerDistribucion(req: any, resp: Response): Promise<any> {
    const foranea = new mongoose.Types.ObjectId(req.get("foranea"));
    const objError = {
      mensaje: "",
    };

    const distDB = await workerModel.aggregate([
      {
        $lookup: {
          from: "rolecolaboradors",
          localField: "role",
          foreignField: "_id",
          as: "roles",
        },
      },
      {
        $lookup: {
          from: "pedidos",
          localField: "_id",
          foreignField: "diseniador",
          as: "pedidos",
          pipeline: [
            {
              $count: "pedidos",
            },
          ],
        },
      },
      {
        $unwind: { path: "$pedidos", preserveNullAndEmptyArrays: true },
      },
      {
        $match: { "roles.diseniador": true, foranea },
      },
    ]);

    if (!distDB) {
      return resp.json({
        ok: false,
        mensaje: "Error al obtener la distribución",
      });
    } else {
      return resp.json({
        ok: true,
        distDB,
      });
    }
  }

  plantillaHTMLRecuperacionPassword(data: any): string {
    return mjml2html(`<mjml>
    <mj-body background-color="#ffffff">
      
      <!-- titulo -->
      <mj-section full-width="full-width" background-color="#00b19d">
        <mj-column>
          <mj-text font-family="Helvetica" color="#ffffff">
            <h1 align="center">Solicitúd de recuperación de contraseña</h1>
            <p style="line-height: 1.5; font-size: 16" align="center">Se ha realizado un petición para cambio de 						contraseña. Si no fue usted quien hizo esta petición, por favor omita este mensaje,</p>
          </mj-text>
        </mj-column>
      </mj-section>
      
          <!-- cuerpo -->
      <mj-section full-width="full-width" background-color="#00b19d">
        <mj-column>
          <mj-text font-family="Helvetica" color="#ffffff">
            <p style="line-height: 1.5; font-size: 16" align="center">Si la petición fue realizada por usted, haga 						clic en el siguiente botón para recuperación de la misma.</p>
          </mj-text>
          <mj-button href="${data.pathRecuperarPass}" font-family="Helvetica" background-color="#f45e43" color="white">
            Recuperar contraseña
           </mj-button>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>`).html;
  }
}
