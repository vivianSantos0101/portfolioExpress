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
  // Garante que errors e formData existem na primeira visita
  res.render('pages/sugestoes', {
     data: allData,
     errors: [],
     formData: {}
     });
});

// ROTA GET para página de obrigado
router.get('/sugestao-enviada', (req, res) => {
  const allData = db.getData();
  res.render('pages/obrigado', { data: allData });
});

// ROTA POST /sugestoes - COM VALIDAÇÃO NO SERVIDOR
router.post('/sugestoes', async (req, res) => {
  const sugestao = req.body;
  const { titulo, empresa, emailEmpresa, urgencia, descricao, linguagem, outraLinguagemNome } = sugestao; // Extrai os campos

  // === VALIDAÇÃO DOS CAMPOS ===
  const errors = []; // Array para guardar mensagens de erro
  if (!titulo || titulo.trim() === '') errors.push('Título do Projeto é obrigatório.');
  if (!empresa || empresa.trim() === '') errors.push('Nome da Empresa é obrigatório.');
  if (!emailEmpresa || emailEmpresa.trim() === '') errors.push('Email da Empresa é obrigatório.');
  // Adicionar validação de formato de email (opcional)
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
    const allData = db.getData(); // Pega dados para o footer
    // Re-renderiza o formulário, passando os erros e os dados antigos
    return res.render('pages/sugestoes', {
      data: allData,
      errors: errors, // Passa a lista de erros
      formData: sugestao // Passa os dados que o usuário já digitou
    });
  }
  // === FIM DA VALIDAÇÃO ===


  // Se a validação passou, continua com o envio do email...
  // (Mantendo os logs de debug do Nodemailer por enquanto)
  console.log("\n--- DEBUG: Iniciando processo de envio de email ---");
  console.log("DEBUG: Dados recebidos do formulário:", sugestao);
  console.log(`DEBUG: Verificando variáveis de ambiente...`);
  console.log(`DEBUG: EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`DEBUG: EMAIL_PASS existe? ${process.env.EMAIL_PASS ? 'Sim (******)' : 'NÃO!!!'}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("!!! ERRO CRÍTICO: Variáveis EMAIL_USER ou EMAIL_PASS não encontradas no .env !!!");
     const allData = db.getData();
     return res.render('pages/sugestoes', {
        data: allData,
        errors: ['Erro interno do servidor ao configurar o envio. Por favor, tente mais tarde.'],
        formData: sugestao
    });
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
    console.log("DEBUG: Transporter criado.");

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
    console.log("DEBUG: Opções do email:", mailOptions);

    console.log("DEBUG: Tentando enviar email via transporter.sendMail...");
    let info = await transporter.sendMail(mailOptions);
    console.log('DEBUG: Email aparentemente enviado! Resposta:', info.messageId);
    console.log("--- DEBUG: Fim do processo de envio (Sucesso aparente) ---");

    res.redirect('/sugestao-enviada');

  } catch (error) {
    console.error('!!! ERRO CAPTURADO AO ENVIAR EMAIL !!!:', error);
    console.log("--- DEBUG: Fim do processo de envio (Com Erro) ---");
    const allData = db.getData();
    res.render('pages/sugestoes', {
        data: allData,
        errors: ['Ocorreu um erro interno ao tentar enviar a sua sugestão. Por favor, tente novamente mais tarde.'],
        formData: sugestao
    });
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
router.put('/admin/update/:id', requireAdmin, (req, res) => {
  const { title, description, imageUrl, link } = req.body;
  db.updateProject(req.params.id, { title, description, imageUrl, link });
  console.log(`Projeto ${req.params.id} atualizado via PUT`);
  res.redirect('/admin');
});
router.delete('/admin/delete/:id', requireAdmin, (req, res) => {
  db.deleteProject(req.params.id);
  console.log(`Projeto ${req.params.id} deletado via DELETE`);
  res.redirect('/admin');
});

module.exports = router;