import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramUpdate } from './telegram.update';
import { TelegramController } from './telagram.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelegrafModule.forRoot({ token: process.env.TOKEN }),
  ],
  controllers: [TelegramController],
  providers: [TelegramUpdate],
})
export class TelegramModule {}
