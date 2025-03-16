import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramService {
  async publishPost(message: string) {
    try {
      const response = await fetch(
        process.env.TG_API_URL + process.env.TG_TOKEN + '/sendMessage',
        {
          method: 'POST',
          body: new URLSearchParams({
            chat_id: process.env.TG_CHAT_ID,
            text: message,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Ошибка при запросе к Telegram API: ${response.statusText}`,
        );
      } else return '✅ Успешно опубликовано!';
    } catch (error) {
      throw new Error(`Ошибка при отправке сообщения: ${error.message}`);
    }
  }
}
