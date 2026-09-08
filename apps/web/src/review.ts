import { getCopy, localeOrder, type Locale } from './i18n.js';

type ProbeKey = 'live' | 'ready' | 'openapi' | 'docs';
type ProbeState = 'checking' | 'online' | 'degraded' | 'unavailable';

interface ReviewCopy {
  languageName: string;
  languageLabel: string;
  navLabel: string;
  brandAriaLabel: string;
  navLive: string;
  navCustomer: string;
  navDocs: string;
  navOpenApi: string;
  eyebrow: string;
  title: string;
  lead: string;
  reviewTime: string;
  ctaOverview: string;
  ctaLive: string;
  ctaCustomer: string;
  ctaDocs: string;
  ctaOpenApi: string;
  ctaProbe: string;
  guideLabel: string;
  guideTitle: string;
  guideIntro: string;
  audienceLabel: string;
  audienceTitle: string;
  audienceIntro: string;
  audiencePoints: Array<{ title: string; detail: string }>;
  audienceNote: string;
  claimLabel: string;
  claimTitle: string;
  claimIntro: string;
  liveLabel: string;
  liveTitle: string;
  liveIntro: string;
  architectureLabel: string;
  architectureTitle: string;
  architectureIntro: string;
  boundariesLabel: string;
  boundariesTitle: string;
  boundariesIntro: string;
  promptsLabel: string;
  promptsTitle: string;
  promptsIntro: string;
  probeTitle: string;
  probeInitial: string;
  probeUpdated: string;
  checking: string;
  online: string;
  degraded: string;
  unavailable: string;
  requestPending: string;
  requestUnavailable: string;
  httpStatus: string;
  lifecycleLabel: string;
  lifecycleTitle: string;
  lifecycleIntro: string;
  lifecycleCodeLabel: string;
  lifecycleCode: string;
  lifecycleTestsLabel: string;
  lifecycleTests: string;
  lifecycleDocsLabel: string;
  lifecycleDocsLinkLabel: string;
  guideSteps: Array<{ title: string; detail: string; links: Array<{ label: string; href: string }> }>;
  claims: Array<{ title: string; evidence: string; tags: string[]; links: Array<{ label: string; href: string }> }>;
  probes: Record<ProbeKey, { label: string; path: string }>;
  architecture: Array<{ name: string; detail: string; className: string }>;
  boundaries: Array<{ title: string; detail: string }>;
  prompts: Array<{ question: string; href: string }>;
  footer: string;
}

const reviewEn: ReviewCopy = {
  languageName: 'English',
  languageLabel: 'Language',
  navLabel: 'Primary navigation',
  brandAriaLabel: 'PulseBoard engineering review home',
  navLive: 'Live Ops Console',
  navCustomer: 'Customer Surface',
  navDocs: 'API Docs',
  navOpenApi: 'OpenAPI',
  eyebrow: 'For recruiters and hiring managers',
  title: 'Reliable software, explained clearly.',
  lead: 'PulseBoard is a working backend engineering portfolio project. Start with the plain-language summary below to see the practical outcome; technical links are available when you want to inspect the details.',
  reviewTime: 'Start here: 60 seconds for the overview, 10 minutes for the evidence',
  ctaOverview: 'Start with the 60-second overview',
  ctaLive: 'Open Live Ops Console',
  ctaCustomer: 'Open Customer Surface',
  ctaDocs: 'Open API Docs',
  ctaOpenApi: 'Open OpenAPI',
  ctaProbe: 'Run public probes',
  guideLabel: '01 / Start here',
  guideTitle: 'What to inspect first',
  guideIntro: 'Follow the shortest path from availability to reliability evidence. Every step points to a live route, a public record, or a section on this page.',
  audienceLabel: 'For recruiters and hiring managers',
  audienceTitle: 'What this project shows, in plain language',
  audienceIntro: 'You do not need a software background to start. In one minute, you can see what was built, why it matters, and where an engineer can verify the details.',
  audiencePoints: [
    { title: 'I build dependable systems', detail: 'Important work is designed to survive retries and temporary failures instead of disappearing when one request goes wrong.' },
    { title: 'I protect customer data', detail: 'Different workspaces are kept separate, so one customer cannot simply reach another customer\'s records.' },
    { title: 'I make my work checkable', detail: 'The project includes a working demo, public health checks, tests, documentation, and clear limits rather than unsupported claims.' },
  ],
  audienceNote: 'The rest of this page is the evidence trail for a technical interviewer. You can stop here and still have the right high-level picture.',
  claimLabel: '02 / Claim versus evidence',
  claimTitle: 'Engineering claims with receipts',
  claimIntro: 'The claim is the design intent. The evidence column names what is actually present in code, tests, or documentation, without turning a rehearsal into production proof.',
  liveLabel: '03 / What is live now',
  liveTitle: 'Public probes, same origin',
  liveIntro: 'These requests run from this page against the public demo paths. A failed request stays visible as degraded or unavailable and never blocks the rest of the review.',
  architectureLabel: '04 / Architecture in one pass',
  architectureTitle: 'A modular path, not a decorative diagram',
  architectureIntro: 'The browser reaches the Hono API, durable state sits in PostgreSQL, background work moves through Redis and BullMQ, and operational evidence is recorded alongside the flow.',
  boundariesLabel: '05 / Honest boundaries',
  boundariesTitle: 'Useful, but deliberately bounded',
  boundariesIntro: 'Read these constraints as part of the engineering judgment. They are visible so the project is not mistaken for a commercial production service.',
  promptsLabel: '06 / Interview prompts',
  promptsTitle: 'Good questions to take further',
  promptsIntro: 'These prompts link to existing project records where available. They are invitations to inspect, not prewritten answers.',
  probeTitle: 'Public probe console',
  probeInitial: 'Waiting for first probe',
  probeUpdated: 'Last checked',
  checking: 'checking',
  online: 'online',
  degraded: 'degraded',
  unavailable: 'unavailable',
  requestPending: 'request pending',
  requestUnavailable: 'network unavailable',
  httpStatus: 'HTTP',
  lifecycleLabel: 'Incident lifecycle',
  lifecycleTitle: 'Ingest, queue, resolve.',
  lifecycleIntro: 'API-key protected requests enter the Hono API, Redis-backed workers process delayed operational work, and the worker records incident transitions, audit history, usage, and notification outbox state.',
  lifecycleCodeLabel: 'Code',
  lifecycleCode: 'Leases, stable idempotency keys, row locks, and one result transaction.',
  lifecycleTestsLabel: 'Tests',
  lifecycleTests: 'Worker crash recovery and in-flight graceful drain scenarios.',
  lifecycleDocsLabel: 'Docs',
  lifecycleDocsLinkLabel: 'Reliability ADR',
  guideSteps: [
    { title: 'Check health and readiness', detail: 'Use both probes to separate process availability from dependency readiness.', links: [{ label: 'Liveness', href: '/demo/health/live' }, { label: 'Readiness', href: '/demo/health/ready' }] },
    { title: 'Inspect the OpenAPI contract', detail: 'Read the exported contract instead of inferring the API from the user interface.', links: [{ label: 'OpenAPI', href: '/demo/openapi.json' }] },
    { title: 'Read the incident lifecycle', detail: 'Trace intake, queueing, worker execution, and durable resolution.', links: [{ label: 'Lifecycle', href: '#lifecycle' }] },
    { title: 'Review tenant and credential boundaries', detail: 'Inspect workspace scoping and authentication boundaries.', links: [{ label: 'Boundaries', href: '#boundaries' }] },
    { title: 'Inspect deployment and rollback evidence', detail: 'See the declared rehearsals and deployment handoff evidence.', links: [{ label: 'Deploy runbook', href: '/zh-hant/projects/pulseboard/deployment-runbook/' }, { label: 'Verification record', href: '/zh-hant/projects/pulseboard/verification-record/' }] },
  ],
  claims: [
    { title: 'Durable incident processing', evidence: 'Database leases, idempotency keys, transactional effects, and worker recovery tests keep at-least-once work from duplicating durable incident effects.', tags: ['code', 'tests', 'recovery rehearsal'], links: [{ label: 'Reliability ADR', href: 'reliability-adr' }, { label: 'Verification record', href: 'verification-record' }] },
    { title: 'Tenant boundaries', evidence: 'Workspace-scoped resource access, foreign-tenant response behavior, and API-key authentication are exercised at the API boundary.', tags: ['code', 'tests', 'API contract'], links: [{ label: 'Architecture', href: 'architecture' }, { label: 'Verification record', href: 'verification-record' }] },
    { title: 'Operational readiness', evidence: 'Live/readiness probes, structured request IDs, graceful shutdown, and metrics are implemented and documented as operational surfaces.', tags: ['code', 'tests', 'runbook'], links: [{ label: 'Liveness', href: '/demo/health/live' }, { label: 'Readiness', href: '/demo/health/ready' }] },
    { title: 'Deployment discipline', evidence: 'Backup/restore rehearsal, application rollback rehearsal, and a staging deploy runbook define the tested handoff and its limits.', tags: ['tests', 'docs', 'rehearsal'], links: [{ label: 'Deploy runbook', href: 'deployment-runbook' }, { label: 'Verification record', href: 'verification-record' }] },
  ],
  probes: {
    live: { label: 'Liveness', path: '/demo/health/live' },
    ready: { label: 'Readiness', path: '/demo/health/ready' },
    openapi: { label: 'OpenAPI document', path: '/demo/openapi.json' },
    docs: { label: 'Scalar API docs', path: '/demo/docs' },
  },
  architecture: [
    { name: 'Browser / static surface', detail: 'Review page and Live Ops Console', className: 'browser' },
    { name: 'Hono API', detail: 'Auth, routes, OpenAPI, request IDs', className: 'api' },
    { name: 'PostgreSQL', detail: 'Tenant state and incident records', className: 'data' },
    { name: 'Redis + BullMQ', detail: 'Rate limits and durable jobs', className: 'data' },
    { name: 'Worker', detail: 'Leases, checks, incident transitions', className: 'worker' },
    { name: 'Audit / metrics / outbox', detail: 'Operational evidence and notification state', className: 'ops' },
  ],
  boundaries: [
    { title: 'Production-shaped portfolio project', detail: 'This is an inspectable backend/platform portfolio project, not a real commercial production customer system.' },
    { title: 'Mock-compatible transports', detail: 'Email and Slack transports remain mock-compatible. Webhooks are real HTTP POSTs only when configured by the local system.' },
    { title: 'Rehearsal evidence', detail: 'Backup/restore and rollback are rehearsals. Rollback evidence covers the declared expand-contract compatibility scenario, not arbitrary historical binaries.' },
    { title: 'Plan-only cloud', detail: 'AWS stays plan-only. No cloud resources, DNS, TLS, or host configuration are created by this project.' },
  ],
  prompts: [
    { question: 'Why a modular monolith instead of microservices?', href: '/zh-hant/projects/pulseboard/architecture/' },
    { question: 'How does at-least-once delivery avoid duplicate incident effects?', href: '/zh-hant/projects/pulseboard/reliability-adr/' },
    { question: 'Why are migrations forward-only during application rollback?', href: '/zh-hant/projects/pulseboard/deployment-runbook/' },
    { question: 'Why is API-key auth sufficient for this inspectable demo?', href: '#boundaries' },
  ],
  footer: 'PulseBoard is a production-shaped backend, platform, and cloud portfolio project.',
};

const translated: Partial<Record<Locale, Partial<ReviewCopy>>> = {
  'zh-TW': {
    languageName: '繁體中文', navLive: '即時營運控制台', navCustomer: '客戶介面', navDocs: 'API 文件', navOpenApi: 'OpenAPI',
    eyebrow: '給招募者與用人主管', title: '用清楚、誠實的方式看懂可靠軟體。', lead: 'PulseBoard 是一個可操作的後端工程作品集專案。先從下面的白話摘要了解實際成果；想查看細節時，再使用技術連結。', reviewTime: '先用 60 秒看懂摘要，再用 10 分鐘查看證據', ctaOverview: '先看 60 秒摘要', ctaLive: '開啟即時營運控制台', ctaCustomer: '開啟客戶介面', ctaDocs: '開啟 API 文件', ctaOpenApi: '開啟 OpenAPI', ctaProbe: '執行公開探測', guideLabel: '01 / 從這裡開始', guideTitle: '先檢查什麼', guideIntro: '沿著從可用性到可靠性證據的最短路徑前進。每一步都指向即時路由、公開紀錄或本頁的段落。', audienceLabel: '給招募者與用人主管', audienceTitle: '用白話說，這個專案展示了什麼', audienceIntro: '不需要軟體背景也能開始。用一分鐘了解做了什麼、為什麼重要，以及工程面試官可以在哪裡驗證細節。', audiencePoints: [{ title: '我會打造可靠的系統', detail: '重要工作即使遇到重試或暫時性故障，也不會因為一次請求失敗就消失。' }, { title: '我會保護客戶資料', detail: '不同工作區彼此隔離，一個客戶不能直接讀取另一個客戶的紀錄。' }, { title: '我會讓成果可以被檢查', detail: '專案提供可操作的 demo、公開健康檢查、測試、文件與清楚限制，而不是只提出沒有依據的說法。' }], audienceNote: '本頁其餘內容是給技術面試官看的證據鏈。讀完這裡，你已經能掌握這個專案的重點。', claimLabel: '02 / 主張與證據', claimTitle: '帶有憑據的工程主張', claimIntro: '主張是設計意圖；證據欄列出實際存在於程式碼、測試或文件中的內容，不把 rehearsal 說成生產證明。', liveLabel: '03 / 目前可用內容', liveTitle: '同源公開探測', liveIntro: '這些請求由本頁對公開 demo 路徑發出。失敗會清楚顯示為 degraded 或 unavailable，不會阻塞其他評審內容。', architectureLabel: '04 / 一次看懂架構', architectureTitle: '模組化路徑，不是裝飾圖', architectureIntro: '瀏覽器連到 Hono API；持久狀態放在 PostgreSQL；背景工作經過 Redis 與 BullMQ；營運證據與流程一起記錄。', boundariesLabel: '05 / 誠實邊界', boundariesTitle: '有用，但刻意限制範圍', boundariesIntro: '這些限制也是工程判斷的一部分，讓專案不會被誤認為商業生產服務。', promptsLabel: '06 / 面試問題', promptsTitle: '可以繼續深入的好問題', probeTitle: '公開探測控制台', probeInitial: '等待第一次探測', probeUpdated: '上次檢查', checking: '檢查中', online: '線上', degraded: '降級', unavailable: '不可用', requestPending: '請求處理中', requestUnavailable: '網路不可用', httpStatus: 'HTTP', footer: 'PulseBoard 是一個接近生產環境的 backend、platform 與 cloud 作品集專案。',
  },
  'zh-CN': {
    languageName: '简体中文', navLive: '实时运维控制台', navCustomer: '客户界面', navDocs: 'API 文档', navOpenApi: 'OpenAPI',
    eyebrow: '给招聘者和用人主管', title: '用清楚、诚实的方式看懂可靠软件。', lead: 'PulseBoard 是一个可操作的后端工程作品集项目。先从下面的白话摘要了解实际成果；想查看细节时，再使用技术链接。', reviewTime: '先用 60 秒看懂摘要，再用 10 分钟查看证据', ctaOverview: '先看 60 秒摘要', ctaLive: '打开实时运维控制台', ctaCustomer: '打开客户界面', ctaDocs: '打开 API 文档', ctaOpenApi: '打开 OpenAPI', ctaProbe: '运行公开探测', guideLabel: '01 / 从这里开始', guideTitle: '先检查什么', guideIntro: '沿着从可用性到可靠性证据的最短路径前进。每一步都指向实时路由、公开记录或本页的段落。', audienceLabel: '给招聘者和用人主管', audienceTitle: '用白话说，这个项目展示了什么', audienceIntro: '不需要软件背景也能开始。用一分钟了解做了什么、为什么重要，以及工程面试官可以在哪里验证细节。', audiencePoints: [{ title: '我会打造可靠的系统', detail: '重要工作即使遇到重试或暂时性故障，也不会因为一次请求失败就消失。' }, { title: '我会保护客户数据', detail: '不同工作区彼此隔离，一个客户不能直接读取另一个客户的记录。' }, { title: '我会让成果可以被检查', detail: '项目提供可操作的 demo、公开健康检查、测试、文档与清楚限制，而不是只提出没有依据的说法。' }], audienceNote: '本页其余内容是给技术面试官看的证据链。读完这里，你已经能掌握这个项目的重点。', claimLabel: '02 / 主张与证据', claimTitle: '带有凭据的工程主张', claimIntro: '主张是设计意图；证据栏列出实际存在于代码、测试或文档中的内容，不把 rehearsal 说成生产证明。', liveLabel: '03 / 当前可用内容', liveTitle: '同源公开探测', liveIntro: '这些请求由本页对公开 demo 路径发出。失败会清楚显示为 degraded 或 unavailable，不会阻塞其他评审内容。', architectureLabel: '04 / 一次看懂架构', architectureTitle: '模块化路径，不是装饰图', architectureIntro: '浏览器连接 Hono API；持久状态放在 PostgreSQL；后台工作经过 Redis 与 BullMQ；运维证据与流程一起记录。', boundariesLabel: '05 / 诚实边界', boundariesTitle: '有用，但刻意限制范围', boundariesIntro: '这些限制也是工程判断的一部分，让项目不会被误认成商业生产服务。', promptsLabel: '06 / 面试问题', promptsTitle: '可以继续深入的好问题', probeTitle: '公开探测控制台', probeInitial: '等待第一次探测', probeUpdated: '上次检查', checking: '检查中', online: '在线', degraded: '降级', unavailable: '不可用', requestPending: '请求处理中', requestUnavailable: '网络不可用', httpStatus: 'HTTP', footer: 'PulseBoard 是一个接近生产环境的 backend、platform 与 cloud 作品集项目。',
  },
  ja: {
    languageName: '日本語', navLive: 'Live Ops Console', navCustomer: '顧客向け画面', navDocs: 'API ドキュメント', navOpenApi: 'OpenAPI',
    eyebrow: '採用担当者と採用マネージャー向け', title: '信頼できるソフトウェアを、明確に見る。', lead: 'PulseBoard は動作するバックエンドエンジニアリングのポートフォリオプロジェクトです。まずは下の平易な概要で成果を把握し、仕組みを知りたいときに技術的なリンクへ進めます。', reviewTime: 'まず 60 秒で概要を読み、10 分で証拠を確認', ctaOverview: '60 秒の概要から始める', ctaLive: 'Live Ops Console を開く', ctaCustomer: '顧客向け画面を開く', ctaDocs: 'API ドキュメントを開く', ctaOpenApi: 'OpenAPI を開く', ctaProbe: '公開 probe を実行', guideLabel: '01 / まずここから', guideTitle: '最初に確認すること', guideIntro: '可用性から信頼性の証拠まで、最短の順路で確認します。各ステップは実際のルート、公開記録、またはこのページのセクションにつながります。', audienceLabel: '採用担当者と採用マネージャー向け', audienceTitle: 'このプロジェクトが示すことを平易に', audienceIntro: 'ソフトウェアの専門知識は必要ありません。1 分で何を作ったのか、なぜ重要なのか、エンジニアがどこで確認できるのかを把握できます。', audiencePoints: [{ title: '信頼できるシステムを作る', detail: '重要な処理は、リトライや一時的な障害があっても、1 回のリクエスト失敗で消えないように設計されています。' }, { title: '顧客データを守る', detail: 'ワークスペースを分離し、ある顧客が別の顧客の記録へ簡単に到達できないようにしています。' }, { title: '成果を確認可能にする', detail: '動く demo、公開ヘルスチェック、テスト、ドキュメント、明示された制約を用意し、根拠のない主張に頼りません。' }], audienceNote: 'この先は技術面接官向けの証拠 trail です。ここまで読めば、このプロジェクトの全体像はつかめます。', claimLabel: '02 / Claim と Evidence', claimTitle: '証拠のあるエンジニアリング主張', claimIntro: 'Claim は設計意図です。Evidence にはコード、テスト、ドキュメントに実際に存在するものだけを挙げ、rehearsal を本番の証明とは扱いません。', liveLabel: '03 / 現在 live なもの', liveTitle: '同一オリジンの公開 probe', liveIntro: 'このページから公開 demo ルートへリクエストします。失敗は degraded または unavailable として残り、他のレビュー内容を止めません。', architectureLabel: '04 / Architecture in one pass', architectureTitle: '装飾ではなくモジュール構成', architectureIntro: 'Browser は Hono API に接続し、永続状態は PostgreSQL、バックグラウンド処理は Redis と BullMQ を通り、運用証拠はフローとともに記録されます。', boundariesLabel: '05 / Honest boundaries', boundariesTitle: '有用だが、意図的に限定されている', boundariesIntro: 'これらの制約も設計判断の一部です。このプロジェクトを商用本番サービスと誤解しないために表示しています。', promptsLabel: '06 / Interview prompts', promptsTitle: 'さらに掘り下げる質問', probeTitle: '公開 probe コンソール', probeInitial: '最初の probe を待機中', probeUpdated: '最終確認', checking: '確認中', online: 'online', degraded: 'degraded', unavailable: 'unavailable', requestPending: 'リクエスト待機中', requestUnavailable: 'ネットワーク利用不可', httpStatus: 'HTTP', footer: 'PulseBoard は backend、platform、cloud のための production-shaped portfolio project です。',
  },
};

