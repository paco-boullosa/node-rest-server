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
// BASE DE DATOS
// ==========================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://pacomongo:PW1IXK1FazgNhAQp@cluster0-qgjra.mongodb.net/cafe?retryWrites=true&w=majority';
}
process.env.URL_BASEDATOS = urlDB;