const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
    values: ['USER_ROLE', 'ADMIN_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;

let usuariosSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    email: {
        type: String,
        unique: true, //no se permiten emails duplicados
        required: [true, 'El email es obligatorio']
    },
    password: {
        type: String,
        required: true
    },
    img: {
        type: String
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

//si queremos que la contraseñe no se devuelva por seguridad, hacemos lo siguiente:
usuariosSchema.methods.toJSON = function() {
    //se toma el esquema, se convierte a objeto y se elimina la propiedad password.
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
};

usuariosSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Usuario', usuariosSchema);