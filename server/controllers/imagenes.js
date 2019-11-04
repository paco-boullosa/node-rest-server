const express = require('express');
const fs = require('fs');
const path = require('path');

const { verificaTokenImagen } = require('../middlewares/autenticacion');

let app = express();


app.get('/imagen/:tipo/:img', verificaTokenImagen, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        let noImagePath = path.resolve(__dirname, '../assets/no-encontrado.png'); //__dirname es el directorio en donde esta este archivo 'controllers', por lo que hay que subir a 'server' y despues bajar a 'assets'
        res.sendFile(noImagePath);
    }


});


module.exports = app;