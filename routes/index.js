// routes/index.js ATUALIZADO

const express = require('express');
const router = express.Router();
const db = require('../data'); // Nosso "banco de dados" mock

// ROTA GET / (Página Principal) - Sem alterações
router.get('/', (req, res) => {
  const allData = db.getData();
  console.log("=== DEBUG: Objeto 'allData' que será enviado para o EJS ===");
  console.log(allData);
  console.log("=========================================================");
  res.render('pages/index', { data: allData });
});

// === ROTAS DE LOGIN E LOGOUT ===

// ROTA GET /login - Mostra o formulário de login
router.get('/login', (req, res) => {
  res.render('pages/login', { error: null }); // Passa null para erro inicialmente
});

// ROTA POST /login - Processa a tentativa de login
router.post('/login', (req, res) => {
  const { password } = req.body;
  // Compara a senha enviada com a senha no arquivo .env
  if (password === process.env.ADMIN_PASSWORD) {
    // Senha correta: marca o usuário como admin na sessão
    req.session.isAdmin = true;
    res.redirect('/admin'); // Redireciona para a área administrativa
  } else {
    // Senha incorreta: renderiza a página de login novamente com uma mensagem de erro
    res.render('pages/login', { error: 'Senha incorreta.' });
  }
});

// ROTA GET /logout - Destrói a sessão (faz logout)
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      // Tratar erro, se necessário
      console.error("Erro ao fazer logout:", err);
      return res.redirect('/'); // Redireciona mesmo se houver erro
    }
    res.redirect('/'); // Redireciona para a página inicial após logout
  });
});

// === MIDDLEWARE DE AUTENTICAÇÃO ===
// Esta função verifica se o usuário está logado como admin
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next(); // Usuário é admin, continua para a próxima rota
  } else {
    res.redirect('/login'); // Usuário não é admin, redireciona para a página de login
  }
}


// --- ROTAS DE ADMIN PROTEGIDAS PELO MIDDLEWARE ---
// O middleware 'requireAdmin' é aplicado a TODAS as rotas que começam com /admin

// ROTA GET /admin - Protegida
router.get('/admin', requireAdmin, (req, res) => {
  const projects = db.getProjects();
  res.render('pages/admin', { projects: projects, projectToEdit: null });
});

// ROTA POST /admin/add - Protegida
router.post('/admin/add', requireAdmin, (req, res) => {
  const { title, description, imageUrl, link } = req.body;
  db.addProject({ title, description, imageUrl, link });
  res.redirect('/admin');
});

// ROTA GET /admin/edit/:id - Protegida
router.get('/admin/edit/:id', requireAdmin, (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (project) {
    const projects = db.getProjects();
    res.render('pages/admin', { projects: projects, projectToEdit: project });
  } else {
    res.redirect('/admin');
  }
});

// ROTA POST /admin/update/:id - Protegida
router.post('/admin/update/:id', requireAdmin, (req, res) => {
  const { title, description, imageUrl, link } = req.body;
  db.updateProject(req.params.id, { title, description, imageUrl, link });
  res.redirect('/admin');
});

// ROTA POST /admin/delete/:id - Protegida
router.post('/admin/delete/:id', requireAdmin, (req, res) => {
  db.deleteProject(req.params.id);
  res.redirect('/admin');
});
// --- FIM DAS ROTAS DE ADMIN ---

module.exports = router;