import { Body, Controller, Get, Post } from '@nestjs/common';
import { VKAuthService } from '../service/vk-auth.service';
import { VKAuth } from '../interface/VK-auth.interface';
import { TelegramService } from '../service/telegram.service';
import { Ctx } from 'nestjs-telegraf';
import { Context } from '../interface/context.interface';

@Controller('vk-auth')
export class VKAuthController {
  constructor(
    private readonly vkAuthService: VKAuthService,
    private readonly telegramService: TelegramService,
  ) {}

  @Get('login')
  getAuthUrl() {
    return { url: this.vkAuthService.getAuthUrl() };
  }

  @Post()
  async handleTokens(@Body() VKAuthBody: VKAuth, @Ctx() ctx: Context) {
    try {
      console.log('Получены токены:', VKAuthBody);

      // Сохраняем токены в сервисе
      const user = this.vkAuthService.setTokens(VKAuthBody, ctx);

      // Проверяем валидность токена
      if (!user) {
        const authUrl = this.vkAuthService.getAuthUrl();
        await ctx.reply(
          'Токен истек или недействителен. Пожалуйста, авторизуйтесь снова:',
        );
        await ctx.reply(authUrl);
        return;
      }

      // Отправляем сообщение в Telegram о успешной авторизации
      await ctx.reply(
        `✅ Успешная авторизация!\nТеперь вы можете выкладывать посты в ВК.`,
      );
    } catch (error) {
      console.error('Ошибка при обработке токенов:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