const reviewUi: Record<Locale, Pick<ReviewCopy, 'languageLabel' | 'navLabel' | 'brandAriaLabel' | 'promptsIntro' | 'lifecycleCodeLabel' | 'lifecycleTestsLabel' | 'lifecycleDocsLabel'>> = {
  en: { languageLabel: 'Language', navLabel: 'Primary navigation', brandAriaLabel: 'PulseBoard engineering review home', promptsIntro: reviewEn.promptsIntro, lifecycleCodeLabel: 'Code', lifecycleTestsLabel: 'Tests', lifecycleDocsLabel: 'Docs' },
  'zh-TW': { languageLabel: '語言', navLabel: '主要導覽', brandAriaLabel: 'PulseBoard 工程評審首頁', promptsIntro: '這些問題會在可用時連到既有專案紀錄；它們是邀請面試官進一步查證，而不是預先寫好的答案。', lifecycleCodeLabel: '程式碼', lifecycleTestsLabel: '測試', lifecycleDocsLabel: '文件' },
  'zh-CN': { languageLabel: '语言', navLabel: '主要导航', brandAriaLabel: 'PulseBoard 工程评审首页', promptsIntro: '这些问题会在可用时链接到现有项目记录；它们是邀请面试官继续查证，而不是预先写好的答案。', lifecycleCodeLabel: '代码', lifecycleTestsLabel: '测试', lifecycleDocsLabel: '文档' },
  ja: { languageLabel: '言語', navLabel: 'メインナビゲーション', brandAriaLabel: 'PulseBoard エンジニアリングレビューのホーム', promptsIntro: '各質問は、可能な範囲で既存のプロジェクト記録にリンクしています。用意された模範回答ではなく、実装を確認するための問いです。', lifecycleCodeLabel: 'コード', lifecycleTestsLabel: 'テスト', lifecycleDocsLabel: '資料' },
  ko: { languageLabel: '언어', navLabel: '주요 내비게이션', brandAriaLabel: 'PulseBoard 엔지니어링 리뷰 홈', promptsIntro: '각 질문은 가능한 경우 기존 프로젝트 기록으로 연결됩니다. 미리 정해 둔 답이 아니라 실제 구현을 확인하기 위한 질문입니다.', lifecycleCodeLabel: '코드', lifecycleTestsLabel: '테스트', lifecycleDocsLabel: '문서' },
  es: { languageLabel: 'Idioma', navLabel: 'Navegación principal', brandAriaLabel: 'Inicio de la revisión técnica de PulseBoard', promptsIntro: 'Estas preguntas enlazan con registros existentes del proyecto cuando están disponibles. Invitan a comprobar el trabajo, no ofrecen respuestas preparadas.', lifecycleCodeLabel: 'Código', lifecycleTestsLabel: 'Pruebas', lifecycleDocsLabel: 'Documentación' },
  fr: { languageLabel: 'Langue', navLabel: 'Navigation principale', brandAriaLabel: 'Accueil de la revue technique PulseBoard', promptsIntro: 'Ces questions renvoient aux documents existants lorsque c’est possible. Elles invitent à vérifier le travail, sans fournir de réponses toutes faites.', lifecycleCodeLabel: 'Code', lifecycleTestsLabel: 'Tests', lifecycleDocsLabel: 'Documentation' },
  de: { languageLabel: 'Sprache', navLabel: 'Hauptnavigation', brandAriaLabel: 'Startseite der PulseBoard-Systemprüfung', promptsIntro: 'Diese Fragen verweisen, wo möglich, auf vorhandene Projektunterlagen. Sie laden zum Prüfen ein und liefern keine vorgefertigten Antworten.', lifecycleCodeLabel: 'Code', lifecycleTestsLabel: 'Tests', lifecycleDocsLabel: 'Dokumentation' },
  'pt-BR': { languageLabel: 'Idioma', navLabel: 'Navegação principal', brandAriaLabel: 'Início da revisão técnica do PulseBoard', promptsIntro: 'Estas perguntas levam aos registros existentes do projeto quando disponíveis. São convites para verificar o trabalho, não respostas prontas.', lifecycleCodeLabel: 'Código', lifecycleTestsLabel: 'Testes', lifecycleDocsLabel: 'Documentação' },
  ar: { languageLabel: 'اللغة', navLabel: 'التنقل الرئيسي', brandAriaLabel: 'الصفحة الرئيسية لمراجعة هندسة PulseBoard', promptsIntro: 'ترتبط هذه الأسئلة بسجلات المشروع المتاحة. وهي دعوة لفحص العمل وليست إجابات جاهزة.', lifecycleCodeLabel: 'الشفرة', lifecycleTestsLabel: 'الاختبارات', lifecycleDocsLabel: 'الوثائق' },
};

type EvidenceInput = {
  steps: Array<[string, string, string[]]>;
  claims: Array<[string, string, string[], string[]]>;
  boundaries: Array<[string, string]>;
  prompts: string[];
};

const guideHrefs = [
  ['/demo/health/live', '/demo/health/ready'],
  ['/demo/openapi.json'],
  ['#lifecycle'],
  ['#boundaries'],
  ['/zh-hant/projects/pulseboard/deployment-runbook/', '/zh-hant/projects/pulseboard/verification-record/'],
];
const claimHrefs = [
  ['reliability-adr', 'verification-record'],
  ['architecture', 'verification-record'],
  ['/demo/health/live', '/demo/health/ready'],
  ['deployment-runbook', 'verification-record'],
];
const promptHrefs = [
  '/zh-hant/projects/pulseboard/architecture/',
  '/zh-hant/projects/pulseboard/reliability-adr/',
  '/zh-hant/projects/pulseboard/deployment-runbook/',
  '#boundaries',
];

function hrefAt(groups: string[][], groupIndex: number, linkIndex: number) {
  const href = groups[groupIndex]?.[linkIndex];
  if (!href) throw new Error('Review evidence link mapping is incomplete.');
  return href;
}

function makeEvidence(input: EvidenceInput): Pick<ReviewCopy, 'guideSteps' | 'claims' | 'boundaries' | 'prompts'> {
  return {
    guideSteps: input.steps.map(([title, detail, labels], index) => ({ title, detail, links: labels.map((label, linkIndex) => ({ label, href: hrefAt(guideHrefs, index, linkIndex) })) })),
    claims: input.claims.map(([title, evidence, tags, labels], index) => ({ title, evidence, tags, links: labels.map((label, linkIndex) => ({ label, href: hrefAt(claimHrefs, index, linkIndex) })) })),
    boundaries: input.boundaries.map(([title, detail]) => ({ title, detail })),
    prompts: input.prompts.map((question, index) => ({ question, href: hrefAt([promptHrefs], 0, index) })),
  };
}

const evidenceTranslations: Partial<Record<Locale, ReturnType<typeof makeEvidence>>> = {};

evidenceTranslations['zh-TW'] = makeEvidence({
  steps: [
    ['檢查服務是否正常並可接收流量', '兩項公開檢查分別回答「程式是否仍在運作」和「資料庫等依賴是否已準備完成」。', ['服務存活檢查', '服務就緒檢查']],
    ['查看 OpenAPI 合約', '直接閱讀匯出的 API 合約，不必從畫面反推後端能力。', ['OpenAPI']],
    ['閱讀事故處理流程', '依序查看事故接收、排入佇列、背景處理，以及結果如何可靠保存。', ['事故處理流程']],
    ['檢查客戶資料與憑證邊界', '確認工作區範圍限制與 API 金鑰驗證如何阻止跨客戶存取。', ['範圍限制']],
    ['查看部署與回滾證據', '閱讀已聲明的演練範圍、部署交接流程與驗證紀錄。', ['部署手冊', '驗證紀錄']],
  ],
  claims: [
    ['可恢復且不重複的事故處理', '資料庫中的暫時處理權、冪等鍵、同一交易內的結果寫入，以及背景處理復原測試，可避免同一工作被重送時重複改寫事故結果。', ['程式碼', '測試', '復原演練'], ['可靠性設計紀錄', '驗證紀錄']],
    ['客戶資料隔離', '資源存取限制在各自工作區內；測試也涵蓋其他客戶資源的回應方式與 API 金鑰驗證。', ['程式碼', '測試', 'API 合約'], ['架構說明', '驗證紀錄']],
    ['營運就緒能力', '服務存活與就緒檢查、結構化請求識別碼、安全結束程序及監控指標都有實作和文件。', ['程式碼', '測試', '操作手冊'], ['服務存活檢查', '服務就緒檢查']],
    ['部署紀律', '備份還原演練、應用程式回滾演練與預備環境部署手冊，界定了已驗證的交接方式及其限制。', ['測試', '文件', '演練'], ['部署手冊', '驗證紀錄']],
  ],
  boundaries: [
    ['以正式生產環境要求為設計基準', '這是可檢查的後端與平台工程作品集，不是真實商業客戶正在使用的生產系統。'],
    ['通知採用測試替身', '電子郵件與 Slack 通知使用測試替身；Webhook 只有在本機明確設定時才會發出真實 HTTP POST。'],
    ['演練不等於正式營運實績', '備份還原與回滾都屬於演練。回滾只驗證已聲明的「先擴充、再移除舊結構」相容情境，不代表任意歷史版本都能回退。'],
    ['雲端仍在規劃階段', 'AWS 只完成設計規劃；專案沒有建立雲端資源，也沒有變更 DNS、TLS 或主機設定。'],
  ],
  prompts: ['為什麼選擇模組化單體，而不是微服務？', '同一工作可能被投遞多次時，如何避免重複寫入事故結果？', '為什麼應用程式回滾時，資料庫變更仍只向前推進？', '為什麼 API 金鑰驗證足以支援這個可檢查的示範頁？'],
});

evidenceTranslations['zh-CN'] = makeEvidence({
  steps: [
    ['检查服务是否正常并可接收流量', '两项公开检查分别回答“程序是否仍在运行”和“数据库等依赖是否已经准备完成”。', ['服务存活检查', '服务就绪检查']],
    ['查看 OpenAPI 合约', '直接阅读导出的 API 合约，不必从界面反推后端能力。', ['OpenAPI']],
    ['阅读事故处理流程', '依次查看事故接收、进入队列、后台处理，以及结果如何可靠保存。', ['事故处理流程']],
    ['检查客户数据与凭证边界', '确认工作区范围限制与 API 密钥验证如何阻止跨客户访问。', ['范围限制']],
    ['查看部署与回滚证据', '阅读已声明的演练范围、部署交接流程与验证记录。', ['部署手册', '验证记录']],
  ],
  claims: [
    ['可恢复且不重复的事故处理', '数据库中的临时处理权、幂等键、同一事务内的结果写入，以及后台处理恢复测试，可避免同一任务被重复投递时多次改写事故结果。', ['代码', '测试', '恢复演练'], ['可靠性设计记录', '验证记录']],
    ['客户数据隔离', '资源访问被限制在各自工作区内；测试也覆盖其他客户资源的响应方式与 API 密钥验证。', ['代码', '测试', 'API 合约'], ['架构说明', '验证记录']],
    ['运维就绪能力', '服务存活与就绪检查、结构化请求标识、安全退出流程和监控指标都有实现与文档。', ['代码', '测试', '操作手册'], ['服务存活检查', '服务就绪检查']],
    ['部署纪律', '备份恢复演练、应用回滚演练与预备环境部署手册，界定了已经验证的交接方式及其限制。', ['测试', '文档', '演练'], ['部署手册', '验证记录']],
  ],
  boundaries: [
    ['以正式生产环境要求为设计基准', '这是可检查的后端与平台工程作品集，不是真实商业客户正在使用的生产系统。'],
    ['通知使用测试替身', '电子邮件与 Slack 通知使用测试替身；Webhook 只有在本地明确配置时才会发出真实 HTTP POST。'],
    ['演练不等于正式运行业绩', '备份恢复与回滚都属于演练。回滚只验证已声明的“先扩展、再移除旧结构”兼容场景，不代表任意历史版本都能回退。'],
    ['云端仍在规划阶段', 'AWS 只完成设计规划；项目没有创建云资源，也没有修改 DNS、TLS 或主机配置。'],
  ],
  prompts: ['为什么选择模块化单体，而不是微服务？', '同一任务可能被投递多次时，如何避免重复写入事故结果？', '为什么应用回滚时，数据库变更仍只向前推进？', '为什么 API 密钥验证足以支持这个可检查的演示页？'],
});

evidenceTranslations.ja = makeEvidence({
  steps: [
    ['稼働状態と準備状態を確認する', '2 つの公開チェックで、サービス自体が動いているか、依存サービスを含めて利用可能かを分けて確認します。', ['稼働確認', '準備状態']],
    ['OpenAPI 契約を確認する', '画面から推測するのではなく、公開された API 契約を直接読みます。', ['OpenAPI']],
    ['インシデント処理の流れを読む', '受付、キューへの登録、バックグラウンド処理、結果の永続化までを追います。', ['処理の流れ']],
    ['テナントと認証情報の境界を確認する', 'ワークスペース単位の制限と API キー認証が、顧客間の不正なアクセスをどう防ぐか確認します。', ['制約']],
    ['デプロイとロールバックの証拠を確認する', '明示された演習範囲、引き継ぎ手順、検証記録を読みます。', ['デプロイ手順', '検証記録']],
  ],
  claims: [
    ['失われにくいインシデント処理', 'データベースの処理権限管理、冪等性キー、トランザクション内の更新、バックグラウンド処理の復旧テストにより、少なくとも 1 回の配信でも結果の重複を防ぎます。', ['コード', 'テスト', '復旧演習'], ['信頼性 ADR', '検証記録']],
    ['テナント境界', 'リソースへのアクセスをワークスペース内に限定し、別テナントからの要求と API キー認証を API 境界でテストしています。', ['コード', 'テスト', 'API 契約'], ['アーキテクチャ', '検証記録']],
    ['運用準備', '稼働確認と準備状態のチェック、構造化されたリクエスト ID、安全な終了処理、メトリクスを実装し、運用手順として文書化しています。', ['コード', 'テスト', '運用手順'], ['稼働確認', '準備状態']],
    ['デプロイ規律', 'バックアップ復元演習、アプリケーションのロールバック演習、検証環境へのデプロイ手順書が、確認済みの引き継ぎ方法と限界を示します。', ['テスト', '資料', '演習'], ['デプロイ手順', '検証記録']],
  ],
  boundaries: [
    ['本番運用を想定したポートフォリオ', '確認可能なバックエンド／プラットフォーム作品ですが、実際の商用顧客が使う本番サービスではありません。'],
    ['模擬環境に対応した通知経路', 'メールと Slack の通知は模擬実行に対応しています。Webhook はローカル環境で明示的に設定した場合だけ、実際の HTTP POST を送ります。'],
    ['演習による証拠', 'バックアップ復元とロールバックは演習です。ロールバックは、宣言済みの段階的な互換性シナリオだけを対象とし、任意の過去バージョンへの復帰を保証しません。'],
    ['クラウドは設計計画のみ', 'AWS は計画段階にとどまり、このプロジェクトではクラウド資源、DNS、TLS、ホスト設定を作成していません。'],
  ],
  prompts: ['なぜマイクロサービスではなくモジュラーモノリスなのか？', '少なくとも 1 回の配信で、インシデント結果の重複をどう防ぐのか？', 'アプリケーションをロールバックするときも、データベース移行を前方互換に保つのはなぜか？', 'この確認可能なデモで API キー認証が十分なのはなぜか？'],
});

