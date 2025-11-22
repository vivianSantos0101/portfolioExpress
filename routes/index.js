const express = require('express');
const router = express.Router();
const db = require('../data'); // Agora aponta para o seu data.js com MySQL
const nodemailer = require('nodemailer');

// ROTA GET / (Página Principal) - AGORA ASSÍNCRONA
router.get('/', async (req, res) => {
  try {
    const allData = await db.getData();
    res.render('pages/index', { data: allData });
  } catch (err) {
    console.error("Erro ao buscar dados para a página principal:", err);
    res.status(500).send("Erro ao carregar a página. Tente novamente mais tarde.");
  }
});

// === ROTAS PARA SUGESTÕES ===

// GET /sugestoes - AGORA ASSÍNCRONA
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

// GET /sugestao-enviada - AGORA ASSÍNCRONA
router.get('/sugestao-enviada', async (req, res) => {
  try {
    const allData = await db.getData();
    res.render('pages/obrigado', { data: allData });
  } catch (err) {
    console.error("Erro ao carregar dados para a página de 'obrigado':", err);
    res.status(500).send("Erro ao carregar a página. Tente novamente mais tarde.");
  }
});

// ROTA POST /sugestoes - ATUALIZADA COM TRY/CATCH PARA ERROS DE DB
router.post('/sugestoes', async (req, res) => {
  const sugestao = req.body;
  const { titulo, empresa, emailEmpresa, urgencia, descricao, linguagem, outraLinguagemNome } = sugestao;

  const errors = [];
  if (!titulo || titulo.trim() === '') errors.push('Título do Projeto é obrigatório.');
  if (!empresa || empresa.trim() === '') errors.push('Nome da Empresa é obrigatório.');
  if (!emailEmpresa || emailEmpresa.trim() === '') errors.push('Email da Empresa é obrigatório.');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailEmpresa && !emailRegex.test(emailEmpresa)) errors.push('Formato de Email inválido.');
  if (!urgencia || urgencia === '') errors.push('Urgência é obrigatória.');
  if (!descricao || descricao.trim() === '') errors.push('Descrição é obrigatória.');
  if (!linguagem || linguagem === '') errors.push('Linguagem é obrigatória.');
  if (linguagem === 'outra' && (!outraLinguagemNome || outraLinguagemNome.trim() === '')) {
    errors.push('Especifique a "Outra" linguagem.');
  }

  // Se houver erros de validação:
  if (errors.length > 0) {
    try {
      const allData = await db.getData(); // Pega dados para o footer
      return res.render('pages/sugestoes', {
        data: allData,
        errors: errors,
        formData: sugestao
      });
    } catch (dbErr) {
      console.error("Erro de DB ao tentar renderizar erros de validação:", dbErr);
      return res.status(500).send("Erro interno. Tente novamente.");
    }
  }

  // Se a validação passou, continua com o envio do email...
  console.log("\n--- DEBUG: Iniciando processo de envio de email ---");
  // ... (outros console.log de debug) ...

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("!!! ERRO CRÍTICO: Variáveis EMAIL_USER ou EMAIL_PASS não encontradas no .env !!!");
    try {
      const allData = await db.getData();
      return res.render('pages/sugestoes', {
        data: allData,
        errors: ['Erro interno do servidor ao configurar o envio. Por favor, tente mais tarde.'],
        formData: sugestao
      });
    } catch (dbErr) {
      console.error("Erro de DB ao tentar renderizar erro de .env:", dbErr);
      return res.status(500).send("Erro interno. Tente novamente.");
    }
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
    let linguagemTexto = linguagem;
    if (linguagem === 'outra') {
      linguagemTexto = `Outra (${outraLinguagemNome.trim()})`;
    }

    let mailOptions = {
      from: `"Portfólio Sugestões" <${process.env.EMAIL_USER}>`,
      to: 'vivian.stoliveira@gmail.com',
      replyTo: emailEmpresa,
      subject: `Nova Sugestão de Projeto: ${titulo}`,
      text: `
        Uma nova sugestão de projeto foi enviada:

        Título: ${titulo}
        Empresa: ${empresa}
        Email Empresa: ${emailEmpresa}
        Urgência: ${urgencia}
        Linguagem: ${linguagemTexto}

        Descrição:
        ${descricao}
      `,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('DEBUG: Email aparentemente enviado! Resposta:', info.messageId);

    res.redirect('/sugestao-enviada');

  } catch (error) {
    console.error('!!! ERRO CAPTURADO AO ENVIAR EMAIL !!!:', error);
    try {
      const allData = await db.getData();
      res.render('pages/sugestoes', {
        data: allData,
        errors: ['Ocorreu um erro interno ao tentar enviar a sua sugestão. Por favor, tente novamente mais tarde.'],
        formData: sugestao
      });
    } catch (dbErr) {
      console.error("Erro de DB ao tentar renderizar erro de envio de email:", dbErr);
      res.status(500).send("Erro interno. Tente novamente.");
    }
  }
});

// === ROTAS DE LOGIN E LOGOUT ===
// (Não precisam de 'async' pois não acessam o DB)
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

// --- ROTAS DE ADMIN PROTEGIDAS ---
// TODAS AGORA SÃO ASSÍNCRONAS

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
    console.log(`Projeto ${req.params.id} atualizado via PUT`);
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
    console.log(`Projeto ${req.params.id} deletado via DELETE`);
    res.redirect('/admin');
  } catch (err) {
    console.error("Erro ao deletar projeto:", err);
    res.status(500).send("Erro ao deletar projeto.");
  }
});

module.exports = router;