(() => {
  const profileUrl = 'https://www.linkedin.com/in/lang-he-a94655120/';
  const localeStorageKey = 'anlan.portal.locale';
  const projectColors = { cyan: 'var(--cyan)', cobalt: 'var(--cobalt)', violet: 'var(--violet)', orange: 'var(--orange)' };

  const copy = {
    en: {
      documentTitle: 'ANLAN.STORE — Project Frequencies',
      topbar: 'DODGE / PROJECT FREQUENCIES',
      profile: 'My LinkedIn profile',
      profileAria: 'Open My LinkedIn profile (external)',
      skip: 'Skip to project index',
      chooseLanguage: 'Choose portal language',
      railTitle: 'PROJECT DIRECTORY',
      projectDirectory: 'Project directory',
      railAll: 'VIEW ALL PROJECTS',
      heroLabel: 'LIVE SYSTEMS · OPEN SOURCE',
      heroTitle: 'DODGE HO.<br>BUILDS IN PUBLIC.',
      heroLede: 'I’m Dodge Ho — 道安澜 in Chinese — and this is my open-source project space for inspectable systems, signal work, and practical tools.',
      identityFacts: [['IDENTITY', 'Dodge Ho · 道安澜'], ['PRACTICE', 'Systems · signals · tools'], ['SPACE', 'Public open-source work']],
      railKeywords: {
        heatstack: ['Astro', 'AI Skills', 'Windows CLI'], pulseboard: ['Hono', 'PostgreSQL', 'Redis'], career: ['Invite-only', 'Job inbox', 'Digests'], saa: ['AWS', 'Question bank', 'Progress'], sap: ['AWS', 'Architecture', 'Advanced'], ispm: ['ITSM', 'Study', 'Unlinked'], vmd: ['C++', 'Eigen', 'VMD'], pal4: ['Python', 'Localization', 'MIT'], ielts: ['GPT', 'Writing', 'Python'], rrt: ['Python', 'Robotics', 'RRT']
      },
      liveAction: 'EXPLORE LIVE WORK',
      sourceAction: 'BROWSE SOURCE PROJECTS',
      scopeTitle: 'LIVE SIGNAL SCOPE',
      live: 'LIVE',
      scopeRows: [['SIGNAL MODE', 'MULTI-SURFACE'], ['ROUTE STATE', 'AUDITABLE'], ['LANGUAGE LAYER', 'EN · 繁中 · 简中 · 日本語']],
      indexTitle: 'PROJECT SCOPE',
      indexSummary: 'Ten project signals, scaled by live evidence, research depth, and study focus.',
      filterProjects: 'Filter projects',
      filters: { all: 'ALL', live: 'LIVE', source: 'SOURCE', study: 'STUDY' },
      availability: { checking: 'CHECKING ROUTE', online: 'ROUTE ONLINE', unavailable: 'CHECK ROUTE' },
      route: 'PUBLIC ROUTE',
      repository: 'PUBLIC REPOSITORY',
      external: 'OPEN REPOSITORY',
      open: 'OPEN PROJECT',
      previewOps: 'OPERATIONS',
      previewCustomer: 'CUSTOMER VIEW',
      pulseEvidence: 'PulseBoard interface evidence',
      chooseEvidence: 'Choose PulseBoard evidence view',
      opsAlt: 'PulseBoard Live Ops Console showing runtime evidence and health probe rows',
      customerAlt: 'PulseBoard customer reliability surface in Japanese',
      docs: 'API DOCS',
      footer: 'ANLAN.STORE / SIGNAL LATTICE DIRECTORY',
      backToTop: 'BACK TO TOP ↑',
      empty: 'No projects match this filter. Choose another signal group.',
      kinds: { live: 'DEPLOYED SYSTEM', source: 'OPEN-SOURCE PROJECT', study: 'STUDY TOOL' },
      descriptions: {
        heatstack: 'A bilingual AI engineering learning hub connecting daily Skill trends, safer local installation, Windows CLI workflows, structured practice, portfolio projects, and interview preparation.',
        pulseboard: 'A production-shaped reliability SaaS portfolio: Hono API, PostgreSQL, Redis, BullMQ workers, API-key boundaries, OpenAPI, and operational evidence.',
        career: 'An invite-only, account-isolated job discovery and inbox service with saved roles, unread state, and scheduled digests.',
        saa: 'Focused question-bank practice with learning progress tracking for cloud architecture preparation.',
        sap: 'Advanced architecture practice using the same progress-aware study workflow on a separate route.',
        ispm: 'A service-management practice route with focused questions and progress tracking.',
        vmd: 'A C++ and Eigen implementation of Variational Mode Decomposition for signal-processing work.',
        pal4: 'English localization work for the PC game Sword and Fairy 4, published as PAL4_EnglishMod.',
        ielts: 'A GPT-assisted tool that evaluates and improves IELTS writing drafts.',
        rrt: 'A Python implementation of bidirectional RRT Connect with dynamic-obstacle avoidance.'
      }
    },
    'zh-Hant': {
      documentTitle: 'ANLAN.STORE — 專案訊號目錄',
      topbar: '專案訊號頻段',
      profile: '我的 LinkedIn 個人資料',
      profileAria: '開啟我的 LinkedIn 個人資料（外部連結）',
      skip: '跳至專案目錄',
      chooseLanguage: '選擇入口網站語言',
      railTitle: '專案目錄',
      projectDirectory: '專案目錄',
      railAll: '查看所有專案',
      heroLabel: '線上系統 · 開源專案',
      heroTitle: '道安瀾。<br>公開構建。',
      heroLede: '我是 Dodge Ho，中文名道安瀾。這是我的開源專案空間，收錄可檢查的系統、訊號工作與實用工具。',
      identityFacts: [['身份', 'Dodge Ho · 道安瀾'], ['實踐', '系統 · 訊號 · 工具'], ['空間', '公開開源作品']],
      railKeywords: {
        heatstack: ['Astro', 'AI Skills', 'Windows CLI'], pulseboard: ['Hono', 'PostgreSQL', 'Redis'], career: ['僅限受邀', '職缺收件匣', '摘要'], saa: ['AWS', '題庫', '進度'], sap: ['AWS', '架構', '進階'], ispm: ['ITSM', '學習', '未連結'], vmd: ['C++', 'Eigen', 'VMD'], pal4: ['Python', '在地化', 'MIT'], ielts: ['GPT', '寫作', 'Python'], rrt: ['Python', '機器人', 'RRT']
      },
      liveAction: '探索線上作品',
      sourceAction: '瀏覽開源專案',
      scopeTitle: '即時訊號範圍',
      live: '運作中',
      scopeRows: [['訊號模式', '多重介面'], ['路由狀態', '可稽核'], ['語言層', 'EN · 繁中 · 简中 · 日本語']],
      indexTitle: '專案範圍',
      indexSummary: '十組專案訊號，依線上證據、研究深度與學習焦點配置尺度。',
      filterProjects: '篩選專案',
      filters: { all: '全部', live: '線上', source: '開源', study: '學習' },
      availability: { checking: '檢查路由中', online: '路由正常', unavailable: '請檢查路由' },
      route: '公開路由',
      repository: '公開儲存庫',
      external: '開啟儲存庫',
      open: '開啟專案',
      previewOps: '營運畫面',
      previewCustomer: '客戶畫面',
      pulseEvidence: 'PulseBoard 介面證據',
      chooseEvidence: '選擇 PulseBoard 證據畫面',
      opsAlt: '顯示執行期證據與健康探測列的 PulseBoard 營運主控台',
      customerAlt: '日文版 PulseBoard 客戶可靠性介面',
      docs: 'API 文件',
      footer: 'ANLAN.STORE / SIGNAL LATTICE 專案目錄',
      backToTop: '回到頂端 ↑',
      empty: '沒有符合此篩選的專案。請選擇另一個訊號群組。',
      kinds: { live: '已部署系統', source: '開源專案', study: '學習工具' },
      descriptions: {
        heatstack: '把每日 AI Skill 趨勢、安全安裝、Windows CLI、系統化練習、作品專案與面試準備串成一條工程能力路徑。',
        pulseboard: '可供檢查的可靠性 SaaS 作品：Hono API、PostgreSQL、Redis、BullMQ 工作程序、API Key 邊界、OpenAPI 與營運證據。',
        career: '僅限受邀者使用、帳戶隔離的職缺探索與收件匣服務，包含收藏職缺、未讀狀態與定期摘要。',
        saa: '提供雲端架構準備的專注題庫練習與學習進度追蹤。',
        sap: '在獨立路由上提供進階架構練習，沿用同一套具進度意識的學習流程。',
        ispm: '提供聚焦題目與進度追蹤的服務管理練習路由。',
        vmd: '使用 C++ 與 Eigen 實作的變分模態分解（Variational Mode Decomposition）訊號處理專案。',
        pal4: '為《仙劍奇俠傳四》PC 版製作的英文在地化工作，以 PAL4_EnglishMod 公開發布。',
        ielts: '使用 GPT 協助評估並改進 IELTS 寫作草稿的工具。',
        rrt: '使用 Python 實作的雙向 RRT Connect 與動態障礙物迴避演算法。'
      }
    },
    'zh-Hans': {
      documentTitle: 'ANLAN.STORE — 项目信号目录',
      topbar: '项目信号频段',
      profile: '我的 LinkedIn 个人资料',
      profileAria: '打开我的 LinkedIn 个人资料（外部链接）',
      skip: '跳至项目索引',
      chooseLanguage: '选择门户语言',
      railTitle: '项目目录',
      projectDirectory: '项目目录',
      railAll: '查看所有项目',
      heroLabel: '在线系统 · 开源项目',
      heroTitle: '道安澜。<br>公开构建。',
      heroLede: '我是 Dodge Ho，中文名道安澜。这是我的开源项目空间，收录可检查的系统、信号工作与实用工具。',
      identityFacts: [['身份', 'Dodge Ho · 道安澜'], ['实践', '系统 · 信号 · 工具'], ['空间', '公开开源作品']],
      railKeywords: {
        heatstack: ['Astro', 'AI Skills', 'Windows CLI'], pulseboard: ['Hono', 'PostgreSQL', 'Redis'], career: ['仅限受邀', '职位收件箱', '摘要'], saa: ['AWS', '题库', '进度'], sap: ['AWS', '架构', '进阶'], ispm: ['ITSM', '学习', '未链接'], vmd: ['C++', 'Eigen', 'VMD'], pal4: ['Python', '本地化', 'MIT'], ielts: ['GPT', '写作', 'Python'], rrt: ['Python', '机器人', 'RRT']
      },
      liveAction: '探索在线作品',
      sourceAction: '浏览开源项目',
      scopeTitle: '实时信号范围',
      live: '运行中',
      scopeRows: [['信号模式', '多重界面'], ['路由状态', '可审计'], ['语言层', 'EN · 繁中 · 简中 · 日本語']],
      indexTitle: '项目范围',
      indexSummary: '十组项目信号，依在线证据、研究深度与学习焦点配置尺度。',
      filterProjects: '筛选项目',
      filters: { all: '全部', live: '在线', source: '开源', study: '学习' },
      availability: { checking: '正在检查路由', online: '路由正常', unavailable: '请检查路由' },
      route: '公开路由',
      repository: '公开仓库',
      external: '打开仓库',
      open: '打开项目',
      previewOps: '运营界面',
      previewCustomer: '客户界面',
      pulseEvidence: 'PulseBoard 界面证据',
      chooseEvidence: '选择 PulseBoard 证据界面',
      opsAlt: '显示运行时证据与健康探测行的 PulseBoard 运营控制台',
      customerAlt: '日文版 PulseBoard 客户可靠性界面',
      docs: 'API 文档',
      footer: 'ANLAN.STORE / SIGNAL LATTICE 项目目录',
      backToTop: '返回顶部 ↑',
      empty: '没有项目符合此筛选条件。请选择另一组信号。',
      kinds: { live: '已部署系统', source: '开源项目', study: '学习工具' },
      descriptions: {
        heatstack: '把每日 AI Skill 趋势、安全安装、Windows CLI、系统化练习、作品项目与面试准备串成一条工程能力路径。',
        pulseboard: '可供检查的可靠性 SaaS 作品：Hono API、PostgreSQL、Redis、BullMQ 工作进程、API Key 边界、OpenAPI 与运营证据。',
        career: '仅限受邀者使用、账户隔离的职位发现与收件箱服务，包含收藏职位、未读状态与定期摘要。',
        saa: '提供云架构准备的专注题库练习与学习进度跟踪。',
        sap: '在独立路由上提供高级架构练习，沿用同一套具进度意识的学习流程。',
        ispm: '提供聚焦题目与进度跟踪的服务管理练习路由。',
        vmd: '使用 C++ 与 Eigen 实现的变分模态分解（Variational Mode Decomposition）信号处理项目。',
        pal4: '为《仙剑奇侠传四》PC 版制作的英文本地化工作，以 PAL4_EnglishMod 公开发布。',
        ielts: '使用 GPT 协助评估并改进 IELTS 写作草稿的工具。',
        rrt: '使用 Python 实现的双向 RRT Connect 与动态障碍物避障算法。'
      }
    },
    ja: {
      documentTitle: 'ANLAN.STORE — プロジェクト信号目録',
      topbar: 'プロジェクト周波数',
      profile: '私の LinkedIn プロフィール',
      profileAria: '私の LinkedIn プロフィールを開く（外部リンク）',
      skip: 'プロジェクト一覧へ移動',
      chooseLanguage: 'ポータル言語を選択',
      railTitle: 'プロジェクト目録',
      projectDirectory: 'プロジェクト目録',
      railAll: 'すべてのプロジェクト',
      heroLabel: 'ライブシステム · オープンソース',
      heroTitle: '道安瀾。<br>公開でつくる。',
      heroLede: '私は Dodge Ho、中国語名は道安瀾です。これは検証可能なシステム、信号の仕事、実用ツールを集めた私のオープンソース・プロジェクト空間です。',
      identityFacts: [['アイデンティティ', '道安瀾（ドッジ・ホー）'], ['実践', 'システム · 信号 · ツール'], ['空間', '公開オープンソース作品']],
      railKeywords: {
        heatstack: ['Astro', 'AI Skills', 'Windows CLI'], pulseboard: ['Hono', 'PostgreSQL', 'Redis'], career: ['招待制', '求人受信箱', 'ダイジェスト'], saa: ['AWS', '問題バンク', '進捗'], sap: ['AWS', 'アーキテクチャ', '上級'], ispm: ['ITSM', '学習', '未リンク'], vmd: ['C++', 'Eigen', 'VMD'], pal4: ['Python', 'ローカライズ', 'MIT'], ielts: ['GPT', 'ライティング', 'Python'], rrt: ['Python', 'ロボティクス', 'RRT']
      },
      liveAction: 'ライブ作品を見る',
      sourceAction: 'ソースプロジェクトを見る',
      scopeTitle: 'ライブ信号スコープ',
      live: '稼働中',
      scopeRows: [['信号モード', 'マルチサーフェス'], ['経路状態', '監査可能'], ['言語レイヤー', 'EN · 繁中 · 简中 · 日本語']],
      indexTitle: 'プロジェクト範囲',
      indexSummary: 'ライブの根拠、研究の深さ、学習の焦点に応じて尺度を変えた 10 件のプロジェクト信号。',
      filterProjects: 'プロジェクトを絞り込む',
      filters: { all: 'すべて', live: 'ライブ', source: 'ソース', study: '学習' },
      availability: { checking: '経路を確認中', online: '経路はオンライン', unavailable: '経路を確認' },
      route: '公開経路',
      repository: '公開リポジトリ',
      external: 'リポジトリを開く',
      open: 'プロジェクトを開く',
      previewOps: '運用画面',
      previewCustomer: '顧客画面',
      pulseEvidence: 'PulseBoard インターフェースの根拠',
      chooseEvidence: 'PulseBoard の根拠画面を選択',
      opsAlt: '実行時の根拠とヘルスプローブ行を表示した PulseBoard 運用コンソール',
      customerAlt: '日本語の PulseBoard 顧客向け信頼性画面',
      docs: 'API ドキュメント',
      footer: 'ANLAN.STORE / SIGNAL LATTICE ディレクトリ',
      backToTop: '先頭へ ↑',
      empty: 'この絞り込みに一致するプロジェクトはありません。別の信号グループを選んでください。',
      kinds: { live: 'デプロイ済みシステム', source: 'オープンソース', study: '学習ツール' },
      descriptions: {
        heatstack: '日々の AI Skill トレンド、安全な導入、Windows CLI、体系的な学習、ポートフォリオ制作、面接準備を一つのエンジニアリング経路につなぐ学習ハブです。',
        pulseboard: 'Hono API、PostgreSQL、Redis、BullMQ ワーカー、API キー境界、OpenAPI、運用根拠を備えた、検証可能な信頼性 SaaS ポートフォリオです。',
        career: '保存した求人、未読状態、定期ダイジェストを備えた、招待制・アカウント分離型の求人探索と受信箱サービスです。',
        saa: 'クラウドアーキテクチャの準備に向けた、学習進捗付きの集中特化問題バンクです。',
        sap: '別経路で同じ進捗認識型の学習フローを使う、高度なアーキテクチャ練習です。',
        ispm: '焦点を絞った問題と進捗管理を提供するサービスマネジメント練習経路です。',
        vmd: '信号処理向けの Variational Mode Decomposition を C++ と Eigen で実装したプロジェクトです。',
        pal4: 'PC 版『仙剣奇侠伝四』の英語ローカライズ作業で、PAL4_EnglishMod として公開されています。',
        ielts: 'IELTS ライティング草稿を GPT で評価・改善する支援ツールです。',
        rrt: '動的障害物回避を備えた双方向 RRT Connect の Python 実装です。'
      }
    }
  };

  const projects = [
    { id: 'heatstack', category: 'live', layout: 'feature', color: 'orange', name: 'HeatStack', alias: 'AI 热栈', route: '/heatstack/', action: '/heatstack/', actionKey: 'open', railKeywords: ['Astro', 'AI Skills', 'Windows CLI'], tags: ['Astro', 'AI Skills', 'Windows CLI'] },
    { id: 'pulseboard', category: 'live', layout: 'feature', color: 'cyan', name: 'PulseBoard', route: '/demo/', action: '/demo/', actionKey: 'open', railKeywords: ['Hono', 'PostgreSQL', 'Redis'], tags: ['Hono', 'PostgreSQL', 'Redis', 'BullMQ', 'Docker'], links: [{ href: '/demo/docs', key: 'docs' }] },
    { id: 'career', category: 'live', layout: 'major', color: 'orange', name: 'Career Radar', alias: '职海雷达 · キャリアレーダー', route: '/jobs/', action: '/jobs/', actionKey: 'open', railKeywords: ['invite-only', 'inbox', 'digests'], tags: ['invite-only', 'inbox', 'digests'] },
    { id: 'saa', category: 'study', layout: 'study', color: 'cobalt', name: 'SAA Practice', route: '/saa/', action: '/saa/', actionKey: 'open', railKeywords: ['AWS', 'questions', 'progress'], tags: ['AWS', 'practice', 'progress'] },
    { id: 'sap', category: 'study', layout: 'study-small', color: 'violet', name: 'SAP Practice', route: '/sap/', action: '/sap/', actionKey: 'open', railKeywords: ['AWS', 'architecture', 'advanced'], tags: ['AWS', 'advanced', 'practice'] },
    { id: 'ispm', category: 'study', layout: 'quiet', color: 'orange', name: 'ISPM Practice', railLinked: false, railKeywords: ['ITSM', 'study', 'unlinked'], tags: ['ITSM', 'practice', 'progress'] },
    { id: 'vmd', category: 'source', layout: 'research', color: 'violet', name: 'VMD_cpp', route: 'https://github.com/DodgeHo/VMD_cpp', action: 'https://github.com/DodgeHo/VMD_cpp', actionKey: 'external', railKeywords: ['C++', 'Eigen', 'VMD'], tags: ['C++', 'Eigen', 'signal processing'] },
    { id: 'pal4', category: 'source', layout: 'source', color: 'orange', name: 'PAL4 translation', alias: 'PAL4_EnglishMod', route: 'https://github.com/DodgeHo/PAL4_EnglishMod', action: 'https://github.com/DodgeHo/PAL4_EnglishMod', actionKey: 'external', railKeywords: ['Python', 'localization', 'MIT'], tags: ['Python', 'localization', 'MIT'] },
    { id: 'ielts', category: 'source', layout: 'source-compact', color: 'cobalt', name: 'IELTS writing GPT', alias: 'IELTS_writing_GPT', route: 'https://github.com/DodgeHo/IELTS_writing_GPT', action: 'https://github.com/DodgeHo/IELTS_writing_GPT', actionKey: 'external', railKeywords: ['GPT', 'writing', 'Python'], tags: ['GPT', 'writing', 'Python'] },
    { id: 'rrt', category: 'source', layout: 'source-wide', color: 'cyan', name: 'Dynamic RRT Connect', alias: 'dynamic_rrt_connect', route: 'https://github.com/DodgeHo/dynamic_rrt_connect', action: 'https://github.com/DodgeHo/dynamic_rrt_connect', actionKey: 'external', railKeywords: ['Python', 'robotics', 'RRT'], tags: ['Python', 'robotics', 'planning'] }
  ];

  const localeButtons = Array.from(document.querySelectorAll('[data-locale]'));
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const projectList = document.querySelector('#project-list');
  const railList = document.querySelector('#rail-list');
  const emptyState = document.querySelector('#empty-state');
  let currentLocale = 'en';
  let currentFilter = 'all';

  const t = () => copy[currentLocale];
  const iconExternal = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3h7v7M13 3 6.5 9.5M12 9.5V13H3V4h3.5" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="square"/></svg>';

  const safeStoredLocale = () => {
    try {
      const stored = window.localStorage.getItem(localeStorageKey);
      return stored && copy[stored] ? stored : 'en';
    } catch { return 'en'; }
  };

  const renderRail = () => {
    railList.innerHTML = projects.map((project, index) => {
      const keywords = t().railKeywords[project.id] ?? project.railKeywords;
      const content = `<span class="rail-number">${String(index + 1).padStart(2, '0')}</span><span class="rail-name">${project.name}</span><span class="rail-keywords">${keywords.join(' · ')}</span>`;
      const destination = project.railLinked === false
        ? `<span class="rail-record" aria-label="${project.name}">${content}</span>`
        : `<a href="#project-${project.id}" data-rail-project="${project.id}">${content}</a>`;
      return `<li class="rail-item${project.railLinked === false ? ' is-unlinked' : ''}" style="--rail-color:${projectColors[project.color]}">${destination}</li>`;
    }).join('');
  };

  const makeStatus = (project) => project.category !== 'live' || !project.route ? '' : `
    <span class="status-label is-checking" data-route-status="${project.route}"><i aria-hidden="true"></i><span>${t().availability.checking}</span></span>`;

  const makeEvidence = () => `
    <div class="pulse-evidence" aria-label="${t().pulseEvidence}">
      <div class="evidence-frame">
        <img class="is-active" data-preview="ops" src="__PULSEBOARD_OPS_IMAGE__" alt="${t().opsAlt}">
        <img data-preview="customer" src="__PULSEBOARD_CUSTOMER_IMAGE__" alt="${t().customerAlt}">
      </div>
      <div class="evidence-controls" role="group" aria-label="${t().chooseEvidence}">
        <button type="button" data-preview-target="ops" aria-pressed="true">${t().previewOps}</button>
        <button type="button" data-preview-target="customer" aria-pressed="false">${t().previewCustomer}</button>
        <a class="row-action" href="/demo/docs">${t().docs}</a>
      </div>
    </div>`;

  const renderProjects = () => {
    projectList.innerHTML = projects.map((project, index) => {
      const external = project.category === 'source';
      const action = !project.action ? '' : external
        ? `<a class="row-action" href="${project.action}" target="_blank" rel="noreferrer">${t()[project.actionKey]}${iconExternal}</a>`
        : `<a class="row-action" href="${project.action}">${t()[project.actionKey]}</a>`;
      const sourceOrRoute = external ? t().repository : t().route;
      const routeLine = project.route ? `<p class="project-route"><span>${sourceOrRoute}</span><code>${project.route}</code></p>` : '';
      return `<article class="project-row layout-${project.layout}" id="project-${project.id}" data-project data-category="${project.category}" data-route="${external || !project.route ? '' : project.route}" style="--project-color:${projectColors[project.color]}">
        <span class="project-order">${String(index + 1).padStart(2, '0')}</span>
        <div><p class="project-title">${project.name}</p>${project.alias ? `<p class="project-alias">${project.alias}</p>` : ''}</div>
        <div class="project-copy"><p class="project-description">${t().descriptions[project.id]}</p>${routeLine}<ul class="project-tags">${project.tags.map((tag) => `<li>${tag}</li>`).join('')}</ul>${makeStatus(project)}</div>
        ${action}
        ${project.id === 'pulseboard' ? makeEvidence() : ''}
      </article>`;
    }).join('');
    bindEvidenceControls();
    checkRoutes();
  };

  const bindEvidenceControls = () => {
    const buttons = Array.from(document.querySelectorAll('[data-preview-target]'));
    const images = Array.from(document.querySelectorAll('[data-preview]'));
    buttons.forEach((button) => button.addEventListener('click', () => {
      const target = button.dataset.previewTarget;
      buttons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
      images.forEach((image) => image.classList.toggle('is-active', image.dataset.preview === target));
    }));
  };

  const renderScopeReadout = () => {
    document.querySelector('#scope-readout').innerHTML = t().scopeRows.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('');
  };

  const renderIdentityFacts = () => {
    document.querySelector('#identity-facts').innerHTML = t().identityFacts.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('');
  };

  const applyFilter = (filter) => {
    currentFilter = filter;
    filterButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    const rows = Array.from(document.querySelectorAll('[data-project]'));
    let visible = 0;
    rows.forEach((row) => {
      const show = filter === 'all' || row.dataset.category === filter;
      row.hidden = !show;
      if (show) visible += 1;
    });
    emptyState.hidden = visible > 0;
  };

  const setRouteStatus = (path, state) => {
    document.querySelectorAll(`[data-route-status="${path}"]`).forEach((element) => {
      element.classList.remove('is-checking', 'is-online', 'is-unavailable');
      element.classList.add(`is-${state}`);
      const text = element.querySelector('span');
      if (text) text.textContent = t().availability[state];
    });
  };

  const fetchRoute = async (path) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5500);
    try {
      let response = await fetch(path, { method: 'HEAD', cache: 'no-store', credentials: 'same-origin', signal: controller.signal });
      if (response.status === 405 || response.status === 501) response = await fetch(path, { method: 'GET', cache: 'no-store', credentials: 'same-origin', headers: { Range: 'bytes=0-0' }, signal: controller.signal });
      return response.ok || (response.status >= 300 && response.status < 400);
    } catch { return false; }
    finally { window.clearTimeout(timeout); }
  };

  const checkRoutes = async () => {
    const routes = [...new Set(projects.filter((project) => project.category === 'live' && project.route).map((project) => project.route))];
    if (window.location.protocol === 'file:') {
      routes.forEach((path) => setRouteStatus(path, 'checking'));
      return;
    }
    await Promise.all(routes.map(async (path) => setRouteStatus(path, (await fetchRoute(path)) ? 'online' : 'unavailable')));
  };

  const applyLocale = (locale, persist = false) => {
    currentLocale = copy[locale] ? locale : 'en';
    document.documentElement.lang = currentLocale;
    document.title = t().documentTitle;
    localeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.locale === currentLocale)));
    document.querySelector('#topbar-state').textContent = t().topbar;
    document.querySelector('#skip-link').textContent = t().skip;
    document.querySelector('#locale-switcher').setAttribute('aria-label', t().chooseLanguage);
    document.querySelector('#profile-link-label').textContent = t().profile;
    document.querySelector('.profile-link').setAttribute('aria-label', t().profileAria);
    document.querySelector('#rail-title').textContent = t().railTitle;
    document.querySelector('#rail-nav').setAttribute('aria-label', t().projectDirectory);
    document.querySelector('#rail-all-link span:nth-child(2)').textContent = t().railAll;
    document.querySelector('#portal-title').innerHTML = t().heroTitle;
    document.querySelector('#hero-lede').textContent = t().heroLede;
    document.querySelector('#hero-live-action span').textContent = t().liveAction;
    document.querySelector('#hero-source-action span').textContent = t().sourceAction;
    document.querySelector('#live-scope-title').textContent = t().scopeTitle;
    document.querySelector('#live-label').textContent = t().live;
    document.querySelector('#project-index-title').textContent = t().indexTitle;
    document.querySelector('#index-summary').textContent = t().indexSummary;
    document.querySelector('#filter-controls').setAttribute('aria-label', t().filterProjects);
    document.querySelector('#footer-left').textContent = t().footer;
    document.querySelector('#footer-top').textContent = t().backToTop;
    document.querySelector('#empty-state').textContent = t().empty;
    filterButtons.forEach((button) => { button.textContent = t().filters[button.dataset.filter]; });
    renderIdentityFacts();
    renderScopeReadout();
    renderRail();
    renderProjects();
    applyFilter(currentFilter);
    if (persist) {
      try { window.localStorage.setItem(localeStorageKey, currentLocale); } catch { /* Preference persistence is optional. */ }
    }
  };

  const drawWave = () => {
    const canvas = document.querySelector('#scope-wave');
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const render = (time) => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width * ratio));
      const height = Math.max(1, Math.round(bounds.height * ratio));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const w = bounds.width; const h = bounds.height; const phase = time / 1300;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#050b1d'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(23,214,255,.22)'; ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += 26) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, h); ctx.stroke(); }
      for (let y = 0; y <= h; y += 26) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); ctx.stroke(); }
      ctx.strokeStyle = '#ff8f1f'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, h * .52); ctx.lineTo(w, h * .52); ctx.stroke();
      const markerX = w * (.5 + Math.sin(phase * .65) * .14);
      ctx.strokeStyle = '#ff8f1f'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(markerX, 0); ctx.lineTo(markerX, h); ctx.stroke();
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const xNorm = x / w;
        const y = h * .51 - Math.sin(xNorm * Math.PI * 13 + phase) * h * .28 * (0.68 + .32 * Math.sin(xNorm * Math.PI * 4 - phase));
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#17d6ff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#f4f8ff'; ctx.beginPath(); ctx.arc(markerX, h * .52, 4, 0, Math.PI * 2); ctx.fill();
      if (!reduce) frame = window.requestAnimationFrame(render);
    };
    render(0);
    return () => window.cancelAnimationFrame(frame);
  };

  const drawLattice = () => {
    const canvas = document.querySelector('#signal-lattice');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return () => {};
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const render = (time) => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(window.innerWidth * ratio));
      const height = Math.max(1, Math.round(window.innerHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const w = window.innerWidth; const h = window.innerHeight; const phase = time / 1700;
      ctx.clearRect(0, 0, w, h);
      const bands = [{ y: h * .16, color: 'rgba(23,214,255,.22)', freq: .009 }, { y: h * .71, color: 'rgba(138,85,255,.17)', freq: .0065 }];
      bands.forEach((band, index) => {
        ctx.strokeStyle = band.color; ctx.lineWidth = 1; ctx.beginPath();
        for (let x = 0; x <= w; x += 9) {
          const y = band.y + Math.sin(x * band.freq + phase * (index ? .75 : 1)) * 22 + Math.sin(x * band.freq * 2.9 - phase) * 7;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      for (let x = 18; x < w; x += 72) {
        const barHeight = 9 + ((Math.sin(x * .075 + phase) + 1) * 17);
        ctx.fillStyle = x % 3 ? 'rgba(51,128,255,.15)' : 'rgba(255,143,31,.2)';
        ctx.fillRect(x, h - 24 - barHeight, 2, barHeight);
      }
      if (!reduce) frame = window.requestAnimationFrame(render);
    };
    render(0);
    return () => window.cancelAnimationFrame(frame);
  };

  localeButtons.forEach((button) => button.addEventListener('click', () => applyLocale(button.dataset.locale || 'en', true)));
  filterButtons.forEach((button) => button.addEventListener('click', () => applyFilter(button.dataset.filter || 'all')));
  document.querySelector('.profile-link').href = profileUrl;
  applyLocale(safeStoredLocale());
  drawWave();
  drawLattice();
})();
