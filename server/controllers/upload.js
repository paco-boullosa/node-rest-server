const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();

const fs = require('fs');
const path = require('path'); // para reconstruir la ruta a los archivos 

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');


// opciones del file upload. Ejemplo:
//      useTempFiles : true                      <--- esta es obligatoria
//      limits: { fileSize: 50 * 1024 * 1024 }
//      tempFileDir : '/tmp/'
app.use(fileUpload({ useTempFiles: true }));


app.put('/upload/:tipo/:id', (req, res) => {
    // Se hace con put para que se puedan adjuntar parametros por query (:tipo y :id)
    let tipo = req.params.tipo;
    let id = req.params.id;

    // Validaciones de que se envia un fichero
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: { message: 'No se ha adjuntado ningun archivo' }
        })
    }
    // Validacion tipo
    let tiposValidos = ['usuarios', 'productos'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            tipo,
            err: { message: 'Los tipos válidos son: ' + tiposValidos.join(', ') }
        })
    }

    let fichero = req.files.archivo; // 'archivo' es el nombre del campo en el que va el fichero adjunto

    let arrNombreFichero = fichero.name.split('.');
    let extensionFichero = arrNombreFichero[arrNombreFichero.length - 1];
    let extensionesValidas = ['jpg', 'jpeg', 'png', 'gif'];
    if (extensionesValidas.indexOf(extensionFichero) < 0) {
        return res.status(400).json({
            ok: false,
            extension: extensionFichero,
            err: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        })
    }

    // Modificar nombre del fichero. Se hace para que no se sobreescriban ficheros en el servidor.modal
    // En este caso usaremos el ID del registro (usuario o producto) quedando asi:
    // ID-MILISEGUNDOS.EXT
    let nuevoNombreFichero = `${ id }-${ new Date().getTime() }.${ extensionFichero }`;

    fichero.mv(`uploads/${ tipo }/${ nuevoNombreFichero }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        // En este momento ya sabemos que la imagen subió correctamente al servidor
        if (tipo === 'usuarios') {
            imagenUsuario(id, nuevoNombreFichero, res);
        } else {
            imagenProducto(id, nuevoNombreFichero, res);
        }

    });
});



function imagenUsuario(id, nombreFichero, res) { //nota: se envia 'res' para poder escribir en la respuesta
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo('usuarios', nombreFichero); // en cualquier error se elimina el fichero subido, para no tener basura en el servidor
            return res.status(500).json({
                ok: false,
                err
            })
        }
        // 1.- validar que el usuario existe
        if (!usuarioDB) {
            borraArchivo('usuarios', nombreFichero);
            return res.status(400).json({
                ok: false,
                err: { message: 'Usuario no encontrado' }
            })
        }
        // 2.- eliminar en la carpeta la imagen anterior del usuario (si existe)
        borraArchivo('usuarios', usuarioDB.img);
        // 3.- actualizar el registro
        usuarioDB.img = nombreFichero;
        usuarioDB.save((err, usuarioActualizado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                message: 'Fichero subido correctamente',
                usuario: usuarioActualizado
            });
        })
    })
}


function imagenProducto(id, nombreFichero, res) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo('productos', nombreFichero);
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            borraArchivo('productos', nombreFichero);
            return res.status(400).json({
                ok: false,
                err: { message: 'El producto no existe' }
            });
        }
        borraArchivo('productos', productoDB.img);
        productoDB.img = nombreFichero;
        productoDB.save((err, productoActualizado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                message: 'Fichero subido correctamente',
                producto: productoActualizado
            });
        });
    })
}


function borraArchivo(tipo, nombreImagen) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }

}

module.exports = app;