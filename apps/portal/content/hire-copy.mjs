export const hireLinks = {
  linkedin: "https://www.linkedin.com/in/lang-he-a94655120/",
  github: "https://github.com/DodgeHo",
  pulseboardOps: "/demo/",
  pulseboardCustomer: "/demo/frontend/",
  apiDocs: "/demo/docs",
  openapi: "/demo/openapi.json",
  pulseboardRecord: "/projects/pulseboard/",
  careerRadarRecord: "/projects/career-radar/",
  heatstack: "/heatstack/",
  heatstackRecord: "/projects/heatstack/",
  vmd: "https://github.com/DodgeHo/VMD_cpp",
  pal4: "https://github.com/DodgeHo/PAL4_EnglishMod",
  ielts: "https://github.com/DodgeHo/IELTS_writing_GPT",
  rrt: "https://github.com/DodgeHo/dynamic_rrt_connect"
};

const en = {
  title: "Dodge Ho / Lang He - Engineering profile",
  description: "A concise, recruiter-oriented introduction to Dodge Ho's public backend, platform, reliability, full-stack, and cloud-native engineering evidence.",
  skip: "Skip to profile",
  backHome: "Return to ANLAN.STORE",
  languageLabel: "Language",
  name: "Dodge Ho / Lang He",
  targetNote: "Roles I am pursuing, not positions I claim to have held",
  targets: ["Backend Engineer", "Platform / Reliability Engineer", "Full-stack Engineer with systems depth", "Cloud-native systems and practical tools"],
  thesis: [
    "I build software from the system boundary inward: contracts, data, queues, failure paths, operational checks, and the product surface that makes the system usable.",
    "My public work is intended to make engineering judgment inspectable. It shows how I think about reliability and maintainability while staying explicit about what has and has not been proven."
  ],
  sections: {
    approach: ["How I approach engineering", "I look for the decisions that remain important after the first successful request."],
    evidence: ["Selected engineering evidence", "Start with PulseBoard, then use the smaller records to check range and consistency."],
    index: ["Evidence index", "A compact map from capability direction to directly inspectable evidence."],
    review: ["Ten-minute review", "A practical route through working surfaces, contracts, project records, and public profiles."],
    boundaries: ["Public boundaries", "These notes define the evidence accurately and reduce ambiguity during review."],
    contact: ["Continue", "The public channels available for a further conversation."]
  },
  approachParagraphs: [
    "I treat backend behavior, operations, and user-facing delivery as one engineering problem. An API is not complete at its happy path: access boundaries, persistence choices, asynchronous work, health signals, recovery procedures, and documentation all shape whether it can be maintained.",
    "Reliability work is most useful when it is concrete. I prefer checks and rehearsals that can be run, reviewed, and repeated: separate liveness and readiness, worker recovery, backup and restore, rollback procedures, and explicit contracts.",
    "I also care about the last mile. A sound system should provide a practical interface and a clear review path, without hiding uncertainty behind visual polish or an inflated claim."
  ],
  evidenceItems: [
    ["PulseBoard", "Primary case study", "A production-shaped portfolio project that connects a Hono API, PostgreSQL, Redis, BullMQ, an API-key boundary, OpenAPI, liveness and readiness checks, worker recovery, backup and restore rehearsal, and rollback rehearsal. Its operations and customer surfaces make the same system reviewable from different perspectives.", "Read the PulseBoard project record", "pulseboardRecord"],
    ["Career Radar", "Privacy-aware product system", "An invite-only application surface with account isolation, inbox state, scheduled digest behavior, and a deliberately narrow public boundary. The record focuses on product behavior and privacy decisions without exposing private career data.", "Read the Career Radar project record", "careerRadarRecord"],
    ["HeatStack", "Engineering learning system", "A structured content model, Windows CLI, safer installation path, and AI engineering learning workflow. It demonstrates how I turn a difficult learning domain into a maintainable tool rather than a loose collection of notes.", "Read the HeatStack project record", "heatstackRecord"],
    ["Public source projects", "Inspectable source history", "VMD_cpp, PAL4_EnglishMod, IELTS_writing_GPT, and Dynamic RRT Connect expose work across signal processing, localization, applied AI tooling, and path planning.", "Open my GitHub profile", "github"]
  ],
  sourceLabel: "Direct source records",
  sourceLinks: [["VMD_cpp", "vmd"], ["PAL4_EnglishMod", "pal4"], ["IELTS_writing_GPT", "ielts"], ["Dynamic RRT Connect", "rrt"]],
  tableHeaders: ["Capability direction", "Representative project", "Verifiable evidence", "Review link"],
  tableRows: [
    ["Reliability judgment", "PulseBoard", "Separate liveness and readiness, queue recovery, backup and restore rehearsal, and immutable-image rollback rehearsal.", "Project record", "pulseboardRecord"],
    ["Boundaries and security", "PulseBoard / Career Radar", "API-key protection, invite-only access, account isolation, and explicit public and private boundaries.", "Live operations surface", "pulseboardOps"],
    ["Maintainable delivery", "PulseBoard", "OpenAPI contract, worker architecture, operational documentation, and deployment and rollback records.", "API documentation", "apiDocs"],
    ["Practical tool design", "HeatStack", "Structured content, safer Windows installation, CLI behavior, and a repeatable learning workflow.", "HeatStack", "heatstack"],
    ["Inspectable implementation", "VMD_cpp / PAL4 / IELTS / RRT", "Public repositories covering signal processing, localization, applied AI tooling, and path planning.", "GitHub profile", "github"]
  ],
  reviewSteps: [
    ["00-02 min", "Open the PulseBoard live operations surface", "Check health, readiness, operational states, and the shape of the running system.", "pulseboardOps"],
    ["02-03 min", "Open the PulseBoard customer surface", "Confirm that the system also has a practical product-facing path.", "pulseboardCustomer"],
    ["03-05 min", "Open the API documentation", "Review the public contract and how the API is presented for inspection.", "apiDocs"],
    ["05-06 min", "View the OpenAPI JSON", "Inspect the machine-readable contract directly.", "openapi"],
    ["06-08 min", "Read the PulseBoard project record", "Check the architecture, reliability work, and stated limitations together.", "pulseboardRecord"],
    ["08-09 min", "Review my GitHub profile", "Use repository history to inspect implementation beyond the featured projects.", "github"],
    ["09-10 min", "Review my LinkedIn profile", "Continue with the public professional context available there.", "linkedin"]
  ],
  boundaries: [
    ["Portfolio context", "PulseBoard is a production-shaped portfolio project. It is not presented as a commercial production system serving real customers."],
    ["Notification delivery", "The notification provider is mock-compatible. The project does not claim a live third-party production delivery integration."],
    ["Cloud scope", "No AWS resources have been created. Cloud architecture material is design evidence, not proof of a running AWS estate."],
    ["Recovery evidence", "Backup and restore and rollback are local or CI rehearsals. They are not evidence of large-scale production RPO/RTO performance."]
  ],
  contacts: [["My LinkedIn profile", "linkedin"], ["My GitHub profile", "github"], ["Return to ANLAN.STORE", "home"]],
  footer: "Public engineering profile",
  footerNote: "Evidence over claims. Boundaries included."
};

