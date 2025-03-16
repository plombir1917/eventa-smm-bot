import {
  Ctx,
  Hears,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Message as MessageType } from 'telegraf/typings/core/types/typegram'; // Импортируем тип Message
import { actionButtons } from './bot.buttons';
import { Context } from '../interface/context.interface';
import { TelegramService } from '../service/telegram.service';
import { VKService } from '../service/vk.service';

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly TelegramService: TelegramService,
    private readonly VKService: VKService,
  ) {}

  @Start()
  async startBot(ctx: Context) {
    await ctx.reply(
      'Привет, бро! Выбирай соцсеть, куда хочешь сделать новый пост.',
      actionButtons(),
    );
  }

  @Hears('ВК')
  async initVKPost(ctx: Context) {
    ctx.session.type = 'VK';
    await ctx.reply(
      'Выкладываем пост ВК, окей. А теперь пришли мне контент, который нужно выложить.',
    );
  }

  @Hears('ТГ')
  async initTGPost(ctx: Context) {
    ctx.session.type = 'TG';
    await ctx.reply(
      'Выкладываем пост ТГ, окей. А теперь пришли мне контент, который нужно выложить.',
    );
  }

  @On('text')
  async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    switch (ctx.session.type) {
      case 'VK':
        ctx.reply(await this.VKService.publishPost(message));
        break;
      case 'TG':
        ctx.reply(await this.TelegramService.publishPost(message));
        break;
      default:
        return;
    }
  }

  @On('photo')
  async getPhoto(@Ctx() ctx: Context) {
    if (ctx.session.type !== 'VK') {
      return;
    }

    // Указываем тип сообщения
    const message = ctx.message as MessageType.PhotoMessage;

    // Получаем файл фотографии
    const photo = message.photo[message.photo.length - 1]; // Берем самое большое изображение
    const fileId = photo.file_id;

    // Получаем ссылку на файл
    const fileLink = await ctx.telegram.getFileLink(fileId);
    console.log(fileLink);
    // Отправляем файл в канал
    try {
      const result = await this.VKService.publishPost(
        message.caption,
        fileLink.href,
      );
      await ctx.reply('Фотография успешно отправлена в канал!');
      console.log(result);
    } catch (error) {
      await ctx.reply('Ошибка при отправке фотографии: ' + error.message);
      console.error(error);
    }
  }
}
