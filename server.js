const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/index');

const app = express();
const PORT = 3000;


app.set('view engine', 'ejs'); // renderização de views com EJS que o claudio pediu <-----
app.set('views', path.join(__dirname, 'views'));

// css e imagens na pasta public
app.use(express.static(path.join(__dirname, 'public')));

// forms de adição de projetos
app.use(bodyParser.urlencoded({ extended: true }));

// configuração das rotas '/' inicia as rotas do arquivo routes/index.js
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});