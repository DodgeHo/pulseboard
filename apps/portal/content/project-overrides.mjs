const four = (en, zhHant, zhHans, ja) => ({ en, "zh-Hant": zhHant, "zh-Hans": zhHans, ja });

export const privateSummary = four(
  "A private engineering project retained in the complete inventory. Its implementation, repository history, and operational details are intentionally not published.",
  "收錄於完整清單中的私人工程專案。實作、版本歷史與運作細節均刻意不公開。",
  "收录于完整清单中的私人工程项目。实现、版本历史与运行细节均有意不公开。",
  "完全な目録に記録された非公開のエンジニアリングプロジェクトです。実装、履歴、運用詳細は意図的に公開していません。"
);

export const liveProjects = [
  {
    name: "HeatStack",
    slug: "heatstack",
    visibility: "public",
    origin: "original",
    featured: true,
    showInArchive: true,
    publishCaseStudy: true,
    category: "applications",
    score: 100,
    skills: ["Astro", "AI Skills", "Windows CLI"],
    liveRoutes: ["/heatstack/"],
    evidence: ["Live demo", "Case study", "Architecture"],
    safeSummary: four(
      "A bilingual AI engineering learning hub that turns fast-moving Skill trends into safer installation paths, structured practice, portfolio work, and interview preparation.",
      "雙語 AI 工程學習中心，把快速變動的 Skill 趨勢轉化為更安全的安裝路徑、結構化實作、作品集專案與面試準備。",
      "双语 AI 工程学习中心，把快速变化的 Skill 趋势转化为更安全的安装路径、结构化练习、作品集项目与面试准备。",
      "変化の速い AI Skill の動向を、安全な導入、体系的な実践、ポートフォリオ制作、面接準備へつなぐバイリンガル学習ハブです。"
    )
  },
  {
    name: "Career Radar",
    slug: "career-radar",
    visibility: "public",
    origin: "original",
    featured: true,
    showInArchive: true,
    publishCaseStudy: true,
    category: "applications",
    score: 96,
    skills: ["Account isolation", "Job inbox", "Scheduled digests"],
    liveRoutes: ["/jobs/"],
    evidence: ["Live demo", "Case study", "Architecture"],
    safeSummary: four(
      "An invite-only, account-isolated job discovery and inbox service with saved roles, unread state, and scheduled digests.",
      "採邀請制與帳戶隔離的職缺探索及收件匣服務，包含收藏職缺、未讀狀態與排程摘要。",
      "采用邀请制与账户隔离的职位探索及收件箱服务，包含收藏职位、未读状态与定时摘要。",
      "招待制とアカウント分離を採用し、保存求人、未読状態、定期ダイジェストを備えた求人探索・受信箱サービスです。"
    )
  },
  {
    name: "SAP Practice",
    slug: "sap-practice",
    visibility: "public",
    origin: "original",
    featured: false,
    showInArchive: true,
    publishCaseStudy: false,
    category: "learning",
    score: 54,
    skills: ["AWS", "Architecture", "Progress tracking"],
    liveRoutes: ["/sap/"],
    evidence: ["Live demo"],
    safeSummary: four(
      "An advanced cloud architecture practice route with progress-aware question sessions.",
      "具備進度追蹤的進階雲端架構題庫練習路徑。",
      "具备进度跟踪的高级云架构题库练习路径。",
      "進捗を記録する上級クラウドアーキテクチャ問題演習です。"
    )
  }
];

