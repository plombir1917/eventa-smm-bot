import { Markup } from 'telegraf';

export function actionButtons() {
  return Markup.keyboard(
    [Markup.button.callback('ВК', 'VK'), Markup.button.callback('ТГ', 'TG')],
    {
      columns: 2,
    },
  );
}