evidenceTranslations["ko"] = makeEvidence({
  steps: [
    ["서비스 상태와 준비 여부 확인", "두 가지 공개 검사를 통해 프로그램이 실행 중인지, 데이터베이스 같은 의존 시스템까지 준비됐는지를 나누어 확인합니다.", ["서비스 동작 확인","서비스 준비 확인"]],
    ["OpenAPI 계약 확인", "화면만 보고 API를 추측하지 않고 공개된 계약 문서를 직접 확인합니다.", ["OpenAPI"]],
    ["인시던트 처리 흐름 확인", "접수, 대기열 등록, 백그라운드 처리, 결과 저장까지의 흐름을 따라갑니다.", ["처리 흐름"]],
    ["고객 데이터와 인증 경계 확인", "고객별 작업 공간의 범위와 API 키 인증이 다른 고객의 데이터 접근을 어떻게 막는지 확인합니다.", ["범위와 제한"]],
    ["배포와 이전 버전 복구 근거 확인", "명시된 검증 훈련의 범위와 배포 인계 절차, 검증 기록을 확인합니다.", ["배포 안내서","검증 기록"]]
  ],
  claims: [
    ["복구 가능하고 중복되지 않는 인시던트 처리", "데이터베이스의 임시 처리 권한, 멱등성 키, 하나의 트랜잭션으로 묶인 결과 저장, 백그라운드 처리 복구 테스트를 통해 같은 작업이 여러 번 전달돼도 인시던트 결과가 중복 기록되지 않게 합니다.", ["코드","테스트","복구 훈련"], ["신뢰성 설계 기록","검증 기록"]],
    ["고객 데이터 격리", "리소스 접근을 고객별 작업 공간 안으로 제한하고, 다른 고객의 리소스를 요청했을 때의 응답과 API 키 인증을 API 경계에서 테스트합니다.", ["코드","테스트","API 계약"], ["아키텍처","검증 기록"]],
    ["운영 준비 상태", "서비스 동작 및 준비 상태 검사, 구조화된 요청 식별자, 안전한 종료 절차, 모니터링 지표를 구현하고 문서화했습니다.", ["코드","테스트","운영 안내서"], ["서비스 동작 확인","서비스 준비 확인"]],
    ["배포 원칙", "백업 복원 훈련, 애플리케이션 이전 버전 복구 훈련, 사전 검증 환경 배포 안내서가 확인된 인계 방식과 한계를 보여 줍니다.", ["테스트","문서","검증 훈련"], ["배포 안내서","검증 기록"]]
  ],
  boundaries: [
    ["실제 운영 환경을 가정해 설계한 포트폴리오", "확인 가능한 백엔드 및 플랫폼 엔지니어링 포트폴리오이며, 실제 상용 고객이 사용하는 운영 시스템은 아닙니다."],
    ["알림은 테스트 대역 사용", "이메일과 Slack 알림은 테스트 대역을 사용합니다. 웹훅은 로컬 환경에서 명시적으로 설정한 경우에만 실제 HTTP POST 요청을 보냅니다."],
    ["검증 훈련은 운영 실적이 아님", "백업 복원과 이전 버전 복구는 검증 훈련입니다. 이전 버전 복구는 새 구조를 먼저 추가한 뒤 기존 구조를 제거하는 것으로 선언된 호환 시나리오만 다루며, 임의의 과거 실행 파일 복구를 보장하지 않습니다."],
    ["클라우드는 설계 계획 단계", "AWS는 설계 계획만 마련했습니다. 이 프로젝트는 클라우드 리소스를 만들거나 DNS, TLS, 호스트 설정을 변경하지 않습니다."]
  ],
  prompts: ["마이크로서비스가 아닌 모듈형 단일 애플리케이션을 선택한 이유는 무엇인가요?", "같은 작업이 여러 번 전달될 수 있는데도 인시던트 결과가 중복되지 않는 이유는 무엇인가요?", "애플리케이션을 이전 버전으로 되돌릴 때도 데이터베이스 변경을 앞으로만 적용하는 이유는 무엇인가요?", "이 확인 가능한 데모에 API 키 인증만으로 충분한 이유는 무엇인가요?"],
});

evidenceTranslations["es"] = makeEvidence({
  steps: [
    ["Comprueba el estado y la disponibilidad", "Las dos comprobaciones distinguen entre un proceso que sigue funcionando y un servicio cuyas dependencias ya están listas para recibir tráfico.", ["Servicio activo","Servicio preparado"]],
    ["Inspecciona el contrato OpenAPI", "Lee el contrato exportado en lugar de inferir la API desde la interfaz de usuario.", ["OpenAPI"]],
    ["Sigue el ciclo de un incidente", "Recorre la recepción, la entrada en cola, el procesamiento en segundo plano y el guardado fiable del resultado.", ["Flujo del incidente"]],
    ["Revisa el aislamiento de clientes y credenciales", "Comprueba cómo el ámbito de cada espacio de trabajo y la autenticación por clave de API impiden el acceso entre clientes.", ["Alcance y límites"]],
    ["Revisa las pruebas de despliegue y reversión", "Consulta el alcance declarado de los ensayos, el procedimiento de entrega y el registro de verificación.", ["Guía de despliegue","Registro de verificación"]]
  ],
  claims: [
    ["Procesamiento recuperable y sin duplicados", "La asignación temporal del trabajo en la base de datos, las claves de idempotencia, la escritura del resultado en una sola transacción y las pruebas de recuperación evitan duplicar el resultado aunque una tarea llegue más de una vez.", ["código","pruebas","ensayo de recuperación"], ["Decisión de fiabilidad","Registro de verificación"]],
    ["Aislamiento entre clientes", "El acceso queda limitado al espacio de trabajo de cada cliente; también se prueban la respuesta ante recursos ajenos y la autenticación por clave de API.", ["código","pruebas","contrato de API"], ["Arquitectura","Registro de verificación"]],
    ["Preparación operativa", "Las comprobaciones de servicio activo y preparado, los identificadores estructurados de solicitud, el cierre seguro y las métricas están implementados y documentados.", ["código","pruebas","guía operativa"], ["Servicio activo","Servicio preparado"]],
    ["Disciplina de despliegue", "Los ensayos de copia y restauración, de reversión de la aplicación y la guía de despliegue en preproducción delimitan el traspaso que se ha probado y sus límites.", ["pruebas","documentación","ensayo"], ["Guía de despliegue","Registro de verificación"]]
  ],
  boundaries: [
    ["Portafolio diseñado con criterios de producción", "Es un proyecto verificable de ingeniería de sistemas y plataforma, no un sistema comercial real utilizado por clientes en producción."],
    ["Notificaciones con sustitutos de prueba", "El correo y Slack usan sustitutos de prueba. Los webhooks solo envían solicitudes HTTP POST reales cuando se configuran expresamente en el entorno local."],
    ["Los ensayos no son experiencia de producción", "La copia y restauración y la reversión son ensayos. La reversión solo cubre el escenario declarado de añadir primero la nueva estructura y retirar después la antigua; no garantiza volver a cualquier ejecutable histórico."],
    ["La nube sigue en fase de planificación", "AWS solo cuenta con un plan de diseño. El proyecto no crea recursos en la nube ni modifica DNS, TLS o la configuración del servidor."]
  ],
  prompts: ["¿Por qué elegir un monolito modular en lugar de microservicios?", "Si una tarea puede llegar más de una vez, ¿cómo se evita duplicar el resultado del incidente?", "¿Por qué los cambios de base de datos solo avanzan cuando se revierte la aplicación?", "¿Por qué basta la autenticación por clave de API en esta demostración verificable?"],
});

evidenceTranslations["fr"] = makeEvidence({
  steps: [
    ["Vérifier que le service fonctionne et peut recevoir du trafic", "Les deux contrôles publics indiquent séparément si le service reste actif et si la base de données et les autres dépendances sont prêtes.", ["Service actif","Service prêt"]],
    ["Consulter le contrat OpenAPI", "Lisez directement le contrat API exporté, sans avoir à déduire les capacités du système depuis l'interface.", ["OpenAPI"]],
    ["Suivre le traitement d'un incident", "Suivez le parcours d'un incident : réception, mise en file d'attente, traitement en arrière-plan et enregistrement fiable du résultat.", ["Traitement de l'incident"]],
    ["Vérifier l'isolation des données clients et des accès", "Examinez comment le périmètre de chaque espace de travail et l'authentification par clé API empêchent les accès entre clients.", ["Périmètre et accès"]],
    ["Examiner les preuves de déploiement et de retour à une version précédente", "Consultez le périmètre déclaré des exercices, le guide de mise en production et le registre de vérification.", ["Guide de déploiement","Registre de vérification"]]
  ],
  claims: [
    ["Traitement récupérable et sans doublons", "Une réservation temporaire du traitement en base de données, des clés d'idempotence, l'écriture du résultat dans une seule transaction et des tests de reprise empêchent qu'un incident soit modifié deux fois lorsqu'une tâche est livrée plusieurs fois.", ["code","tests","exercice de reprise"], ["Décision de fiabilité","Registre de vérification"]],
    ["Isolation des données clients", "L'accès aux ressources est limité à l'espace de travail de chaque client. Les réponses aux demandes visant les données d'un autre client et l'authentification par clé API sont également testées.", ["code","tests","contrat API"], ["Architecture","Registre de vérification"]],
    ["Préparation à l'exploitation", "Les contrôles de service actif et de service prêt, les identifiants de requête structurés, l'arrêt propre et les indicateurs de suivi sont implémentés et documentés.", ["code","tests","guide d'exploitation"], ["Service actif","Service prêt"]],
    ["Discipline de déploiement", "Un exercice de sauvegarde et de restauration, un exercice de retour à une version précédente et un guide de déploiement en environnement de préproduction définissent la procédure vérifiée et ses limites.", ["tests","documentation","exercice"], ["Guide de déploiement","Registre de vérification"]]
  ],
  boundaries: [
    ["Conçu selon les exigences d'un environnement de production", "Il s'agit d'un projet de portfolio backend et plateforme que l'on peut examiner, et non d'un système commercial réellement utilisé par des clients."],
    ["Notifications remplacées par des doubles de test", "Les notifications par e-mail et Slack utilisent des substituts de test. Un webhook n'envoie une véritable requête HTTP POST que s'il est explicitement configuré dans l'environnement local."],
    ["Un exercice n'est pas une preuve d'exploitation réelle", "La sauvegarde, la restauration et le retour à une version précédente sont des exercices de vérification. Le retour ne couvre que le scénario de compatibilité déclaré, où la nouvelle structure est ajoutée avant le retrait de l'ancienne."],
    ["Cloud encore au stade de la planification", "AWS fait uniquement l'objet d'un plan. Le projet ne crée aucune ressource cloud et ne modifie ni DNS, ni TLS, ni configuration de serveur."]
  ],
  prompts: ["Pourquoi avoir choisi une application unique organisée en modules plutôt que des microservices ?", "Comment éviter de modifier deux fois un incident lorsqu'une tâche peut arriver plusieurs fois ?", "Pourquoi les changements de base de données continuent-ils d'avancer lorsque l'application revient à une version précédente ?", "Pourquoi une authentification par clé API suffit-elle pour cette démonstration vérifiable ?"],
});

evidenceTranslations["de"] = makeEvidence({
  steps: [
    ["Prüfen, ob der Dienst läuft und Anfragen annehmen kann", "Die beiden öffentlichen Prüfungen zeigen getrennt, ob der Dienst noch läuft und ob die Datenbank sowie weitere Abhängigkeiten bereit sind.", ["Dienst läuft","Dienst ist bereit"]],
    ["Den OpenAPI-Vertrag ansehen", "Lesen Sie den exportierten API-Vertrag direkt, statt die Funktionen aus der Oberfläche abzuleiten.", ["OpenAPI"]],
    ["Die Bearbeitung eines Vorfalls nachvollziehen", "Verfolgen Sie den Weg eines Vorfalls durch Annahme, Warteschlange, Hintergrundverarbeitung und zuverlässige Speicherung des Ergebnisses.", ["Vorfallbearbeitung"]],
    ["Kundendaten und Zugriffsgrenzen prüfen", "Sehen Sie nach, wie die Begrenzung auf den jeweiligen Arbeitsbereich und die API-Schlüssel-Authentifizierung Zugriffe zwischen Kunden verhindern.", ["Daten- und Zugriffsgrenzen"]],
    ["Nachweise für Bereitstellung und Rückkehr zu einer früheren Version prüfen", "Lesen Sie den erklärten Übungsumfang, den Bereitstellungsleitfaden und den Verifikationsnachweis.", ["Bereitstellungsleitfaden","Verifikationsnachweis"]]
  ],
  claims: [
    ["Wiederherstellbare Verarbeitung ohne doppelte Ergebnisse", "Eine zeitlich begrenzte Verarbeitungsreservierung in der Datenbank, Idempotenzschlüssel, das Speichern des Ergebnisses in einer einzigen Transaktion und Wiederherstellungstests verhindern, dass ein Vorfall doppelt geändert wird, wenn eine Aufgabe mehrfach zugestellt wird.", ["Code","Tests","Wiederherstellungsübung"], ["Zuverlässigkeitsentscheidung","Verifikationsnachweis"]],
    ["Trennung von Kundendaten", "Der Ressourcenzugriff ist auf den Arbeitsbereich des jeweiligen Kunden begrenzt. Auch die Antwort auf fremde Kundendaten und die API-Schlüssel-Authentifizierung werden getestet.", ["Code","Tests","API-Vertrag"], ["Architektur","Verifikationsnachweis"]],
    ["Betriebsbereitschaft", "Prüfungen für laufenden und betriebsbereiten Dienst, strukturierte Anfragekennungen, kontrolliertes Herunterfahren und Überwachungskennzahlen sind umgesetzt und dokumentiert.", ["Code","Tests","Betriebsleitfaden"], ["Dienst läuft","Dienst ist bereit"]],
    ["Disziplin bei der Bereitstellung", "Eine Übung für Sicherung und Wiederherstellung, eine Übung zur Rückkehr auf eine frühere Anwendungsversion und ein Leitfaden für die Vorproduktionsumgebung beschreiben das geprüfte Vorgehen und seine Grenzen.", ["Tests","Dokumentation","Übung"], ["Bereitstellungsleitfaden","Verifikationsnachweis"]]
  ],
  boundaries: [
    ["Nach den Anforderungen eines Produktivsystems gestaltet", "Dies ist ein überprüfbares Portfolio-Projekt für Backend- und Plattformtechnik, aber kein kommerzielles System, das von echten Kunden im Produktivbetrieb genutzt wird."],
    ["Benachrichtigungen verwenden Testersatz", "E-Mail- und Slack-Benachrichtigungen verwenden Testersatz. Ein Webhook sendet nur dann einen echten HTTP POST, wenn er in der lokalen Umgebung ausdrücklich eingerichtet wurde."],
    ["Übungen sind kein Nachweis realen Produktivbetriebs", "Sicherung, Wiederherstellung und die Rückkehr zu einer früheren Version sind Verifikationsübungen. Die Rückkehr deckt nur das erklärte Kompatibilitätsszenario ab, bei dem die neue Struktur vor dem Entfernen der alten eingeführt wird."],
    ["Cloud nur in der Planungsphase", "Für AWS liegt lediglich ein Plan vor. Das Projekt erstellt keine Cloud-Ressourcen und ändert weder DNS, TLS noch Serverkonfigurationen."]
  ],
  prompts: ["Warum wurde eine einzelne, klar in Module gegliederte Anwendung statt Microservices gewählt?", "Wie verhindert das System doppelte Änderungen, wenn dieselbe Aufgabe mehrfach eintreffen kann?", "Warum werden Datenbankänderungen weiter vorwärtsgeführt, während die Anwendung auf eine frühere Version zurückkehrt?", "Warum genügt eine API-Schlüssel-Authentifizierung für diese überprüfbare Demonstration?"],
});

