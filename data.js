

const mysql = require('mysql2/promise');


const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Manter APENAS os dados estáticos (não migrados para o DB)
let staticData = {
  presentation: {
    fullName: "Vivian Santos",
    contactEmail: "vivian.stoliveira@gmail.com",
    bio: "Estudante de Análise e Desenvolvimento de Sistemas com forte inclinação para o desenvolvimento full stack. Dedico-me à arquitetura e construção de soluções de software completas, desde a experiência do utilizador até a lógica de negócios e persistência de dados.",
    profilePic: "/assets/Eu2.png"
  },
  socialLinks: [
    { name: "LinkedIn", href: "https://www.linkedin.com/in/vivianstoliveira/", iconClass: "fab fa-linkedin-in" },
    { name: "GitHub", href: "https://github.com/vivianSantos0101", iconClass: "fab fa-github" },
    { name: "Instagram", href: "https://www.instagram.com/vivian_msants/", iconClass: "fab fa-instagram" }
  ],
  projects: [] // Será preenchido dinamicamente
};


module.exports = {
  
  pool: pool,
  
  // === FUNÇÕES DE BUSCA GERAL (INDEX) ===
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

  getLanguagesList: async () => {
    const [rows] = await pool.query('SELECT name FROM languages ORDER BY id DESC');
    return rows.map(row => row.name);
  },

  // === FUNÇÕES DE PROJETOS (CRUD) ===
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
    return { id: parseInt(id), ...updatedProject };
  },
  
  deleteProject: async (id) => {
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
  
  // === FUNÇÕES DE SKILLS (CRUD) ===
  getAllSkills: async () => {
    const [rows] = await pool.query('SELECT * FROM skills ORDER BY type, name ASC');
    return rows;
  },
  getSkillById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM skills WHERE id = ?', [id]);
    return rows[0];
  },
  addSkill: async (skill) => {
    const { name, type } = skill;
    await pool.query('INSERT INTO skills (name, type) VALUES (?, ?)', [name, type]);
  },
  updateSkill: async (id, updatedSkill) => {
    const { name, type } = updatedSkill;
    await pool.query('UPDATE skills SET name = ?, type = ? WHERE id = ?', [name, type, id]);
  },
  deleteSkill: async (id) => {
    await pool.query('DELETE FROM skills WHERE id = ?', [id]);
  },

  // === FUNÇÕES DE IDIOMAS (CRUD) ===
  getLanguageById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM languages WHERE id = ?', [id]);
    return rows[0];
  },
  addLanguage: async (language) => {
    await pool.query('INSERT INTO languages (name) VALUES (?)', [language.name]);
  },
  updateLanguage: async (id, updatedLanguage) => {
    await pool.query('UPDATE languages SET name = ? WHERE id = ?', [updatedLanguage.name, id]);
  },
  deleteLanguage: async (id) => {
    await pool.query('DELETE FROM languages WHERE id = ?', [id]);
  },

  // === FUNÇÃO MESTRE (getData) ===
  getData: async () => {
    try {
      const projects = await module.exports.getProjects();
      const education = await module.exports.getEducation();
      const certifications = await module.exports.getCertifications();
      const technicalSkills = await module.exports.getTechnicalSkills();
      const softSkills = await module.exports.getSoftSkills();
      const languages = await module.exports.getLanguagesList(); 
      
      return { 
        ...staticData, 
        projects, 
        education, 
        certifications, 
        technicalSkills, 
        softSkills,
        languages 
      };
    } catch (error) {
      console.error("Erro ao buscar dados completos do banco de dados:", error);
      return { 
          ...staticData, 
          projects: [], 
          education: [], 
          certifications: [], 
          technicalSkills: [], 
          softSkills: [],
          languages: [] 
      }; 
    }
  }
};