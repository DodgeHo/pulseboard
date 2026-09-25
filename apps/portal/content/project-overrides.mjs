const four = (en, zhHant, zhHans, ja) => ({ en, "zh-Hant": zhHant, "zh-Hans": zhHans, ja });
const nameMap = four;

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
    auxiliaryName: nameMap("AI 热栈", "AI 熱棧", "AI 热栈", "AI 熱棧"),
    liveRoutes: ["/heatstack/"],
    evidence: ["Live demo", "Case study", "Architecture"],
    safeSummary: four(
      "An AI Skill plaza for learning and improving with agents, combining daily hot Skill browsing, batch download and install flows, and an entry into Understanding AI Agents.",
      "AI Skill 廣場，面向 AI 學習、Agent 科普與精進，整合每日熱門 Skill 瀏覽、批次下載安裝流程，並提供《深入理解 AI Agent》入口。",
      "AI Skill 广场，面向 AI 学习、Agent 科普与精进，整合每日热点 Skill 浏览、批量 Skill 下载安装，并提供《深入理解 AI Agent》入口。",
      "AI Skill の広場として、日々の注目 Skill の閲覧、まとめてダウンロードして導入する流れ、Agent の学習と理解を支援し、『深入理解 AI Agent』への入口も備えています。"
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
    auxiliaryName: nameMap("职海雷达", "職海雷達", "职海雷达", "職海雷達"),
    liveRoutes: ["/jobs/"],
    evidence: ["Live demo", "Case study", "Architecture"],
    safeSummary: four(
      "An invite-only job exploration product with account-isolated collection, a role inbox, unread state, and scheduled summaries for repeated review.",
      "採邀請制的職缺探索產品，透過帳戶隔離的收藏、職缺收件匣、未讀狀態與排程摘要支援反覆檢視。",
      "采用邀请制的职位探索产品，通过账户隔离的职位收藏、收件箱、未读状态与定时摘要支持持续筛选。",
      "招待制の求人探索プロダクトで、アカウント分離された保存、求人受信箱、未読状態、定期サマリーによって継続的な確認を支えます。"
    )
  },
  {
    name: "TapPhysics",
    slug: "tapphysics",
    visibility: "public",
    origin: "original",
    featured: true,
    showInArchive: true,
    publishCaseStudy: false,
    category: "applications",
    score: 91,
    skills: ["Physics", "Interactive web", "Simulation"],
    auxiliaryName: nameMap("一点物理", "一點物理", "一点物理", "一点物理"),
    liveRoutes: ["/tapphysics/"],
    evidence: ["Live demo", "Interactive project"],
    safeSummary: four(
      "An offline Gaokao physics past-question tool for high school students and physics teachers, covering local question search, practice, paper assembly, and print-ready workflows.",
      "一點物理是面向高中生與物理教師的離線高考物理真題工具，支援本地找題、練習、組卷與列印前準備。",
      "一点物理是一款面向高中生和物理教师的离线高考物理真题工具，支持本地找题、练习、组卷和打印准备。",
      "高校生と物理教師向けのオフライン高考物理過去問ツールで、ローカルでの問題検索、練習、組題、印刷準備を支えます。"
    )
  },
  {
    name: "CWC",
    slug: "cwc",
    visibility: "private",
    privateRepository: false,
    closedSource: true,
    origin: "original",
    featured: true,
    showInArchive: true,
    publishCaseStudy: true,
    category: "applications",
    score: 90,
    skills: ["Closed source", "Product engineering", "System design"],
    auxiliaryName: nameMap("CellLoc Web Controller- 细胞定位网络控制系统", "CellLoc Web Controller- 細胞定位網路控制系統", "CellLoc Web Controller- 细胞定位网络控制系统", "CellLoc Web Controller- 细胞定位网络控制系统"),
    liveRoutes: [],
    evidence: ["Security-reviewed overview", "Project record"],
    safeSummary: four(
      "A closed-source CellLoc web controller overview that states the product direction and public engineering boundary without exposing customers, data, infrastructure, internal implementation, or proprietary algorithms.",
      "閉源的 CellLoc 網路控制系統公開概覽，只說明產品方向與可公開工程邊界，不揭露客戶、資料、基礎設施、內部實作或專有演算法。",
      "闭源的 CellLoc 网络控制系统公开概览，只说明产品方向与可公开工程边界，不披露客户、数据、基础设施、内部实现或专有算法。",
      "クローズドソースの CellLoc Web Controller 概要で、製品の方向性と公開可能な工程境界だけを示し、顧客、データ、インフラ、内部実装、独自アルゴリズムは公開しません。"
    )
  },
  {
    name: "PuzzleWear",
    slug: "puzzlewear",
    visibility: "private",
    privateRepository: false,
    closedSource: true,
    origin: "original",
    featured: true,
    showInArchive: true,
    publishCaseStudy: false,
    category: "applications",
    score: 87,
    skills: ["Closed source", "Product interface", "Web"],
    auxiliaryName: nameMap("拼频品聘-服装创意设计", "拼頻品聘-服裝創意設計", "拼频品聘-服装创意设计", "拼频品聘-服装创意设计"),
    liveRoutes: ["https://puzzlewear.cn/login"],
    evidence: ["Public project site", "Closed-source record"],
    safeSummary: four(
      "A closed-source clothing creative design project presented through its public project site, with internal implementation details intentionally kept outside the public record.",
      "閉源的服裝創意設計專案，透過公開專案網站呈現產品方向，內部實作細節刻意不放入公開作品面。",
      "闭源的服装创意设计项目，通过公开项目网站呈现产品方向，内部实现细节有意不进入公开项目页。",
      "クローズドソースの服飾クリエイティブデザインプロジェクトで、公開サイトでは製品の方向性だけを示し、内部実装は公開面に出しません。"
    )
  },
  {
    name: "DevEnglish",
    slug: "devenglish",
    visibility: "private",
    privateRepository: false,
    closedSource: true,
    origin: "original",
    featured: false,
    showInArchive: true,
    publishCaseStudy: false,
    category: "applications",
    score: 72,
    skills: ["Closed source", "English learning", "Web"],
    auxiliaryName: nameMap("开发者英语练习站", "開發者英語練習站", "开发者英语练习站", "开发者英语练习站"),
    liveRoutes: ["https://devenglish.club/"],
    evidence: ["Public project site", "Closed-source record"],
    safeSummary: four(
      "A closed-source developer English learning project whose public site shows the learning direction while keeping private implementation details outside the project surface.",
      "閉源的開發者英語學習專案，公開網站呈現學習方向，私人實作細節不進入專案公開面。",
      "闭源的开发者英语学习项目，公开网站呈现学习方向，私有实现细节不进入项目公开面。",
      "クローズドソースの開発者向け英語学習プロジェクトで、公開サイトでは学習の方向性を示し、非公開実装はプロジェクト面に出しません。"
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
    auxiliaryName: nameMap("SAP Practice-亚马逊云做题练习", "SAP Practice-亞馬遜雲做題練習", "SAP Practice-亚马逊云做题练习", "SAP Practice-亚马逊云做题练习"),
    liveRoutes: ["/sap/"],
    evidence: ["Live demo"],
    safeSummary: four(
      "An Amazon cloud question-practice product for advanced architecture study, with focused sessions and progress-aware review on a separate SAP route.",
      "面向進階架構學習的亞馬遜雲做題練習產品，在獨立 SAP 路由中提供聚焦練習與進度回顧。",
      "面向高级架构学习的亚马逊云做题练习产品，在独立 SAP 路由中提供聚焦练习与进度回顾。",
      "高度なアーキテクチャ学習向けの Amazon クラウド問題練習プロダクトで、SAP 専用ルートで集中演習と進捗レビューを行います。"
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
    auxiliaryName: nameMap("运营脉冲板", "營運脈衝板", "运营脉冲板", "运营脉冲板"),
    liveRoutes: ["/demo/", "/demo/frontend/", "/demo/docs"],
    evidence: ["Live demo", "Case study", "Architecture", "Runbook", "ADR", "Verification"],
    safeSummary: four(
      "A backend, platform, and operations system with public API docs, health checks, background worker flow, data storage, rate limiting, and deployment verification.",
      "後端、平台與營運系統，公開呈現 API 文件、健康檢查、背景 worker 流程、資料儲存、限流與部署驗證。",
      "后端、平台与运营系统，公开呈现 API 文档、健康检查、后台 worker 流程、数据存储、限流和部署验证。",
      "バックエンド、プラットフォーム、運用のためのシステムで、API ドキュメント、ヘルスチェック、バックグラウンド worker、データ保存、レート制限、デプロイ検証を公開範囲で示します。"
    )
  },
  VMD_cpp: {
    featured: true,
    category: "research",
    score: 88,
    family: "vmd",
    skills: ["C++", "Eigen", "Signal processing", "VMD"],
    evidence: ["Source", "Research implementation"],
    safeSummary: four(
      "The core 1D implementation in a VMD project family, using C++ and Eigen for signal-processing experiments.",
      "VMD 專案族的核心一維實作，以 C++ 與 Eigen 用於訊號處理實驗。",
      "VMD 项目族的核心一维实现，以 C++ 与 Eigen 用于信号处理实验。",
      "VMD プロジェクトファミリーの中核となる 1D 実装で、C++ と Eigen を信号処理実験に使います。"
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
    auxiliaryName: nameMap("SAA Practice-亚马逊云做题练习", "SAA Practice-亞馬遜雲做題練習", "SAA Practice-亚马逊云做题练习", "SAA Practice-亚马逊云做题练习"),
    liveRoutes: ["/saa/"],
    evidence: ["Live demo", "Source"],
    safeSummary: four(
      "An Amazon cloud question-practice product for SAA preparation, combining focused practice sessions with progress tracking.",
      "面向 SAA 準備的亞馬遜雲做題練習產品，結合聚焦題目練習與進度追蹤。",
      "面向 SAA 备考的亚马逊云做题练习产品，结合聚焦题目练习与进度跟踪。",
      "SAA 対策向けの Amazon クラウド問題練習プロダクトで、集中した問題演習と進捗記録を組み合わせています。"
    )
  },
  CEEMDAN_cpp: {
    category: "research",
    score: 74,
    skills: ["C++", "CEEMDAN", "Signal processing"],
    evidence: ["Source", "Research implementation"],
    safeSummary: four(
      "A C++ implementation of CEEMDAN for empirical mode decomposition and signal-processing experiments, presented alongside the VMD project family.",
      "以 C++ 實作 CEEMDAN，用於經驗模態分解與訊號處理實驗，並與 VMD 專案族並列呈現。",
      "以 C++ 实现 CEEMDAN，用于经验模态分解与信号处理实验，并与 VMD 项目族并列呈现。",
      "経験的モード分解と信号処理実験のための CEEMDAN を C++ で実装し、VMD プロジェクトファミリーと並べて示しています。"
    )
  },
  VMD_2D_cpp: { category: "research", score: 70, family: "vmd", skills: ["C++", "2D VMD", "Signal processing"] },
  VMD_2D_CPP_OpenCV: { category: "research", score: 62 },
  VMD_2D_python: { category: "research", score: 67, family: "vmd", skills: ["Python", "2D VMD", "Signal processing"] },
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
  cwc: {
    updatedAt: "2026-09-24",
    assets: [],
    sections: {
      problem: four(
        "CWC is a closed-source project, so its public record must explain the product direction without turning private implementation context into public documentation.",
        "CWC 是閉源專案，因此公開記錄必須在不把私人實作背景變成公開文件的前提下，說明產品方向。",
        "CWC 是闭源项目，因此公开记录必须在不把私有实现背景变成公开文档的前提下，说明产品方向。",
        "CWC はクローズドソースのため、非公開の実装背景を公開文書に変えずに、プロジェクトの輪郭を説明できる公開面が必要です。"
      ),
      role: four(
        "I present CWC through a deliberately limited project record: enough context to understand the product boundary, without publishing private implementation details.",
        "我以刻意受限的專案記錄呈現 CWC：提供足以理解產品邊界的背景，但不公開私人實作細節。",
        "我以刻意受限的项目记录呈现 CWC：提供足以理解产品边界的背景，但不披露私有实现细节。",
        "製品境界を理解できるだけの背景を示し、非公開の実装詳細は出さない、意図的に限定した記録として CWC を公開しています。"
      ),
      constraints: four(
        "The public boundary excludes source code, private infrastructure, credentials, client or employer details, internal data, and proprietary operating records.",
        "公開邊界排除原始碼、私人基礎設施、憑據、客戶或雇主細節、內部資料與專有運作記錄。",
        "公开边界排除源代码、私有基础设施、凭据、客户或雇主细节、内部数据与专有运行记录。",
        "公開範囲にはソースコード、非公開インフラ、認証情報、顧客や雇用主の詳細、内部データ、専有の運用記録を含めません。"
      ),
      decisions: four(
        "A static, multilingual page preserves a stable explanation while keeping the repository and operational boundary closed.",
        "靜態多語言頁面保留穩定說明，同時維持儲存庫與運作邊界的封閉。",
        "静态多语言页面保留稳定说明，同时维持仓库与运行边界的封闭。",
        "静的な多言語ページで安定した説明を保ちながら、リポジトリと運用の境界を非公開に保ちます。"
      ),
      architecture: four(
        "The public architecture is intentionally simple: a static project overview, a clear private-project status, and no source or download action.",
        "公開架構刻意保持簡單：靜態專案概覽、清楚的閉源狀態，以及不提供原始碼或下載操作。",
        "公开架构刻意保持简单：静态项目概览、清楚的闭源状态，以及不提供源码或下载操作。",
        "公開側の構成は意図的に単純です。静的な概要、明確な非公開ステータス、ソースやダウンロード操作を持たせません。"
      ),
      evidence: four(
        "The evidence boundary is the public-safe project explanation itself. It is not a substitute for access to the closed repository.",
        "證據邊界就是這份可公開的專案說明；它不是閉源儲存庫存取權的替代品。",
        "证据边界就是这份可公开的项目说明；它不是闭源仓库存取权的替代品。",
        "証拠の範囲は、この公開可能なプロジェクト説明そのものです。非公開リポジトリへのアクセスを代替するものではありません。"
      ),
      result: four(
        "CWC now has a durable public entry that communicates its place in the project set without exposing private material.",
        "CWC 現在擁有可長期使用的公開入口，能說明其在專案集合中的位置，同時不暴露私人資料。",
        "CWC 现在拥有可长期使用的公开入口，能说明其在项目集合中的位置，同时不暴露私有资料。",
        "CWC は、非公開情報を露出せずにプロジェクト群の中での位置づけを伝える、長期利用可能な公開入口になりました。"
      ),
      limits: four(
        "This page intentionally does not claim private metrics, customers, deployment addresses, source access, or implementation details that are not approved for publication.",
        "此頁面刻意不宣稱未獲准公開的私人指標、客戶、部署位址、原始碼存取權或實作細節。",
        "此页面刻意不宣称未获准公开的私有指标、客户、部署地址、源码访问权或实现细节。",
        "このページでは、公開承認されていない非公開の指標、顧客、デプロイ先、ソースアクセス、実装詳細を意図的に主張しません。"
      )
    }
  },
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
      result: four("The result is an inspectable engineering system: visitors can move from product behavior to API and operational proof without relying on invented usage metrics.", "成果是一套可檢查的工程系統：訪客能從產品行為一路追到 API 與運維證據，不依賴虛構的使用數據。", "成果是一套可检查的工程系统：访客能从产品行为一路追到 API 与运维证据，不依赖虚构的使用数据。", "架空の利用指標に頼らず、製品挙動から API と運用証拠まで追跡できるエンジニアリングシステムになりました。"),
      limits: four("This remains a review-scale deployment. Load testing, multi-region failover, and production alert delivery are intentionally outside the current evidence boundary.", "這仍是審閱規模的部署。負載測試、多區域容錯與正式告警投遞目前不在證據範圍內。", "这仍是审阅规模的部署。负载测试、多区域容错与正式告警投递目前不在证据范围内。", "これはレビュー規模のデプロイです。負荷試験、マルチリージョンのフェイルオーバー、本番通知配信は現在の証拠範囲外です。")
    }
  },
  heatstack: {
    updatedAt: "2026-08-17",
    assets: ["architecture", "practice-guide"],
    sections: {
      problem: four("AI learning resources move quickly, but trend lists alone do not help a Windows-based learner inspect Skills, install them safely, or keep a durable learning path.", "AI 學習資源變動很快，但單純的趨勢清單無法協助 Windows 使用者檢查 Skill、安全安裝，或維持可持續的學習路徑。", "AI 学习资源变化很快，但单纯的趋势清单无法帮助 Windows 用户检查 Skill、安全安装，或维持可持续的学习路径。", "AI 学習資源は変化が速く、トレンド一覧だけでは Windows 利用者が Skill を確認し、安全に導入し、継続的な学習経路を保つことはできません。"),
      role: four("I designed the content model, bilingual learning path, local-installation safety guidance, Skill browsing flow, and deployed web experience.", "我設計內容模型、雙語學習路徑、本機安裝安全指引、Skill 瀏覽流程與部署後的網站體驗。", "我设计内容模型、双语学习路径、本地安装安全指引、Skill 浏览流程与部署后的网站体验。", "コンテンツモデル、バイリンガル学習経路、ローカル導入の安全指針、Skill 閲覧フロー、公開 Web 体験を設計しました。"),
      constraints: four("Recommendations must stay useful as tools change, avoid unsafe one-line installation habits, and work for learners who use Windows terminals.", "建議必須能因應工具變化，避免不安全的一行安裝習慣，並適用於使用 Windows 終端機的學習者。", "建议必须能应对工具变化，避免不安全的一行安装习惯，并适用于使用 Windows 终端的学习者。", "ツールの変化に耐え、危険な一行インストールを避け、Windows ターミナル利用者にも機能する必要があります。"),
      decisions: four("The experience connects each trend to prerequisites, inspection steps, guided practice, batch install/download paths, and Agent learning notes instead of treating popularity as mastery.", "每個趨勢都連接到先備條件、檢查步驟、引導式練習、批次下載安裝路徑與 Agent 學習筆記，而不是把熱門程度當成能力。", "每个趋势都连接到前置条件、检查步骤、引导式练习、批量下载安装路径与 Agent 学习笔记，而不是把热度当成能力。", "人気を習得と見なさず、各トレンドを前提条件、確認手順、ガイド付き実践、一括ダウンロードと導入経路、Agent 学習メモへ接続します。"),
      architecture: four("A static-first Astro surface separates editorial content, ranked Skill data, safety notes, and reusable learning modules while remaining inexpensive to host.", "靜態優先的 Astro 介面分離編輯內容、Skill 排名資料、安全提示與可重用學習模組，同時維持低成本託管。", "静态优先的 Astro 界面分离编辑内容、Skill 排名数据、安全提示与可复用学习模块，同时保持低成本托管。", "静的優先の Astro 構成で、編集コンテンツ、Skill 順位、安全メモ、再利用可能な学習モジュールを分離し、低コストで配信します。"),
      evidence: four("The deployed route, real learning modules, Skill browsing data, installation checks, bilingual content, and Agent book entry provide inspectable proof.", "已部署路由、真實學習模組、Skill 瀏覽資料、安裝檢查、雙語內容與 Agent 書籍入口提供可檢查的證據。", "已部署路由、真实学习模块、Skill 浏览数据、安装检查、双语内容与 Agent 书籍入口提供可检查的证据。", "公開ルート、実際の学習モジュール、Skill 閲覧データ、導入チェック、バイリンガル内容、Agent 書籍入口が検証可能な証拠です。"),
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