evidenceTranslations["pt-BR"] = makeEvidence({
  steps: [
    ["Verificar se o serviço está funcionando e pronto para receber tráfego", "As duas verificações públicas mostram separadamente se o programa continua no ar e se o banco de dados e as demais dependências estão prontos.", ["Serviço ativo","Serviço pronto"]],
    ["Consultar o contrato OpenAPI", "Leia diretamente o contrato exportado da API, sem precisar deduzir as funções pela interface.", ["OpenAPI"]],
    ["Acompanhar o tratamento de um incidente", "Siga o recebimento, a entrada na fila, o processamento em segundo plano e o armazenamento confiável do resultado.", ["Tratamento do incidente"]],
    ["Verificar o isolamento dos dados e dos acessos", "Veja como o escopo de cada área de trabalho e a autenticação por chave de API impedem o acesso entre clientes.", ["Dados e acessos"]],
    ["Examinar as evidências de implantação e reversão", "Consulte o escopo declarado dos ensaios, o guia de implantação e o registro de verificação.", ["Guia de implantação","Registro de verificação"]]
  ],
  claims: [
    ["Processamento recuperável e sem duplicação", "Uma reserva temporária do processamento no banco de dados, chaves de idempotência, a gravação do resultado em uma única transação e testes de recuperação evitam alterações duplicadas quando a mesma tarefa chega mais de uma vez.", ["código","testes","ensaio de recuperação"], ["Decisão de confiabilidade","Registro de verificação"]],
    ["Isolamento dos dados de clientes", "O acesso aos recursos fica limitado à área de trabalho de cada cliente. Também são testadas a resposta a dados de outro cliente e a autenticação por chave de API.", ["código","testes","contrato da API"], ["Arquitetura","Registro de verificação"]],
    ["Prontidão operacional", "As verificações de serviço ativo e pronto, os identificadores estruturados de solicitação, o encerramento seguro e as métricas de acompanhamento estão implementados e documentados.", ["código","testes","guia operacional"], ["Serviço ativo","Serviço pronto"]],
    ["Disciplina de implantação", "Um ensaio de backup e restauração, um ensaio de reversão da aplicação e um guia de implantação no ambiente de pré-produção definem o procedimento verificado e seus limites.", ["testes","documentação","ensaio"], ["Guia de implantação","Registro de verificação"]]
  ],
  boundaries: [
    ["Projetado com os requisitos de um ambiente de produção", "Este é um projeto de portfólio verificável de backend e plataforma, não um sistema comercial realmente usado por clientes em produção."],
    ["Notificações usam substitutos de teste", "As notificações por e-mail e Slack usam substitutos de teste. Um webhook só envia uma solicitação HTTP POST real quando é configurado explicitamente no ambiente local."],
    ["Ensaios não são histórico real de produção", "Backup, restauração e reversão são ensaios de verificação. A reversão cobre apenas o cenário de compatibilidade declarado, no qual a nova estrutura é adicionada antes da remoção da antiga."],
    ["Nuvem ainda na fase de planejamento", "Há apenas um plano para a AWS. O projeto não cria recursos de nuvem nem altera DNS, TLS ou configurações de servidor."]
  ],
  prompts: ["Por que foi escolhida uma aplicação única organizada em módulos, em vez de microsserviços?", "Como o sistema evita alterações duplicadas quando a mesma tarefa pode chegar mais de uma vez?", "Por que as mudanças no banco de dados continuam avançando enquanto a aplicação volta para uma versão anterior?", "Por que a autenticação por chave de API é suficiente para esta demonstração verificável?"],
});

evidenceTranslations["ar"] = makeEvidence({
  steps: [
    ["التحقق من أن الخدمة تعمل وجاهزة لاستقبال الطلبات", "يعرض الفحصان العامان بشكل منفصل ما إذا كانت الخدمة نشطة وما إذا كانت قاعدة البيانات وبقية الخدمات المساندة جاهزة.", ["الخدمة تعمل","الخدمة جاهزة"]],
    ["مراجعة عقد OpenAPI", "اقرأ عقد API المصدّر مباشرة بدلاً من استنتاج قدرات النظام من الواجهة.", ["OpenAPI"]],
    ["تتبّع معالجة الحادث", "تتبّع مسار الحادث: استلامه وإدخاله إلى قائمة الانتظار ومعالجته في الخلفية ثم حفظ النتيجة بصورة موثوقة.", ["معالجة الحادث"]],
    ["التحقق من عزل بيانات العملاء وحدود الوصول", "راجع كيف يمنع نطاق العمل الخاص بكل عميل والمصادقة بمفتاح API الوصول إلى بيانات عميل آخر.", ["البيانات والوصول"]],
    ["مراجعة أدلة النشر والعودة إلى إصدار سابق", "اطلع على نطاق تمارين التحقق المعلن ودليل النشر وسجل التحقق.", ["دليل النشر","سجل التحقق"]]
  ],
  claims: [
    ["معالجة قابلة للاستئناف بلا نتائج مكررة", "تضمن صلاحية المعالجة المؤقتة المحفوظة في قاعدة البيانات ومفاتيح منع التكرار وحفظ النتيجة ضمن معاملة واحدة واختبارات الاستعادة ألا يُعدّل الحادث مرتين، حتى إذا وصلت المهمة أكثر من مرة.", ["الشفرة","الاختبارات","تمرين الاستعادة"], ["قرار تصميم الموثوقية","سجل التحقق"]],
    ["عزل بيانات العملاء", "يقتصر الوصول إلى الموارد على نطاق العمل الخاص بكل عميل. وتشمل الاختبارات أيضاً الرد على طلبات بيانات عميل آخر والمصادقة بمفتاح API.", ["الشفرة","الاختبارات","عقد API"], ["البنية المعمارية","سجل التحقق"]],
    ["الاستعداد التشغيلي", "فحوصات نشاط الخدمة وجاهزيتها ومعرّفات الطلبات المنظمة والإيقاف الآمن ومؤشرات المراقبة كلها مطبقة وموثقة.", ["الشفرة","الاختبارات","دليل التشغيل"], ["الخدمة تعمل","الخدمة جاهزة"]],
    ["انضباط النشر", "يحدد تمرين النسخ الاحتياطي والاستعادة وتمرين العودة إلى إصدار سابق للتطبيق ودليل النشر في بيئة ما قبل الإنتاج الإجراء الذي جرى التحقق منه وحدوده.", ["الاختبارات","الوثائق","تمرين تحقق"], ["دليل النشر","سجل التحقق"]]
  ],
  boundaries: [
    ["مصمم وفق متطلبات بيئة الإنتاج", "هذا مشروع أعمال يمكن فحصه في هندسة الأنظمة الخلفية والمنصات، وليس نظاماً تجارياً يستخدمه عملاء حقيقيون في بيئة الإنتاج."],
    ["الإشعارات تستخدم بدائل مخصصة للاختبار", "تستخدم إشعارات البريد الإلكتروني وSlack بدائل اختبار. ولا يرسل رابط webhook طلب HTTP POST حقيقياً إلا عند إعداده صراحة في البيئة المحلية."],
    ["تمارين التحقق ليست سجلاً لتشغيل حقيقي", "النسخ الاحتياطي والاستعادة والعودة إلى إصدار سابق كلها تمارين تحقق. وتغطي العودة فقط سيناريو التوافق المعلن الذي يضيف البنية الجديدة قبل إزالة القديمة."],
    ["السحابة ما زالت في مرحلة التخطيط", "لا يتجاوز AWS مرحلة الخطة. لا ينشئ المشروع موارد سحابية ولا يغيّر DNS أو TLS أو إعدادات الخادم."]
  ],
  prompts: ["لماذا اختير تطبيق واحد مقسم إلى وحدات مستقلة بدلاً من الخدمات المصغرة؟", "كيف يمنع النظام تعديل الحادث مرتين عندما تصل المهمة نفسها أكثر من مرة؟", "لماذا تستمر تغييرات قاعدة البيانات إلى الأمام بينما يعود التطبيق إلى إصدار سابق؟", "لماذا تكفي المصادقة بمفتاح API لهذه النسخة التجريبية القابلة للتحقق؟"],
});