export const repositoryOverrides = {
  pulseboard: {
    slug: "pulseboard",
    featured: true,
    publishCaseStudy: true,
    category: "applications",
    score: 99,
    skills: ["Hono", "PostgreSQL", "Redis", "BullMQ", "Docker"],
    liveRoutes: ["/demo/", "/demo/frontend/", "/demo/docs"],
    evidence: ["Live demo", "Case study", "Architecture", "Runbook", "ADR", "Verification"],
    safeSummary: four(
      "A production-shaped reliability SaaS portfolio with API-key boundaries, queues, health probes, OpenAPI, and inspectable operational evidence.",
      "具備 API 金鑰邊界、佇列、健康探針、OpenAPI 與可檢查運維證據的生產型可靠性 SaaS 作品。",
      "具备 API 密钥边界、队列、健康探针、OpenAPI 与可检查运维证据的生产型可靠性 SaaS 作品。",
      "API キー境界、キュー、ヘルスプローブ、OpenAPI、検証可能な運用証拠を備えた本番志向の信頼性 SaaS ポートフォリオです。"
    )
  },
  VMD_cpp: {
    featured: true,
    category: "research",
    score: 88,
    skills: ["C++", "Eigen", "Signal processing", "VMD"],
    evidence: ["Source", "Research implementation"],
    safeSummary: four(
      "A C++ and Eigen implementation of Variational Mode Decomposition for signal-processing experiments.",
      "以 C++ 與 Eigen 實作變分模態分解，用於訊號處理實驗。",
      "以 C++ 与 Eigen 实现变分模态分解，用于信号处理实验。",
      "信号処理実験のための Variational Mode Decomposition を C++ と Eigen で実装しています。"
    )
  },
  PAL4_EnglishMod: {
    featured: true,
    category: "applications",
    score: 84,
    skills: ["Python", "Localization", "Game tooling"],
    evidence: ["Source", "Released localization"],
    safeSummary: four(
      "English localization tooling and release work for the PC game Sword and Fairy 4.",
      "為 PC 遊戲《仙劍奇俠傳四》製作的英文在地化工具與發布成果。",
      "为 PC 游戏《仙剑奇侠传四》制作的英文本地化工具与发布成果。",
      "PC ゲーム『仙剣奇侠伝四』向けの英語ローカライズ用ツールと公開成果です。"
    )
  },
  IELTS_writing_GPT: {
    featured: true,
    category: "applications",
    score: 78,
    skills: ["JavaScript", "GPT", "English learning"],
    evidence: ["Source"],
    safeSummary: four(
      "A GPT-assisted tool for evaluating and improving IELTS writing drafts.",
      "使用 GPT 協助評估與改善 IELTS 寫作草稿的工具。",
      "使用 GPT 协助评估与改善 IELTS 写作草稿的工具。",
      "IELTS ライティング草稿の評価と改善を GPT で支援するツールです。"
    )
  },
  dynamic_rrt_connect: {
    featured: true,
    category: "research",
    score: 80,
    skills: ["Python", "Robotics", "RRT Connect", "Path planning"],
    evidence: ["Source", "Algorithm implementation"],
    safeSummary: four(
      "A Python implementation of bidirectional RRT Connect with dynamic-obstacle avoidance.",
      "以 Python 實作具動態障礙避讓的雙向 RRT Connect。",
      "以 Python 实现具动态障碍避让的双向 RRT Connect。",
      "動的障害物回避を備えた双方向 RRT Connect の Python 実装です。"
    )
  },
  "aws-saa-learning-skill": {
    slug: "saa-practice",
    category: "learning",
    score: 60,
    skills: ["Dart", "AWS", "Question bank", "Progress tracking"],
    liveRoutes: ["/saa/"],
    evidence: ["Live demo", "Source"]
  },
  CEEMDAN_cpp: { category: "research", score: 74, skills: ["C++", "CEEMDAN", "Signal processing"] },
  VMD_2D_cpp: { category: "research", score: 70 },
  VMD_2D_CPP_OpenCV: { category: "research", score: 62 },
  VMD_2D_python: { category: "research", score: 67 },
  PulsePal_test: { category: "research", score: 65 },
  EEG_Fourier_frequency_filter: { category: "research", score: 61 },
  MATLAB_Tutorials_and_Exercise: { category: "research", score: 58 },
  ShapeContext_cpp: { category: "research", score: 60 },
  SVWRPCA: { category: "research", score: 63 },
  "01_polyAseq_py27": { category: "research", score: 56 },
  adEBHMMs: { category: "research", score: 55 },
  CodeLexicon: { category: "applications", score: 69 },
  GPT_translator_Dodge: { category: "applications", score: 68 },
  IELTSReadingQuizMaker: { category: "applications", score: 64 },
  PAL1_EnglishMod: { category: "applications", score: 66 },
  PAL4_Voice_Volume_Patch: { category: "applications", score: 62 },
  Venn: { category: "applications", score: 57 },
  "Wechat-questionnaire": { category: "applications", score: 52 }
};

