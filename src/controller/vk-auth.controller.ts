import { Body, Controller, Get, Post } from '@nestjs/common';
import { VKAuthService } from '../service/vk-auth.service';
import { VKAuth } from 'src/interface/VK-auth.interface';

@Controller('vk-auth')
export class VKAuthController {
  constructor(private readonly vkAuthService: VKAuthService) {}

  @Get('login')
  getAuthUrl() {
    return { url: this.vkAuthService.getAuthUrl() };
  }

  @Post()
  async handleTokens(@Body() VKAuthBody: VKAuth) {
    console.log(VKAuthBody);
  }
}