const reviewStaticTranslations: Partial<Record<Locale, Partial<ReviewCopy>>> = {
  "ar": {
    "navLive": "وحدة العمليات المباشرة",
    "navCustomer": "واجهة العميل",
    "navDocs": "توثيق API",
    "navOpenApi": "OpenAPI",
    "eyebrow": "لمسؤولي التوظيف ومديري الفرق",
    "title": "برمجيات موثوقة، بشرح واضح.",
    "lead": "PulseBoard مشروع عملي ضمن ملف أعمال لهندسة الأنظمة الخلفية. ابدأ بالملخص المبسط أدناه لتفهم ما تم بناؤه ولماذا يهم، ثم استخدم الروابط التقنية إذا أردت التحقق من التفاصيل.",
    "ctaLive": "افتح وحدة العمليات المباشرة",
    "ctaCustomer": "افتح واجهة العميل",
    "ctaDocs": "افتح توثيق API",
    "ctaOpenApi": "افتح OpenAPI",
    "ctaProbe": "شغّل فحوصات الحالة العامة",
    "audiencePoints": [{"title":"أبني أنظمة يمكن الاعتماد عليها","detail":"صُممت المهام المهمة لتتحمل إعادة المحاولة والأعطال المؤقتة، بدلاً من أن تضيع عند فشل طلب واحد."},{"title":"أحمي بيانات العملاء","detail":"تظل مساحات العمل منفصلة، فلا يستطيع عميل الوصول ببساطة إلى سجلات عميل آخر."},{"title":"أجعل عملي قابلاً للتحقق","detail":"يتضمن المشروع عرضاً عملياً، وفحوصات حالة عامة، واختبارات، وتوثيقاً، وحدوداً واضحة بدلاً من ادعاءات بلا دليل."}],
    "probes": {"live":{"label":"فحص بقاء الخدمة","path":"/demo/health/live"},"ready":{"label":"فحص الجاهزية","path":"/demo/health/ready"},"openapi":{"label":"مستند OpenAPI","path":"/demo/openapi.json"},"docs":{"label":"توثيق API","path":"/demo/docs"}},
    "architecture": [{"name":"المتصفح / الواجهة الثابتة","detail":"صفحة المراجعة ووحدة العمليات المباشرة","className":"browser"},{"name":"Hono API","detail":"المصادقة والمسارات وOpenAPI ومعرّفات الطلبات","className":"api"},{"name":"PostgreSQL","detail":"بيانات مساحات العمل وسجلات الحوادث","className":"data"},{"name":"Redis + BullMQ","detail":"حدود الطلبات والمهام الخلفية الموثوقة","className":"data"},{"name":"العامل الخلفي","detail":"الحجوزات والفحوصات وتغييرات حالة الحوادث","className":"worker"},{"name":"التدقيق / المقاييس / صندوق الإرسال","detail":"السجلات التشغيلية وحالة الإشعارات","className":"ops"}],
    "reviewTime": "ابدأ هنا: 60 ثانية للنظرة العامة و10 دقائق للأدلة",
    "ctaOverview": "ابدأ بالنظرة العامة التي تستغرق 60 ثانية",
    "guideLabel": "01 / ابدأ هنا",
    "guideTitle": "ما الذي يجب فحصه أولاً",
    "guideIntro": "اتبع أقصر مسار من التوافر إلى أدلة الموثوقية. كل خطوة تشير إلى مسار مباشر أو سجل عام أو قسم في هذه الصفحة.",
    "audienceLabel": "للمسؤولين عن التوظيف",
    "audienceTitle": "ما يعرضه هذا المشروع بلغة واضحة",
    "audienceIntro": "لا تحتاج إلى خلفية برمجية للبدء. خلال دقيقة واحدة يمكنك معرفة ما تم بناؤه، ولماذا هو مهم، وأين يمكن لمهندس التحقق من التفاصيل.",
    "audienceNote": "بقية هذه الصفحة هي مسار الأدلة لمقابلة تقنية. يمكنك التوقف هنا وما زلت تحصل على الصورة العامة الصحيحة.",
    "claimLabel": "02 / الادعاء مقابل الدليل",
    "claimTitle": "ادعاءات هندسية مع إثباتات",
    "claimIntro": "الادعاء هو نية التصميم. عمود الأدلة يسمي ما هو موجود فعلاً في الكود أو الاختبارات أو التوثيق، دون تحويل rehearsal إلى إثبات إنتاج.",
    "liveLabel": "03 / ما هو مباشر الآن",
    "liveTitle": "مسابر عامة، نفس المصدر",
    "liveIntro": "تُنفَّذ هذه الطلبات من هذه الصفحة إلى مسارات العرض العامة. الطلب الفاشل يبقى ظاهراً بحالة degraded أو unavailable ولا يحجب بقية المراجعة أبداً.",
    "architectureLabel": "04 / البنية في نظرة واحدة",
    "architectureTitle": "مسار معياري، وليس مخططاً زخرفياً",
    "architectureIntro": "المتصفح يستدعي Hono API؛ الحالة الدائمة موجودة في PostgreSQL؛ العمل الخلفي يمر عبر Redis وBullMQ؛ الأدلة التشغيلية تُسجل بجانب سير العمل.",
    "boundariesLabel": "05 / حدود صريحة",
    "boundariesTitle": "مفيد لكنه محدود عمداً",
    "boundariesIntro": "اقرأ هذه القيود كجزء من الحكم الهندسي. إنها ظاهرة حتى لا يُخلط بين المشروع وخدمة إنتاج تجارية.",
    "promptsLabel": "06 / أسئلة المقابلة",
    "promptsTitle": "أسئلة جيدة لمزيد من النقاش",
    "promptsIntro": "هذه الأسئلة ترتبط بسجلات المشروع الحالية حيثما أمكن. إنها دعوات للفحص، وليست إجابات جاهزة.",
    "probeTitle": "وحدة تحكم المسابر العامة",
    "probeInitial": "بانتظار أول تشغيل للمسار",
    "probeUpdated": "آخر فحص",
    "checking": "جارٍ الفحص",
    "online": "متصل",
    "degraded": "متدهور",
    "unavailable": "غير متاح",
    "requestPending": "طلب معلّق",
    "requestUnavailable": "الشبكة غير متاحة",
    "httpStatus": "HTTP",
    "lifecycleLabel": "دورة حياة الحادث",
    "lifecycleTitle": "الاستيعاب، قائمة الانتظار، الحل.",
    "lifecycleIntro": "الطلبات المحمية بـ API key تدخل إلى Hono API، ويعالج العمال المدعومون بـ Redis الأعمال التشغيلية المؤجلة، ويسجل العامل تحولات الحادث وسجل التدقيق والاستخدام وحالة صندوق إرسال الإشعارات.",
    "lifecycleCodeLabel": "الكود",
    "lifecycleCode": "عقود إيجار (leases)، ومفاتيح idempotency مستقرة، وأقفال صفوف، ومعاملة نتيجة واحدة.",
    "lifecycleTestsLabel": "الاختبارات",
    "lifecycleTests": "سيناريوهات استرداد العمال بعد الانهيار والتصريف الآمن أثناء التشغيل.",
    "lifecycleDocsLabel": "التوثيق",
    "lifecycleDocsLinkLabel": "Reliability ADR",
    "footer": "PulseBoard هو مشروع محفظة بمظهر إنتاجي للواجهة الخلفية والمنصة والسحابة.",
  },
  "pt-BR": {
    "navLive": "Console de operações",
    "navCustomer": "Área do cliente",
    "navDocs": "Documentação da API",
    "navOpenApi": "OpenAPI",
    "eyebrow": "Para recrutadores e gestores de contratação",
    "title": "Software confiável, explicado com clareza.",
    "lead": "O PulseBoard é um projeto funcional de portfólio em engenharia de backend. Comece pelo resumo em linguagem simples para entender o que foi construído e por que isso importa; os links técnicos permitem conferir os detalhes.",
    "ctaLive": "Abrir console de operações",
    "ctaCustomer": "Abrir área do cliente",
    "ctaDocs": "Abrir documentação da API",
    "ctaOpenApi": "Abrir OpenAPI",
    "ctaProbe": "Executar verificações públicas",
    "audiencePoints": [{"title":"Eu construo sistemas confiáveis","detail":"Tarefas importantes são preparadas para suportar novas tentativas e falhas temporárias, sem desaparecer quando uma requisição dá errado."},{"title":"Eu protejo os dados dos clientes","detail":"Os espaços de trabalho ficam separados, para que um cliente não consiga acessar os registros de outro."},{"title":"Eu torno meu trabalho verificável","detail":"O projeto oferece uma demonstração funcional, verificações públicas, testes, documentação e limites claros, em vez de afirmações sem prova."}],
    "probes": {"live":{"label":"Verificação de atividade","path":"/demo/health/live"},"ready":{"label":"Verificação de prontidão","path":"/demo/health/ready"},"openapi":{"label":"Documento OpenAPI","path":"/demo/openapi.json"},"docs":{"label":"Documentação da API","path":"/demo/docs"}},
    "architecture": [{"name":"Navegador / interface estática","detail":"Página de revisão e console de operações","className":"browser"},{"name":"Hono API","detail":"Autenticação, rotas, OpenAPI e IDs de requisição","className":"api"},{"name":"PostgreSQL","detail":"Dados dos espaços de trabalho e registros de incidentes","className":"data"},{"name":"Redis + BullMQ","detail":"Limites de requisição e tarefas duráveis em segundo plano","className":"data"},{"name":"Worker","detail":"Leases, verificações e mudanças de estado dos incidentes","className":"worker"},{"name":"Auditoria / métricas / outbox","detail":"Registros operacionais e estado das notificações","className":"ops"}],
    "reviewTime": "Comece aqui: 60 segundos para a visão geral, 10 minutos para as evidências",
    "ctaOverview": "Comece com a visão geral de 60 segundos",
    "guideLabel": "01 / Comece aqui",
    "guideTitle": "O que inspecionar primeiro",
    "guideIntro": "Siga o caminho mais curto da disponibilidade à evidência de confiabilidade. Cada etapa leva a uma rota ao vivo, um registro público ou uma seção desta página.",
    "audienceLabel": "Para recrutadores e gerentes de contratação",
    "audienceTitle": "O que este projeto mostra, em linguagem simples",
    "audienceIntro": "Você não precisa de conhecimento técnico para começar. Em um minuto, você vê o que foi construído, por que isso importa e onde um engenheiro pode verificar os detalhes.",
    "audienceNote": "O restante desta página é a trilha de evidências para um entrevistador técnico. Você pode parar aqui e ainda ter o panorama correto.",
    "claimLabel": "02 / Afirmação versus evidência",
    "claimTitle": "Afirmações de engenharia com comprovantes",
    "claimIntro": "A afirmação é a intenção de design. A coluna de evidências nomeia o que está realmente presente no código, nos testes ou na documentação, sem transformar um rehearsal em prova de produção.",
    "liveLabel": "03 / O que está no ar agora",
    "liveTitle": "Sondas públicas, mesma origem",
    "liveIntro": "Estas solicitações são executadas a partir desta página contra os caminhos públicos de demonstração. Uma solicitação com falha permanece visível como degradada ou indisponível e nunca bloqueia o restante da revisão.",
    "architectureLabel": "04 / Arquitetura em uma passada",
    "architectureTitle": "Um caminho modular, não um diagrama decorativo",
    "architectureIntro": "O navegador chama a Hono API; o estado durável vive no PostgreSQL; o trabalho em segundo plano passa por Redis e BullMQ; as evidências operacionais são registradas junto ao fluxo de trabalho.",
    "boundariesLabel": "05 / Limites honestos",
    "boundariesTitle": "Útil, mas deliberadamente delimitado",
    "boundariesIntro": "Leia essas restrições como parte do julgamento de engenharia. Elas ficam visíveis para que o projeto não seja confundido com um serviço comercial de produção.",
    "promptsLabel": "06 / Perguntas para entrevista",
    "promptsTitle": "Boas perguntas para aprofundar",
    "promptsIntro": "Estas perguntas linkam para registros existentes do projeto quando disponíveis. São convites para inspecionar, não respostas prontas.",
    "probeTitle": "Console de sonda pública",
    "probeInitial": "Aguardando a primeira execução da sonda",
    "probeUpdated": "Última verificação",
    "checking": "verificando",
    "online": "online",
    "degraded": "degradado",
    "unavailable": "indisponível",
    "requestPending": "solicitação pendente",
    "requestUnavailable": "rede indisponível",
    "httpStatus": "HTTP",
    "lifecycleLabel": "Ciclo de vida do incidente",
    "lifecycleTitle": "Ingestão, fila, resolução.",
    "lifecycleIntro": "Solicitações protegidas por API key entram na Hono API, workers com suporte em Redis processam o trabalho operacional adiado, e o worker registra transições de incidentes, histórico de auditoria, uso e estado da caixa de saída de notificações.",
    "lifecycleCodeLabel": "Código",
    "lifecycleCode": "Leases, chaves estáveis de idempotência, locks de linha e uma transação de resultado único.",
    "lifecycleTestsLabel": "Testes",
    "lifecycleTests": "Recuperação de crash do worker e cenários de drain gracioso em andamento.",
    "lifecycleDocsLabel": "Docs",
    "lifecycleDocsLinkLabel": "Reliability ADR",
    "footer": "PulseBoard é um projeto de portfólio com formato de backend, plataforma e nuvem de produção.",
  },
  "de": {
    "navLive": "Live-Betriebskonsole",
    "navCustomer": "Kundenansicht",
    "navDocs": "API-Dokumentation",
    "navOpenApi": "OpenAPI",
    "eyebrow": "Für Recruiting und Personalverantwortliche",
    "title": "Zuverlässige Software, verständlich erklärt.",
    "lead": "PulseBoard ist ein funktionsfähiges Portfolio-Projekt für Backend-Engineering. Die kurze, verständliche Übersicht zeigt zuerst, was gebaut wurde und warum es wichtig ist; technische Links machen die Details überprüfbar.",
    "ctaLive": "Live-Betriebskonsole öffnen",
    "ctaCustomer": "Kundenansicht öffnen",
    "ctaDocs": "API-Dokumentation öffnen",
    "ctaOpenApi": "OpenAPI öffnen",
    "ctaProbe": "Öffentliche Prüfungen starten",
    "audiencePoints": [{"title":"Ich entwickle verlässliche Systeme","detail":"Wichtige Aufgaben überstehen Wiederholungen und vorübergehende Fehler, statt bei einer fehlgeschlagenen Anfrage verloren zu gehen."},{"title":"Ich schütze Kundendaten","detail":"Arbeitsbereiche bleiben voneinander getrennt, damit ein Kunde nicht auf die Daten eines anderen zugreifen kann."},{"title":"Ich mache meine Arbeit überprüfbar","detail":"Das Projekt enthält eine funktionierende Demo, öffentliche Statusprüfungen, Tests, Dokumentation und klar benannte Grenzen statt unbelegter Behauptungen."}],
    "probes": {"live":{"label":"Verfügbarkeit","path":"/demo/health/live"},"ready":{"label":"Betriebsbereitschaft","path":"/demo/health/ready"},"openapi":{"label":"OpenAPI-Dokument","path":"/demo/openapi.json"},"docs":{"label":"API-Dokumentation","path":"/demo/docs"}},
    "architecture": [{"name":"Browser / statische Oberfläche","detail":"Review-Seite und Live-Betriebskonsole","className":"browser"},{"name":"Hono API","detail":"Authentifizierung, Routen, OpenAPI und Request-IDs","className":"api"},{"name":"PostgreSQL","detail":"Workspace-Daten und Vorfallaufzeichnungen","className":"data"},{"name":"Redis + BullMQ","detail":"Anfragelimits und dauerhafte Hintergrundaufgaben","className":"data"},{"name":"Worker","detail":"Leases, Prüfungen und Statusänderungen von Vorfällen","className":"worker"},{"name":"Audit / Metriken / Outbox","detail":"Betriebsnachweise und Benachrichtigungsstatus","className":"ops"}],
    "reviewTime": "Hier starten: 60 Sekunden für den Überblick, 10 Minuten für die Belege",
    "ctaOverview": "Beginnen Sie mit dem 60-Sekunden-Überblick",
    "guideLabel": "01 / Hier starten",
    "guideTitle": "Was zuerst geprüft werden sollte",
    "guideIntro": "Folgen Sie dem kürzesten Weg von Verfügbarkeit zu Zuverlässigkeitsbelegen. Jeder Schritt führt zu einem Live-Pfad, einem öffentlichen Eintrag oder einem Abschnitt auf dieser Seite.",
    "audienceLabel": "Für Personalvermittler und Einstellungsverantwortliche",
    "audienceTitle": "Was dieses Projekt zeigt, in einfacher Sprache",
    "audienceIntro": "Sie benötigen keinen Software-Hintergrund, um zu starten. In einer Minute sehen Sie, was gebaut wurde, warum es wichtig ist und wo ein Ingenieur die Details prüfen kann.",
    "audienceNote": "Der Rest dieser Seite ist die Belegkette für ein technisches Interview. Sie können hier aufhören und haben trotzdem das richtige Gesamtbild.",
    "claimLabel": "02 / Behauptung versus Beleg",
    "claimTitle": "Engineering-Behauptungen mit Belegen",
    "claimIntro": "Die Behauptung ist die Designabsicht. Die Belegspalte benennt, was tatsächlich im Code, in Tests oder in der Dokumentation vorhanden ist, ohne ein rehearsal in einen Produktionsbeweis zu verwandeln.",
    "liveLabel": "03 / Was jetzt live ist",
    "liveTitle": "Öffentliche Probes, gleiche Herkunft",
    "liveIntro": "Diese Anfragen laufen von dieser Seite gegen die öffentlichen Demo-Pfade. Eine fehlgeschlagene Anfrage bleibt als degradiert oder nicht verfügbar sichtbar und blockiert nie den Rest der Überprüfung.",
    "architectureLabel": "04 / Architektur in einem Durchgang",
    "architectureTitle": "Ein modularer Weg, kein dekoratives Diagramm",
    "architectureIntro": "Der Browser ruft die Hono API auf; dauerhafter Zustand liegt in PostgreSQL; Hintergrundarbeit läuft über Redis und BullMQ; betriebliche Belege werden zusammen mit dem Workflow erfasst.",
    "boundariesLabel": "05 / Ehrliche Grenzen",
    "boundariesTitle": "Nützlich, aber bewusst begrenzt",
    "boundariesIntro": "Lesen Sie diese Einschränkungen als Teil des Engineering-Urteils. Sie sind sichtbar, damit das Projekt nicht mit einem kommerziellen Produktionsdienst verwechselt wird.",
    "promptsLabel": "06 / Interview-Fragen",
    "promptsTitle": "Gute Fragen, um tiefer zu gehen",
    "promptsIntro": "Diese Fragen verlinken, wo verfügbar, auf vorhandene Projektaufzeichnungen. Sie sind Einladungen zur Prüfung, keine vorgefertigten Antworten.",
    "probeTitle": "Öffentliche Probe-Konsole",
    "probeInitial": "Warten auf den ersten Probe-Lauf",
    "probeUpdated": "Zuletzt geprüft",
    "checking": "prüfe",
    "online": "online",
    "degraded": "degradiert",
    "unavailable": "nicht verfügbar",
    "requestPending": "Anfrage ausstehend",
    "requestUnavailable": "Netzwerk nicht verfügbar",
    "httpStatus": "HTTP",
    "lifecycleLabel": "Vorfall-Lebenszyklus",
    "lifecycleTitle": "Aufnahme, Warteschlange, Auflösung.",
    "lifecycleIntro": "Durch API-Key geschützte Anfragen gelangen in die Hono API, Redis-gestützte Worker verarbeiten verzögerte operative Arbeit, und der Worker zeichnet Vorfallübergänge, Audit-Verlauf, Nutzung und Zustand des Benachrichtigungs-Postausgangs auf.",
    "lifecycleCodeLabel": "Code",
    "lifecycleCode": "Leases, stabile Idempotenzschlüssel, Zeilensperren und eine Ergebnis-Transaktion.",
    "lifecycleTestsLabel": "Tests",
    "lifecycleTests": "Worker-Crash-Recovery und Szenarien für kontrolliertes Drain während des laufenden Betriebs.",
    "lifecycleDocsLabel": "Doku",
    "lifecycleDocsLinkLabel": "Reliability ADR",
    "footer": "PulseBoard ist ein produktionsnahes Backend-, Plattform- und Cloud-Portfolioprojekt.",
  },
  "fr": {
    "navLive": "Console des opérations",
    "navCustomer": "Espace client",
    "navDocs": "Documentation API",
    "navOpenApi": "OpenAPI",
    "eyebrow": "Pour les recruteurs et responsables du recrutement",
    "title": "Un logiciel fiable, expliqué clairement.",
    "lead": "PulseBoard est un projet de portfolio fonctionnel en ingénierie backend. Commencez par le résumé en langage simple pour comprendre ce qui a été construit et pourquoi cela compte; les liens techniques permettent ensuite de vérifier les détails.",
    "ctaLive": "Ouvrir la console des opérations",
    "ctaCustomer": "Ouvrir l’espace client",
    "ctaDocs": "Ouvrir la documentation API",
    "ctaOpenApi": "Ouvrir OpenAPI",
    "ctaProbe": "Lancer les vérifications publiques",
    "audiencePoints": [{"title":"Je construis des systèmes fiables","detail":"Les tâches importantes sont conçues pour résister aux nouvelles tentatives et aux pannes temporaires, plutôt que de disparaître après l’échec d’une requête."},{"title":"Je protège les données clients","detail":"Les espaces de travail restent séparés afin qu’un client ne puisse pas accéder aux données d’un autre."},{"title":"Je rends mon travail vérifiable","detail":"Le projet comprend une démonstration fonctionnelle, des contrôles publics, des tests, de la documentation et des limites claires, plutôt que des affirmations sans preuve."}],
    "probes": {"live":{"label":"Disponibilité du service","path":"/demo/health/live"},"ready":{"label":"État de préparation","path":"/demo/health/ready"},"openapi":{"label":"Document OpenAPI","path":"/demo/openapi.json"},"docs":{"label":"Documentation API","path":"/demo/docs"}},
    "architecture": [{"name":"Navigateur / interface statique","detail":"Page de revue et console des opérations","className":"browser"},{"name":"Hono API","detail":"Authentification, routes, OpenAPI et identifiants de requête","className":"api"},{"name":"PostgreSQL","detail":"Données des espaces de travail et incidents","className":"data"},{"name":"Redis + BullMQ","detail":"Limites de requêtes et tâches durables en arrière-plan","className":"data"},{"name":"Worker","detail":"Leases, contrôles et changements d’état des incidents","className":"worker"},{"name":"Audit / métriques / outbox","detail":"Traces opérationnelles et état des notifications","className":"ops"}],
    "reviewTime": "Commencez ici : 60 secondes pour la vue d'ensemble, 10 minutes pour les preuves",
    "ctaOverview": "Commencez par la vue d'ensemble en 60 secondes",
    "guideLabel": "01 / Commencez ici",
    "guideTitle": "Ce qu'il faut inspecter en premier",
    "guideIntro": "Suivez le chemin le plus court entre la disponibilité et les preuves de fiabilité. Chaque étape mène à une route en direct, un enregistrement public ou une section de cette page.",
    "audienceLabel": "Pour les recruteurs et les responsables de recrutement",
    "audienceTitle": "Ce que ce projet montre, en langage clair",
    "audienceIntro": "Vous n'avez pas besoin de connaissances en logiciel pour commencer. En une minute, vous pouvez voir ce qui a été construit, pourquoi c'est important et où un ingénieur peut vérifier les détails.",
    "audienceNote": "Le reste de cette page est la piste de preuves destinée à un intervieweur technique. Vous pouvez vous arrêter ici et garder une vision d'ensemble correcte.",
    "claimLabel": "02 / Affirmation et preuves",
    "claimTitle": "Des affirmations d'ingénierie avec des reçus",
    "claimIntro": "L'affirmation est l'intention de conception. La colonne des preuves indique ce qui est réellement présent dans le code, les tests ou la documentation, sans transformer un rehearsal en preuve de production.",
    "liveLabel": "03 / Ce qui est en direct maintenant",
    "liveTitle": "Sondes publiques, même origine",
    "liveIntro": "Ces requêtes partent de cette page vers les chemins de démonstration publics. Une requête en échec reste visible comme dégradée ou indisponible et ne bloque jamais le reste de l'examen.",
    "architectureLabel": "04 / Architecture en un passage",
    "architectureTitle": "Un chemin modulaire, pas un diagramme décoratif",
    "architectureIntro": "Le navigateur appelle la Hono API ; l'état durable vit dans PostgreSQL ; le travail en arrière-plan passe par Redis et BullMQ ; les preuves opérationnelles sont enregistrées en même temps que le flux de travail.",
    "boundariesLabel": "05 / Limites honnêtes",
    "boundariesTitle": "Utile, mais délibérément limité",
    "boundariesIntro": "Lisez ces contraintes comme faisant partie du jugement d'ingénierie. Elles sont visibles pour que le projet ne soit pas confondu avec un service commercial de production.",
    "promptsLabel": "06 / Questions d'entretien",
    "promptsTitle": "De bonnes questions pour aller plus loin",
    "promptsIntro": "Ces questions renvoient aux enregistrements existants du projet lorsque c'est possible. Ce sont des invitations à inspecter, pas des réponses toutes faites.",
    "probeTitle": "Console de sondes publiques",
    "probeInitial": "En attente de la première exécution de sonde",
    "probeUpdated": "Dernière vérification",
    "checking": "vérification",
    "online": "en ligne",
    "degraded": "dégradé",
    "unavailable": "indisponible",
    "requestPending": "requête en attente",
    "requestUnavailable": "réseau indisponible",
    "httpStatus": "HTTP",
    "lifecycleLabel": "Cycle de vie d'un incident",
    "lifecycleTitle": "Ingestion, file d'attente, résolution.",
    "lifecycleIntro": "Les requêtes protégées par API key entrent dans la Hono API, les workers adossés à Redis traitent le travail opérationnel différé, et le worker enregistre les transitions d'incident, l'historique d'audit, l'utilisation et l'état de la boîte d'envoi de notifications.",
    "lifecycleCodeLabel": "Code",
    "lifecycleCode": "Leases, clés d'idempotence stables, verrous de ligne et une transaction de résultat unique.",
    "lifecycleTestsLabel": "Tests",
    "lifecycleTests": "Récupération après crash du worker et scénarios de drain gracieux en cours.",
    "lifecycleDocsLabel": "Docs",
    "lifecycleDocsLinkLabel": "Reliability ADR",
    "footer": "PulseBoard est un projet de portfolio configuré comme un backend, une plateforme et un cloud de production.",
  },
  "es": {
    "navLive": "Consola de operaciones",
    "navCustomer": "Vista del cliente",
    "navDocs": "Documentación de la API",
    "navOpenApi": "OpenAPI",
    "eyebrow": "Para selección de personal y responsables de contratación",
    "title": "Software fiable, explicado con claridad.",
    "lead": "PulseBoard es un proyecto funcional de portafolio centrado en ingeniería backend. Empiece por el resumen en lenguaje sencillo para entender qué se construyó y por qué importa; los enlaces técnicos permiten comprobar los detalles.",
    "ctaLive": "Abrir consola de operaciones",
    "ctaCustomer": "Abrir vista del cliente",
    "ctaDocs": "Abrir documentación de la API",
    "ctaOpenApi": "Abrir OpenAPI",
    "ctaProbe": "Ejecutar comprobaciones públicas",
    "audiencePoints": [{"title":"Construyo sistemas fiables","detail":"Las tareas importantes están diseñadas para soportar reintentos y fallos temporales, sin perderse cuando una solicitud falla."},{"title":"Protejo los datos de los clientes","detail":"Los espacios de trabajo permanecen separados para que un cliente no pueda acceder a los registros de otro."},{"title":"Hago que mi trabajo sea verificable","detail":"El proyecto incluye una demostración funcional, comprobaciones públicas, pruebas, documentación y límites claros, en lugar de afirmaciones sin respaldo."}],
    "probes": {"live":{"label":"Comprobación de actividad","path":"/demo/health/live"},"ready":{"label":"Comprobación de disponibilidad","path":"/demo/health/ready"},"openapi":{"label":"Documento OpenAPI","path":"/demo/openapi.json"},"docs":{"label":"Documentación de la API","path":"/demo/docs"}},
    "architecture": [{"name":"Navegador / interfaz estática","detail":"Página de revisión y consola de operaciones","className":"browser"},{"name":"Hono API","detail":"Autenticación, rutas, OpenAPI e identificadores de solicitud","className":"api"},{"name":"PostgreSQL","detail":"Datos de espacios de trabajo y registros de incidentes","className":"data"},{"name":"Redis + BullMQ","detail":"Límites de solicitudes y tareas duraderas en segundo plano","className":"data"},{"name":"Worker","detail":"Leases, comprobaciones y cambios de estado de incidentes","className":"worker"},{"name":"Auditoría / métricas / outbox","detail":"Registros operativos y estado de las notificaciones","className":"ops"}],
    "reviewTime": "Empieza aquí: 60 segundos para la visión general, 10 minutos para la evidencia",
    "ctaOverview": "Empieza con la visión general de 60 segundos",
    "guideLabel": "01 / Empieza aquí",
    "guideTitle": "Qué inspeccionar primero",
    "guideIntro": "Sigue el camino más corto desde la disponibilidad hasta la evidencia de fiabilidad. Cada paso lleva a una ruta en vivo, un registro público o una sección de esta página.",
    "audienceLabel": "Para reclutadores y responsables de contratación",
    "audienceTitle": "Lo que muestra este proyecto, en lenguaje sencillo",
    "audienceIntro": "No necesitas conocimientos de software para empezar. En un minuto puedes ver qué se ha construido, por qué importa y dónde puede un ingeniero verificar los detalles.",
    "audienceNote": "El resto de esta página es la pista de evidencia para un entrevistador técnico. Puedes detenerte aquí y aun así tener la visión general correcta.",
    "claimLabel": "02 / Afirmación frente a evidencia",
    "claimTitle": "Afirmaciones de ingeniería con justificantes",
    "claimIntro": "La afirmación es la intención de diseño. La columna de evidencia nombra lo que realmente está presente en el código, las pruebas o la documentación, sin convertir un rehearsal en prueba de producción.",
    "liveLabel": "03 / Lo que está en vivo ahora",
    "liveTitle": "Sondas públicas, mismo origen",
    "liveIntro": "Estas solicitudes se ejecutan desde esta página contra las rutas públicas de demostración. Una solicitud fallida permanece visible como degradada o no disponible y nunca bloquea el resto de la revisión.",
    "architectureLabel": "04 / Arquitectura de un vistazo",
    "architectureTitle": "Un camino modular, no un diagrama decorativo",
    "architectureIntro": "El navegador llama a la Hono API; el estado duradero vive en PostgreSQL; el trabajo en segundo plano pasa por Redis y BullMQ; la evidencia operativa se registra junto con el flujo de trabajo.",
    "boundariesLabel": "05 / Límites honestos",
    "boundariesTitle": "Útil, pero deliberadamente acotado",
    "boundariesIntro": "Lee estas restricciones como parte del juicio de ingeniería. Son visibles para que el proyecto no se confunda con un servicio comercial de producción.",
    "promptsLabel": "06 / Preguntas para la entrevista",
    "promptsTitle": "Buenas preguntas para profundizar",
    "promptsIntro": "Estas preguntas enlazan con registros existentes del proyecto cuando están disponibles. Son invitaciones a inspeccionar, no respuestas escritas de antemano.",
    "probeTitle": "Consola de sondas públicas",
    "probeInitial": "Esperando la primera ejecución de sonda",
    "probeUpdated": "Última comprobación",
    "checking": "comprobando",
    "online": "en línea",
    "degraded": "degradada",
    "unavailable": "no disponible",
    "requestPending": "solicitud pendiente",
    "requestUnavailable": "red no disponible",
    "httpStatus": "HTTP",
    "lifecycleLabel": "Ciclo de vida del incidente",
    "lifecycleTitle": "Ingesta, cola, resolución.",
    "lifecycleIntro": "Las solicitudes protegidas por API key entran en la Hono API, los workers con respaldo en Redis procesan el trabajo operativo retrasado, y el worker registra transiciones de incidentes, historial de auditoría, uso y estado de la bandeja de notificaciones.",
    "lifecycleCodeLabel": "Código",
    "lifecycleCode": "Leases, claves estables de idempotencia, bloqueos de fila y una transacción de resultado único.",
    "lifecycleTestsLabel": "Pruebas",
    "lifecycleTests": "Recuperación ante caídas del worker y escenarios de drenaje controlado en curso.",
    "lifecycleDocsLabel": "Docs",
    "lifecycleDocsLinkLabel": "Reliability ADR",
    "footer": "PulseBoard es un proyecto de portafolio con forma de backend, plataforma y nube de producción.",
  },
  "ko": {
    "navLive": "실시간 운영 콘솔",
    "navCustomer": "고객 화면",
    "navDocs": "API 문서",
    "navOpenApi": "OpenAPI",
    "eyebrow": "채용 담당자와 현업 면접관을 위한 안내",
    "title": "안정적인 소프트웨어를 쉽게 설명합니다.",
    "lead": "PulseBoard는 실제로 실행해 볼 수 있는 백엔드 엔지니어링 포트폴리오 프로젝트입니다. 먼저 아래의 쉬운 설명에서 무엇을 만들었고 왜 중요한지 확인하세요. 기술 담당자는 링크를 통해 세부 구현을 검증할 수 있습니다.",
    "ctaLive": "실시간 운영 콘솔 열기",
    "ctaCustomer": "고객 화면 열기",
    "ctaDocs": "API 문서 열기",
    "ctaOpenApi": "OpenAPI 열기",
    "ctaProbe": "공개 상태 확인 실행",
    "audiencePoints": [{"title":"신뢰할 수 있는 시스템을 만듭니다","detail":"중요한 작업은 재시도나 일시적인 장애가 생겨도 사라지지 않도록 설계했습니다."},{"title":"고객 데이터를 보호합니다","detail":"작업 공간을 서로 분리해 한 고객이 다른 고객의 기록에 접근할 수 없도록 했습니다."},{"title":"결과를 직접 확인할 수 있게 합니다","detail":"근거 없는 주장 대신 실행 가능한 데모, 공개 상태 확인, 테스트, 문서, 명확한 한계를 제공합니다."}],
    "probes": {"live":{"label":"서비스 작동 상태","path":"/demo/health/live"},"ready":{"label":"서비스 준비 상태","path":"/demo/health/ready"},"openapi":{"label":"OpenAPI 문서","path":"/demo/openapi.json"},"docs":{"label":"API 문서","path":"/demo/docs"}},
    "architecture": [{"name":"브라우저 / 정적 화면","detail":"리뷰 페이지와 실시간 운영 콘솔","className":"browser"},{"name":"Hono API","detail":"인증, 경로, OpenAPI, 요청 ID","className":"api"},{"name":"PostgreSQL","detail":"작업 공간 데이터와 인시던트 기록","className":"data"},{"name":"Redis + BullMQ","detail":"요청 제한과 안정적인 백그라운드 작업","className":"data"},{"name":"Worker","detail":"Lease, 상태 확인, 인시던트 상태 변경","className":"worker"},{"name":"감사 기록 / 메트릭 / 전송함","detail":"운영 기록과 알림 상태","className":"ops"}],
    "reviewTime": "여기서 시작하세요. 개요는 60초, 증거 확인은 10분",
    "ctaOverview": "60초 개요부터 시작하세요",
    "guideLabel": "01 / 여기서 시작",
    "guideTitle": "가장 먼저 확인할 것",
    "guideIntro": "가용성에서 안정성 증거까지 가장 짧은 경로를 따르세요. 각 단계는 라이브 경로, 공개 기록 또는 이 페이지의 한 섹션으로 연결됩니다.",
    "audienceLabel": "리크루터와 채용 담당자용",
    "audienceTitle": "이 프로젝트가 보여주는 것: 쉬운 언어로",
    "audienceIntro": "소프트웨어 배경지식 없이도 시작할 수 있습니다. 1분 안에 무엇이 구축됐는지, 왜 중요한지, 엔지니어가 세부 사항을 어디서 검증하는지 확인할 수 있습니다.",
    "audienceNote": "이 페이지의 나머지는 기술 면접관을 위한 증거 자료입니다. 여기서 멈춰도 큰 그림은 정확합니다.",
    "claimLabel": "02 / 주장과 증거",
    "claimTitle": "근거가 있는 엔지니어링 주장",
    "claimIntro": "주장은 설계 의도입니다. 증거 열은 코드, 테스트, 문서에 실제로 존재하는 항목을 보여주며 rehearsal을 프로덕션 증명으로 바꾸지 않습니다.",
    "liveLabel": "03 / 현재 라이브 제공",
    "liveTitle": "공개 프로브, 동일 출처",
    "liveIntro": "이 요청은 이 페이지에서 공개 데모 경로로 실행됩니다. 실패한 요청은 degraded 또는 unavailable로 계속 표시되며 나머지 리뷰를 차단하지 않습니다.",
    "architectureLabel": "04 / 한눈에 보는 아키텍처",
    "architectureTitle": "장식용 다이어그램이 아니라 모듈형 경로",
    "architectureIntro": "브라우저는 Hono API를 호출하고, 지속 상태는 PostgreSQL에 저장되며, 백그라운드 작업은 Redis와 BullMQ를 통과하고, 운영 증거는 워크플로와 함께 기록됩니다.",
    "boundariesLabel": "05 / 솔직한 경계",
    "boundariesTitle": "유용하지만 의도적으로 제한됨",
    "boundariesIntro": "이 제약들을 엔지니어링 판단의 일부로 읽어 주세요. 프로젝트가 상용 프로덕션 서비스로 오인되지 않도록 명확히 드러냅니다.",
    "promptsLabel": "06 / 면접 프롬프트",
    "promptsTitle": "더 깊이 논의할 좋은 질문",
    "promptsIntro": "이 질문은 가능하면 기존 프로젝트 기록으로 연결됩니다. 미리 작성된 답변이 아니라 확인하라는 초대입니다.",
    "probeTitle": "공개 프로브 콘솔",
    "probeInitial": "첫 프로브 실행 대기 중",
    "probeUpdated": "마지막 확인",
    "checking": "확인 중",
    "online": "온라인",
    "degraded": "성능 저하",
    "unavailable": "사용 불가",
    "requestPending": "요청 대기 중",
    "requestUnavailable": "네트워크 사용 불가",
    "httpStatus": "HTTP",
    "lifecycleLabel": "인시던트 라이프사이클",
    "lifecycleTitle": "수집, 대기열, 해결.",
    "lifecycleIntro": "API key로 보호된 요청은 Hono API로 들어오고, Redis 기반 워커가 지연된 운영 작업을 처리하며, 워커는 인시던트 전환, 감사 기록, 사용량, 알림 전송 큐 상태를 기록합니다.",
    "lifecycleCodeLabel": "코드",
    "lifecycleCode": "데이터베이스 lease, 안정적인 멱등성 키, 행 잠금, 단일 결과 트랜잭션.",
    "lifecycleTestsLabel": "테스트",
    "lifecycleTests": "워커 충돌 복구 및 진행 중 정상 드레이닝 시나리오.",
    "lifecycleDocsLabel": "문서",
    "lifecycleDocsLinkLabel": "Reliability ADR",
    "footer": "PulseBoard는 프로덕션 형태의 백엔드, 플랫폼, 클라우드 포트폴리오 프로젝트입니다.",
  },
};

