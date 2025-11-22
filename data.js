

const mysql = require('mysql2/promise');

// Criar o Pool de Conexões (Mantenha este bloco intacto)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Manter APENAS os dados estáticos que não estão no DB
let staticData = {
  presentation: {
    fullName: "Vivian Santos",
    contactEmail: "vivian.stoliveira@gmail.com",
    bio: "Estudante de Análise e Desenvolvimento de Sistemas com forte inclinação para o desenvolvimento full stack. Dedico-me à arquitetura e construção de soluções de software completas, desde a experiência do utilizador até a lógica de negócios e persistência de dados.",
    profilePic: "/assets/Eu2.png"
  },
  languages: ["Inglês (Fluente)", "Espanhol (Fluente)"], // Mantido estático
  socialLinks: [
    { name: "LinkedIn", icon: "fab fa-linkedin", href: "LINKEDIN_URL_AQUI" },
    { name: "GitHub", icon: "fab fa-github", href: "GITHUB_URL_AQUI" },
    { name: "Instagram", icon: "fab fa-instagram", href: "INSTAGRAM_URL_AQUI" }
  ],
 
  projects: [] 
};


module.exports = {
  

  getEducation: async () => {
    const [rows] = await pool.query('SELECT course, institution, period FROM education ORDER BY id DESC');
    return rows;
  },

  getCertifications: async () => {
    const [rows] = await pool.query('SELECT name, institution, category FROM certifications ORDER BY id DESC');
    return rows;
  },

  getTechnicalSkills: async () => {
    const [rows] = await pool.query("SELECT name FROM skills WHERE type = 'technical' ORDER BY name ASC");
   
    return rows.map(row => row.name);
  },

  getSoftSkills: async () => {
    const [rows] = await pool.query("SELECT name FROM skills WHERE type = 'soft' ORDER BY name ASC");
   
    return rows.map(row => row.name);
  },

  // === FUNÇÕES DE PROJETOS (Mantenha as existentes para CRUD) ===
  getProjects: async () => {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    return rows;
  },
  
  getProjectById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    return rows[0];
  },
  
  addProject: async (project) => {
    const { title, description, imageUrl, link } = project;
    const [result] = await pool.query(
      'INSERT INTO projects (title, description, imageUrl, link) VALUES (?, ?, ?, ?)',
      [title, description, imageUrl, link]
    );
    return { id: result.insertId, ...project };
  },
  
  updateProject: async (id, updatedProject) => {
    const { title, description, imageUrl, link } = updatedProject;
    await pool.query(
      'UPDATE projects SET title = ?, description = ?, imageUrl = ?, link = ? WHERE id = ?',
      [title, description, imageUrl, link, id]
    );
    return { id, ...updatedProject };
  },
  
  deleteProject: async (id) => {
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
  },

  // === FUNÇÃO MESTRE ATUALIZADA (getData) ===
  getData: async () => {
    try {
      // Busca TODOS os dados dinâmicos do DB
      const projects = await module.exports.getProjects();
      const education = await module.exports.getEducation();
      const certifications = await module.exports.getCertifications();
      const technicalSkills = await module.exports.getTechnicalSkills();
      const softSkills = await module.exports.getSoftSkills();
      
      // Mescla todos os dados (estáticos + dinâmicos)
      return { 
        ...staticData, 
        projects, 
        education, 
        certifications, 
        technicalSkills, 
        softSkills
      };
    } catch (error) {
      console.error("Erro ao buscar dados completos do banco de dados:", error);
      // Retorna dados estáticos e arrays vazios em caso de falha no DB
      return { 
          ...staticData, 
          projects: [], 
          education: [], 
          certifications: [], 
          technicalSkills: [], 
          softSkills: [] 
      }; 
    }
  }
};