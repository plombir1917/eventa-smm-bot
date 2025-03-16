import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot/bot.update';
import { TelegramController } from './app.controller';
import * as LocalSession from 'telegraf-session-local';
import { TelegramService } from './service/telegram.service';
import { VKService } from './service/vk.service';

const sessions = new LocalSession();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: process.env.TG_TOKEN,
    }),
  ],
  controllers: [TelegramController],
  providers: [BotUpdate, TelegramService, VKService],
})
export class AppModule {}
