const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            //no se encontró el usuario
            return res.status(400).json({
                ok: false,
                message: 'Usuario y/o contraseña incorrecto'
            });
        }
        //si llega aqui, el usuario existe. Ahora se comprueba si la contraseña es correcta.
        //Se utiliza una funcion de bcrypt que compara el hash de la password de la BD con el hash del pass enviado
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            //contraseña incorrecta
            return res.status(400).json({
                ok: false,
                message: 'Usuario y/o contraseña incorrecto'
            });
        }
        //todo OK => se genera el token
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_CADUCIDAD });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })
    });

})


module.exports = app;