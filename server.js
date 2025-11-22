require('dotenv').config(); 
const express = require('express');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000; 


// CONFIGURAÇÃO DE VIEWS E ARQUIVOS ESTÁTICOS

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));



// MIDDLEWARES 


app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

// Sobrescrever métodos HTTP (COM FUNÇÃO DE FORÇAMENTO)
// Essa função garante que o valor do campo _method seja lido e depois removido
// do corpo da requisição, forçando o Express a usar o método correto (PUT/DELETE).
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // Salva o valor do campo _method
    var method = req.body._method;
    // Remove o campo do corpo para evitar conflitos
    delete req.body._method;
    // Retorna o método correto (PUT ou DELETE)
    return method;
  }
}));

// Configuração da Sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key_segura', 
  resave: false,
  saveUninitialized: false, 
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 1000 * 60 * 60 * 24 
  } 
}));


// ROTAS

app.use('/', routes); 


// INICIALIZAÇÃO DO SERVIDOR

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});