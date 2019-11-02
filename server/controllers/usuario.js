const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');


const Usuario = require('../models/usuario');

const app = express();



app.get('/usuario', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img') // si no se especifica ningun filtro, devuelve todos los registros
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            Usuario.estimatedDocumentCount({ estado: true }, (err, contador) => { //debe llevar el mismo filtro que arriba
                // se utiliza estimatedDocumentCount para contar el numero de registros total
                res.json({
                    ok: true,
                    numRegs: contador,
                    usuarios
                })
            })
        })
});



app.post('/usuario', (req, res) => {
    let body = req.body;

    usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 11), // el 2º parametro es el numero de iteraciones que se hace al hash
        role: body.role
    });
    //ahora se graba en la BD
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //se insertó OK
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});



app.put('/usuario/:id', (req, res) => {
    let id = req.params.id;
    //let body = req.body;   ---> en vez de tomar todos los valores del body se filtran solo los que se pueden actualizar con PUT. Para ello se utiliza _.pick
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        //la opcion new:true hace que devuelva el objeto actualizado, en lugar del antiguo
        //la opcion runValidators: true obliga a que los datos pasen las validaciones del esquema antes de actualizarse
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});


app.delete('/usuario/:id', (req, res) => {
    let id = req.params.id;
    //borrado FISICO del registro
    /*
    Usuario.findByIdAndRemove(id, (err, usuarioEliminado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
        if (!usuarioEliminado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioEliminado
        });
    })
    */
    //borrado LOGICO del registro
    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioEliminado) => {
        //la opcion new:true hace que devuelva el objeto actualizado, en lugar del antiguo
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
        if (!usuarioEliminado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioEliminado
        });
    });

});


module.exports = app;