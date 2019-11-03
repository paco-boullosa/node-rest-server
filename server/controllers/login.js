const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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


// Google sign in -  token
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    // si no salio por el catch -> el usuario esta identificado correctamente con google
    // pasos:
    // 1: verificar si no existe el email en la BD
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        };
        if (usuarioDB) {
            // el usuario existe
            if (usuarioDB.google === false) {
                // el usuario se creó sin las credenciales de google, es decir, creando su propio email y contraseña
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticacion normal porque su usuario tiene credenciales normales'
                    }
                })
            } else {
                // es un usuario que se dió de alta con las credenciales de google => renovar su token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_CADUCIDAD });
                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        } else {
            // el usuario NO existe en la BD ==> nueva alta
            let usuarioNUEVO = new Usuario();
            usuarioNUEVO.nombre = googleUser.nombre;
            usuarioNUEVO.email = googleUser.email;
            usuarioNUEVO.img = googleUser.img;
            usuarioNUEVO.google = true;
            usuarioNUEVO.password = 'No hace falta';

            usuarioNUEVO.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                };
                // se crea su token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_CADUCIDAD });
                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    })
});


module.exports = app;