const zhHans = {
  title: "Dodge Ho / 道安澜 - 工程自我介绍",
  description: "面向招聘者的精简工程自我介绍，集中呈现 Dodge Ho / 道安澜可公开验证的后端、平台、可靠性、全栈与云原生工程证据。",
  skip: "跳至自我介绍",
  backHome: "返回 ANLAN.STORE",
  languageLabel: "语言",
  name: "Dodge Ho / 道安澜",
  targetNote: "以下是我正在寻求的能力方向，不是已任职职位",
  targets: ["后端工程师", "平台／可靠性工程师", "具系统深度的全栈工程师", "云原生系统与实用工具"],
  thesis: [
    "我从系统边界向内构建软件：契约、数据、队列、失败路径、运维检查，以及让系统真正可用的产品界面。",
    "我的公开作品不是用来堆叠关键词，而是让工程判断可以被检查。我展示自己如何处理可靠性与可维护性，也清楚说明哪些内容已被证明、哪些尚未。"
  ],
  sections: {
    approach: ["我的工程方法", "我关注第一次成功请求之后仍然重要的决策。"],
    evidence: ["精选工程证据", "先看 PulseBoard，再用较小的项目记录检查能力范围与一致性。"],
    index: ["证据索引", "从能力方向到可直接检查证据的精简地图。"],
    review: ["十分钟评审路径", "依次查看运行界面、契约、项目记录与公开职业资料。"],
    boundaries: ["公开边界", "这些说明让证据保持准确，并降低评审时的不确定性。"],
    contact: ["继续了解", "可用于进一步对话的公开入口。"]
  },
  approachParagraphs: [
    "我把后端行为、运维和用户界面视为同一个工程问题。API 不会在 happy path 成功后就算完成；访问边界、持久化选择、异步工作、健康信号、恢复程序与文档，共同决定系统能否被维护。",
    "可靠性工作必须具体才有价值。我偏好可执行、可评审、可重复的检查与演练：分离 liveness 与 readiness、worker recovery、备份恢复、rollback 程序及明确契约。",
    "我也重视最后一公里。稳健的系统应提供实用界面与清晰评审路径，而不是用视觉包装或夸大的陈述掩盖不确定性。"
  ],
  evidenceItems: [
    ["PulseBoard", "主要案例", "一个 production-shaped portfolio project，连接 Hono API、PostgreSQL、Redis、BullMQ、API key 边界、OpenAPI、liveness/readiness、worker recovery、备份恢复演练与 rollback 演练。运维界面和客户界面让同一系统可以从不同角度接受检查。", "阅读 PulseBoard 项目记录", "pulseboardRecord"],
    ["Career Radar", "重视隐私的产品系统", "具备邀请制、账户隔离、收件箱状态、定期摘要行为与刻意收窄的公开边界。项目记录聚焦产品行为与隐私决策，不公开私人求职数据。", "阅读 Career Radar 项目记录", "careerRadarRecord"],
    ["HeatStack", "工程学习系统", "结构化内容模型、Windows CLI、更安全的安装路径与 AI engineering 学习工作流。它展示我如何把困难的学习领域做成可维护工具，而不是零散笔记。", "阅读 HeatStack 项目记录", "heatstackRecord"],
    ["公开源码项目", "可检查的源码历史", "VMD_cpp、PAL4_EnglishMod、IELTS_writing_GPT 与 Dynamic RRT Connect 公开了信号处理、本地化、应用型 AI 工具与路径规划方面的工作。", "打开我的 GitHub", "github"]
  ],
  sourceLabel: "直接源码记录",
  sourceLinks: [["VMD_cpp", "vmd"], ["PAL4_EnglishMod", "pal4"], ["IELTS_writing_GPT", "ielts"], ["Dynamic RRT Connect", "rrt"]],
  tableHeaders: ["能力方向", "代表项目", "可验证证据", "评审链接"],
  tableRows: [
    ["可靠性判断", "PulseBoard", "分离 liveness/readiness、队列恢复、备份恢复演练与 immutable-image rollback 演练。", "项目记录", "pulseboardRecord"],
    ["边界与安全", "PulseBoard / Career Radar", "API key 保护、邀请制、账户隔离与明确的公开／私人边界。", "运维界面", "pulseboardOps"],
    ["可维护交付", "PulseBoard", "OpenAPI 契约、worker 架构、运维文档，以及部署与 rollback 记录。", "API 文档", "apiDocs"],
    ["实用工具设计", "HeatStack", "结构化内容、安全的 Windows 安装、CLI 行为与可重复的学习工作流。", "HeatStack", "heatstack"],
    ["可检查实现", "VMD_cpp / PAL4 / IELTS / RRT", "涵盖信号处理、本地化、应用型 AI 工具与路径规划的公开仓库。", "GitHub", "github"]
  ],
  reviewSteps: [
    ["00-02 分", "打开 PulseBoard live operations surface", "检查 health、readiness、运维状态与运行中系统的形态。", "pulseboardOps"],
    ["02-03 分", "打开 PulseBoard customer surface", "确认系统也有实用的产品端路径。", "pulseboardCustomer"],
    ["03-05 分", "打开 API docs", "查看公开契约及 API 如何被呈现以供检查。", "apiDocs"],
    ["05-06 分", "查看 OpenAPI JSON", "直接检查机器可读契约。", "openapi"],
    ["06-08 分", "阅读 PulseBoard 项目记录", "一起检查架构、可靠性工作与已声明限制。", "pulseboardRecord"],
    ["08-09 分", "查看我的 GitHub", "用仓库历史检查精选项目以外的实现。", "github"],
    ["09-10 分", "查看我的 LinkedIn", "从公开职业背景继续了解。", "linkedin"]
  ],
  boundaries: [
    ["作品集语境", "PulseBoard 是 production-shaped portfolio project，不是真实服务商业客户的生产系统。"],
    ["通知交付", "通知 provider 是 mock-compatible。项目不声称已接入真实第三方生产通知服务。"],
    ["云端范围", "AWS 资源尚未创建。云端架构材料是设计证据，不是运行中 AWS 基础设施的证明。"],
    ["恢复证据", "备份恢复与 rollback 属于本地或 CI 演练，不能证明大规模生产环境的 RPO/RTO 表现。"]
  ],
  contacts: [["我的 LinkedIn", "linkedin"], ["我的 GitHub", "github"], ["返回 ANLAN.STORE", "home"]],
  footer: "公开工程自我介绍",
  footerNote: "以证据代替宣称，并明示边界。"
};