const reviewLocalizationPolish: Partial<Record<Locale, Partial<ReviewCopy>>> = {
  'zh-TW': {
    claimIntro: '主張代表設計意圖；證據欄只列出程式碼、測試或文件中確實存在的內容，不把演練說成正式生產環境的證明。',
    liveIntro: '這些請求會從本頁連到公開示範路徑。若請求失敗，畫面會明確顯示「功能降級」或「無法連線」，但不影響閱讀其他評審內容。',
    probes: {
      live: { label: '服務存活檢查', path: '/demo/health/live' },
      ready: { label: '服務就緒檢查', path: '/demo/health/ready' },
      openapi: { label: 'OpenAPI 規格文件', path: '/demo/openapi.json' },
      docs: { label: 'API 說明文件', path: '/demo/docs' },
    },
    architecture: [
      { name: '瀏覽器／靜態介面', detail: '評審頁面與即時營運控制台', className: 'browser' },
      { name: 'Hono API', detail: '身分驗證、路由、OpenAPI 與請求識別碼', className: 'api' },
      { name: 'PostgreSQL', detail: '工作區資料與事故紀錄', className: 'data' },
      { name: 'Redis + BullMQ', detail: '流量限制與可靠的背景工作', className: 'data' },
      { name: '背景工作程序', detail: '工作租約、狀態檢查與事故狀態轉換', className: 'worker' },
      { name: '稽核／指標／通知寄件匣', detail: '營運證據與通知狀態', className: 'ops' },
    ],
    lifecycleLabel: '事故處理生命週期',
    lifecycleTitle: '接收、排隊、處理完成。',
    lifecycleIntro: '通過 API 金鑰驗證的請求進入 Hono API；由 Redis 支援的背景工作程序處理延後任務，並記錄事故狀態、稽核紀錄、用量與通知寄件匣狀態。',
    lifecycleCode: '資料庫工作租約、穩定的冪等鍵、資料列鎖定，以及在單一交易中寫入結果。',
    lifecycleTests: '涵蓋背景工作程序當機復原，以及處理中安全結束的測試情境。',
    lifecycleDocsLinkLabel: '可靠性架構決策紀錄',
    footer: 'PulseBoard 是一個以正式生產環境要求為設計基準的後端、平台與雲端工程作品集專案。',
  },
  'zh-CN': {
    claimIntro: '主张代表设计意图；证据栏只列出代码、测试或文档中确实存在的内容，不把演练说成正式生产环境的证明。',
    liveIntro: '这些请求会从本页连接到公开演示路径。若请求失败，页面会明确显示“功能降级”或“无法连接”，但不影响阅读其他评审内容。',
    probes: {
      live: { label: '服务存活检查', path: '/demo/health/live' },
      ready: { label: '服务就绪检查', path: '/demo/health/ready' },
      openapi: { label: 'OpenAPI 规范文档', path: '/demo/openapi.json' },
      docs: { label: 'API 说明文档', path: '/demo/docs' },
    },
    architecture: [
      { name: '浏览器／静态界面', detail: '评审页面与实时运维控制台', className: 'browser' },
      { name: 'Hono API', detail: '身份验证、路由、OpenAPI 与请求标识', className: 'api' },
      { name: 'PostgreSQL', detail: '工作区数据与事故记录', className: 'data' },
      { name: 'Redis + BullMQ', detail: '流量限制与可靠的后台任务', className: 'data' },
      { name: '后台工作进程', detail: '任务租约、状态检查与事故状态转换', className: 'worker' },
      { name: '审计／指标／通知发件箱', detail: '运维证据与通知状态', className: 'ops' },
    ],
    lifecycleLabel: '事故处理生命周期',
    lifecycleTitle: '接收、排队、处理完成。',
    lifecycleIntro: '通过 API 密钥验证的请求进入 Hono API；由 Redis 支持的后台工作进程处理延迟任务，并记录事故状态、审计记录、用量与通知发件箱状态。',
    lifecycleCode: '数据库任务租约、稳定的幂等键、数据行锁定，以及在单个事务中写入结果。',
    lifecycleTests: '覆盖后台工作进程崩溃恢复，以及处理中安全退出的测试场景。',
    lifecycleDocsLinkLabel: '可靠性架构决策记录',
    footer: 'PulseBoard 是一个以正式生产环境要求为设计基准的后端、平台与云工程作品集项目。',
  },
  ja: {
    navLive: '運用コンソール',
    ctaLive: '運用コンソールを開く',
    ctaProbe: '公開チェックを実行',
    audiencePoints: [
      { title: '信頼できるシステムを作る', detail: '重要な処理は、再試行や一時的な障害が起きても、1 回のリクエスト失敗で失われないように設計しています。' },
      { title: '顧客データを守る', detail: 'ワークスペースを分離し、ある顧客が別の顧客の記録へアクセスできないようにしています。' },
      { title: '成果を確認できる形で示す', detail: '動作するデモ、公開ヘルスチェック、テスト、資料、明示した制約を用意し、根拠のない主張に頼りません。' },
    ],
    audienceNote: 'この先は、技術面接官が実装を確認するための証拠です。ここまで読めば、採用担当者として必要な全体像はつかめます。',
    claimLabel: '02 / 主張と根拠',
    claimIntro: '主張は設計意図です。根拠欄にはコード、テスト、資料に実在する内容だけを挙げ、演習を本番運用の実績とは扱いません。',
    liveLabel: '03 / 現在確認できるもの',
    liveTitle: '同じサイト上の公開チェック',
    liveIntro: 'このページから公開デモの各経路へ実際に接続します。失敗は「一部障害」または「利用不可」と表示され、他の内容の閲覧は妨げません。',
    architectureLabel: '04 / アーキテクチャを一巡',
    architectureIntro: 'ブラウザは Hono API に接続し、永続データは PostgreSQL に保存されます。バックグラウンド処理は Redis と BullMQ を経由し、運用上の証拠も処理とともに記録されます。',
    boundariesLabel: '05 / 明示している制約',
    promptsLabel: '06 / 面接で深掘りする質問',
    probeTitle: '公開チェック状況',
    probeInitial: '最初の確認を待っています',
    checking: '確認中',
    online: '正常',
    degraded: '一部障害',
    unavailable: '利用不可',
    probes: {
      live: { label: '稼働確認', path: '/demo/health/live' },
      ready: { label: '準備状態', path: '/demo/health/ready' },
      openapi: { label: 'OpenAPI 仕様書', path: '/demo/openapi.json' },
      docs: { label: 'API ドキュメント', path: '/demo/docs' },
    },
    architecture: [
      { name: 'ブラウザ／静的画面', detail: 'レビュー画面と運用コンソール', className: 'browser' },
      { name: 'Hono API', detail: '認証、ルート、OpenAPI、リクエスト ID', className: 'api' },
      { name: 'PostgreSQL', detail: 'ワークスペースのデータとインシデント記録', className: 'data' },
      { name: 'Redis + BullMQ', detail: 'アクセス制限と信頼性のあるバックグラウンド処理', className: 'data' },
      { name: 'バックグラウンド処理', detail: '処理権限、状態確認、インシデントの状態変更', className: 'worker' },
      { name: '監査／メトリクス／送信待ち', detail: '運用記録と通知状態', className: 'ops' },
    ],
    lifecycleLabel: 'インシデント処理の流れ',
    lifecycleTitle: '受け付け、キューへ登録し、解決する。',
    lifecycleIntro: 'API キーで保護されたリクエストは Hono API に入り、Redis を使うバックグラウンド処理が遅延タスクを実行します。処理結果として、インシデントの状態変更、監査履歴、利用量、通知の送信待ち状態を記録します。',
    lifecycleCode: '処理権限の管理、安定した冪等性キー、行ロック、結果をまとめて確定するトランザクション。',
    lifecycleTests: 'バックグラウンド処理の異常終了からの復旧と、処理中タスクを安全に終えるシナリオ。',
    lifecycleDocsLinkLabel: '信頼性に関する設計判断',
    footer: 'PulseBoard は、本番運用を想定した設計を確認できるバックエンド、プラットフォーム、クラウド分野のポートフォリオ作品です。',
  },
  ko: {
    claimTitle: '근거로 확인할 수 있는 기술적 판단',
    claimIntro: '주장은 설계 의도를 설명합니다. 증거란에는 코드, 테스트, 문서에서 실제로 확인할 수 있는 내용만 적고, 검증 훈련을 실제 운영 실적으로 포장하지 않습니다.',
    liveLabel: '03 / 지금 직접 확인할 수 있는 항목',
    liveTitle: '공개 상태 확인',
    liveIntro: '이 페이지에서 공개 데모 경로로 직접 요청을 보냅니다. 요청에 실패하면 일부 기능 저하 또는 연결 불가로 명확히 표시되며, 다른 설명과 링크는 계속 볼 수 있습니다.',
    promptsLabel: '06 / 면접 질문',
    probeTitle: '공개 상태 확인 결과',
    probeInitial: '첫 확인을 기다리는 중',
    degraded: '일부 기능 저하',
    unavailable: '연결할 수 없음',
    requestUnavailable: '네트워크에 연결할 수 없음',
    probes: {
      live: { label: '서비스 동작 확인', path: '/demo/health/live' },
      ready: { label: '서비스 준비 확인', path: '/demo/health/ready' },
      openapi: { label: 'OpenAPI 명세', path: '/demo/openapi.json' },
      docs: { label: 'API 문서', path: '/demo/docs' },
    },
    architectureTitle: '장식이 아니라 실제 처리 흐름',
    architectureIntro: '브라우저가 Hono API를 호출하고, 지속 데이터는 PostgreSQL에 저장됩니다. 지연 작업은 Redis와 BullMQ를 거쳐 백그라운드에서 처리되며, 운영 기록도 같은 흐름에서 남습니다.',
    architecture: [
      { name: '브라우저 / 정적 화면', detail: '검토 페이지와 운영 콘솔', className: 'browser' },
      { name: 'Hono API', detail: '인증, 경로, OpenAPI, 요청 식별자', className: 'api' },
      { name: 'PostgreSQL', detail: '고객별 작업 공간 데이터와 인시던트 기록', className: 'data' },
      { name: 'Redis + BullMQ', detail: '요청 제한과 신뢰성 있는 지연 작업', className: 'data' },
      { name: '백그라운드 처리', detail: '임시 처리 권한, 상태 확인, 인시던트 상태 변경', className: 'worker' },
      { name: '감사 기록 / 지표 / 알림 대기함', detail: '운영 근거와 알림 상태', className: 'ops' },
    ],
    lifecycleLabel: '인시던트 처리 흐름',
    lifecycleTitle: '접수, 대기열 등록, 처리 완료.',
    lifecycleIntro: 'API 키로 인증된 요청이 Hono API에 들어오면 Redis 기반 백그라운드 처리가 지연 작업을 수행하고, 인시던트 상태 변경, 감사 기록, 사용량, 알림 대기 상태를 저장합니다.',
    lifecycleCode: '데이터베이스의 임시 처리 권한, 안정적인 멱등성 키, 행 잠금, 결과를 한 번에 확정하는 트랜잭션.',
    lifecycleTests: '백그라운드 처리 중단 후 복구와 진행 중인 작업을 안전하게 마치는 상황을 테스트합니다.',
    lifecycleDocsLinkLabel: '신뢰성 설계 기록',
    footer: 'PulseBoard는 실제 운영 환경의 요구 사항을 기준으로 설계한 백엔드, 플랫폼, 클라우드 엔지니어링 포트폴리오입니다.',
  },
  es: {
    claimTitle: 'Decisiones técnicas respaldadas por pruebas',
    claimIntro: 'La afirmación describe la intención del diseño. La columna de evidencia solo señala lo que puede comprobarse en el código, las pruebas o la documentación, sin presentar un ensayo como experiencia real de producción.',
    liveLabel: '03 / Lo que puedes comprobar ahora',
    liveTitle: 'Comprobaciones públicas del propio sistema',
    liveIntro: 'Esta página realiza solicitudes directas a las rutas públicas de la demostración. Si una falla, se muestra como servicio degradado o no disponible sin bloquear el resto de la explicación ni los enlaces.',
    probeTitle: 'Resultado de las comprobaciones públicas',
    probeInitial: 'Esperando la primera comprobación',
    probes: {
      live: { label: 'Servicio activo', path: '/demo/health/live' },
      ready: { label: 'Servicio preparado', path: '/demo/health/ready' },
      openapi: { label: 'Especificación OpenAPI', path: '/demo/openapi.json' },
      docs: { label: 'Documentación de la API', path: '/demo/docs' },
    },
    architectureTitle: 'El flujo real del sistema, sin adornos',
    architectureIntro: 'El navegador llama a Hono API y los datos persistentes se guardan en PostgreSQL. Las tareas diferidas pasan por Redis y BullMQ para su procesamiento en segundo plano, mientras el sistema conserva los registros operativos.',
    architecture: [
      { name: 'Navegador / interfaz estática', detail: 'Página de revisión y consola de operaciones', className: 'browser' },
      { name: 'Hono API', detail: 'Autenticación, rutas, OpenAPI e identificadores de solicitud', className: 'api' },
      { name: 'PostgreSQL', detail: 'Datos separados por cliente y registros de incidentes', className: 'data' },
      { name: 'Redis + BullMQ', detail: 'Límites de solicitudes y tareas diferidas fiables', className: 'data' },
      { name: 'Procesamiento en segundo plano', detail: 'Asignación temporal, comprobaciones y cambios de estado', className: 'worker' },
      { name: 'Auditoría / métricas / notificaciones pendientes', detail: 'Registros operativos y estado de las notificaciones', className: 'ops' },
    ],
    lifecycleLabel: 'Flujo de tratamiento de incidentes',
    lifecycleTitle: 'Recepción, cola y resolución.',
    lifecycleIntro: 'Las solicitudes autenticadas mediante una clave de API entran en Hono API. El procesamiento en segundo plano apoyado en Redis ejecuta las tareas diferidas y registra los cambios del incidente, el historial de auditoría, el uso y las notificaciones pendientes.',
    lifecycleCode: 'Asignación temporal en la base de datos, claves de idempotencia estables, bloqueos de fila y una transacción que confirma el resultado una sola vez.',
    lifecycleTests: 'Pruebas de recuperación tras una interrupción del procesamiento y de cierre seguro de las tareas en curso.',
    lifecycleDocsLinkLabel: 'Decisión de diseño sobre fiabilidad',
    footer: 'PulseBoard es un proyecto de portafolio de backend, plataforma y nube diseñado según las exigencias de un entorno de producción.',
  },
  fr: {
    claimTitle: 'Des choix techniques étayés par des preuves',
    claimIntro: 'L’affirmation décrit l’intention de conception. La colonne des preuves ne mentionne que ce qui est vérifiable dans le code, les tests ou la documentation, sans présenter un exercice comme une expérience réelle de production.',
    liveLabel: '03 / Ce que vous pouvez vérifier maintenant',
    liveTitle: 'Contrôles publics effectués sur le système',
    liveIntro: 'Cette page interroge directement les chemins publics de la démonstration. En cas d’échec, le service est clairement indiqué comme dégradé ou indisponible, sans bloquer les autres explications ni les liens.',
    probeTitle: 'Résultat des contrôles publics',
    probeInitial: 'En attente du premier contrôle',
    probes: {
      live: { label: 'Service actif', path: '/demo/health/live' },
      ready: { label: 'Service prêt', path: '/demo/health/ready' },
      openapi: { label: 'Spécification OpenAPI', path: '/demo/openapi.json' },
      docs: { label: 'Documentation de l’API', path: '/demo/docs' },
    },
    architectureTitle: 'Le parcours réel du système, sans décoration',
    architectureIntro: 'Le navigateur appelle Hono API et les données persistantes sont conservées dans PostgreSQL. Les tâches différées passent par Redis et BullMQ pour être traitées en arrière-plan, tandis que le système enregistre les éléments utiles à l’exploitation.',
    architecture: [
      { name: 'Navigateur / interface statique', detail: 'Page de revue et console des opérations', className: 'browser' },
      { name: 'Hono API', detail: 'Authentification, routes, OpenAPI et identifiants de requête', className: 'api' },
      { name: 'PostgreSQL', detail: 'Données séparées par client et incidents', className: 'data' },
      { name: 'Redis + BullMQ', detail: 'Limitation des requêtes et tâches différées fiables', className: 'data' },
      { name: 'Traitement en arrière-plan', detail: 'Attribution temporaire, contrôles et changements d’état', className: 'worker' },
      { name: 'Audit / indicateurs / notifications en attente', detail: 'Traces d’exploitation et état des notifications', className: 'ops' },
    ],
    lifecycleLabel: 'Parcours de traitement d’un incident',
    lifecycleTitle: 'Réception, mise en file et résolution.',
    lifecycleIntro: 'Les requêtes authentifiées par clé API entrent dans Hono API. Le traitement en arrière-plan appuyé sur Redis exécute les tâches différées et enregistre les changements de l’incident, l’historique d’audit, l’utilisation et les notifications en attente.',
    lifecycleCode: 'Attribution temporaire en base de données, clés d’idempotence stables, verrouillage des lignes et transaction qui confirme le résultat une seule fois.',
    lifecycleTests: 'Tests de reprise après une interruption du traitement et d’arrêt propre des tâches en cours.',
    lifecycleDocsLinkLabel: 'Décision de conception sur la fiabilité',
    footer: 'PulseBoard est un projet de portfolio backend, plateforme et cloud conçu selon les exigences d’un environnement de production.',
  },
  de: {
    claimTitle: 'Technische Entscheidungen mit überprüfbaren Belegen',
    claimIntro: 'Die Aussage beschreibt die Entwurfsabsicht. In der Belegspalte steht nur, was sich in Code, Tests oder Dokumentation tatsächlich prüfen lässt. Eine Verifikationsübung wird nicht als echter Produktivbetrieb dargestellt.',
    liveLabel: '03 / Was Sie jetzt selbst prüfen können',
    liveTitle: 'Öffentliche Statusprüfungen des Systems',
    liveIntro: 'Diese Seite sendet direkte Anfragen an die öffentlichen Demo-Pfade. Schlägt eine Anfrage fehl, wird der Dienst klar als eingeschränkt oder nicht erreichbar angezeigt, ohne die übrigen Erklärungen und Links zu blockieren.',
    probeTitle: 'Ergebnis der öffentlichen Statusprüfungen',
    probeInitial: 'Warten auf die erste Prüfung',
    checking: 'wird geprüft',
    online: 'erreichbar',
    degraded: 'eingeschränkt',
    unavailable: 'nicht erreichbar',
    probes: {
      live: { label: 'Dienst läuft', path: '/demo/health/live' },
      ready: { label: 'Dienst ist bereit', path: '/demo/health/ready' },
      openapi: { label: 'OpenAPI-Spezifikation', path: '/demo/openapi.json' },
      docs: { label: 'API-Dokumentation', path: '/demo/docs' },
    },
    architectureTitle: 'Der tatsächliche Systemablauf, ohne Ziergrafik',
    architectureIntro: 'Der Browser ruft Hono API auf, dauerhafte Daten liegen in PostgreSQL. Verzögerte Aufgaben werden über Redis und BullMQ im Hintergrund verarbeitet; zugleich entstehen die für den Betrieb nötigen Aufzeichnungen.',
    architecture: [
      { name: 'Browser / statische Oberfläche', detail: 'Prüfseite und Betriebskonsole', className: 'browser' },
      { name: 'Hono API', detail: 'Authentifizierung, Routen, OpenAPI und Anfragekennungen', className: 'api' },
      { name: 'PostgreSQL', detail: 'Getrennte Kundendaten und Vorfallaufzeichnungen', className: 'data' },
      { name: 'Redis + BullMQ', detail: 'Anfragelimits und zuverlässige verzögerte Aufgaben', className: 'data' },
      { name: 'Hintergrundverarbeitung', detail: 'Zeitlich begrenzte Zuordnung, Prüfungen und Statusänderungen', className: 'worker' },
      { name: 'Audit / Kennzahlen / ausstehende Nachrichten', detail: 'Betriebsnachweise und Benachrichtigungsstatus', className: 'ops' },
    ],
    lifecycleLabel: 'Ablauf der Vorfallbearbeitung',
    lifecycleTitle: 'Annahme, Warteschlange und Abschluss.',
    lifecycleIntro: 'Mit einem API-Schlüssel authentifizierte Anfragen gelangen in Hono API. Die Redis-gestützte Hintergrundverarbeitung führt verzögerte Aufgaben aus und speichert Statusänderungen, Auditverlauf, Nutzung und ausstehende Benachrichtigungen.',
    lifecycleCode: 'Zeitlich begrenzte Verarbeitungszuordnung in der Datenbank, stabile Idempotenzschlüssel, Zeilensperren und eine Transaktion, die das Ergebnis genau einmal bestätigt.',
    lifecycleTests: 'Tests für die Wiederaufnahme nach einer Unterbrechung und für das sichere Beenden laufender Aufgaben.',
    lifecycleDocsLinkLabel: 'Entwurfsentscheidung zur Zuverlässigkeit',
    footer: 'PulseBoard ist ein Portfolio-Projekt für Backend, Plattform und Cloud, das nach den Anforderungen eines Produktivsystems gestaltet wurde.',
  },
  'pt-BR': {
    claimTitle: 'Decisões técnicas apoiadas por evidências',
    claimIntro: 'A afirmação descreve a intenção do projeto. A coluna de evidências mostra apenas o que pode ser verificado no código, nos testes ou na documentação, sem apresentar um ensaio como experiência real de produção.',
    liveLabel: '03 / O que você pode verificar agora',
    liveTitle: 'Verificações públicas do próprio sistema',
    liveIntro: 'Esta página faz solicitações diretas às rotas públicas da demonstração. Se uma delas falhar, o serviço aparece claramente como degradado ou indisponível, sem bloquear as demais explicações e links.',
    probeTitle: 'Resultado das verificações públicas',
    probeInitial: 'Aguardando a primeira verificação',
    checking: 'verificando',
    online: 'disponível',
    degraded: 'degradado',
    unavailable: 'indisponível',
    probes: {
      live: { label: 'Serviço ativo', path: '/demo/health/live' },
      ready: { label: 'Serviço pronto', path: '/demo/health/ready' },
      openapi: { label: 'Especificação OpenAPI', path: '/demo/openapi.json' },
      docs: { label: 'Documentação da API', path: '/demo/docs' },
    },
    architectureTitle: 'O fluxo real do sistema, sem enfeites',
    architectureIntro: 'O navegador chama a Hono API e os dados persistentes ficam no PostgreSQL. As tarefas adiadas passam por Redis e BullMQ para processamento em segundo plano, enquanto o sistema registra as informações necessárias para operação.',
    architecture: [
      { name: 'Navegador / interface estática', detail: 'Página de revisão e console de operações', className: 'browser' },
      { name: 'Hono API', detail: 'Autenticação, rotas, OpenAPI e identificadores de solicitação', className: 'api' },
      { name: 'PostgreSQL', detail: 'Dados separados por cliente e registros de incidentes', className: 'data' },
      { name: 'Redis + BullMQ', detail: 'Limites de solicitações e tarefas adiadas confiáveis', className: 'data' },
      { name: 'Processamento em segundo plano', detail: 'Reserva temporária, verificações e mudanças de estado', className: 'worker' },
      { name: 'Auditoria / métricas / notificações pendentes', detail: 'Registros operacionais e estado das notificações', className: 'ops' },
    ],
    lifecycleLabel: 'Fluxo de tratamento de incidentes',
    lifecycleTitle: 'Recebimento, fila e resolução.',
    lifecycleIntro: 'Solicitações autenticadas por chave de API entram na Hono API. O processamento em segundo plano apoiado pelo Redis executa tarefas adiadas e registra mudanças no incidente, histórico de auditoria, uso e notificações pendentes.',
    lifecycleCode: 'Reserva temporária do processamento no banco de dados, chaves de idempotência estáveis, bloqueios de linha e uma transação que confirma o resultado uma única vez.',
    lifecycleTests: 'Testes de recuperação após uma interrupção do processamento e de encerramento seguro das tarefas em andamento.',
    lifecycleDocsLinkLabel: 'Decisão de projeto sobre confiabilidade',
    footer: 'PulseBoard é um projeto de portfólio de backend, plataforma e nuvem projetado segundo as exigências de um ambiente de produção.',
  },
  ar: {
    claimTitle: 'قرارات هندسية تدعمها أدلة قابلة للتحقق',
    claimIntro: 'يشرح الادعاء الهدف من التصميم، بينما يعرض عمود الأدلة ما يمكن التحقق منه فعلاً في الشفرة أو الاختبارات أو الوثائق. ولا تُقدَّم تمارين التحقق على أنها خبرة تشغيل حقيقية في بيئة الإنتاج.',
    liveLabel: '03 / ما يمكنك التحقق منه الآن',
    liveTitle: 'فحوصات عامة للنظام نفسه',
    liveIntro: 'ترسل هذه الصفحة طلبات مباشرة إلى المسارات العامة للنسخة التجريبية. وإذا فشل أحدها تظهر الخدمة بوضوح في حالة أداء محدود أو تعذر اتصال، من دون حجب بقية الشرح والروابط.',
    probeTitle: 'نتيجة الفحوصات العامة',
    probeInitial: 'في انتظار أول فحص',
    checking: 'جارٍ الفحص',
    online: 'متاحة',
    degraded: 'أداء محدود',
    unavailable: 'يتعذر الوصول',
    requestPending: 'الطلب قيد الانتظار',
    requestUnavailable: 'يتعذر الاتصال بالشبكة',
    probes: {
      live: { label: 'الخدمة تعمل', path: '/demo/health/live' },
      ready: { label: 'الخدمة جاهزة', path: '/demo/health/ready' },
      openapi: { label: 'مواصفات OpenAPI', path: '/demo/openapi.json' },
      docs: { label: 'توثيق API', path: '/demo/docs' },
    },
    architectureTitle: 'مسار العمل الفعلي للنظام بلا رسم زخرفي',
    architectureIntro: 'يستدعي المتصفح Hono API وتُحفظ البيانات الدائمة في PostgreSQL. تمر المهام المؤجلة عبر Redis وBullMQ لمعالجتها في الخلفية، ويسجل النظام في الوقت نفسه المعلومات اللازمة للتشغيل.',
    architecture: [
      { name: 'المتصفح / واجهة ثابتة', detail: 'صفحة المراجعة ووحدة العمليات', className: 'browser' },
      { name: 'Hono API', detail: 'المصادقة والمسارات وOpenAPI ومعرّفات الطلبات', className: 'api' },
      { name: 'PostgreSQL', detail: 'بيانات منفصلة لكل عميل وسجلات الحوادث', className: 'data' },
      { name: 'Redis + BullMQ', detail: 'تحديد معدل الطلبات والمهام المؤجلة الموثوقة', className: 'data' },
      { name: 'المعالجة في الخلفية', detail: 'صلاحية مؤقتة للمعالجة والفحوصات وتغييرات الحالة', className: 'worker' },
      { name: 'التدقيق / المؤشرات / الإشعارات المنتظرة', detail: 'السجلات التشغيلية وحالة الإشعارات', className: 'ops' },
    ],
    lifecycleLabel: 'مسار معالجة الحادث',
    lifecycleTitle: 'استلام، ثم قائمة انتظار، ثم حل.',
    lifecycleIntro: 'تدخل الطلبات التي تمت مصادقتها بمفتاح API إلى Hono API. تنفذ المعالجة في الخلفية والمدعومة بـ Redis المهام المؤجلة، ثم تسجل تغييرات الحادث وسجل التدقيق والاستخدام والإشعارات المنتظرة.',
    lifecycleCode: 'صلاحية مؤقتة للمعالجة في قاعدة البيانات، ومفاتيح ثابتة لمنع التكرار، وقفل للصفوف، ومعاملة واحدة تعتمد النتيجة مرة واحدة.',
    lifecycleTests: 'اختبارات لاستعادة العمل بعد انقطاع المعالجة وإنهاء المهام الجارية بأمان.',
    lifecycleDocsLinkLabel: 'قرار تصميم الموثوقية',
    footer: 'PulseBoard مشروع أعمال في هندسة الأنظمة الخلفية والمنصات والسحابة، صُمم وفق متطلبات بيئة الإنتاج.',
  },
};

