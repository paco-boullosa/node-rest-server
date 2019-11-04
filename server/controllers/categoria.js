const express = require('express');

const { verificaToken, validaAdminRole } = require('../middlewares/autenticacion');

let app = express();

const Categoria = require('../models/categoria');


// -------------------------------------
// Mostrar todas las categorias
// -------------------------------------
app.get('/categoria', (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email') // carga datos de otras tablas relacionadas. en este caso el campo 'usuario' de 'categorias'
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                categorias
            })
        })
});


// -------------------------------------
// Mostrar UNA categoria por ID
// -------------------------------------
app.get('/categoria/:id', (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Categoria no encontrada' }
            })
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
});


// -------------------------------------
// CREAR una nueva categoria
// -------------------------------------
// Al ejecutar verificaToken tenemos el ID del usuario en 'req.usuario._id'
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    })

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


// -------------------------------------
// MODIFICAR una categoria
// -------------------------------------
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let camposaActualizar = {
        descripcion: body.descripcion //solo se debe poder actualizar este campo
    }
    Categoria.findByIdAndUpdate(id, camposaActualizar, { new: true, runValidators: true }, (err, categoriaDB) => {
        // new:true -> hace que devuelva el objeto actualizado, en lugar del antiguo
        // runValidators:true -> obliga a que los datos pasen las validaciones del esquema antes de actualizarse
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Categoria no encontrada' }
            })
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});


// -------------------------------------
// ELIMINAR físicamente una categoria
// -------------------------------------
// solo un ADMIN_ROLE puede hacerlo
app.delete('/categoria/:id', [verificaToken, validaAdminRole], (req, res) => {
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaEliminada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaEliminada) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Categoria no encontrada' }
            });
        }
        res.json({
            ok: true,
            message: 'Categoría borrada',
            categoria: categoriaEliminada
        })
    });
});



module.exports = app;