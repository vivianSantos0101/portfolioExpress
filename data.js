// Simulação de um banco de dados para cumprir os requisitos
let data = {
  // Informações para a Página de Apresentação (Hero)
  presentation: {
    fullName: "Vivian Santos",
    contactEmail: "seu.email@example.com",
    bio: "Sou estudante de Análise e Desenvolvimento de Sistemas (3º semestre), com foco em desenvolvimento fullstack. Trabalho com JavaScript, React, Node.js, Java, Python e MySQL. Busco constantemente evoluir na criação de aplicações completas, tanto no frontend quanto no backend.",
    profilePic: "/assets/Eu2.png" // Caminho para a imagem na pasta 'public'
  },

  // Formação Acadêmica
  education: [
    {
      course: "Análise e Desenvolvimento de Sistemas",
      institution: "FATEC São José dos Campos",
      period: "Cursando (3º Semestre)"
    }
    // Adicione outras formações aqui
  ],

  // Cursos Complementares e Certificações
  certifications: [
    { name: "Certificação AWS Cloud Practitioner" },
    { name: "Curso de UI/UX Design - Figma" }
    // Adicione outros cursos
  ],

  // Competências Técnicas
  technicalSkills: ["LLMs", "React", "Node.js", "JavaScript", "Java", "Python", "mySQL", "Express", "EJS"],

  // Competências Interpessoais (Soft Skills)
  softSkills: ["Comunicação", "Trabalho em Equipe", "Metodologias Ágeis", "Resolução de Problemas"],

  // Projetos
  projects: [
    {
      id: 1,
      title: "Projeto de E-commerce",
      description: "UI/UX Design, Desenvolvimento Front-end com React",
      imageUrl: "https://via.placeholder.com/800x600/f7f7f7/969696?text=Projeto+1",
      link: "#"
    },
    {
      id: 2,
      title: "Aplicativo de Gestão de Tarefas",
      description: "Desenvolvimento Fullstack com Node.js e React",
      imageUrl: "https://via.placeholder.com/800x600/f0f0f0/969696?text=Projeto+2",
      link: "#"
    }
  ],
  
  // Links (Redes Profissionais)
  socialLinks: [
    { name: "LinkedIn", href: "#", iconClass: "fab fa-linkedin-in" },
    { name: "GitHub", href: "#", iconClass: "fab fa-github" },
    { name: "Behance", href: "#", iconClass: "fab fa-behance" }
  ]
};

// Exportamos os dados e funções para "mutar" os dados (simulando o CRUD)
module.exports = {
  getData: () => data,
  
  getProjects: () => data.projects,
  
  getProjectById: (id) => data.projects.find(p => p.id === parseInt(id)),
  
  addProject: (project) => {
    const newId = data.projects.length > 0 ? Math.max(...data.projects.map(p => p.id)) + 1 : 1;
    const newProject = { id: newId, ...project };
    data.projects.push(newProject);
    return newProject;
  },
  
  updateProject: (id, updatedProject) => {
    const index = data.projects.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      data.projects[index] = { ...data.projects[index], ...updatedProject };
      return data.projects[index];
    }
    return null;
  },
  
  deleteProject: (id) => {
    const index = data.projects.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      data.projects.splice(index, 1);
      return true;
    }
    return false;
  }
};