function buildCopy(locale: Locale): ReviewCopy {
  if (locale === 'en') return reviewEn;
  const site = getCopy(locale);
  const localeCopy = translated[locale] ?? {};
  return {
    ...reviewEn,
    languageName: site.languageName,
    navLive: site.navHealth,
    navCustomer: site.frontendLabel,
    navDocs: site.navDocs,
    navOpenApi: site.navOpenApi,
    eyebrow: site.eyebrow,
    title: `${site.titleA} ${site.titleB}`,
    lead: site.lead,
    ctaLive: site.secondaryCta,
    ctaCustomer: site.frontendHomeCta,
    ctaDocs: site.primaryCta,
    ctaOpenApi: site.navOpenApi,
    ctaProbe: site.secondaryCta,
    audiencePoints: [
      { title: site.featureRealtime, detail: site.featureRealtimeCopy },
      { title: site.featureOperator, detail: site.featureOperatorCopy },
      { title: site.featureI18n, detail: site.featureI18nCopy },
    ],
    probes: {
      live: { label: site.liveEndpoint, path: '/demo/health/live' },
      ready: { label: site.readyEndpoint, path: '/demo/health/ready' },
      openapi: { label: site.openapiEndpoint, path: '/demo/openapi.json' },
      docs: { label: site.docsEndpoint, path: '/demo/docs' },
    },
    architecture: [
      { name: site.nodeFrontend, detail: site.frontendCopy, className: 'browser' },
      { name: site.nodeApi, detail: site.backendCopy, className: 'api' },
      { name: site.nodeDb, detail: site.mapCopy, className: 'data' },
      { name: site.nodeRedis, detail: site.featureRealtimeCopy, className: 'data' },
      { name: site.nodeWorker, detail: site.timelineTwoCopy, className: 'worker' },
      { name: site.featureOperator, detail: site.featureOperatorCopy, className: 'ops' },
    ],
    lifecycleLabel: site.timelineTitle,
    lifecycleTitle: `${site.timelineOne} · ${site.timelineTwo} · ${site.timelineThree}`,
    lifecycleIntro: site.timelineCopy,
    lifecycleCode: site.timelineOneCopy,
    lifecycleTests: site.timelineTwoCopy,
    lifecycleDocsLinkLabel: site.timelineTitle,
    footer: site.footer,
    ...localeCopy,
    ...reviewUi[locale],
    ...reviewStaticTranslations[locale],
    ...evidenceTranslations[locale],
    ...reviewLocalizationPolish[locale],
  };
}

