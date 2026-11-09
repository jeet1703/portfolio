export const EMAIL = 'prabhjeetdec03@gmail.com';
export const RESUME = 'https://drive.google.com/file/d/1CFZRbuN-V-Y-o7UlW8ntF9XFPLIqf1w-/view?usp=sharing';
export const LINKEDIN = 'https://www.linkedin.com/in/prabhjeetsinghhh/';
export const GITHUB = 'https://github.com/jeet1703';

export const BOOT_LINES = [
  ['POST ........................', 'OK'],
  ['JDK 21 ......................', 'OK'],
  ['Spring Boot 3 ...............', 'OK'],
  ['Kafka · RabbitMQ · Redis ....', 'OK'],
  ['Postgres · Oracle · Mongo ...', 'OK'],
  ['Docker · Kubernetes .........', 'OK'],
  ['prabhjeet.service ......', 'ONLINE'],
];

export const RAILS = [
  {
    volt: '+12V', rc: '#f5c400', org: 'Samsung Electro-Mechanics',
    role: 'Software Development Engineer Intern · Bengaluru',
    when: ['June 2025 – June 2026', '12 months'],
    meters: [
      ['45k+', 'requests / hour handled'],
      ['−34%', 'response time, 35 → 23 ms'],
      ['20×', 'faster deployments'],
      ['10k+', 'employees on Model Store'],
    ],
    points: [
      'Led the migration of 20+ microservices from Java 8 to 17 and Spring Boot 2 to 3, resolving dependency conflicts along the way.',
      'Built backend services for a Model Store platform used by 10,000+ employees: a REST API gateway with rate limiting and concurrency control, model delivery from AWS S3, and deployment on Kubernetes.',
      'Designed the Oracle data models and Spring Boot REST services for an API key management system covering key generation, request tracking, usage logging and access control.',
      'Integrated in-house systems through REST APIs and an async job queue (Kafka, RabbitMQ) with Redis caching, so request handling and processing scale separately.',
      'Debugged production with OpenTelemetry, Prometheus and Grafana, and traced failures across 25 services after the migration back to deprecated libraries.',
      'Split interdependent Jenkins and GitHub Actions pipelines across 5+ modules so each service ships on its own. Built an internal workflow tool tying together Jira and email.',
    ],
  },
  {
    volt: '+5V', rc: '#e8463a', org: 'DRDO', side: 'right',
    role: 'Web Development Intern · Defence Research & Development Organisation, Delhi',
    when: ['April 2025 – May 2025'],
    points: [
      'Turned product requirements for a government R&D proposal and grant platform into REST APIs for multi-step approval workflows, on a Node.js backend deployed to Microsoft Azure.',
      'Broke features into tasks and led a team of interns through task allocation and code reviews to deliver on tight deadlines.',
    ],
  },
  {
    volt: '+3.3V', rc: '#f2efe6', org: 'Amity University, Noida',
    role: 'B.Tech, Computer Science & Engineering · CGPA 8.92',
    when: ['Sep 2022 – June 2026'],
    points: ['Merit Scholarship for ranking in the top 3 of the course.'],
  },
];

const H = 'hot', M = 'mod';
const ROWS = [
  [['Java', H, 'Core Java & Java 8/17/21 · OOP, collections, exception handling · led a Java 8 → 17 migration of 20+ services', 'Languages', 'w2'],
   ['Go', H, 'Wrote the Chess Arena backend in Go alongside Node.js', 'Languages'],
   ['Python', '', 'End-to-end tests in Playwright for Python at Samsung', 'Languages'],
   ['TypeScript', '', 'Chess Arena frontend and Node.js services', 'Languages', 'w2'],
   ['JavaScript', '', 'Frontends and Node.js backends', 'Languages', 'w2'],
   ['C++', '', 'EquipControl: a supervisory control app in C++ / Qt', 'Languages'],
   ['SQL', H, 'Logical & physical data models in Oracle DB for an API key management system', 'Languages']],
  [['Spring Boot', H, 'Spring Boot 2 → 3 migration · REST services for API key management & Model Store', 'Backend', 'w3'],
   ['Hibernate', '', 'Hibernate / JPA for persistence and data modeling', 'Backend', 'w2'],
   ['Microservices', H, '20+ microservices migrated, traced and tuned: 35 ms → 23 ms average response', 'Backend', 'w3'],
   ['Node.js', '', 'DRDO grant-platform approval workflows · Chess Arena backend', 'Backend', 'w2'],
   ['REST', '', 'RESTful APIs with JSON across Samsung, DRDO and every project', 'Backend'],
   ['SOAP', '', 'SOAP web services exchanging XML with in-house systems', 'Backend']],
  [['Kafka', H, 'Async job queue decoupling request handling from processing at 45,000+ req/hr', 'Messaging & data'],
   ['RabbitMQ', '', 'Async job queue paired with Kafka for in-house integrations', 'Messaging & data', 'w2'],
   ['Redis', H, 'Caching layer in front of integrated in-house services', 'Messaging & data'],
   ['WebSockets', '', 'Real-time multiplayer moves, matchmaking and reconnection in Chess Arena', 'Messaging & data', 'w2'],
   ['PostgreSQL', '', 'Relational data modeling', 'Messaging & data', 'w2'],
   ['Oracle', '', "Data models for Samsung's API key management system", 'Messaging & data'],
   ['MongoDB', '', 'Document data modeling and indexes', 'Messaging & data', 'w2']],
  [['Docker', M, 'Containerized WebVizion and services shipped at Samsung', 'Ops & cloud'],
   ['Kubernetes', M, 'Model Store deployment on Kubernetes', 'Ops & cloud', 'w2'],
   ['AWS', M, 'Model delivery from S3 · AWS Cloud Practitioner Essentials (2025)', 'Ops & cloud'],
   ['Azure', M, "Deployed DRDO's Node.js backend on Microsoft Azure", 'Ops & cloud'],
   ['Jenkins', M, 'Split interdependent CI/CD pipelines so each service ships alone: 20× faster deploys', 'Ops & cloud', 'w2'],
   ['OpenTelemetry', M, 'Distributed tracing to find production bottlenecks across 25 services', 'Ops & cloud', 'w3'],
   ['Grafana', M, 'Prometheus + Grafana dashboards for production debugging', 'Ops & cloud', 'w2']],
  [['JUnit', '', 'Unit tests before every handoff', 'Testing & practice'],
   ['Playwright', '', 'End-to-end tests in Python Playwright', 'Testing & practice', 'w2'],
   ['AI-assisted dev · Claude Code · Cursor · Copilot · Git · Jira · Postman', H, 'Daily workflow: AI-assisted development, code reviews, Agile sprints, Git/GitHub, Bitbucket, Jira, Postman', 'How I work', 'space'],
   ['DSA', '', '370+ LeetCode problems solved', 'Testing & practice']],
];

