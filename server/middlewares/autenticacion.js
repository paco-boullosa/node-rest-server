const jwt = require('jsonwebtoken');

// ============================
// Verificar token
// ============================
let verificaToken = (req, res, next) => {
    //para verificar el token se lee del header del request
    let token = req.get('token');

    jwt.verify(token, process.env.TOKEN_SEED, (err, decoded) => {
        //verifica sincronamente un token con una clave (semilla)
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }
        //el token es OK
        req.usuario = decoded.usuario;

        next(); //continua con la ejecución
    });
};


// ============================
// Valida AdminRole
// ============================
let validaAdminRole = (req, res, next) => {
    let usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Operación permitida solo para Administradores'
            }
        });
    }
};


// ============================
// Verifica token para imagen
// ============================
let verificaTokenImagen = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.TOKEN_SEED, (err, decoded) => {
        //verifica sincronamente un token con una clave (semilla)
        if (err) {
            return res.status(401).json({
                ok: false,
                err: { message: 'Token no válido' }
            });
        }
        //el token es OK
        req.usuario = decoded.usuario;
        next(); //continua con la ejecución
    });
}


module.exports = {
    verificaToken,
    validaAdminRole,
    verificaTokenImagen
}