let currentLocale = readLocale();
const probeStates: Record<ProbeKey, { state: ProbeState; detail: string }> = {
  live: { state: 'checking', detail: '' },
  ready: { state: 'checking', detail: '' },
  openapi: { state: 'checking', detail: '' },
  docs: { state: 'checking', detail: '' },
};
let lastProbeAt = '';
let probeInFlight = false;

function readLocale(): Locale {
  const requested = new URLSearchParams(window.location.search).get('lang') as Locale | null;
  if (requested && localeOrder.includes(requested)) return requested;
  const stored = window.localStorage.getItem('pulseboard-locale') as Locale | null;
  if (stored && localeOrder.includes(stored)) return stored;
  return 'en';
}

function copy() { return buildCopy(currentLocale); }

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function stateLabel(state: ProbeState) { return copy()[state]; }
function stateClass(state: ProbeState) { return state === 'online' ? 'good' : state === 'checking' ? 'warn' : 'bad'; }

function localizedPath(href: string) {
  if (href.startsWith('/')) return href;
  return `/zh-hant/projects/pulseboard/${href}/`;
}

function renderLanguageOptions() {
  return localeOrder.map((locale) => `<option value="${locale}" ${locale === currentLocale ? 'selected' : ''}>${escapeHtml(buildCopy(locale).languageName)}</option>`).join('');
}

function renderAudience() {
  return copy().audiencePoints.map((point) => `<article class="review-audience-point">
    <h3>${escapeHtml(point.title)}</h3>
    <p>${escapeHtml(point.detail)}</p>
  </article>`).join('');
}

function renderProbeRow(key: ProbeKey, compact = false) {
  const config = copy().probes[key];
  const result = probeStates[key];
  return `<div class="${compact ? 'review-live-item' : 'review-probe-row'}">
    <div><strong>${escapeHtml(config.label)}</strong><code>${config.path}</code></div>
    <div class="review-status ${stateClass(result.state)}"><strong>${escapeHtml(stateLabel(result.state))}</strong><span>${escapeHtml(result.detail || copy().requestPending)}</span></div>
  </div>`;
}

function renderGuide() {
  return copy().guideSteps.map((step, index) => `<article class="review-route">
    <span class="review-route-index">0${index + 1}</span><h3>${escapeHtml(step.title)}</h3>
    <p>${escapeHtml(step.detail)}</p>
    <span class="review-proof-links">${step.links.map((link) => `<a class="review-inline-link" href="${link.href}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} <span aria-hidden="true">↗</span></a>`).join('')}</span>
  </article>`).join('');
}

function renderClaims() {
  return copy().claims.map((claim) => `<article class="review-claim">
    <h3 class="review-claim-title">${escapeHtml(claim.title)}</h3>
    <div><p class="review-claim-evidence">${escapeHtml(claim.evidence)}</p><div class="review-evidence-tags">${claim.tags.map((tag) => `<span class="review-evidence-tag">${escapeHtml(tag)}</span>`).join('')}</div><div class="review-proof-links">${claim.links.map((link) => `<a class="review-inline-link" href="${localizedPath(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div></div>
  </article>`).join('');
}

function renderArchitecture() {
  return copy().architecture.map((node, index) => `${index ? '<span class="review-architecture-arrow" aria-hidden="true">→</span>' : ''}<div class="review-architecture-node ${node.className}"><strong>${escapeHtml(node.name)}</strong><span>${escapeHtml(node.detail)}</span></div>`).join('');
}

function renderBoundaries() {
  return copy().boundaries.map((item) => `<li><strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.detail)}</li>`).join('');
}

function renderPrompts() {
  return copy().prompts.map((prompt) => `<article class="review-prompt"><a href="${prompt.href}" target="_blank" rel="noreferrer"><strong>${escapeHtml(prompt.question)}</strong><span aria-hidden="true">↗</span></a></article>`).join('');
}

function render() {
  const c = copy();
  document.documentElement.lang = currentLocale;
  document.documentElement.dir = currentLocale === 'ar' ? 'rtl' : 'ltr';
  document.title = `PulseBoard - ${c.title}`;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', c.lead);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', `PulseBoard - ${c.title}`);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', c.lead);
  const app = document.querySelector<HTMLDivElement>('#review-app');
  if (!app) return;
  app.innerHTML = `<main class="review-shell">
    <header class="review-topbar" aria-label="${escapeHtml(c.navLabel)}">
      <a class="review-brand" href="/demo/review/" aria-label="${escapeHtml(c.brandAriaLabel)}"><span class="review-mark" aria-hidden="true">PB</span><span class="review-brand-copy"><strong>PulseBoard</strong><small>${escapeHtml(c.eyebrow)}</small></span></a>
      <nav class="review-nav"><a class="review-nav-link" href="/demo/">${escapeHtml(c.navLive)}</a><a class="review-nav-link" href="/demo/frontend/">${escapeHtml(c.navCustomer)}</a><a class="review-nav-link" href="/demo/docs" target="_blank" rel="noreferrer">${escapeHtml(c.navDocs)}</a><a class="review-nav-link" href="/demo/openapi.json" target="_blank" rel="noreferrer">${escapeHtml(c.navOpenApi)}</a><label class="visually-hidden" for="review-language">${escapeHtml(c.languageLabel)}</label><select id="review-language" class="review-language" aria-label="${escapeHtml(c.languageLabel)}">${renderLanguageOptions()}</select></nav>
    </header>

    <section class="review-hero" aria-labelledby="review-title">
      <div class="review-hero-copy"><span class="review-kicker">${escapeHtml(c.eyebrow)}</span><h1 id="review-title">${escapeHtml(c.title)}</h1><p class="review-hero-lead">${escapeHtml(c.lead)}</p><div class="review-actions"><a class="review-button" href="#overview">${escapeHtml(c.ctaOverview)}</a><a class="review-button-secondary" href="/demo/frontend/">${escapeHtml(c.ctaCustomer)}</a><a class="review-button-quiet" href="/demo/">${escapeHtml(c.ctaLive)}</a><a class="review-button-quiet" href="/demo/docs" target="_blank" rel="noreferrer">${escapeHtml(c.ctaDocs)}</a><a class="review-button-quiet" href="/demo/openapi.json" target="_blank" rel="noreferrer">${escapeHtml(c.ctaOpenApi)}</a><button class="review-button-quiet" type="button" data-action="probe">${escapeHtml(c.ctaProbe)}</button></div><p class="review-microcopy review-hero-note">${escapeHtml(c.reviewTime)}</p></div>
      <aside class="review-probe-panel" aria-label="${escapeHtml(c.probeTitle)}"><div class="review-probe-head"><strong>${escapeHtml(c.probeTitle)}</strong><code>/demo/*</code></div><div class="review-probes">${renderProbeRow('live')}${renderProbeRow('ready')}${renderProbeRow('openapi')}${renderProbeRow('docs')}</div><div class="review-probe-foot"><span>${escapeHtml(lastProbeAt ? `${c.probeUpdated}: ${lastProbeAt}` : c.probeInitial)}</span><button type="button" data-action="probe">${escapeHtml(c.ctaProbe)} ↗</button></div></aside>
    </section>

    <section class="review-audience" id="overview" aria-labelledby="overview-title"><div class="review-audience-head"><div><span class="review-label">${escapeHtml(c.audienceLabel)}</span><h2 id="overview-title">${escapeHtml(c.audienceTitle)}</h2></div><p>${escapeHtml(c.audienceIntro)}</p></div><div class="review-audience-grid">${renderAudience()}</div><p class="review-audience-note">${escapeHtml(c.audienceNote)}</p></section>

    <section class="review-section" id="guide" aria-labelledby="guide-title"><div class="review-section-head"><div><span class="review-label">${escapeHtml(c.guideLabel)}</span><h2 id="guide-title">${escapeHtml(c.guideTitle)}</h2></div><p class="review-section-intro">${escapeHtml(c.guideIntro)}</p></div><div class="review-route-grid">${renderGuide()}</div></section>
    <section class="review-section" id="claims" aria-labelledby="claims-title"><div class="review-section-head"><div><span class="review-label">${escapeHtml(c.claimLabel)}</span><h2 id="claims-title">${escapeHtml(c.claimTitle)}</h2></div><p class="review-section-intro">${escapeHtml(c.claimIntro)}</p></div><div class="review-claim-list">${renderClaims()}</div></section>
    <section class="review-section" id="live" aria-labelledby="live-title"><div class="review-section-head"><div><span class="review-label">${escapeHtml(c.liveLabel)}</span><h2 id="live-title">${escapeHtml(c.liveTitle)}</h2></div><p class="review-section-intro">${escapeHtml(c.liveIntro)}</p></div><div class="review-live-grid"><div class="review-live-summary"><span class="review-label">${escapeHtml(c.probeTitle)}</span><h3>${escapeHtml(c.ctaProbe)}</h3><p>${escapeHtml(c.liveIntro)}</p><p class="review-live-time">${escapeHtml(lastProbeAt ? `${c.probeUpdated}: ${lastProbeAt}` : c.probeInitial)}</p></div><div class="review-live-list">${renderProbeRow('live', true)}${renderProbeRow('ready', true)}${renderProbeRow('openapi', true)}${renderProbeRow('docs', true)}</div></div></section>
    <section class="review-section" id="architecture" aria-labelledby="architecture-title"><div class="review-section-head"><div><span class="review-label">${escapeHtml(c.architectureLabel)}</span><h2 id="architecture-title">${escapeHtml(c.architectureTitle)}</h2></div><p class="review-section-intro">${escapeHtml(c.architectureIntro)}</p></div><div class="review-architecture">${renderArchitecture()}</div></section>
    <section class="review-lower-grid" id="lifecycle"><article class="review-evidence-card"><span class="review-label">${escapeHtml(c.lifecycleLabel)}</span><h2>${escapeHtml(c.lifecycleTitle)}</h2><p>${escapeHtml(c.lifecycleIntro)}</p><ul class="review-evidence-list"><li><strong>${escapeHtml(c.lifecycleCodeLabel)}</strong><span>${escapeHtml(c.lifecycleCode)}</span></li><li><strong>${escapeHtml(c.lifecycleTestsLabel)}</strong><span>${escapeHtml(c.lifecycleTests)}</span></li><li><strong>${escapeHtml(c.lifecycleDocsLabel)}</strong><span><a class="review-inline-link" href="/zh-hant/projects/pulseboard/reliability-adr/" target="_blank" rel="noreferrer">${escapeHtml(c.lifecycleDocsLinkLabel)} <span aria-hidden="true">↗</span></a></span></li></ul></article><article class="review-boundary-panel" id="boundaries"><span class="review-label">${escapeHtml(c.boundariesLabel)}</span><h2>${escapeHtml(c.boundariesTitle)}</h2><p>${escapeHtml(c.boundariesIntro)}</p><ul class="review-boundary-list">${renderBoundaries()}</ul></article></section>
    <section class="review-section" id="prompts" aria-labelledby="prompts-title"><div class="review-section-head"><div><span class="review-label">${escapeHtml(c.promptsLabel)}</span><h2 id="prompts-title">${escapeHtml(c.promptsTitle)}</h2></div><p class="review-section-intro">${escapeHtml(c.promptsIntro)}</p></div><div class="review-prompts">${renderPrompts()}</div></section>
    <footer class="review-footer"><span>${escapeHtml(c.footer)}</span><span class="review-footer-links"><a href="/demo/">${escapeHtml(c.navLive)}</a><a href="/demo/docs" target="_blank" rel="noreferrer">${escapeHtml(c.navDocs)}</a><a href="/demo/openapi.json" target="_blank" rel="noreferrer">${escapeHtml(c.navOpenApi)}</a></span></footer>
  </main>`;

  app.querySelector<HTMLSelectElement>('#review-language')?.addEventListener('change', (event) => {
    const next = (event.currentTarget as HTMLSelectElement).value as Locale;
    if (!localeOrder.includes(next)) return;
    currentLocale = next;
    window.localStorage.setItem('pulseboard-locale', next);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState({}, '', url);
    render();
  });
  app.querySelectorAll<HTMLButtonElement>('[data-action="probe"]').forEach((button) => button.addEventListener('click', () => { void probePublicSurface(); }));
}

async function fetchProbe(key: ProbeKey) {
  const started = performance.now();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(copy().probes[key].path, { cache: 'no-store', signal: controller.signal });
    const duration = Math.round(performance.now() - started);
    return { state: response.ok ? 'online' as const : 'degraded' as const, detail: `${copy().httpStatus} ${response.status} · ${duration} ms` };
  } catch {
    return { state: 'unavailable' as const, detail: copy().requestUnavailable };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function probePublicSurface() {
  if (probeInFlight) return;
  probeInFlight = true;
  (Object.keys(probeStates) as ProbeKey[]).forEach((key) => { probeStates[key] = { state: 'checking', detail: '' }; });
  render();
  const keys: ProbeKey[] = ['live', 'ready', 'openapi', 'docs'];
  const results = await Promise.all(keys.map(async (key) => [key, await fetchProbe(key)] as const));
  results.forEach(([key, result]) => { probeStates[key] = result; });
  lastProbeAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  probeInFlight = false;
  render();
}

render();
void probePublicSurface();
