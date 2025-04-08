import { Injectable } from '@nestjs/common';
import { VKAuthService } from './vk-auth.service';

@Injectable()
export class VKService {
  constructor(private readonly vkAuthService: VKAuthService) {}

  private async getUploadServer(userId: number) {
    const userToken = this.vkAuthService.getUserToken(userId);
    if (!userToken) {
      throw new Error(
        'Токен пользователя ВК не найден или истек. Пожалуйста, авторизуйтесь снова.',
      );
    }

    const response = await fetch(
      `${process.env.VK_API_URL}photos.getUploadServer?` +
        new URLSearchParams({
          access_token: userToken,
          v: process.env.VK_API_VERSION,
        }).toString(),
    );

    const data = await response.json();
    if (data.error) {
      throw new Error(`Ошибка получения сервера: ${data.error.error_msg}`);
    }

    return data.response.upload_url;
  }

  private async uploadPhoto(uploadUrl: string, photoUrl: string) {
    try {
      // Скачиваем фото
      const photoResponse = await fetch(photoUrl);
      if (!photoResponse.ok) {
        throw new Error('Не удалось скачать фото');
      }
      const buffer = await photoResponse.arrayBuffer();

      // Создаем FormData
      const formData = new FormData();
      formData.append(
        'photo',
        new Blob([buffer], { type: 'image/jpeg' }),
        'photo.jpg',
      );

      // Загружаем на сервер ВК
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Ошибка загрузки: ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.photo) {
        throw new Error(
          'Ошибка загрузки фото на сервер ВК: нет данных о фото в ответе',
        );
      }

      return uploadResult;
    } catch (error) {
      throw error;
    }
  }

  private async savePhoto(userId: number, uploadResponse: any) {
    try {
      const userToken = this.vkAuthService.getUserToken(userId);
      if (!userToken) {
        throw new Error('Токен пользователя ВК не найден или истек');
      }

      const response = await fetch(
        `${process.env.VK_API_URL}photos.save?` +
          new URLSearchParams({
            album_id: '-1',
            server: String(uploadResponse.server),
            photos_list: uploadResponse.photos_list,
            hash: uploadResponse.hash,
            access_token: userToken,
            v: process.env.VK_API_VERSION,
          }).toString(),
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(`Ошибка сохранения фото: ${data.error.error_msg}`);
      }

      if (!data.response?.[0]) {
        throw new Error('Нет данных о сохраненном фото в ответе');
      }

      return data.response[0];
    } catch (error) {
      throw error;
    }
  }

  async publishPost(userId: number, text: string, photoUrl?: string) {
    try {
      let attachments = '';

      if (photoUrl) {
        // Получаем URL для загрузки
        const uploadUrl = await this.getUploadServer(userId);

        // Загружаем фото
        const uploadResponse = await this.uploadPhoto(uploadUrl, photoUrl);

        // Сохраняем фото
        const savedPhoto = await this.savePhoto(userId, uploadResponse);

        attachments = `photo${savedPhoto.owner_id}_${savedPhoto.id}`;
      }

      const userToken = this.vkAuthService.getUserToken(userId);
      if (!userToken) {
        throw new Error('Токен пользователя ВК не найден или истек');
      }

      // Публикуем пост используя токен пользователя
      const response = await fetch(
        `${process.env.VK_API_URL}wall.post?` +
          new URLSearchParams({
            owner_id: `-${process.env.VK_GROUP_ID}`,
            from_group: '1',
            message: text || '',
            attachments: attachments,
            access_token: userToken,
            v: process.env.VK_API_VERSION,
          }).toString(),
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(`Ошибка публикации: ${data.error.error_msg}`);
      }

      return '✅ Успешно опубликовано!';
    } catch (error) {
      throw new Error(`Ошибка при отправке сообщения: ${error.message}`);
    }
  }
}
