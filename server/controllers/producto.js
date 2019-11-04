const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
let app = express();
let Producto = require('../models/producto');


// -------------------------------------
// Mostrar todos los productos
// -------------------------------------
app.get('/productos', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let registros = req.query.registros || 5;
    registros = Number(registros);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(registros)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            Producto.estimatedDocumentCount({ disponible: true }, (err, contador) => { //debe llevar el mismo filtro que arriba
                // se utiliza estimatedDocumentCount para contar el numero de registros total
                res.json({
                    ok: true,
                    numRegs: contador,
                    productos
                })
            })
        });
});


// -------------------------------------
// Mostrar un producto por ID
// -------------------------------------
app.get('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'Producto no encontrado' }
                })
            }
            res.json({
                ok: true,
                producto: productoDB
            })
        });
});


// -------------------------------------
// Buscar productos por nombre
// -------------------------------------
app.get('/productos/buscar/:texto', verificaToken, (req, res) => {
    let texto = req.params.texto;
    //necesitamos una expresion regular para que se permita una busqueda no exacta
    let regexpTexto = new RegExp(texto, 'i');

    Producto.find({ nombre: regexpTexto, disponible: true })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'Productos no encontrados' }
                })
            }
            res.json({
                ok: true,
                productos
            })
        });
});


// -------------------------------------
// Crear un producto 
// -------------------------------------
app.post('/productos', verificaToken, (req, res) => {
    //tengo que grabar el usuario y la categoria
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    })

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        res.status(201).json({ // 201: nuevo registro
            ok: true,
            producto
        })
    })
});


// -------------------------------------
// Actualizar un producto 
// -------------------------------------
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
        // new:true -> hace que devuelva el objeto actualizado, en lugar del antiguo
        // runValidators:true -> obliga a que los datos pasen las validaciones del esquema antes de actualizarse
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Producto no encontrado' }
            })
        }
        res.json({
            ok: true,
            producto: productoDB
        })
    });
});


// -------------------------------------
// Eliminar un producto (borrado logico)
// -------------------------------------
app.delete('/productos/:id', verificaToken, (req, res) => {
    //no borrar fisicamente
    let id = req.params.id;
    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Producto no encontrado' }
            })
        }
        res.json({
            ok: true,
            producto: productoDB,
            message: 'Producto eliminado'
        })
    });
});



module.exports = app;