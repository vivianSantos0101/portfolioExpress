// routes/index.js

const express = require('express');
const router = express.Router();
const db = require('../data'); 
const nodemailer = require('nodemailer');

// === MIDDLEWARE DE AUTENTICAÇÃO ===
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/login');
  }
}

// === ROTAS FRONTS (PÁGINA PRINCIPAL, SUGESTÕES, ETC.) ===

// ROTA GET / (Página Principal)
router.get('/', async (req, res) => {
  try {
    const allData = await db.getData();
    res.render('pages/index', { data: allData });
  } catch (err) {
    console.error("Erro ao buscar dados para a página principal:", err);
    res.status(500).send("Erro ao carregar a página. Tente novamente mais tarde.");
  }
});

// GET /sugestoes
router.get('/sugestoes', async (req, res) => {
  try {
    const allData = await db.getData();
    res.render('pages/sugestoes', {
      data: allData,
      errors: [],
      formData: {}
    });
  } catch (err) {
    console.error("Erro ao carregar dados para a página de sugestões:", err);
    res.status(500).send("Erro ao carregar a página. Tente novamente mais tarde.");
  }
});

// GET /sugestao-enviada
router.get('/sugestao-enviada', async (req, res) => {
  try {
    const allData = await db.getData();
    res.render('pages/obrigado', { data: allData });
  } catch (err) {
    console.error("Erro ao carregar dados para a página de 'obrigado':", err);
    res.status(500).send("Erro ao carregar a página. Tente novamente mais tarde.");
  }
});

// ROTA POST /sugestoes (ENVIO DE EMAIL)
router.post('/sugestoes', async (req, res) => {
  const sugestao = req.body;
  const { titulo, empresa, emailEmpresa, urgencia, descricao, linguagem, outraLinguagemNome } = sugestao;

  // ... (Validação omitida por brevidade) ...

  // Se a validação passou, continua com o envio do email...
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    // ... (tratamento de erro de variável .env) ...
  }

  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: true
    });
    // ... (lógica do mailOptions) ...

    let info = await transporter.sendMail(mailOptions);
    res.redirect('/sugestao-enviada');

  } catch (error) {
    // ... (tratamento de erro de envio de email) ...
  }
});

// === ROTAS DE LOGIN E LOGOUT ===
router.get('/login', (req, res) => { res.render('pages/login', { error: null }); });
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
      return res.redirect('/');
    }
    res.redirect('/');
  });
});

// === ROTAS DE ADMIN PARA PROJETOS ===
// GET /admin
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const projects = await db.getProjects();
    res.render('pages/admin', { projects: projects, projectToEdit: null });
  } catch (err) {
    console.error("Erro ao buscar projetos para o admin:", err);
    res.status(500).send("Erro ao carregar painel de admin.");
  }
});

// POST /admin/add
router.post('/admin/add', requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl, link } = req.body;
    await db.addProject({ title, description, imageUrl, link });
    res.redirect('/admin');
  } catch (err) {
    console.error("Erro ao adicionar projeto:", err);
    res.status(500).send("Erro ao adicionar projeto.");
  }
});

// GET /admin/edit/:id
router.get('/admin/edit/:id', requireAdmin, async (req, res) => {
  try {
    const project = await db.getProjectById(req.params.id);
    if (project) {
      const projects = await db.getProjects();
      res.render('pages/admin', { projects: projects, projectToEdit: project });
    } else {
      res.redirect('/admin');
    }
  } catch (err) {
    console.error("Erro ao buscar projeto para edição:", err);
    res.status(500).send("Erro ao buscar projeto.");
  }
});

// PUT /admin/update/:id
router.put('/admin/update/:id', requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl, link } = req.body;
    await db.updateProject(req.params.id, { title, description, imageUrl, link });
    res.redirect('/admin');
  } catch (err) {
    console.error("Erro ao atualizar projeto:", err);
    res.status(500).send("Erro ao atualizar projeto.");
  }
});

