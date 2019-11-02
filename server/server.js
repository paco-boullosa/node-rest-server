require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


//configuracion global de rutas (controladores)
app.use(require('./controllers/index'));



// conexion a la BD
mongoose.connect(process.env.URL_BASEDATOS, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
    (err, res) => {
        if (err) throw err;
        console.log('Base de datos conectada');
    });



app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto', process.env.PORT);
});