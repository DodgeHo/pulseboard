const four = (en, zhHant, zhHans, ja) => ({ en, "zh-Hant": zhHant, "zh-Hans": zhHans, ja });
const nameMap = four;
const media = (fileName, source, kind = "mark") => ({
  src: `/assets/project-media/${fileName}`,
  source,
  kind
});

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
    auxiliaryName: nameMap("AI 热栈", "AI 热栈", "AI 热栈", "AI 热栈"),
    liveRoutes: ["/heatstack/"],
    evidence: ["Live demo", "Case study", "Architecture"],
    safeSummary: four(
      "An AI Skill plaza for agent learning: daily hot Skill browsing, batch Skill download and installation, and the Understanding AI Agents learning entry.",
      "AI Skill 廣場，面向 AI 學習、Agent 科普與精進，整合每日熱門 Skill 瀏覽、批次下載安裝流程，並提供《深入理解 AI Agent》入口。",
      "AI Skill 广场，面向 AI 学习、Agent 科普与精进，整合每日热点 Skill 浏览、批量 Skill 下载安装，并提供《深入理解 AI Agent》入口。",
      "Agent 学習のための AI Skill 広場です。日々の注目 Skill、まとめてダウンロードして導入する流れ、『深入理解 AI Agent』への入口を備えています。"
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
    skills: ["Account isolation", "Agent workflows", "Scheduled digests"],
    auxiliaryName: nameMap("职海雷达", "职海雷达", "职海雷达", "职海雷达"),
    liveRoutes: ["/jobs/"],
    evidence: ["Live demo", "Case study", "Architecture"],
    safeSummary: four(
      "An invite-only Career Radar product that separates public discovery, tenant-scoped matching/explanation, delivery digests, AI assessment preparation, and inbox state into reviewable agent-labeled workflows.",
      "採邀請制的 Career Radar 產品，把公開職缺探索、帳戶範圍匹配與解釋、投遞摘要、AI 評估準備和收件匣狀態拆成可檢查的 Agent 標記工作流。",
      "采用邀请制的 Career Radar 产品，把公开职位发现、账户范围匹配与解释、投递摘要、AI 评估准备和收件箱状态拆成可检查的 Agent 标记工作流。",
      "招待制の Career Radar です。公開求人の発見、アカウント単位のマッチングと説明、配信ダイジェスト、AI 評価準備、受信箱状態を、確認可能な Agent ラベル付きワークフローに分けています。"
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
    skills: ["Tauri", "SQLite", "Question review"],
    auxiliaryName: nameMap("一点物理", "一点物理", "一点物理", "一点物理"),
    liveRoutes: ["/tapphysics/"],
    evidence: ["Live demo", "Interactive project"],
    safeSummary: four(
      "An offline Gaokao physics question-bank desktop app for search, practice, paper assembly, rich question review, and export. Evidence supports a Tauri-style Alpha/Beta desktop workflow over SQLite-backed data; Windows/macOS packaging is kept as a target boundary rather than a published-release claim. Agent help stays bounded to supervised export/review workflows.",
      "一点物理是離線高考物理桌面題庫工具，支援找題、練習、組卷、富文本題目審閱與匯出。證據支援以 Tauri 形態維護 Alpha/Beta 桌面流程與 SQLite 資料；Windows/macOS 只作為桌面封裝目標邊界，不宣稱已公開發版。Agent 只在受監督的匯出與審閱流程中輔助。",
      "一点物理是离线高考物理桌面题库工具，支持找题、练习、组卷、富文本题目审阅与导出。证据支持以 Tauri 形态维护 Alpha/Beta 桌面流程与 SQLite 数据；Windows/macOS 只作为桌面打包目标边界，不宣称已公开发版。Agent 只在受监督的导出与审阅流程中辅助。",
      "オフライン高考物理のデスクトップ問題バンクアプリです。検索、演習、組題、リッチな問題レビュー、エクスポートを扱います。証拠上は SQLite データを使う Tauri 型の Alpha/Beta デスクトップ工程として示し、Windows/macOS は公開リリースの主張ではなくパッケージング対象の境界として扱います。Agent は人が監督する書き出し・レビュー工程で補助する範囲に留めています。"
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
    auxiliaryName: nameMap("CellLoc Web Controller- 细胞定位网络控制系统", "CellLoc Web Controller- 细胞定位网络控制系统", "CellLoc Web Controller- 细胞定位网络控制系统", "CellLoc Web Controller- 细胞定位网络控制系统"),
    liveRoutes: [],
    evidence: ["Security-reviewed overview", "Project record"],
    media: media("cwc-coordinate-record.png", "D:\\CWC\\Screenshots20260608\\1.png, reviewed and copied as a public-safe CWC prototype screenshot", "screenshot"),
    safeSummary: four(
      "A closed-source web controller for cell-location workflows: coordinate recording, image association, embedding, trimming, session organization, and export are shown through a limited public overview.",
      "閉源的 CellLoc Web 控制系統，涵蓋座標記錄、圖像關聯、包埋、修塊、Session 組織與匯出；公開頁只呈現受限且安全的概覽。",
      "闭源的 CellLoc Web 控制系统，涵盖坐标记录、图像关联、包埋、修块、Session 组织与导出；公开页只呈现受限且安全的概览。",
      "細胞定位ワークフロー向けのクローズドソース Web Controller です。座標記録、画像関連付け、包埋、修塊、Session 管理、エクスポートを、限定した公開概要として示します。"
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
    auxiliaryName: nameMap("拼频品聘-服装创意设计", "拼频品聘-服装创意设计", "拼频品聘-服装创意设计", "拼频品聘-服装创意设计"),
    liveRoutes: ["https://puzzlewear.cn/login"],
    evidence: ["Public project site", "Closed-source record"],
    safeSummary: four(
      "A closed-source fashion design platform for product configuration, outfit composition, component choices, colors, pattern matrices, and layer-structure workflows.\n\nThe engineering record is limited to the latest resume-backed scope: REST API design, PostgreSQL/JSONB models for design sessions and product parameters, admin/backend modules, supply-chain data flows, and supervised AI-assisted delivery evidence.",
      "閉源的服裝設計平台，面向產品配置、服裝搭配、組件選擇、顏色、版型矩陣與圖層結構流程。\n\n工程記錄僅保守呈現最新簡歷可支持的範圍：REST API、面向設計 Session 與產品參數的 PostgreSQL/JSONB 模型、後台/後端模組、供應鏈資料流與受監督 AI 輔助交付證據。",
      "闭源的服装设计平台，面向产品配置、服装搭配、组件选择、颜色、版型矩阵与图层结构流程。\n\n工程记录仅保守呈现最新简历可支持的范围：REST API、面向设计 Session 与产品参数的 PostgreSQL/JSONB 模型、后台/后端模块、供应链数据流与受监督 AI 辅助交付证据。",
      "製品設定、コーディネート、コンポーネント選択、色、パターン行列、レイヤー構造のワークフローを扱うクローズドソースのファッション設計プラットフォームです。\n\n工程記録は最新レジュメで裏付けられる範囲に限定します。REST API、デザインセッションと製品パラメータ向けの PostgreSQL/JSONB モデル、管理・バックエンドモジュール、サプライチェーンデータフロー、監督下の AI 支援開発です。"
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
    auxiliaryName: nameMap("开发者英语练习站", "开发者英语练习站", "开发者英语练习站", "开发者英语练习站"),
    liveRoutes: ["https://devenglish.club/"],
    evidence: ["Public project site", "Closed-source record"],
    safeSummary: four(
      "A closed-source developer English learning site that presents the learning entry while course, account, and operational details stay outside the public portfolio surface.\n\nThe verified engineering scope comes from the latest resume-backed online education work behind it: React, NestJS, Drizzle ORM, PostgreSQL, REST APIs, course purchase, scheduling, payment/refund support, and teacher/student/admin role flows.",
      "閉源的開發者英語學習站，公開面呈現學習入口，課程、帳戶與運營細節不放入作品集公開面。\n\n可核對的工程範圍來自最新簡歷支持的線上教育平台工作：React、NestJS、Drizzle ORM、PostgreSQL、REST API、課程購買、排課、付款/退款支援，以及教師、學生、管理員角色流程。",
      "闭源的开发者英语学习站，公开面呈现学习入口，课程、账户与运营细节不放入作品集公开面。\n\n可核对的工程范围来自最新简历支持的在线教育平台工作：React、NestJS、Drizzle ORM、PostgreSQL、REST API、课程购买、排课、付款/退款支持，以及教师、学生、管理员角色流程。",
      "開発者向け英語学習のクローズドソースサイトです。公開面では学習入口を示し、コース、アカウント、運用詳細は公開ポートフォリオ面に出しません。\n\n確認できる工程範囲は、最新レジュメで裏付けられるオンライン教育プラットフォームの仕事です。React、NestJS、Drizzle ORM、PostgreSQL、REST API、コース購入、スケジューリング、支払い・返金支援、教師・学生・管理者ロールのフローを含みます。"
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
    auxiliaryName: nameMap("SAP Practice-亚马逊云做题练习", "SAP Practice-亚马逊云做题练习", "SAP Practice-亚马逊云做题练习", "SAP Practice-亚马逊云做题练习"),
    liveRoutes: ["/sap/"],
    evidence: ["Live demo"],
    safeSummary: four(
      "An Amazon cloud question-practice product for advanced architecture study, with a separate SAP route for focused sessions and progress review.",
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
    auxiliaryName: nameMap("运营脉冲板", "运营脉冲板", "运营脉冲板", "运营脉冲板"),
    liveRoutes: ["/demo/", "/demo/frontend/", "/demo/docs"],
    evidence: ["Live demo", "Case study", "Architecture", "Runbook", "ADR", "Verification"],
    media: media("pulseboard-ops.png", "apps/portal/src/assets/pulseboard-ops.png, real PulseBoard operations screenshot", "screenshot"),
    safeSummary: four(
      "A production-shaped Hono/PostgreSQL/Redis/BullMQ SaaS engineering template with ten implemented interface locales for foreign-trade scenarios, API-key boundaries, OpenAPI, health probes, workers, and verification scripts.",
      "面向外貿 SaaS 場景的工程模板：以 Hono、PostgreSQL、Redis、BullMQ 串起十種已實作介面語言、API key 邊界、OpenAPI、健康探測、worker 與驗證腳本。",
      "面向外贸 SaaS 场景的工程模板：以 Hono、PostgreSQL、Redis、BullMQ 串起十种已实现界面语言、API key 边界、OpenAPI、健康探测、worker 与验证脚本。",
      "外貿 SaaS 場面を想定した Hono/PostgreSQL/Redis/BullMQ の工程テンプレートです。実装済みの 10 UI ロケール、API key 境界、OpenAPI、ヘルスプローブ、worker、検証スクリプトを備えます。"
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
  BiliDownTrans: {
    featured: true,
    category: "applications",
    score: 77,
    skills: ["Python", "Bilibili", "faster-whisper", "PySide6"],
    evidence: ["Source", "README", "Release notes"],
    media: media("bilidowntrans-icon.svg", "https://github.com/DodgeHo/BiliDownTrans/blob/main/assets/pipeline_icon.svg", "icon"),
    safeSummary: four(
      "A fork-based desktop pipeline that combines Bili23 Downloader with faster-whisper so completed Bilibili downloads can enter a local GPU transcription queue and produce subtitle/text outputs.",
      "基於 Fork 整合的桌面流水線，把 Bili23 Downloader 與 faster-whisper 串起來，讓 B 站下載完成後進入本機 GPU 轉錄佇列並輸出字幕與文字。",
      "基于 Fork 整合的桌面流水线，把 Bili23 Downloader 与 faster-whisper 串起来，让 B 站下载完成后进入本机 GPU 转录队列并输出字幕与文本。",
      "Bili23 Downloader と faster-whisper を組み合わせた Fork ベースのデスクトップパイプラインです。Bilibili のダウンロード完了後、ローカル GPU 文字起こしキューに入り、字幕とテキストを出力します。"
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
    auxiliaryName: nameMap("SAA Practice-亚马逊云做题练习", "SAA Practice-亚马逊云做题练习", "SAA Practice-亚马逊云做题练习", "SAA Practice-亚马逊云做题练习"),
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
    updatedAt: "2026-10-09",
    assets: [],
    visuals: [
      {
        src: "/assets/project-media/cwc-coordinate-record.png",
        caption: four(
          "Coordinate-recording prototype view with calibration, position capture, motion controls, and an event log.",
          "座標記錄原型畫面，呈現校準、位置記錄、運動控制與事件日誌。",
          "坐标记录原型画面，呈现校准、位置记录、运动控制与事件日志。",
          "校正、位置記録、運動制御、イベントログを含む座標記録プロトタイプ画面です。"
        )
      },
      {
        src: "/assets/project-media/cwc-embedding-flow.png",
        caption: four(
          "Embedding workflow view with pre-checks, target selection, alignment, path planning, and hardware-state panels.",
          "包埋流程畫面，包含前置檢查、目標選擇、對準、路徑規劃與硬體狀態面板。",
          "包埋流程画面，包含前置检查、目标选择、对准、路径规划与硬件状态面板。",
          "前提チェック、対象選択、位置合わせ、経路計画、ハードウェア状態を示す包埋ワークフロー画面です。"
        )
      },
      {
        src: "/assets/project-media/cwc-session-export.png",
        caption: four(
          "Session organization view showing the JSON/CSV/image export boundary used for archived experiment data.",
          "Session 組織畫面，展示用於實驗歸檔的 JSON/CSV/圖像匯出邊界。",
          "Session 组织画面，展示用于实验归档的 JSON/CSV/图像导出边界。",
          "実験データの保管に使う JSON/CSV/画像エクスポート境界を示す Session 管理画面です。"
        )
      }
    ],
    sections: {
      problem: four(
        "Biomedical cell-location work can lose position context when microscope capture, embedding, trimming, and data export live in separate tools.",
        "生物醫學細胞定位流程若把顯微鏡拍攝、包埋、修塊與資料匯出分散在不同工具中，很容易丟失位置上下文。",
        "生物医学细胞定位流程如果把显微镜拍摄、包埋、修块与数据导出分散在不同工具中，很容易丢失位置上下文。",
        "顕微鏡での取得、包埋、修塊、データ出力が別々のツールに分かれると、生物医学の細胞定位作業では位置文脈を失いやすくなります。"
      ),
      role: four(
        "I built the public-safe explanation from the PRD, software manual, local source metadata, and reviewed prototype screenshots while keeping source code and operational details private.",
        "我根據 PRD、軟體說明書、本地源碼元資料與已審核原型截圖製作可公開說明，同時保留源碼與運行細節的閉源邊界。",
        "我根据 PRD、软件说明书、本地源码元数据与已审核原型截图制作可公开说明，同时保留源码与运行细节的闭源边界。",
        "PRD、ソフトウェア説明書、ローカルのソースメタ情報、確認済みプロトタイプ画像から公開可能な説明を作り、ソースコードと運用詳細は非公開に保っています。"
      ),
      constraints: four(
        "The public boundary excludes source code, private infrastructure, credentials, client or employer details, internal data, and proprietary operating records.",
        "公開邊界排除原始碼、私人基礎設施、憑據、客戶或雇主細節、內部資料與專有運作記錄。",
        "公开边界排除源代码、私有基础设施、凭据、客户或雇主细节、内部数据与专有运行记录。",
        "公開範囲にはソースコード、非公開インフラ、認証情報、顧客や雇用主の詳細、内部データ、専有の運用記録を含めません。"
      ),
      decisions: four(
        "The public page uses only a static overview and sanitized screenshots: enough to show the workflow, not enough to publish clone, API, download, credentials, internal addresses, customer data, or proprietary operating records.",
        "公開頁只使用靜態概覽與經檢查截圖：足以展示流程，但不公開 clone/API/下載入口、憑據、內部地址、客戶資料或專有運行記錄。",
        "公开页只使用静态概览与经过检查的截图：足以展示流程，但不公开 clone/API/下载入口、凭据、内部地址、客户资料或专有运行记录。",
        "公開ページは静的な概要と確認済み画像だけを使います。流れは示しますが、clone/API/ダウンロード入口、認証情報、内部アドレス、顧客データ、専有運用記録は公開しません。"
      ),
      architecture: four(
        "The verified local stack is a web UI plus Python FastAPI backend: the manual describes HTTP REST and WebSocket communication, a hardware abstraction layer for Moonraker and RS485 devices, and file-based JSON/image session storage.",
        "已核對的本地技術邊界是 Web UI 加 Python FastAPI 後端：說明書描述 HTTP REST、WebSocket、面向 Moonraker 與 RS485 設備的硬體抽象層，以及 JSON/圖像檔案式 Session 存儲。",
        "已核对的本地技术边界是 Web UI 加 Python FastAPI 后端：说明书描述 HTTP REST、WebSocket、面向 Moonraker 与 RS485 设备的硬件抽象层，以及 JSON/图像文件式 Session 存储。",
        "確認済みのローカル構成は Web UI と Python FastAPI バックエンドです。説明書では HTTP REST、WebSocket、Moonraker と RS485 デバイス向け HAL、JSON/画像ファイルによる Session 保存を説明しています。"
      ),
      evidence: four(
        "Evidence used here is limited to the latest local README/PRD-derived material, the June 2026 software manual/PDF, local package metadata, and three reviewed screenshots from the coordinate, embedding, and session-export flows.",
        "此頁使用的證據限於最新本地 README/PRD 來源資料、2026 年 6 月軟體說明書/PDF、本地套件元資料，以及三張經審核的座標、包埋與 Session 匯出流程截圖。",
        "此页使用的证据限于最新本地 README/PRD 来源资料、2026 年 6 月软件说明书/PDF、本地包元数据，以及三张经审核的坐标、包埋与 Session 导出流程截图。",
        "ここで使う証拠は、最新のローカル README/PRD 由来資料、2026 年 6 月のソフトウェア説明書/PDF、ローカル package メタ情報、座標・包埋・Session 出力の確認済み画像 3 点に限定しています。"
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
      decisions: four("Invite-only access narrows exposure; account-scoped records keep saved and unread state separate; discovery, matching/explanation, and delivery-agent labels make the workflow boundaries visible; scheduled digests turn repeated checking into a deliberate workflow.", "邀請制縮小暴露面；帳戶範圍記錄分離收藏與未讀狀態；探索、匹配/解釋與投遞 Agent 標籤讓工作流邊界可見；排程摘要把重複檢查轉成明確流程。", "邀请制缩小暴露面；账户范围记录分离收藏与未读状态；探索、匹配/解释与投递 Agent 标签让工作流边界可见；定时摘要把重复检查转成明确流程。", "招待制で露出を絞り、アカウント単位の記録で保存・未読状態を分離します。発見、マッチング/説明、配信 Agent のラベルでワークフロー境界を見えるようにし、定期ダイジェストで反復確認を明確な流れに変えます。"),
      architecture: four("A routed application surface sits behind authentication, with tenant-scoped inbox data, preview-only email behavior, AI-assessment gates, and scheduled pipeline/notify/backup work separated from request-time interaction.", "路由式應用介面置於驗證之後，帳戶範圍收件匣資料、僅預覽的郵件行為、AI 評估門檻，以及 pipeline/notify/backup 排程工作都和請求時互動分離。", "路由式应用界面位于认证之后，账户范围收件箱数据、仅预览的邮件行为、AI 评估门槛，以及 pipeline/notify/backup 定时任务都和请求时交互分离。", "ルーティングされたアプリ面を認証の後ろに置き、テナント単位の受信箱データ、プレビューのみのメール挙動、AI 評価ゲート、pipeline/notify/backup の定期処理を、リクエスト時の操作から分離します。"),
      evidence: four("The live login route, isolated product shell, inbox states, scheduled digest controls, workflow labels, tests, and documented privacy boundary are the current evidence boundary.", "線上登入路由、隔離的產品介面、收件匣狀態、排程摘要控制、工作流標籤、測試與隱私邊界文件構成目前的證據邊界。", "在线登录路由、隔离的产品界面、收件箱状态、定时摘要控制、工作流标签、测试与隐私边界文档构成目前的证据边界。", "公開ログインルート、分離された製品面、受信箱状態、定期ダイジェスト制御、ワークフローラベル、テスト、プライバシー境界文書が現在の証拠範囲です。"),
      result: four("The project demonstrates product and privacy judgment without publishing user data or inventing business outcomes.", "此專案展示產品與隱私判斷，同時不公開使用者資料，也不虛構商業成果。", "此项目展示产品与隐私判断，同时不公开用户数据，也不虚构商业成果。", "ユーザーデータや架空の事業成果を公開せずに、製品とプライバシーの判断を示しています。"),
      limits: four("The public case study deliberately omits internal data structures, account details, infrastructure addresses, and private operational records.", "公開案例刻意省略內部資料結構、帳戶細節、基礎設施位址與私人運維記錄。", "公开案例有意省略内部数据结构、账户细节、基础设施地址与私人运维记录。", "公開ケーススタディでは、内部データ構造、アカウント詳細、インフラアドレス、非公開運用記録を意図的に省略しています。")
    }
  }
};
