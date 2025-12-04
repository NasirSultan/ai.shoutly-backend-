import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  })

  const port = process.env.PORT
  if (!port) {
    console.error('PORT not found in environment variables')
    process.exit(1)
  }

  const server = await app.listen(port)
  server.setTimeout(300000)
  server.keepAliveTimeout = 300000

  console.log(`Server is running on port ${port}`)
  console.log(`Health check available at http://localhost:${port}/health`)
}

bootstrap()
