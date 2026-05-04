shoutyai/
│
├── src/
│   │
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── ai.config.ts
│   │   ├── social.config.ts
│   │   ├── scheduler.config.ts
│   │   └── app.config.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   ├── constants/
│   │   └── utils/
│   │
│   ├── core/
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   │
│   │   ├── logger/
│   │   ├── cache/
│   │   └── queue/
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/
│   │   │   └── strategies/
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │
│   │   ├── industries/
│   │   │   ├── industries.module.ts
│   │   │   ├── industries.controller.ts
│   │   │   ├── industries.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── content/
│   │   │   ├── content.module.ts
│   │   │   ├── content.controller.ts
│   │   │   ├── content.service.ts
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   └── helpers/
│   │   │
│   │   ├── calendar/
│   │   │   ├── calendar.module.ts
│   │   │   ├── calendar.service.ts
│   │   │   └── generators/
│   │   │
│   │   ├── ai/
│   │   │   ├── ai.module.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── llm/
│   │   │   ├── image/
│   │   │   ├── prompt-templates/
│   │   │   └── brand-voice/
│   │   │
│   │   ├── media/
│   │   │   ├── media.module.ts
│   │   │   ├── media.service.ts
│   │   │   ├── storage/
│   │   │   └── templates/
│   │   │
│   │   ├── social/
│   │   │   ├── social.module.ts
│   │   │   ├── social.service.ts
│   │   │   ├── providers/
│   │   │   │   ├── facebook.provider.ts
│   │   │   │   ├── instagram.provider.ts
│   │   │   │   ├── linkedin.provider.ts
│   │   │   │   └── twitter.provider.ts
│   │   │   └── dto/
│   │   │
│   │   ├── scheduler/
│   │   │   ├── scheduler.module.ts
│   │   │   ├── scheduler.service.ts
│   │   │   ├── jobs/
│   │   │   └── processors/
│   │   │
│   │   ├── localization/
│   │   │   ├── localization.module.ts
│   │   │   ├── localization.service.ts
│   │   │   └── events/
│   │   │
│   │   └── analytics/
│   │       ├── analytics.module.ts
│   │       ├── analytics.service.ts
│   │       └── dto/
│   │
│   └── database/
│       ├── prisma.schema
│       └── migrations/
│
├── test/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env
├── package.json
└── README.md



nest.js