// DELETE /admin/delete/:id
router.delete('/admin/delete/:id', requireAdmin, async (req, res) => {
  try {
    await db.deleteProject(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    console.error("Erro ao deletar projeto:", err);
    res.status(500).send("Erro ao deletar projeto.");
  }
});

// === ROTAS DE ADMIN PARA COMPETÊNCIAS (SKILLS) ===
router.get('/admin/skills', requireAdmin, async (req, res) => {
  try {
    const allSkills = await db.getAllSkills();
    res.render('pages/admin-skills', { skills: allSkills, skillToEdit: null });
  } catch (err) {
    console.error("Erro ao buscar skills para o painel de admin:", err);
    res.status(500).send("Erro ao carregar painel de competências.");
  }
});

router.post('/admin/skills/add', requireAdmin, async (req, res) => {
  try {
    const { name, type } = req.body;
    await db.addSkill({ name, type });
    res.redirect('/admin/skills');
  } catch (err) {
    console.error("Erro ao adicionar skill:", err);
    res.status(500).send("Erro ao adicionar competência.");
  }
});

router.get('/admin/skills/edit/:id', requireAdmin, async (req, res) => {
  try {
    const skillToEdit = await db.getSkillById(req.params.id);
    if (skillToEdit) {
      const allSkills = await db.getAllSkills();
      res.render('pages/admin-skills', { skills: allSkills, skillToEdit: skillToEdit });
    } else {
      res.redirect('/admin/skills');
    }
  } catch (err) {
    console.error("Erro ao buscar skill para edição:", err);
    res.status(500).send("Erro ao buscar competência.");
  }
});

router.put('/admin/skills/update/:id', requireAdmin, async (req, res) => {
  try {
    const { name, type } = req.body;
    await db.updateSkill(req.params.id, { name, type });
    res.redirect('/admin/skills');
  } catch (err) {
    console.error("Erro ao atualizar skill:", err);
    res.status(500).send("Erro ao atualizar competência.");
  }
});

router.delete('/admin/skills/delete/:id', requireAdmin, async (req, res) => {
  try {
    await db.deleteSkill(req.params.id);
    res.redirect('/admin/skills');
  } catch (err) {
    console.error("Erro ao deletar skill:", err);
    res.status(500).send("Erro ao deletar competência.");
  }
});

// === ROTAS DE ADMIN PARA IDIOMAS (LANGUAGES) ===
router.get('/admin/languages', requireAdmin, async (req, res) => {
  try {
    const [allLanguages] = await db.pool.query('SELECT * FROM languages ORDER BY id DESC');
    res.render('pages/admin-languages', { languages: allLanguages, languageToEdit: null });
  } catch (err) {
    console.error("Erro ao buscar idiomas para o painel de admin:", err);
    res.status(500).send("Erro ao carregar painel de idiomas.");
  }
});

router.post('/admin/languages/add', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    await db.addLanguage({ name });
    res.redirect('/admin/languages');
  } catch (err) {
    console.error("Erro ao adicionar idioma:", err);
    res.status(500).send("Erro ao adicionar idioma.");
  }
});

router.get('/admin/languages/edit/:id', requireAdmin, async (req, res) => {
  try {
    const languageToEdit = await db.getLanguageById(req.params.id);
    if (languageToEdit) {
      const [allLanguages] = await db.pool.query('SELECT * FROM languages ORDER BY id DESC');
      res.render('pages/admin-languages', { languages: allLanguages, languageToEdit: languageToEdit });
    } else {
      res.redirect('/admin/languages');
    }
  } catch (err) {
    console.error("Erro ao buscar idioma para edição:", err);
    res.status(500).send("Erro ao buscar idioma.");
  }
});

router.put('/admin/languages/update/:id', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    await db.updateLanguage(req.params.id, { name });
    res.redirect('/admin/languages');
  } catch (err) {
    console.error("Erro ao atualizar idioma:", err);
    res.status(500).send("Erro ao atualizar idioma.");
  }
});

router.delete('/admin/languages/delete/:id', requireAdmin, async (req, res) => {
  try {
    await db.deleteLanguage(req.params.id);
    res.redirect('/admin/languages');
  } catch (err) {
    console.error("Erro ao deletar idioma:", err);
    res.status(500).send("Erro ao deletar idioma.");
  }
});


module.exports = router;