export const caseStudies = {
  pulseboard: {
    updatedAt: "2026-08-17",
    assets: ["architecture", "deployment-runbook", "reliability-adr", "verification-record"],
    sections: {
      problem: four("Reliability work is hard to judge from screenshots alone. PulseBoard needed to expose the system boundaries, failure behavior, and operational controls that make a small SaaS credible.", "可靠性工程無法只靠截圖判斷。PulseBoard 必須呈現系統邊界、失敗行為與運維控制，讓小型 SaaS 的可信度可被檢查。", "可靠性工程无法只靠截图判断。PulseBoard 必须呈现系统边界、失败行为与运维控制，让小型 SaaS 的可信度可被检查。", "信頼性はスクリーンショットだけでは判断できません。小規模 SaaS の妥当性を検証できるよう、境界、障害時の挙動、運用制御を公開する必要がありました。"),
      role: four("I designed and implemented the public product surface, API contract, persistence model, worker flow, deployment plan, and verification suite.", "我負責公開產品介面、API 契約、持久化模型、工作佇列、部署計畫與驗證套件的設計及實作。", "我负责公开产品界面、API 契约、持久化模型、工作队列、部署计划与验证套件的设计及实现。", "公開 UI、API 契約、永続化モデル、ワーカーフロー、デプロイ計画、検証スイートを設計・実装しました。"),
      constraints: four("The system had to remain inexpensive, locally reproducible, explicit about authentication boundaries, and deployable without committing secrets.", "系統必須維持低成本、可在本機重現、清楚劃分驗證邊界，且部署時不提交秘密。", "系统必须保持低成本、可在本机复现、清楚划分认证边界，并且部署时不提交秘密。", "低コスト、ローカル再現性、明確な認証境界、シークレットをコミットしないデプロイが制約でした。"),
      decisions: four("Hono keeps the API small, PostgreSQL owns durable state, Redis and BullMQ isolate asynchronous checks, and Nginx preserves a stable public namespace under /demo/.", "Hono 維持 API 精簡，PostgreSQL 管理持久狀態，Redis 與 BullMQ 隔離非同步檢查，Nginx 則維持 `/demo/` 下穩定的公開命名空間。", "Hono 保持 API 精简，PostgreSQL 管理持久状态，Redis 与 BullMQ 隔离异步检查，Nginx 则维持 `/demo/` 下稳定的公开命名空间。", "Hono で API を小さく保ち、PostgreSQL が永続状態を管理し、Redis と BullMQ が非同期チェックを分離し、Nginx が `/demo/` の公開名前空間を維持します。"),
      architecture: four("Requests cross an API-key boundary before reaching workspace-scoped resources. Jobs enter a queue, workers execute checks, and health endpoints expose liveness and dependency readiness separately.", "請求先通過 API 金鑰邊界，再進入工作區範圍資源。工作送入佇列，由 worker 執行檢查；健康端點分別呈現存活與相依服務就緒狀態。", "请求先通过 API 密钥边界，再进入工作区范围资源。任务送入队列，由 worker 执行检查；健康端点分别呈现存活与依赖服务就绪状态。", "リクエストは API キー境界を通過してからワークスペース単位の資源へ到達します。ジョブはキューに入り、ワーカーが検査を実行し、ヘルスエンドポイントは生存性と依存関係の準備状態を分けて示します。"),
      evidence: four("The live console, customer view, OpenAPI document, health probes, tests, ADR, deployment runbook, and public-surface verifier form the evidence set.", "線上控制台、客戶介面、OpenAPI、健康探針、測試、ADR、部署 Runbook 與公開介面驗證器共同構成工程證據。", "在线控制台、客户界面、OpenAPI、健康探针、测试、ADR、部署 Runbook 与公开界面验证器共同构成工程证据。", "ライブコンソール、顧客画面、OpenAPI、ヘルスプローブ、テスト、ADR、デプロイ Runbook、公開面検証が証拠を構成します。"),
      result: four("The result is an inspectable portfolio system: visitors can move from product behavior to API and operational proof without relying on invented usage metrics.", "成果是一套可檢查的作品系統：訪客能從產品行為一路追到 API 與運維證據，不依賴虛構的使用數據。", "成果是一套可检查的作品系统：访客能从产品行为一路追到 API 与运维证据，不依赖虚构的使用数据。", "架空の利用指標に頼らず、製品挙動から API と運用証拠まで追跡できるポートフォリオシステムになりました。"),
      limits: four("This remains a portfolio-scale deployment. Load testing, multi-region failover, and production alert delivery are intentionally outside the current evidence boundary.", "這仍是作品集規模的部署。負載測試、多區域容錯與正式告警投遞目前不在證據範圍內。", "这仍是作品集规模的部署。负载测试、多区域容错与正式告警投递目前不在证据范围内。", "これはポートフォリオ規模のデプロイです。負荷試験、マルチリージョンのフェイルオーバー、本番通知配信は現在の証拠範囲外です。")
    }
  },
  heatstack: {
    updatedAt: "2026-08-17",
    assets: ["architecture", "practice-guide"],
    sections: {
      problem: four("AI learning resources move quickly, but trend lists alone do not help a Windows-based learner install tools safely or turn them into demonstrable engineering work.", "AI 學習資源變動很快，但單純的趨勢清單無法協助 Windows 使用者安全安裝工具，或把學習轉化為可展示的工程成果。", "AI 学习资源变化很快，但单纯的趋势清单无法帮助 Windows 用户安全安装工具，或把学习转化为可展示的工程成果。", "AI 学習資源は変化が速く、トレンド一覧だけでは Windows 利用者が安全に導入し、学習を実証可能な成果へ変えることはできません。"),
      role: four("I designed the content model, bilingual learning path, local-installation safety guidance, portfolio progression, and deployed web experience.", "我設計內容模型、雙語學習路徑、本機安裝安全指引、作品集進程與部署後的網站體驗。", "我设计内容模型、双语学习路径、本地安装安全指引、作品集进程与部署后的网站体验。", "コンテンツモデル、バイリンガル学習経路、ローカル導入の安全指針、ポートフォリオ進行、公開 Web 体験を設計しました。"),
      constraints: four("Recommendations must stay useful as tools change, avoid unsafe one-line installation habits, and work for learners who use Windows terminals.", "建議必須能因應工具變化，避免不安全的一行安裝習慣，並適用於使用 Windows 終端機的學習者。", "建议必须能应对工具变化，避免不安全的一行安装习惯，并适用于使用 Windows 终端的学习者。", "ツールの変化に耐え、危険な一行インストールを避け、Windows ターミナル利用者にも機能する必要があります。"),
      decisions: four("The experience connects each trend to prerequisites, inspection steps, guided practice, a portfolio outcome, and interview prompts instead of treating popularity as mastery.", "每個趨勢都連接到先備條件、檢查步驟、引導式練習、作品成果與面試問題，而不是把熱門程度當成能力。", "每个趋势都连接到前置条件、检查步骤、引导式练习、作品成果与面试问题，而不是把热度当成能力。", "人気を習得と見なさず、各トレンドを前提条件、検査手順、ガイド付き実践、成果物、面接質問へ接続します。"),
      architecture: four("A static-first Astro surface separates editorial content, ranked Skill data, safety notes, and reusable learning modules while remaining inexpensive to host.", "靜態優先的 Astro 介面分離編輯內容、Skill 排名資料、安全提示與可重用學習模組，同時維持低成本託管。", "静态优先的 Astro 界面分离编辑内容、Skill 排名数据、安全提示与可复用学习模块，同时保持低成本托管。", "静的優先の Astro 構成で、編集コンテンツ、Skill 順位、安全メモ、再利用可能な学習モジュールを分離し、低コストで配信します。"),
      evidence: four("The deployed route, real learning modules, installation checks, bilingual content, and portfolio tasks provide inspectable proof.", "已部署路由、真實學習模組、安裝檢查、雙語內容與作品任務提供可檢查的證據。", "已部署路由、真实学习模块、安装检查、双语内容与作品任务提供可检查的证据。", "公開ルート、実際の学習モジュール、導入チェック、バイリンガル内容、制作課題が検証可能な証拠です。"),
      result: four("HeatStack acts as a durable learning asset rather than a disposable trend post, with a route from discovery to practice and proof.", "HeatStack 成為可持續累積的學習資產，而非一次性的趨勢文章，讓使用者從發現一路走到實作與證明。", "HeatStack 成为可持续积累的学习资产，而非一次性的趋势文章，让用户从发现一路走到实践与证明。", "HeatStack は使い捨てのトレンド投稿ではなく、発見から実践と証明へ進む持続的な学習資産です。"),
      limits: four("Trend freshness depends on the upstream collection process, and individual Skill quality still requires human judgment before recommendation.", "趨勢新鮮度取決於上游收集流程，每項 Skill 的品質仍需人工判斷後才能推薦。", "趋势新鲜度取决于上游收集流程，每项 Skill 的质量仍需人工判断后才能推荐。", "トレンドの鮮度は上流の収集工程に依存し、各 Skill の品質は推薦前に人の判断が必要です。")
    }
  },
  "career-radar": {
    updatedAt: "2026-08-17",
    assets: ["architecture", "privacy-boundaries"],
    sections: {
      problem: four("Job discovery becomes noisy when saved roles, unread changes, and recurring searches live in separate tools.", "當收藏職缺、未讀變化與定期搜尋分散在不同工具時，求職探索很快就會變得混亂。", "当收藏职位、未读变化与定期搜索分散在不同工具时，求职探索很快就会变得混乱。", "保存求人、未読更新、定期検索が別々のツールに分かれると、求人探索はすぐに雑然とします。"),
      role: four("I designed the invite-only workflow, account boundaries, inbox model, scheduled digest behavior, and public deployment route.", "我設計邀請制流程、帳戶邊界、收件匣模型、排程摘要行為與公開部署路由。", "我设计邀请制流程、账户边界、收件箱模型、定时摘要行为与公开部署路由。", "招待制フロー、アカウント境界、受信箱モデル、定期ダイジェスト、公開ルートを設計しました。"),
      constraints: four("The service must keep account data isolated, avoid exposing job activity publicly, and still provide a reviewable product surface.", "服務必須隔離帳戶資料、不公開求職活動，同時仍提供可供檢查的產品介面。", "服务必须隔离账户数据、不公开求职活动，同时仍提供可供检查的产品界面。", "アカウントデータを分離し、求人活動を公開せず、それでも確認可能な製品面を提供する必要があります。"),
      decisions: four("Invite-only access narrows exposure; account-scoped records keep saved and unread state separate; scheduled digests turn repeated checking into a deliberate workflow.", "邀請制縮小暴露面；帳戶範圍記錄分離收藏與未讀狀態；排程摘要把重複檢查轉成明確流程。", "邀请制缩小暴露面；账户范围记录分离收藏与未读状态；定时摘要把重复检查转成明确流程。", "招待制で露出を絞り、アカウント単位の記録で保存・未読状態を分離し、定期ダイジェストで反復確認を明確な流れに変えます。"),
      architecture: four("A routed application surface sits behind authentication, with account-scoped inbox data and scheduled work separated from request-time interaction.", "路由式應用介面置於驗證之後，帳戶範圍收件匣資料與排程工作也和請求時互動分離。", "路由式应用界面位于认证之后，账户范围收件箱数据与定时任务也和请求时交互分离。", "ルーティングされたアプリ面を認証の後ろに置き、アカウント単位の受信箱データと定期処理をリクエスト時の操作から分離します。"),
      evidence: four("The live login route, isolated product shell, inbox states, and scheduled digest behavior are the current evidence boundary.", "線上登入路由、隔離的產品介面、收件匣狀態與排程摘要行為構成目前的證據邊界。", "在线登录路由、隔离的产品界面、收件箱状态与定时摘要行为构成目前的证据边界。", "公開ログインルート、分離された製品面、受信箱状態、定期ダイジェストの挙動が現在の証拠範囲です。"),
      result: four("The project demonstrates product and privacy judgment without publishing user data or inventing business outcomes.", "此專案展示產品與隱私判斷，同時不公開使用者資料，也不虛構商業成果。", "此项目展示产品与隐私判断，同时不公开用户数据，也不虚构商业成果。", "ユーザーデータや架空の事業成果を公開せずに、製品とプライバシーの判断を示しています。"),
      limits: four("The public case study deliberately omits internal data structures, account details, infrastructure addresses, and private operational records.", "公開案例刻意省略內部資料結構、帳戶細節、基礎設施位址與私人運維記錄。", "公开案例有意省略内部数据结构、账户细节、基础设施地址与私人运维记录。", "公開ケーススタディでは、内部データ構造、アカウント詳細、インフラアドレス、非公開運用記録を意図的に省略しています。")
    }
  }
};
