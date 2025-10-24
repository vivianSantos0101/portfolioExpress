const express = require('express');
const router = express.Router();
const db = require('../data'); // Nosso "banco de dados" mock

// ROTA GET / (Página Principal)
// Renderiza o portfólio principal com todos os dados
router.get('/', (req, res) => {
  const allData = db.getData();

  console.log("=== DEBUG: Objeto 'allData' que será enviado para o EJS ===");
  console.log(allData);
  console.log("=========================================================");
  

  res.render('pages/index', {
    data: allData // Passa todas as variáveis para o EJS
  });
});

// --- ROTAS DE ADMIN PARA O CRUD DE PROJETOS ---

// ROTA GET /admin
// Mostra a página de admin com os projetos e o formulário de adição
router.get('/admin', (req, res) => {
  const projects = db.getProjects();
  res.render('pages/admin', {
    projects: projects,
    projectToEdit: null // Nenhum projeto está sendo editado
  });
});

// ROTA POST /admin/add (Criação - "POST")
// Recebe os dados do formulário e adiciona um novo projeto
router.post('/admin/add', (req, res) => {
  const { title, description, imageUrl, link } = req.body;
  db.addProject({ title, description, imageUrl, link });
  res.redirect('/admin');
});

// ROTA GET /admin/edit/:id
// Mostra o formulário de admin, mas preenchido com dados do projeto para editar
router.get('/admin/edit/:id', (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (project) {
    const projects = db.getProjects();
    res.render('pages/admin', {
      projects: projects,
      projectToEdit: project // Passa o projeto específico para o formulário
    });
  } else {
    res.redirect('/admin');
  }
});

// ROTA POST /admin/update/:id (Atualização - "PUT")
// Recebe os dados do formulário de edição e atualiza o projeto
router.post('/admin/update/:id', (req, res) => {
  const { title, description, imageUrl, link } = req.body;
  db.updateProject(req.params.id, { title, description, imageUrl, link });
  res.redirect('/admin');
});

// ROTA POST /admin/delete/:id (Deleção - "DELETE")
// Deleta um projeto pelo ID
router.post('/admin/delete/:id', (req, res) => {
  db.deleteProject(req.params.id);
  res.redirect('/admin');
});

module.exports = router;