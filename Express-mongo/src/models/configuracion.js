const mongoose = require("mongoose");
const { text } = require("pdfkit");

const configuracionSchema = mongoose.Schema({
    rol: [
        {
            nombre_rol: {
                type: String,
                required: true
            },
            estado_rol: {
                type: Boolean,
                required: true
            }
        }
    ],
    permisos: [
        {
            nombre_permiso: {
                type: String,
                required: true
            },
            estado_permiso: {
                type: Boolean,
                required: true
            }
        }
    ],
    nombre: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true
    },
    documento: {
        type: Number,
        required: true
    },
    contraseña: {
        type: String,
        required: true
    },
    estado_usuario: {
        type: Boolean,
        required: true
    }
});

const ConfiguracionModel = mongoose.model('gestion_configuracion', configuracionSchema, 'gestion_configuracion');

module.exports = ConfiguracionModel;