export const KEY_ROWS = ROWS.length;
export const KEYS = ROWS.flatMap((r, ri) =>
  r.map(([label, kind, detail, cat, w]) => ({ label, kind: kind || '', detail, cat, w: w || '', row: ri })));

/* Each project has clips. A clip is either a live canvas preview ({scene}) or your own media:
   {title:'Demo', src:'/media/chess-demo.mp4', type:'video'}  or  {title:'Screenshot', src:'/media/webvizion.png', type:'image'} */
export const PROJECTS = [
  {
    name: 'Chess Arena', kind: 'Live real-time multiplayer chess', tech: ['Node.js', 'Go', 'WebSockets', 'React', 'TypeScript'],
    points: [
      'A live multiplayer game with server-side move validation, matchmaking and session management.',
      'The backend is written twice, once in Node.js and once in Go.',
      'Reconnects automatically after a dropped connection, validates on both client and server, and shows clear game-over states.',
    ],
    links: [['Play it live ↗', 'https://chess-prabjeet.netlify.app'], ['GitHub ↗', 'https://github.com/jeet1703/Chess']],
    media: [{ title: 'Live match', scene: 'chess' }, { title: 'Matchmaking & reconnect', scene: 'match' }],
  },
  {
    name: 'WebVizion', kind: 'Real User Monitoring backend', tech: ['Java', 'Spring Boot', 'Microservices', 'Docker', 'REST'],
    points: [
      'A microservices backend that takes in performance metrics and client-side errors from real users through REST APIs.',
      'Batching and asynchronous processing removed a performance bottleneck and cut network overhead by 80%.',
      'Every service is containerized with Docker.',
    ],
    links: [['Live dashboard ↗', 'https://webvizion.netlify.app'], ['Demo app ↗', 'https://webvizion-demo.netlify.app'], ['GitHub ↗', 'https://github.com/jeet1703/webvision']],
    media: [{ title: 'Monitoring dashboard', scene: 'rum' }, { title: 'Batching pipeline', scene: 'batch' }],
  },
  {
    name: 'EquipControl', kind: 'Supervisory control application', tech: ['C++', 'Qt', 'CMake', 'GoogleTest'],
    points: [
      'A desktop supervisory control app for equipment, built in C++ with a Qt interface.',
      'Built with CMake and tested with GoogleTest.',
      'Written with rail and industrial standards in mind (IEC 61131, IEC 61375/TCN, EN 50128), following a V-model process.',
    ],
    links: [['GitHub ↗', 'https://github.com/jeet1703/EquipControl-']],
    media: [{ title: 'Control panel', scene: 'hmi' }, { title: 'Test run', scene: 'gtest' }],
  },
];

export const POST_ROWS = [
  ['Memory test · LeetCode problems solved', '370+  OK'],
  ['Netflix Code Heist · top 100 teams nationwide', 'RUNNER-UP', true],
  ['Devlution hackathon · organized & led', '200+ PARTICIPANTS'],
  ['AWS Cloud Practitioner Essentials', '2025  OK'],
  ['Postman API Fundamentals Student Expert', '2025  OK'],
  ['B.Tech CSE · Amity University · Merit Scholarship (top 3)', 'CGPA 8.92'],
  ['Language packs · Hindi, Punjabi, English, French', 'LOADED'],
  ['Notice period', 'NONE · JOINS IMMEDIATELY', true],
];
