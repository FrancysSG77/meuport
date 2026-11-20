/**
 * FRANCISCO GANGA — CREATIVE PORTFOLIO
 * Dual Theme Engine (Dark #08080C / Light #F7F7F8), Interactive Category Filter Tabs,
 * Cinematic Lightbox Modal with Prev/Next Gallery, Magnetic Cursor Physics,
 * Header Scroll Effect, Live Clock & Smooth Scroll.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Remove no-js flag
  document.documentElement.classList.remove('no-js');

  // ================= 1. DUAL THEME ENGINE (DARK / LIGHT) =================
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeModeText = document.getElementById('themeModeText');
  const THEME_STORAGE_KEY = 'fg_portfolio_theme';

  function getSavedTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) return saved;
    // Default to dark mode (#08080C) as specified in requirements
    return 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (themeModeText) {
      themeModeText.textContent = theme === 'dark' ? 'DARK' : 'LIGHT';
    }

    // Update meta theme-color for mobile browser toolbar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#08080C' : '#F7F7F8');
    }

    // Announce theme change to screen readers
    const announcer = document.getElementById('themeAnnouncer');
    if (announcer) {
      announcer.textContent = theme === 'dark' ? 'Modo Escuro ativado.' : 'Modo Claro ativado.';
    }
  }

  // Initialize Theme
  applyTheme(getSavedTheme());

  themeToggleBtn?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // ================= 1b. HEADER SCROLL, PROGRESS BAR & BACK TO TOP =================
  const siteHeader = document.getElementById('mainHeader');
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const backToTopBtn = document.getElementById('backToTopBtn');
  let scrollTicking = false;

  function updateScrollUI() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;

    siteHeader?.classList.toggle('scrolled', scrollY > 60);
    backToTopBtn?.classList.toggle('visible', scrollY > 520);

    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${progress}%`;
    }
    scrollTicking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!scrollTicking) {
        requestAnimationFrame(updateScrollUI);
        scrollTicking = true;
      }
    },
    { passive: true }
  );
  updateScrollUI();

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ================= 2. LIVE CLOCK (GMT / UTC+1) =================
  const liveClock = document.getElementById('liveClock');
  function updateClock() {
    if (!liveClock) return;
    const now = new Date();
    liveClock.textContent = now.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ================= 3. MOBILE DRAWER NAVIGATION =================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMobileNav() {
    mobileNav?.classList.add('open');
    mobileNav?.setAttribute('aria-hidden', 'false');
    mobileMenuBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileNav?.classList.remove('open');
    mobileNav?.setAttribute('aria-hidden', 'true');
    mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  mobileMenuBtn?.addEventListener('click', openMobileNav);
  mobileCloseBtn?.addEventListener('click', closeMobileNav);
  mobileNav?.addEventListener('click', (e) => {
    if (e.target === mobileNav) closeMobileNav();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('open')) {
      closeMobileNav();
      mobileMenuBtn?.focus();
    }
  });
  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  // ================= 4. INTERACTIVE CATEGORY FILTER TABS =================
  const categoryTabs = document.querySelectorAll('.category-tab');
  const categoryGroups = document.querySelectorAll('.category-group-block');
  const filterTimers = new WeakMap();

  function setCategoryFilter(filter, scrollTarget = null) {
    categoryTabs.forEach((t) => {
      const match = t.getAttribute('data-filter') === filter;
      t.classList.toggle('active', match);
      t.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    categoryGroups.forEach((group) => {
      const prevTimer = filterTimers.get(group);
      if (prevTimer) clearTimeout(prevTimer);

      const groupCategory = group.getAttribute('data-group');
      const isVisible = filter === 'all' || groupCategory === filter;

      if (isVisible) {
        group.classList.remove('tab-hidden', 'tab-fading-out');
        group.classList.add('tab-fading-in');
        filterTimers.set(
          group,
          setTimeout(() => {
            group.classList.remove('tab-fading-in');
          }, 450)
        );
      } else {
        group.classList.remove('tab-fading-in');
        group.classList.add('tab-fading-out');
        filterTimers.set(
          group,
          setTimeout(() => {
            if (group.classList.contains('tab-fading-out')) {
              group.classList.add('tab-hidden');
              group.classList.remove('tab-fading-out');
            }
          }, 250)
        );
      }
    });

    if (scrollTarget) {
      setTimeout(() => {
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }

    // Re-observe items that became visible after filter change
    setTimeout(reObserveRevealItems, 280);
  }

  categoryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');
      setCategoryFilter(filter);
    });
  });

  // Connect navigation links with data-nav-category
  document.querySelectorAll('[data-nav-category]').forEach((navLink) => {
    navLink.addEventListener('click', (e) => {
      e.preventDefault();
      const category = navLink.getAttribute('data-nav-category');
      const targetHash = navLink.getAttribute('href');
      const targetElem = targetHash ? document.querySelector(targetHash) : null;

      // Select matching filter and scroll smoothly to category section
      setCategoryFilter(category, targetElem);
    });
  });

  // ================= 4b. STAGGERED REVEAL AFTER FILTER (re-observe hidden items) =================
  function reObserveRevealItems() {
    document.querySelectorAll('.category-group-block:not(.tab-hidden) .reveal-line:not(.revealed)').forEach((el) => {
      if ('IntersectionObserver' in window) {
        // Trigger a quick visibility check by creating a local observer
        const tempObs = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        tempObs.observe(el);
      } else {
        el.classList.add('revealed');
      }
    });
  }

  // ================= 5. COMPREHENSIVE PROJECT DATABASE FOR LIGHTBOX =================
  const projectsDatabase = {
    'kudima-erp': {
      title: 'Kudima ERP — Módulo de Gestão Comercial',
      subtitle: 'Faturação Certificada & Fluxos Comerciais em Conformidade com a AGT (Angola)',
      category: 'UI/UX Design • ERP / FinTech',
      image: './assets/kudima-erp.svg',
      fallbackImage: './assets/kudima-erp.svg',
      challenge:
        'Estruturar um módulo de gestão comercial e faturação capaz de cumprir rigorosamente as normas fiscais da AGT (Administração Geral Tributária de Angola) — incluindo séries de documentos, cálculo de IVA e exportação SAF-T — sem sacrificar a agilidade no ponto de venda.',
      solution:
        'Criámos uma interface limpa e modular com emissão rápida de faturas (FT/FR/NC), validação instantânea de NIF e estados fiscais, KPIs de faturação em Kwanzas (AOA) e um Design System consistente para equipas comerciais e contabilísticas.',
      tags: ['UI/UX', 'ERP / SaaS', 'Conformidade AGT', 'Faturação AO', 'Design System'],
    },
    'super-teclas': {
      title: 'Super Teclas',
      subtitle: 'Projeto de Interface Interativa & Dactilografia Angolano',
      category: 'UI/UX Design • Interface Interativa',
      image: './assets/super-teclas-cover.jpg',
      fallbackImage: './assets/super-teclas-cover.svg',
      challenge:
        'Conceber e redesenhar a interface do utilizador (Desktop e Mobile) para uma plataforma de jogo de digitação focada na juventude angolana, aliando métricas analíticas de velocidade (WPM e precisão) com uma estética moderna e gamificada.',
      solution:
        'Teclado interativo com feedback visual instantâneo, progressão por streaks de combos, tabelas de classificação competitivas e layout totalmente responsivo para ecrãs táteis e teclados físicos.',
      tags: ['UI/UX', 'Interactive Web App', 'Gamificação', 'Design System', 'Figma'],
      externalLink: 'https://super-teclas-flutter.vercel.app/',
      externalText: 'Aceder ao Jogo Ao Vivo (super-teclas-flutter.vercel.app) ↗',
    },
    'prefira-home': {
      title: 'App Prefira Seguros — Dashboard Principal',
      subtitle: 'Ecrã Inicial de Gestão de Apólices e Assistência 24h',
      category: 'UI/UX Design • Mobile App',
      image: './assets/prefira-seguros-home.jpeg',
      fallbackImage: './assets/prefira-seguros-home.jpg',
      challenge:
        'Criar uma visão consolidada de proteção patrimonial e pessoal para o segurado, garantindo acesso instantâneo ao estado de validade dos planos e botão de emergência com resposta imediata.',
      solution:
        'Arquitetura de informação baseada em cartões translúcidos com indicadores de score de proteção, resumo de veículos e residências seguradas e acionamento tátil de assistência em 1 toque.',
      tags: ['Mobile UI', 'InsurTech', 'iOS / Android Guidelines', 'Thumb-Zone UX'],
    },
    'prefira-conta': {
      title: 'App Prefira Seguros — Gestão de Conta & Biometria',
      subtitle: 'Perfil do Segurado, Histórico Financeiro e Segurança',
      category: 'UI/UX Design • Mobile App',
      image: './assets/prefira-seguros-conta.jpeg',
      fallbackImage: './assets/prefira-seguros-conta.jpg',
      challenge:
        'Tornar a gestão de dados cadastrais, pagamentos e renovações segura sem criar fricção ou exigir preenchimento burocrático repetitivo.',
      solution:
        'Autenticação biométrica integrada, visualização clara de pagamentos pendentes e faturas com comprovativos descarregáveis e preferências de notificação por SMS/Push.',
      tags: ['Biometric Login', 'FinTech UX', 'Security Credentials', 'User Flow'],
    },
    'prefira-apolice': {
      title: 'App Prefira Seguros — Detalhe da Apólice & Coberturas',
      subtitle: 'Cláusulas Claras, Franquias e Participação de Sinistros',
      category: 'UI/UX Design • Mobile App',
      image: './assets/prefira-seguros-apolice.jpeg',
      fallbackImage: './assets/prefira-seguros-apolice.jpg',
      challenge:
        'Desmistificar termos jurídicos complexos de apólices de seguros automóvel e saúde, permitindo ao cliente saber exatamente o que está coberto no momento de um imprevisto.',
      solution:
        'Painel visual com barras de franquia, lista de coberturas ativas em linguagem direta, geolocalização de oficinas credenciadas e upload fotográfico de sinistros em 3 passos.',
      tags: ['Claims Flow', 'Micro-Interações', 'Clarity UX', 'Mobile Testing'],
    },
    'prefira-full': {
      title: 'Prefira Seguros — App Mobile & Arquitetura de Negócio',
      subtitle: 'Arquitetura de Negócio, UI Mobile & Peças Promocionais para App Stores',
      category: 'UI/UX Design • Mobile App',
      image: './assets/prefira-seguros-home.jpeg',
      fallbackImage: './assets/prefira-seguros-home.jpg',
      challenge:
        'Estruturar a arquitetura de negócio e transformar a relação tradicional entre seguradoras e clientes num ecossistema mobile rápido, claro e intuitivo para o mercado angolano.',
      solution:
        'Fluxo completo de gestão de apólices, simulações e participação de sinistros, acompanhado por peças promocionais e carrosséis otimizados para Google Play Store e App Store.',
      tags: ['Mobile App', 'Arquitetura de Negócio', 'InsurTech', 'Store Assets', 'Figma'],
    },
    'securpro-dashboard': {
      title: 'SecurPro — Dashboard Operacional em Tempo Real',
      subtitle: 'Centro de Comando, Criticidade & Postos por Nível de Risco',
      category: 'UI/UX Design • Enterprise SaaS',
      image: './assets/securpro-dashboard.jpeg',
      fallbackImage: './assets/securpro-dashboard.svg',
      challenge:
        'Apresentar em simultâneo postos ativos, efetivos em serviço, alertas críticos, ocorrências abertas e escalas do dia sem provocar sobrecarga cognitiva ou fadiga visual nos operadores da central.',
      solution:
        'Interface Dark Mode de alto contraste (WCAG AAA) com KPIs modulares no topo, gráficos de ocorrências por criticidade (Urgente, Alta, Média), donut de postos por nível de risco e tabelas operacionais em tempo real.',
      tags: ['Enterprise SaaS', 'Data Visualization', 'Dark Mode UI', 'Real-Time Telemetry'],
    },
    'securpro-postos': {
      title: 'SecurPro — Gestão de Efectivos & Operativos',
      subtitle: 'Diretório de Colaboradores, Filtros de Estado & Alocação',
      category: 'UI/UX Design • Enterprise SaaS',
      image: './assets/securpro-efetivos.jpeg',
      fallbackImage: './assets/securpro-postos.svg',
      challenge:
        'Permitir aos supervisores localizar, filtrar e gerir rapidamente dezenas de vigilantes, supervisores rolantes e técnicos por estado (Ativos, Inativos, Afastados, Férias, De Folga) e posto atribuído.',
      solution:
        'Tabela corporativa de alta densidade com filtros em pílula por estado, pesquisa instantânea, badges semânticas de disponibilidade e ações rápidas contextuais por colaborador.',
      tags: ['Field Operations', 'Enterprise Table UI', 'SaaS Filters', 'Admin Panel'],
    },
    'securpro-login': {
      title: 'SecurPro — Registo & Triagem de Ocorrências',
      subtitle: 'Monitorização de Incidentes por Prioridade e Estado',
      category: 'UI/UX Design • Enterprise SaaS',
      image: './assets/securpro-ocorrencias.jpeg',
      fallbackImage: './assets/securpro-login.svg',
      challenge:
        'Garantir resposta imediata a incidentes de segurança (falhas de equipamento, intrusões, emergências) diferenciando visualmente ocorrências urgentes, altas e médias.',
      solution:
        'Sistema de triagem com indicadores cromáticos na margem esquerda, pílulas de prioridade (Urgente, Alta, Média), histórico de quem registou, data/hora exata e criação rápida de nova ocorrência.',
      tags: ['Incident Management', 'Priority Badges', 'Operational UX', 'Dark Mode SaaS'],
    },
    'securpro-full': {
      title: 'SecurPro / SecurAngola — SaaS & Ativos Mobile',
      subtitle: 'Componentes de UI, Layouts Mobile & Carrosséis Google Play / App Store',
      category: 'UI/UX Design • Enterprise SaaS',
      image: './assets/securpro-dashboard.jpeg',
      fallbackImage: './assets/securpro-dashboard.svg',
      challenge:
        'Conceber um ecossistema visual unificado que respondesse tanto à central de operações web como à experiência mobile e à apresentação comercial nas lojas de aplicações.',
      solution:
        'Design System modular em Figma com mais de 80 componentes, painéis operacionais em Dark Mode, layouts mobile e carrosséis promocionais de alta conversão para Google Play Store e App Store.',
      tags: ['SaaS', 'Design System', 'Mobile UI', 'Google Play & App Store'],
    },
    'kubico-platform': {
      title: 'Kubico — Iniciativa Social/Tech de Habitação',
      subtitle: 'Plataforma Digital para Democratização do Acesso à Habitação em Angola',
      category: 'Social Tech • Produto Digital (Fundcube)',
      image: './assets/kubico-platform.svg',
      fallbackImage: './assets/kubico-platform.svg',
      challenge:
        'Reduzir barreiras, informalidade e opacidade no acesso à habitação digna em Angola, criando uma ponte digital fiável entre famílias, cooperativas e modelos de financiamento acessível.',
      solution:
        'Conceito de produto digital com listagens verificadas, simulador claro de parcelas e elegibilidade, e narrativa visual estruturada para a campanha submetida na plataforma Fundcube.',
      tags: ['Social Tech', 'Product Design', 'UI/UX', 'Fundcube', 'Impacto Social'],
    },
    'poster-hyundai': {
      title: 'Aluguer Hyundai Tucson',
      subtitle: 'Flyer Publicitário Promocional • Foco Automóvel',
      category: 'Design Gráfico • Flyer Publicitário',
      image: './assets/flyer-hyundai-tucson.png',
      fallbackImage: './assets/flyer-hyundai-tucson.jpg',
      challenge:
        'Destacar a elegância, robustez e condições de locação de uma viatura SUV topo de gama num cartaz promocional de impacto comercial imediato.',
      solution:
        'Composição com tratamento de cor apurado no Adobe Photoshop, recorte e iluminação automotiva de estúdio, hierarquia tipográfica assertiva e chamada de ação clara para reservas.',
      tags: ['Adobe Photoshop', 'Tratamento de Imagem', 'Composição Automotiva', 'Design de Flyer'],
    },
    'poster-internet': {
      title: 'Planos de Internet Empresarial',
      subtitle: 'Flyer Promocional para Telecomunicações Corporativas',
      category: 'Design Gráfico • Flyer Promocional',
      image: './assets/flyer-servicos-internet.png',
      fallbackImage: './assets/flyer-servicos-internet.jpg',
      challenge:
        'Comunicar planos de fibra ótica corporativa, estabilidade de banda larga e assistência técnica 24/7 com estética moderna e tecnológica.',
      solution:
        'Uso de gradientes ciano e azul elétrico sobre fundo escuro de alto contraste, elementos de fibra ótica em vetor e disposição equilibrada das velocidades de download/upload.',
      tags: ['Composição Gráfica', 'Adobe Illustrator', 'Branding Telecom', 'Direção de Arte'],
    },
    'poster-xpay': {
      title: 'XPay — Cartão VISA Digital',
      subtitle: 'Branding & Flyer Digital para Solução FinTech',
      category: 'Design Gráfico • Branding Digital',
      image: './assets/poster-xpay.png',
      fallbackImage: './assets/poster-xpay.jpg',
      challenge:
        'Posicionar um novo cartão de crédito virtual como a solução mais rápida, segura e sem anuidade para pagamentos internacionais.',
      solution:
        'Renderização do cartão com efeitos de iluminação néon e brilhos translúcidos, tipografia geométrica arrojada e mensagem promocional direta orientada à conversão nas redes sociais.',
      tags: ['FinTech Poster', 'Cartão Virtual', 'Social Media Ads', 'Composição Visual'],
    },
    'poster-caseirinho': {
      title: 'Caseirinho da Dany',
      subtitle: 'Arte Visual & Cartaz Promocional para Iogurtes e Gelados',
      category: 'Design Gráfico • Identidade Visual & Food',
      image: './assets/poster-caseirinho-dany.png',
      fallbackImage: './assets/poster-caseirinho-dany.jpg',
      challenge:
        'Transmitir frescura, sabor artesanal e apelo apetitoso para uma linha de produtos caseiros de iogurte e gelados artesanais.',
      solution:
        'Direção de arte com paleta de cores apetitosa, destaque para as texturas dos ingredientes naturais, integração de elementos tropicais e tipografia acolhedora.',
      tags: ['Food Branding', 'Fotomanipulação', 'Design Publicitário', 'Adobe Photoshop'],
    },
    'anpg-concept': {
      title: 'Website ANPG — Redesign & Design System',
      subtitle: 'Arquitetura de Interface Institucional para a ANPG',
      category: 'Web & Portais Corporativos • Design System',
      image: './assets/anpg-web-concept.jpg',
      fallbackImage: './assets/anpg-web-concept.svg',
      challenge:
        'Modernizar a experiência de navegação, hierarquia de informação e transparência de dados de um portal institucional estratégico no setor de petróleo, gás e biocombustíveis.',
      solution:
        'Design System modular e layout responsivo com tabelas de produção, mapas de concessões e foco em acessibilidade WCAG AA+ e performance.',
      tags: ['Design System', 'Web Corporativo', 'Acessibilidade WCAG AA+', 'UI/UX'],
    },
    'portais-irdp-muhatu': {
      title: 'Portais Institucionais IRDP & Muhatu',
      subtitle: 'Redesign, Arquitetura de Interfaces & Sistemas de Design',
      category: 'Web & Portais Corporativos • UI/UX',
      image: './assets/portais-irdp-muhatu.svg',
      fallbackImage: './assets/portais-irdp-muhatu.svg',
      challenge:
        'Organizar grandes volumes de informação institucional, serviços regulatórios e conteúdos editoriais em experiências digitais simples, inclusivas e consistentes.',
      solution:
        'Definição de arquitetura de informação por jornadas de utilizador, bibliotecas de componentes reutilizáveis em Figma e interfaces mobile-first de alta legibilidade.',
      tags: ['Portais Institucionais', 'Design System', 'Arquitetura de Informação', 'Mobile-First'],
    },
    'mirempet-bolsa': {
      title: 'Bolsa dos Profissionais do MIREMPET',
      subtitle: 'Aplicação Móvel & Design System para Talentos do Setor',
      category: 'Mobile App & Institucional • MIREMPET',
      image: './assets/mirempet-bolsa.svg',
      fallbackImage: './assets/mirempet-bolsa.svg',
      challenge:
        'Criar uma experiência móvel intuitiva para conectar engenheiros, técnicos certificados e entidades empregadoras do setor de recursos minerais, petróleo e gás em Angola.',
      solution:
        'Interface mobile com perfis profissionais validados, pesquisa filtrada por área técnica, candidaturas simplificadas em 1 toque e sistema de design escalável.',
      tags: ['Mobile App UI', 'Design System', 'MIREMPET', 'Product Design'],
    },
  };

  // ================= 6. LIGHTBOX MODAL LOGIC WITH PREV / NEXT & ZOOM =================
  const lightboxModal = document.getElementById('lightboxModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalTagIndicator = document.getElementById('modalTagIndicator');
  const modalCounter = document.getElementById('modalCounter');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalProjectSubtitle = document.getElementById('modalProjectSubtitle');
  const modalImageContainer = document.getElementById('modalImageContainer');
  const modalMainImage = document.getElementById('modalMainImage');
  const modalZoomHint = document.getElementById('modalZoomHint');
  const modalChallengeText = document.getElementById('modalChallengeText');
  const modalSolutionText = document.getElementById('modalSolutionText');
  const modalTagsList = document.getElementById('modalTagsList');
  const modalFooterAction = document.getElementById('modalFooterAction');

  const projectKeys = Object.keys(projectsDatabase);
  let currentProjectIndex = -1;
  let lastFocusedElement = null;

  function resetLightboxZoom() {
    if (!modalImageContainer) return;
    modalImageContainer.classList.remove('zoomed');
    if (modalZoomHint) modalZoomHint.textContent = '🔍 CLIQUE PARA AMPLIAR';
  }

  modalImageContainer?.addEventListener('click', () => {
    const isZoomed = modalImageContainer.classList.toggle('zoomed');
    if (modalZoomHint) {
      modalZoomHint.textContent = isZoomed ? '✕ CLIQUE PARA REDUZIR' : '🔍 CLIQUE PARA AMPLIAR';
    }
  });

  function renderLightboxContent(projectId) {
    const data = projectsDatabase[projectId];
    if (!data) return;

    resetLightboxZoom();

    if (modalTagIndicator) modalTagIndicator.textContent = data.category.toUpperCase();
    if (modalCounter) {
      const num = String(currentProjectIndex + 1).padStart(2, '0');
      const total = String(projectKeys.length).padStart(2, '0');
      modalCounter.textContent = `${num} / ${total}`;
    }
    if (modalProjectTitle) modalProjectTitle.textContent = data.title;
    if (modalProjectSubtitle) modalProjectSubtitle.textContent = data.subtitle;

    if (modalMainImage) {
      modalMainImage.src = data.image;
      modalMainImage.alt = `${data.title} — ${data.subtitle}`;
      modalMainImage.onerror = () => {
        if (data.fallbackImage) modalMainImage.src = data.fallbackImage;
      };
    }

    if (modalChallengeText) modalChallengeText.textContent = data.challenge;
    if (modalSolutionText) modalSolutionText.textContent = data.solution;

    if (modalTagsList) {
      modalTagsList.innerHTML = data.tags.map((t) => `<span class="tech-pill">${t}</span>`).join('');
    }

    if (modalFooterAction) {
      if (data.externalLink) {
        modalFooterAction.innerHTML = `
          <a href="${data.externalLink}" target="_blank" rel="noopener noreferrer" class="btn-external-link magnetic">
            <span>${data.externalText || 'Aceder ao Projeto Ao Vivo'}</span>
          </a>
        `;
      } else {
        modalFooterAction.innerHTML = `
          <a href="#contacto" class="btn-primary-cta magnetic" id="modalContactTrigger">
            <span>Discutir Projeto Semelhante ↗</span>
          </a>
        `;
        document.getElementById('modalContactTrigger')?.addEventListener('click', closeLightbox);
      }
      bindMagneticElements(modalFooterAction);
    }
  }

  function openLightbox(projectId) {
    if (!projectsDatabase[projectId] || !lightboxModal) return;

    lastFocusedElement = document.activeElement;
    currentProjectIndex = projectKeys.indexOf(projectId);
    if (currentProjectIndex === -1) currentProjectIndex = 0;

    renderLightboxContent(projectId);

    if (typeof lightboxModal.showModal === 'function') {
      lightboxModal.showModal();
    } else {
      lightboxModal.setAttribute('open', '');
    }

    document.body.style.overflow = 'hidden';
    modalCloseBtn?.focus();
  }

  function navigateLightbox(direction) {
    if (currentProjectIndex === -1) currentProjectIndex = 0;
    if (direction === 'next') {
      currentProjectIndex = (currentProjectIndex + 1) % projectKeys.length;
    } else if (direction === 'prev') {
      currentProjectIndex = (currentProjectIndex - 1 + projectKeys.length) % projectKeys.length;
    }
    const nextId = projectKeys[currentProjectIndex];
    renderLightboxContent(nextId);
  }

  function closeLightbox() {
    if (!lightboxModal) return;

    resetLightboxZoom();

    if (typeof lightboxModal.close === 'function') {
      lightboxModal.close();
    } else {
      lightboxModal.removeAttribute('open');
    }

    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  // Bind next and prev navigation buttons
  lightboxPrevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox('prev');
  });

  lightboxNextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox('next');
  });

  // Keyboard navigation for Lightbox (Arrow Left, Arrow Right, Escape)
  document.addEventListener('keydown', (e) => {
    const isModalOpen = lightboxModal?.hasAttribute('open') || lightboxModal?.open;
    if (!isModalOpen) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateLightbox('next');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateLightbox('prev');
    } else if (e.key === 'Escape') {
      closeLightbox();
    }
  });

  // Bind all cards and inspect buttons (click + keyboard Enter/Space)
  document.querySelectorAll('[data-project]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      // Don't trigger if clicked directly on an external <a> tag inside
      if (e.target.closest('a') && !e.target.closest('.btn-inspect-modal')) {
        return;
      }
      e.stopPropagation();
      const id = trigger.getAttribute('data-project');
      if (id) openLightbox(id);
    });

    if (trigger.getAttribute('role') === 'button') {
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = trigger.getAttribute('data-project');
          if (id) openLightbox(id);
        }
      });
    }
  });

  modalCloseBtn?.addEventListener('click', closeLightbox);
  modalBackdrop?.addEventListener('click', closeLightbox);

  lightboxModal?.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeLightbox();
  });

  // ================= 7. CUSTOM CURSOR & MAGNETIC PHYSICS =================
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const cursorLabel = document.getElementById('cursorLabel');

  let mouse = { x: -100, y: -100 };
  let ringPos = { x: -100, y: -100 };
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  // Magnetic buttons pull physics (unified & idempotent for static + dynamic elements)
  function bindMagneticElements(root = document) {
    if (!hasFinePointer || !root) return;
    root.querySelectorAll('.magnetic').forEach((btn) => {
      if (btn.dataset.magneticBound) return;
      btn.dataset.magneticBound = 'true';

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.28;
        const deltaY = (e.clientY - centerY) * 0.28;
        btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });

      btn.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering-link');
      });
      btn.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering-link');
      });
    });
  }

  if (hasFinePointer) {
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (cursorDot) {
        cursorDot.style.left = `${mouse.x}px`;
        cursorDot.style.top = `${mouse.y}px`;
      }
    });

    function renderCursor() {
      ringPos.x += (mouse.x - ringPos.x) * 0.16;
      ringPos.y += (mouse.y - ringPos.y) * 0.16;

      if (cursorRing) {
        cursorRing.style.left = `${ringPos.x}px`;
        cursorRing.style.top = `${ringPos.y}px`;
      }

      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover triggers for interactive links
    const interactiveLinks = document.querySelectorAll('a, button, .category-tab');
    interactiveLinks.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering-link');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering-link');
      });
    });

    // Hover triggers for project preview cards
    const cards = document.querySelectorAll('.magnetic-card');
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering-card');
        if (cursorLabel) cursorLabel.textContent = 'VER';
      });
      card.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering-card');
        if (cursorLabel) cursorLabel.textContent = '';
      });
    });

    bindMagneticElements(document);
  }

  // ================= 8. COPY EMAIL TO CLIPBOARD =================
  const copyEmailTrigger = document.getElementById('copyEmailTrigger');
  const copyBtnFeedback = document.getElementById('copyBtnFeedback');
  const EMAIL_ADDRESS = 'franciscoganga77@gmail.com';

  copyEmailTrigger?.addEventListener('click', () => {
    navigator.clipboard
      .writeText(EMAIL_ADDRESS)
      .then(() => {
        if (copyBtnFeedback) copyBtnFeedback.textContent = '✓ COPIADO COM SUCESSO! 📋';
        setTimeout(() => {
          if (copyBtnFeedback) copyBtnFeedback.textContent = 'COPIAR ENDEREÇO DE E-MAIL 📋';
        }, 3000);
      })
      .catch(() => {
        window.location.href = `mailto:${EMAIL_ADDRESS}`;
      });
  });

  // ================= 9. SCROLL REVEAL (INTERSECTION OBSERVER) =================
  const revealElements = document.querySelectorAll('.reveal-line');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Staggered delay based on element index within parent
            const siblings = Array.from(entry.target.parentElement?.querySelectorAll('.reveal-line') || []);
            const idx = siblings.indexOf(entry.target);
            const delay = Math.min(idx * 80, 400); // max 400ms stagger
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // ================= 10. HEADER ACTIVE NAV LINK ON SCROLL =================
  const navTargets = document.querySelectorAll('#ui-ux, #design-grafico, #web-design, #servicos, #contacto');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  if ('IntersectionObserver' in window && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('nav-link-active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );
    navTargets.forEach((sec) => sectionObserver.observe(sec));
  }
});
