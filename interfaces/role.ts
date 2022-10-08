export interface RoleColModel {
  idCreador: string;
  nombre: string;
  estado: boolean;
  restricciones: Restricciones;
}

export interface Restricciones {
  sidebar: {
    catalogo: boolean;
    sucursales: boolean;
    colaboradores: boolean;
    clientes: boolean;
    categorias: boolean;
    productos: boolean;
    roles: boolean;
    origen: boolean;
    prioridad: boolean;
    etapas: boolean;
    colores: boolean;
    metodos: boolean;
  };
}
