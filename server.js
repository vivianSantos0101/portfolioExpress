require('dotenv').config(); // Carrega as variáveis do .env (DEVE SER A PRIMEIRA LINHA)
const express = require('express');
const session = require('express-session'); // Adiciona o session
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override'); // Importado
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

// === CONFIGURAÇÃO METHOD OVERRIDE ===
// Procura por '_method' no corpo da requisição POST vinda de um formulário
app.use(methodOverride('_method')); // Configurado
// ===================================

// === CONFIGURAÇÃO DA SESSÃO ===
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key', // Chave secreta para assinar a sessão
  resave: false, // Não salva a sessão se não for modificada
  saveUninitialized: false, // Não cria sessão até algo ser armazenado
  cookie: { secure: false } // Para desenvolvimento (HTTP). Mude para true se usar HTTPS
}));
// === FIM DA CONFIGURAÇÃO DA SESSÃO ===

// Usar as rotas
// Removi os logs de debug temporários daqui
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});