import { Controller, Get, Query } from '@nestjs/common';
import { VKAuthService } from '../service/vk-auth.service';

@Controller('vk-auth')
export class VKAuthController {
  constructor(private readonly vkAuthService: VKAuthService) {}

  @Get('login')
  getAuthUrl() {
    return { url: this.vkAuthService.getAuthUrl() };
  }

  @Get()
  async handleCallback(@Query('code') code: string) {
    try {
      if (!code) {
        return {
          success: false,
          message: 'Отсутствует токен авторизации',
        };
      }

      const user = await this.vkAuthService.handleCallback(code);

      return {
        success: true,
        message:
          'Авторизация успешна. Теперь вы можете вернуться в Telegram и продолжить работу с ботом.',
        userId: user.id,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
