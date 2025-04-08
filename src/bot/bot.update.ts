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
import { Message as MessageType } from 'telegraf/typings/core/types/typegram';
import { actionButtons } from './bot.buttons';
import { Context } from '../interface/context.interface';
import { TelegramService } from '../service/telegram.service';
import { VKService } from '../service/vk.service';
import { VKAuthService } from '../service/vk-auth.service';

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly TelegramService: TelegramService,
    private readonly VKService: VKService,
    private readonly VKAuthService: VKAuthService,
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
    if (!ctx.session.vkUserId) {
      const authUrl = this.VKAuthService.getAuthUrl();
      await ctx.reply(
        'Для публикации в ВК нужно авторизоваться. Перейдите по ссылке:',
      );
      await ctx.reply(authUrl);
      return;
    }

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
    if (!ctx.session.type) {
      await ctx.reply('Сначала выберите соцсеть (ВК или ТГ)');
      return;
    }

    try {
      let result;
      switch (ctx.session.type) {
        case 'VK':
          if (!ctx.session.vkUserId) {
            await ctx.reply('Сначала авторизуйтесь в ВК');
            return;
          }
          result = await this.VKService.publishPost(ctx.session.vkUserId, message);
          break;
        case 'TG':
          result = await this.TelegramService.publishPost(message);
          break;
      }
      await ctx.reply(result);
    } catch (error) {
      await ctx.reply(`Ошибка при отправке сообщения: ${error.message}`);
    }
  }

  @On('photo')
  async getPhoto(@Ctx() ctx: Context) {
    if (!ctx.session.type) {
      await ctx.reply('Сначала выберите соцсеть (ВК или ТГ)');
      return;
    }

    // Указываем тип сообщения
    const message = ctx.message as MessageType.PhotoMessage;

    // Получаем файл фотографии
    const photo = message.photo[message.photo.length - 1]; // Берем самое большое изображение
    const fileId = photo.file_id;

    try {
      let result;

      if (ctx.session.type === 'VK') {
        if (!ctx.session.vkUserId) {
          await ctx.reply('Сначала авторизуйтесь в ВК');
          return;
        }
        // Для ВК получаем прямую ссылку на файл
        const fileLink = await ctx.telegram.getFileLink(fileId);
        result = await this.VKService.publishPost(
          ctx.session.vkUserId,
          message.caption || '',
          fileLink.href,
        );
      } else if (ctx.session.type === 'TG') {
        // Для Telegram используем file_id напрямую
        result = await this.TelegramService.publishPost(
          message.caption || '',
          fileId,
        );
      }

      await ctx.reply('Фотография успешно отправлена!');
    } catch (error) {
      await ctx.reply(`Ошибка при отправке фотографии: ${error.message}`);
    }
  }
}
