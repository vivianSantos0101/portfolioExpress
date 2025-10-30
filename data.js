let data = {

  

  presentation: {

    fullName: "Vivian Santos",

    contactEmail: "vivian.stoliveira@gmail.com",

    bio: "Estudante de Análise e Desenvolvimento de Sistemas com forte inclinação para o desenvolvimento full stack. Dedico-me à arquitetura e construção de soluções de software completas, desde a experiência do utilizador até a lógica de negócios e persistência de dados.",

    profilePic: "/assets/Eu2.png" // Caminho para a imagem na pasta 'public'

  },



  // Formação Acadêmica

  education: [

    {

      course: "Análise e Desenvolvimento de Sistemas",

      institution: "FATEC São José dos Campos",

      period: "Cursando (3º Semestre)"

    }

 

  ],



  // Cursos Complementares e Certificações

  certifications: [

    { name: "NGD Linux - Cisco" },

    { name: "Introdução a POO - Fundação Bradesco" },

    { name: "IT Essentials - Cisco" },

    { name: "Analise de dados no Power B.I - Fundação Bradesco" }

    // Adicione outros cursos

  ],



  // Competências Técnicas

  technicalSkills: ["LLMs", "React", "Node.js", "JavaScript", "TypeScript", "Java", "mySQL", "Express", "Python"],



  // Competências Interpessoais (Soft Skills)

  softSkills: ["Boa comunicação", "Trabalho em Equipe", "Criatividade", "Resolução de Problemas", "Adaptabilidade", "Gerenciamento de Tempo"],



  // === Idiomas ===

  languages: ["Inglês (Fluente)", "Espanhol (Fluente)"],

  



  // Projetos

  projects: [

    {

      id: 1,

      title: "BotEcho",

      description: "IDE com LLM integrada para desenvolvimento Python.",

      imageUrl: "/assets/LogoBotEcho.png",

      link: "https://github.com/EquipeEcho/botEcho" // projeto api 2 semestre

    },

    {

      id: 2,

      title: "EasyScrum",

      description: "Ferramenta visual para gerenciamento de projetos ágeis.",

      imageUrl: "/assets/LogoEasyScrum.png",

      link: "https://github.com/EquipeEcho/EasyScrum" // projeto api 1 semestre

    },

    {

      id: 3,

      title: "EntreNova",

      description: "Plataforma de ideação e gestão de inovação.",

      imageUrl: "/assets/LogoEntreNova.png",

      link: "https://github.com/Equipe-SUL/EntreNova-Flix" // projeto api 3 semestre (atual)

    },

    {

      id: 4,

      title: "Gerenciador de Cursos",

      description: "Gerenciador de Cursos em JAVA",

      imageUrl: "/assets/LogoGerenciadorCurso.png",

      link: "https://github.com/vivianSantos0101/GerenciadorCurso" // CRUD simples 2 semestre

    },

     {

      id: 5,

      title: "Aerocode CLI",

      description: "Atvividade de criação de uma CLI em TypeScript, com tema de aviação",

      imageUrl: "/assets/LogoAerocode.png",

      link: "https://github.com/vivianSantos0101/GerenciadorCurso" // CRUD simples 2 semestre

    }


  ],

  

  // === LINKS REDES SOCIAIS E CONTATO ===

  socialLinks: [

    { name: "LinkedIn", href: "https://www.linkedin.com/in/vivianstoliveira/", iconClass: "fab fa-linkedin-in" },

    { name: "GitHub", href: "https://github.com/vivianSantos0101", iconClass: "fab fa-github" },

    { name: "Instagram", href: "https://www.instagram.com/vivian_msants/", iconClass: "fab fa-instagram" }

    

  ]

 

};



// CRUD Simples para projetos: 



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