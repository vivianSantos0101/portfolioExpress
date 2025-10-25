const express = require('express');
const router = express.Router();
const db = require('../data');
const nodemailer = require('nodemailer');

// ROTA GET / (Página Principal)
router.get('/', (req, res) => {
  const allData = db.getData();
  res.render('pages/index', {
    data: allData
  });
});

// === ROTAS PARA SUGESTÕES ===

// ROTA GET /sugestoes
router.get('/sugestoes', (req, res) => {
  const allData = db.getData();
  res.render('pages/sugestoes', { data: allData });
});

// ROTA POST /sugestoes - AGORA ENVIA EMAIL (COM MAIS DEBUG)
router.post('/sugestoes', async (req, res) => {
  const sugestao = req.body;

  console.log("\n--- DEBUG: Iniciando processo de envio de email ---");
  console.log("DEBUG: Dados recebidos do formulário:", sugestao);
  console.log(`DEBUG: Verificando variáveis de ambiente...`);
  console.log(`DEBUG: EMAIL_USER: ${process.env.EMAIL_USER}`);
  // CUIDADO: Não logue a senha em produção! Apenas para debug temporário. Remova depois.
  console.log(`DEBUG: EMAIL_PASS existe? ${process.env.EMAIL_PASS ? 'Sim (******)' : 'NÃO!!!'}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("!!! ERRO CRÍTICO: Variáveis EMAIL_USER ou EMAIL_PASS não encontradas no .env !!!");
    return res.status(500).send("Erro de configuração do servidor para envio de email.");
  }

  try {
    // 1. Configurar o transportador
    console.log("DEBUG: Tentando criar transporter Nodemailer...");
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // === ATIVAR LOGS DETALHADOS DO NODEMAILER ===
      logger: true,
      debug: true // Mostra a comunicação com o servidor SMTP
      // ===========================================
    });
    console.log("DEBUG: Transporter criado.");

    // 2. Montar o conteúdo do email
    console.log("DEBUG: Montando opções do email...");
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

    // 3. Enviar o email
    console.log("DEBUG: Tentando enviar email via transporter.sendMail...");
    let info = await transporter.sendMail(mailOptions);
    console.log('DEBUG: Email aparentemente enviado! Resposta do servidor:', info);
    console.log("--- DEBUG: Fim do processo de envio de email (Sucesso aparente) ---");

    res.redirect('/');

  } catch (error) {
    console.error('!!! ERRO CAPTURADO AO ENVIAR EMAIL !!!:', error); // Log detalhado do erro
    console.log("--- DEBUG: Fim do processo de envio de email (Com Erro) ---");
    // Mostra o erro também na página para facilitar o debug (remova em produção)
    res.status(500).send(`Ocorreu um erro ao enviar a sugestão. Verifique o console do servidor. Detalhes: ${error.message}`);
  }
});




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