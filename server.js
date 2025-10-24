const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/index');

const app = express();
const PORT = 3000;

// Configurar o EJS como view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos (CSS, imagens) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configurar o body-parser para ler dados de formulários
app.use(bodyParser.urlencoded({ extended: true }));

// Usar as rotas definidas no arquivo 'routes/index.js'
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});