const zhHant = {
  title: "Dodge Ho / 道安瀾 - 工程自我介紹",
  description: "面向招聘者的精簡工程自我介紹，集中呈現 Dodge Ho / 道安瀾可公開驗證的後端、平台、可靠性、全端與雲原生工程證據。",
  skip: "跳至自我介紹",
  backHome: "返回 ANLAN.STORE",
  languageLabel: "語言",
  name: "Dodge Ho / 道安瀾",
  targetNote: "以下是我正在尋求的能力方向，不是已任職職位",
  targets: ["後端工程師", "平台／可靠性工程師", "具系統深度的全端工程師", "雲原生系統與實用工具"],
  thesis: [
    "我從系統邊界向內構建軟體：契約、資料、佇列、失敗路徑、運維檢查，以及讓系統真正可用的產品介面。",
    "我的公開作品不是用來堆疊關鍵詞，而是讓工程判斷可以被檢查。我展示自己如何處理可靠性與可維護性，也清楚說明哪些內容已被證明、哪些尚未。"
  ],
  sections: {
    approach: ["我的工程方法", "我關注第一次成功請求之後仍然重要的決策。"],
    evidence: ["精選工程證據", "先看 PulseBoard，再用較小的項目記錄檢查能力範圍與一致性。"],
    index: ["證據索引", "從能力方向到可直接檢查證據的精簡地圖。"],
    review: ["十分鐘評審路徑", "依序查看運行介面、契約、項目記錄與公開職業資料。"],
    boundaries: ["公開邊界", "這些說明讓證據保持準確，並降低評審時的不確定性。"],
    contact: ["繼續了解", "可用於進一步對話的公開入口。"]
  },
  approachParagraphs: [
    "我把後端行為、運維和使用者介面視為同一個工程問題。API 不會在 happy path 成功後就算完成；存取邊界、持久化選擇、非同步工作、健康訊號、復原程序與文件，共同決定系統能否被維護。",
    "可靠性工作必須具體才有價值。我偏好可執行、可評審、可重複的檢查與演練：分離 liveness 與 readiness、worker recovery、備份復原、rollback 程序及明確契約。",
    "我也重視最後一公里。穩健的系統應提供實用介面與清晰評審路徑，而不是用視覺包裝或誇大的陳述掩蓋不確定性。"
  ],
  evidenceItems: [
    ["PulseBoard", "主要案例", "一個 production-shaped portfolio project，連接 Hono API、PostgreSQL、Redis、BullMQ、API key 邊界、OpenAPI、liveness/readiness、worker recovery、備份復原演練與 rollback 演練。運維介面和客戶介面讓同一系統可以從不同角度接受檢查。", "閱讀 PulseBoard 項目記錄", "pulseboardRecord"],
    ["Career Radar", "重視隱私的產品系統", "具備邀請制、帳戶隔離、收件匣狀態、定期摘要行為與刻意收窄的公開邊界。項目記錄聚焦產品行為與隱私決策，不公開私人求職資料。", "閱讀 Career Radar 項目記錄", "careerRadarRecord"],
    ["HeatStack", "工程學習系統", "結構化內容模型、Windows CLI、更安全的安裝路徑與 AI engineering 學習工作流。它展示我如何把困難的學習領域做成可維護工具，而不是零散筆記。", "閱讀 HeatStack 項目記錄", "heatstackRecord"],
    ["公開源碼項目", "可檢查的源碼歷史", "VMD_cpp、PAL4_EnglishMod、IELTS_writing_GPT 與 Dynamic RRT Connect 公開了訊號處理、本地化、應用型 AI 工具與路徑規劃方面的工作。", "開啟我的 GitHub", "github"]
  ],
  sourceLabel: "直接源碼記錄",
  sourceLinks: [["VMD_cpp", "vmd"], ["PAL4_EnglishMod", "pal4"], ["IELTS_writing_GPT", "ielts"], ["Dynamic RRT Connect", "rrt"]],
  tableHeaders: ["能力方向", "代表項目", "可驗證證據", "評審連結"],
  tableRows: [
    ["可靠性判斷", "PulseBoard", "分離 liveness/readiness、佇列復原、備份復原演練與 immutable-image rollback 演練。", "項目記錄", "pulseboardRecord"],
    ["邊界與安全", "PulseBoard / Career Radar", "API key 保護、邀請制、帳戶隔離與明確的公開／私人邊界。", "運維介面", "pulseboardOps"],
    ["可維護交付", "PulseBoard", "OpenAPI 契約、worker 架構、運維文件，以及部署與 rollback 記錄。", "API 文件", "apiDocs"],
    ["實用工具設計", "HeatStack", "結構化內容、安全的 Windows 安裝、CLI 行為與可重複的學習工作流。", "HeatStack", "heatstack"],
    ["可檢查實作", "VMD_cpp / PAL4 / IELTS / RRT", "涵蓋訊號處理、本地化、應用型 AI 工具與路徑規劃的公開倉庫。", "GitHub", "github"]
  ],
  reviewSteps: [
    ["00-02 分", "開啟 PulseBoard live operations surface", "檢查 health、readiness、運維狀態與運行中系統的形態。", "pulseboardOps"],
    ["02-03 分", "開啟 PulseBoard customer surface", "確認系統也有實用的產品端路徑。", "pulseboardCustomer"],
    ["03-05 分", "開啟 API docs", "查看公開契約及 API 如何被呈現以供檢查。", "apiDocs"],
    ["05-06 分", "查看 OpenAPI JSON", "直接檢查機器可讀契約。", "openapi"],
    ["06-08 分", "閱讀 PulseBoard 項目記錄", "一起檢查架構、可靠性工作與已聲明限制。", "pulseboardRecord"],
    ["08-09 分", "查看我的 GitHub", "用倉庫歷史檢查精選項目以外的實作。", "github"],
    ["09-10 分", "查看我的 LinkedIn", "從公開職業背景繼續了解。", "linkedin"]
  ],
  boundaries: [
    ["作品集語境", "PulseBoard 是 production-shaped portfolio project，不是真實服務商業客戶的生產系統。"],
    ["通知交付", "通知 provider 是 mock-compatible。項目不聲稱已接入真實第三方生產通知服務。"],
    ["雲端範圍", "AWS 資源尚未建立。雲端架構材料是設計證據，不是運行中 AWS 基礎設施的證明。"],
    ["復原證據", "備份復原與 rollback 屬於本地或 CI 演練，不能證明大規模生產環境的 RPO/RTO 表現。"]
  ],
  contacts: [["我的 LinkedIn", "linkedin"], ["我的 GitHub", "github"], ["返回 ANLAN.STORE", "home"]],
  footer: "公開工程自我介紹",
  footerNote: "以證據代替宣稱，並明示邊界。"
};

