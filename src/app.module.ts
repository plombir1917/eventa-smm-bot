import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot/bot.update';
import { TelegramController } from './app.controller';
import { VKAuthController } from './controller/vk-auth.controller';
import * as LocalSession from 'telegraf-session-local';
import { TelegramService } from './service/telegram.service';
import { VKService } from './service/vk.service';
import { VKAuthService } from './service/vk-auth.service';

const sessions = new LocalSession();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: process.env.TG_TOKEN,
    }),
  ],
  controllers: [TelegramController, VKAuthController],
  providers: [BotUpdate, TelegramService, VKService, VKAuthService],
})
export class AppModule {}
