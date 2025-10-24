const express = require('express');
const router = express.Router();
const db = require('../data'); // Nosso "banco de dados" mock

// ROTA GET / (Página Principal)
router.get('/', (req, res) => {
  const allData = db.getData();
  // Linha de debug removida daqui
  res.render('pages/index', {
    data: allData // Passa todas as variáveis para o EJS
  });
});

// === ROTAS PARA SUGESTÕES ===

// ROTA GET /sugestoes - Mostra a página com o formulário de sugestão
router.get('/sugestoes', (req, res) => {
  // === CORREÇÃO APLICADA AQUI ===
  const allData = db.getData(); // Busca todos os dados (incluindo os necessários para o footer)
  res.render('pages/sugestoes', { data: allData }); // Passa 'data' para a view
  // ============================
});

// ROTA POST /sugestoes - Recebe os dados do formulário
router.post('/sugestoes', (req, res) => {
  const sugestao = req.body; // Pega todos os dados do formulário

  // Aqui você faria algo com os dados (ex: salvar em um arquivo, BD, etc.)
  // Por enquanto, vamos apenas mostrar no console do servidor:
  console.log("=== NOVA SUGESTÃO RECEBIDA ===");
  console.log("Título:", sugestao.titulo);
  console.log("Empresa:", sugestao.empresa);
  console.log("Urgência:", sugestao.urgencia);
  console.log("Descrição:", sugestao.descricao);
  console.log("Linguagem:", sugestao.linguagem);
  if (sugestao.linguagem === 'outra' && sugestao.outraLinguagemNome) {
    console.log("Outra Linguagem:", sugestao.outraLinguagemNome);
  }
  console.log("==============================");

  // Redireciona de volta para a página inicial (ou pode criar uma página de "Obrigado")
  res.redirect('/');
});

// === FIM DAS ROTAS DE SUGESTÕES ===


// === ROTAS DE LOGIN E LOGOUT ===
router.get('/login', (req, res) => {
  res.render('pages/login', { error: null });
});
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.render('pages/login', { error: 'Senha incorreta.' });
  }
});
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Erro ao fazer logout:", err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
});

// === MIDDLEWARE DE AUTENTICAÇÃO ===
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/login');
  }
}

// --- ROTAS DE ADMIN PROTEGIDAS PELO MIDDLEWARE ---
router.get('/admin', requireAdmin, (req, res) => {
  const projects = db.getProjects();
  res.render('pages/admin', { projects: projects, projectToEdit: null });
});
router.post('/admin/add', requireAdmin, (req, res) => {
  const { title, description, imageUrl, link } = req.body;
  db.addProject({ title, description, imageUrl, link });
  res.redirect('/admin');
});
router.get('/admin/edit/:id', requireAdmin, (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (project) {
    const projects = db.getProjects();
    res.render('pages/admin', { projects: projects, projectToEdit: project });
  } else {
    res.redirect('/admin');
  }
});
router.post('/admin/update/:id', requireAdmin, (req, res) => {
  const { title, description, imageUrl, link } = req.body;
  db.updateProject(req.params.id, { title, description, imageUrl, link });
  res.redirect('/admin');
});
router.post('/admin/delete/:id', requireAdmin, (req, res) => {
  db.deleteProject(req.params.id);
  res.redirect('/admin');
});

module.exports = router;