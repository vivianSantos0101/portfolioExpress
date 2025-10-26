const express = require('express');
const router = express.Router();
const db = require('../data');
const nodemailer = require('nodemailer');

// ROTA GET / (Página Principal)
router.get('/', (req, res) => {
  const allData = db.getData();
  res.render('pages/index', { data: allData });
});

// === ROTAS PARA SUGESTÕES ===
router.get('/sugestoes', (req, res) => {
  const allData = db.getData();
  res.render('pages/sugestoes', { data: allData });
});

router.post('/sugestoes', async (req, res) => {
  const sugestao = req.body;

  router.get('/sugestao-enviada', (req, res) => {
  const allData = db.getData(); // Pega os dados para passar ao footer
  res.render('pages/obrigado', { data: allData }); // Renderiza a nova página
});

  console.log("\n--- DEBUG: Iniciando processo de envio de email ---"); // Mantendo logs do nodemailer por enquanto
  console.log("DEBUG: Dados recebidos do formulário:", sugestao);
  console.log(`DEBUG: Verificando variáveis de ambiente...`);
  console.log(`DEBUG: EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`DEBUG: EMAIL_PASS existe? ${process.env.EMAIL_PASS ? 'Sim (******)' : 'NÃO!!!'}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("!!! ERRO CRÍTICO: Variáveis EMAIL_USER ou EMAIL_PASS não encontradas no .env !!!");
    return res.status(500).send("Erro de configuração do servidor para envio de email.");
  }

  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true, // Manter logs do nodemailer
      debug: true   // Manter logs do nodemailer
    });
    console.log("DEBUG: Transporter criado.");

    let linguagemTexto = sugestao.linguagem;
    if (sugestao.linguagem === 'outra' && sugestao.outraLinguagemNome) {
      linguagemTexto = `Outra (${sugestao.outraLinguagemNome})`;
    }

    let mailOptions = {
      from: `"Portfólio Sugestões" <${process.env.EMAIL_USER}>`,
      to: 'vivian.stoliveira@gmail.com',
      subject: `Nova Sugestão de Projeto: ${sugestao.titulo}`,
      text: `
        Uma nova sugestão de projeto foi enviada:

        Título: ${sugestao.titulo}
        Empresa: ${sugestao.empresa}
        Urgência: ${sugestao.urgencia}
        Linguagem: ${linguagemTexto}

        Descrição:
        ${sugestao.descricao}
      `,
    };
    console.log("DEBUG: Opções do email:", mailOptions);

    console.log("DEBUG: Tentando enviar email via transporter.sendMail...");
    let info = await transporter.sendMail(mailOptions);
    // ... (envio do email) ...
    console.log('DEBUG: Email aparentemente enviado! Resposta do servidor:', info);
    console.log("--- DEBUG: Fim do processo de envio de email (Sucesso aparente) ---");

    res.redirect('/sugestao-enviada'); 

  } catch (error) {
    console.error('!!! ERRO CAPTURADO AO ENVIAR EMAIL !!!:', error);
    console.log("--- DEBUG: Fim do processo de envio de email (Com Erro) ---");
    res.status(500).send(`Ocorreu um erro ao enviar a sugestão. Verifique o console do servidor. Detalhes: ${error.message}`);
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
router.get('/admin', requireAdmin, (req, res) => {
  const projects = db.getProjects();
  res.render('pages/admin', { projects: projects, projectToEdit: null });
});

// ROTA POST /admin/add (Create) - Continua POST
router.post('/admin/add', requireAdmin, (req, res) => {
  const { title, description, imageUrl, link } = req.body;
  db.addProject({ title, description, imageUrl, link });
  res.redirect('/admin');
});

// ROTA GET /admin/edit/:id (Read para Edição) - Continua GET
router.get('/admin/edit/:id', requireAdmin, (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (project) {
    const projects = db.getProjects();
    res.render('pages/admin', { projects: projects, projectToEdit: project });
  } else {
    res.redirect('/admin');
  }
});

// === ROTA PUT /admin/update/:id (Update) ===
router.put('/admin/update/:id', requireAdmin, (req, res) => {
  const { title, description, imageUrl, link } = req.body;
  db.updateProject(req.params.id, { title, description, imageUrl, link });
  console.log(`Projeto ${req.params.id} atualizado via PUT`); // Log opcional
  res.redirect('/admin');
});
// =========================================

// === ROTA DELETE /admin/delete/:id (Delete) ===
router.delete('/admin/delete/:id', requireAdmin, (req, res) => {
  db.deleteProject(req.params.id);
  console.log(`Projeto ${req.params.id} deletado via DELETE`); // Log opcional
  res.redirect('/admin');
});
// ===========================================

module.exports = router;