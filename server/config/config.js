// ==========================
// PUERTO
// ==========================
// si el PORT está configurado por el servidor (como en  Heroku) se usa ese valor. En otro caso se inicializa a 3000
process.env.PORT = process.env.PORT || 3000;

// ==========================
// ENTORNO
// ==========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ==========================
// Expiracion del token
// ==========================
// expira en 60s * 60m * 24h * 30 == 30 dias
process.env.TOKEN_CADUCIDAD = 60 * 60 * 24 * 30;

// ==========================
// SEED del token
// ==========================
process.env.TOKEN_SEED = process.env.TOKEN_SEED || 'semilla-de-desarrollo';

// ==========================
// BASE DE DATOS
// ==========================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
    //para ocultar la cadena de conexion a mongo atlas que contiene usuario y contraseña se utiliza la creacion de una variable de entorno
    //en heroku del siguiente modo:
    //  heroku config:set MONGO_URI = "mongodb+srv://user:password@cluster0-qgjra.mongodb.net/base_de_datos?retryWrites=true&w=majority"
    //de este modo se puede utilizar aqui
}
process.env.URL_BASEDATOS = urlDB;