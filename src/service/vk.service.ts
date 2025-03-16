import { Injectable } from '@nestjs/common';

@Injectable()
export class VKService {
  async publishPost(text: string, photoUrl?: string) {
    try {
      const response = await fetch(`${process.env.VK_API_URL}wall.post`, {
        method: 'POST',
        body: new URLSearchParams({
          owner_id: `-${process.env.VK_GROUP_ID}`,
          from_group: '1',
          message: text,
          access_token: process.env.VK_TOKEN,
          v: process.env.VK_API_VERSION,
        }),
      });

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