const ja = {
  title: "道安瀾（ドッジ・ホー）- エンジニアリング紹介",
  description: "採用担当者向けに、道安瀾（ドッジ・ホー）のバックエンド、プラットフォーム、信頼性、フルスタック、クラウドネイティブに関する公開検証可能な成果を簡潔に紹介します。",
  skip: "紹介本文へ移動",
  backHome: "ANLAN.STORE に戻る",
  languageLabel: "言語",
  name: "道安瀾（ドッジ・ホー）",
  targetNote: "以下は希望する能力領域であり、過去の役職を示すものではありません",
  targets: ["バックエンドエンジニア", "プラットフォーム／信頼性エンジニア", "システムに深いフルスタックエンジニア", "クラウドネイティブシステムと実用ツール"],
  thesis: [
    "私はシステム境界から内側へソフトウェアを構築します。契約、データ、キュー、失敗経路、運用チェック、そしてシステムを実際に使えるものにするプロダクト画面までを一つの問題として扱います。",
    "公開成果の目的は、エンジニアリング判断を検証可能にすることです。信頼性と保守性をどう考えるかを示しながら、証明できた範囲と未検証の範囲を明確にしています。"
  ],
  sections: {
    approach: ["エンジニアリングへの向き合い方", "最初のリクエストが成功した後も重要であり続ける判断を重視します。"],
    evidence: ["主なエンジニアリング成果", "まず PulseBoard を確認し、次に小規模な記録から能力の幅と一貫性を確認できます。"],
    index: ["証拠索引", "能力領域と直接確認できる証拠を結ぶ簡潔な一覧です。"],
    review: ["10分レビュー", "稼働画面、契約、プロジェクト記録、公開プロフィールを順に確認します。"],
    boundaries: ["公開範囲", "証拠を正確に位置づけ、レビュー時の曖昧さを減らすための注記です。"],
    contact: ["さらに確認する", "今後の対話に利用できる公開窓口です。"]
  },
  approachParagraphs: [
    "バックエンドの動作、運用、ユーザー画面を一つのエンジニアリング課題として扱います。API は happy path が動くだけでは完成ではありません。アクセス境界、永続化、非同期処理、健康信号、復旧手順、文書が保守性を決めます。",
    "信頼性は具体的であるほど有用です。liveness と readiness の分離、worker recovery、バックアップ復元、rollback 手順、明確な契約など、実行・レビュー・反復できる確認と演習を優先します。",
    "最後の一歩も重視します。堅実なシステムには実用的な画面と明確なレビュー経路が必要であり、視覚的な演出や誇張で不確実性を隠すべきではありません。"
  ],
  evidenceItems: [
    ["PulseBoard", "主要ケーススタディ", "Hono API、PostgreSQL、Redis、BullMQ、API key 境界、OpenAPI、liveness/readiness、worker recovery、バックアップ復元演習、rollback 演習を結ぶ production-shaped portfolio project です。運用画面と顧客画面から同じシステムを異なる視点で確認できます。", "PulseBoard の記録を読む", "pulseboardRecord"],
    ["Career Radar", "プライバシーを重視したプロダクトシステム", "招待制、アカウント分離、受信箱状態、定期ダイジェスト、限定した公開範囲を備えます。プロジェクト記録は個人のキャリアデータを公開せず、プロダクト動作とプライバシー判断に焦点を当てます。", "Career Radar の記録を読む", "careerRadarRecord"],
    ["HeatStack", "エンジニアリング学習システム", "構造化コンテンツモデル、Windows CLI、より安全な導入経路、AI engineering 学習ワークフロー。難しい学習領域を散在するノートではなく、保守可能なツールへ変える方法を示します。", "HeatStack の記録を読む", "heatstackRecord"],
    ["公開ソースプロジェクト", "確認可能なソース履歴", "VMD_cpp、PAL4_EnglishMod、IELTS_writing_GPT、Dynamic RRT Connect は、信号処理、ローカライズ、応用 AI ツール、経路計画にわたる作業を公開しています。", "GitHub を開く", "github"]
  ],
  sourceLabel: "直接確認できるソース",
  sourceLinks: [["VMD_cpp", "vmd"], ["PAL4_EnglishMod", "pal4"], ["IELTS_writing_GPT", "ielts"], ["Dynamic RRT Connect", "rrt"]],
  tableHeaders: ["能力領域", "代表プロジェクト", "検証可能な証拠", "レビューリンク"],
  tableRows: [
    ["信頼性の判断", "PulseBoard", "liveness/readiness の分離、キュー復旧、バックアップ復元演習、immutable-image rollback 演習。", "プロジェクト記録", "pulseboardRecord"],
    ["境界とセキュリティ", "PulseBoard / Career Radar", "API key 保護、招待制、アカウント分離、明確な公開／非公開境界。", "運用画面", "pulseboardOps"],
    ["保守可能なデリバリー", "PulseBoard", "OpenAPI 契約、worker 構成、運用文書、デプロイと rollback の記録。", "API docs", "apiDocs"],
    ["実用ツール設計", "HeatStack", "構造化コンテンツ、安全な Windows 導入、CLI 動作、反復可能な学習ワークフロー。", "HeatStack", "heatstack"],
    ["確認可能な実装", "VMD_cpp / PAL4 / IELTS / RRT", "信号処理、ローカライズ、応用 AI ツール、経路計画を扱う公開リポジトリ。", "GitHub", "github"]
  ],
  reviewSteps: [
    ["00-02 分", "PulseBoard live operations surface を開く", "health、readiness、運用状態、稼働中システムの形を確認します。", "pulseboardOps"],
    ["02-03 分", "PulseBoard customer surface を開く", "実用的なプロダクト側の経路も確認します。", "pulseboardCustomer"],
    ["03-05 分", "API docs を開く", "公開契約と、確認のための API 表示を読みます。", "apiDocs"],
    ["05-06 分", "OpenAPI JSON を見る", "機械可読な契約を直接確認します。", "openapi"],
    ["06-08 分", "PulseBoard の記録を読む", "アーキテクチャ、信頼性対応、明記された制限をまとめて確認します。", "pulseboardRecord"],
    ["08-09 分", "GitHub プロフィールを見る", "リポジトリ履歴から、注目プロジェクト以外の実装も確認します。", "github"],
    ["09-10 分", "LinkedIn プロフィールを見る", "公開されている職業情報から確認を続けます。", "linkedin"]
  ],
  boundaries: [
    ["ポートフォリオとしての位置づけ", "PulseBoard は production-shaped portfolio project です。実顧客に提供中の商用本番システムとは表現しません。"],
    ["通知配信", "通知 provider は mock-compatible です。実運用中の第三者配信連携を主張しません。"],
    ["クラウド範囲", "AWS リソースは作成していません。クラウド設計資料は設計上の証拠であり、稼働中の AWS 基盤を示すものではありません。"],
    ["復旧の証拠", "バックアップ復元と rollback はローカルまたは CI での演習です。大規模本番環境における RPO/RTO の証明ではありません。"]
  ],
  contacts: [["LinkedIn プロフィール", "linkedin"], ["GitHub プロフィール", "github"], ["ANLAN.STORE に戻る", "home"]],
  footer: "公開エンジニアリング紹介",
  footerNote: "主張より証拠を優先し、境界を明記しています。"
};

export const hireCopy = { en, "zh-Hant": zhHant, "zh-Hans": zhHans, ja };
