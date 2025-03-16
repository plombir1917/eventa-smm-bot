import { Controller, Get } from '@nestjs/common';

@Controller()
export class TelegramController {
  @Get()
  async base() {
    return 'Alive!';
  }
}
