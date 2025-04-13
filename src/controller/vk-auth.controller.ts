import { Body, Controller, Get, Post } from '@nestjs/common';
import { VKAuthService } from '../service/vk-auth.service';
import { TelegramService } from '../service/telegram.service';

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
}
