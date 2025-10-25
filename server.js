require('dotenv').config(); // Carrega as variáveis do .env (DEVE SER A PRIMEIRA LINHA)
const express = require('express');
const session = require('express-session'); // Adiciona o session
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/index');

const app = express();
const PORT = 3000;

// Configura o EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// === CONFIGURAÇÃO DA SESSÃO ===
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key', // Chave secreta para assinar a sessão
  resave: false, // Não salva a sessão se não for modificada
  saveUninitialized: false, // Não cria sessão até algo ser armazenado
  cookie: { secure: false } // Para desenvolvimento (HTTP). Mude para true se usar HTTPS
}));
// === FIM DA CONFIGURAÇÃO DA SESSÃO ===

// Usar as rotas
console.log("DEBUG: Tipo da variável 'routes':", typeof routes); // Log de debug temporário
console.log("DEBUG: Conteúdo da variável 'routes':", routes); // Log de debug temporário
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});