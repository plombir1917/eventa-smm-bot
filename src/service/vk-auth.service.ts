import { Injectable } from '@nestjs/common';
import { VKUser } from '../interface/user.interface';

@Injectable()
export class VKAuthService {
  private users: Map<number, VKUser> = new Map();

  getAuthUrl(): string {
    return 'https://eventa-smm.netlify.app/';
  }

  async handleCallback(code: string): Promise<VKUser> {
    // Проверяем валидность токена через API ВК
    const response = await fetch(
      `https://api.vk.com/method/users.get?` +
        new URLSearchParams({
          access_token: code,
          v: process.env.VK_API_VERSION,
        }).toString(),
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(`Ошибка авторизации: ${data.error.error_msg}`);
    }

    const user: VKUser = {
      id: data.response[0].id,
      access_token: code,
      expires_in: 0, // Токен бессрочный
      created_at: Date.now(),
    };

    this.users.set(user.id, user);
    return user;
  }

  getUserToken(userId: number): string | null {
    const user = this.users.get(userId);
    if (!user) return null;
    return user.access_token;
  }
}
