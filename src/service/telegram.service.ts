import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramService {
  async publishPost(message: string, photoFileId?: string) {
    try {
      let url = process.env.TG_API_URL + process.env.TG_TOKEN;
      let body;

      if (photoFileId) {
        // Отправка фото с подписью
        url += '/sendPhoto';
        body = new URLSearchParams({
          chat_id: process.env.TG_CHAT_ID,
          photo: photoFileId,
          caption: message || '',
        });
      } else {
        // Отправка только текста
        url += '/sendMessage';
        body = new URLSearchParams({
          chat_id: process.env.TG_CHAT_ID,
          text: message,
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        body: body,
      });

      if (!response.ok) {
        throw new Error(
          `Ошибка при запросе к Telegram API: ${response.statusText}`,
        );
      }

      return '✅ Успешно опубликовано!';
    } catch (error) {
      console.log(error);
      throw new Error(`Ошибка при отправке сообщения: ${error.message}`);
    }
  }
}
