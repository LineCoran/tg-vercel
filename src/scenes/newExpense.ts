// @ts-nocheck
import { Scenes } from 'telegraf';
import axios from 'axios';
import { KEYBOARDS } from '../constants/constants';
import { moneyFormatterWithSign } from '../shared/formatters';

const replyBack = (ctx, msg) => {
  return ctx.reply(msg, { reply_markup: JSON.stringify({ inline_keyboard: KEYBOARDS.MAIN }) });
}

export const newExpense = new Scenes.WizardScene(
  'calculation_scene',
  async (ctx) => {
    replyBack(ctx, 'Цена товара в юанях:');
    ctx.wizard.state.calculation = {
      delivery: 0,
      price: 0,
      weight: 0,
    };
    return ctx.wizard.next();
  },
  async (ctx) => {
    const message = ctx.message?.text;
    const value = Number(message);
    if (isNaN(value)) {
      await ctx.deleteMessage()
      replyBack(ctx, 'Пожалуйста, введи корректное число');
      return;
    }

    if (value < 0) {
      await ctx.deleteMessage()
      replyBack(ctx, 'Цена товара не может быть отрицательной');
      return;
    }
    ctx.wizard.state.calculation.price = value;
    replyBack(ctx, 'Вес товара, кг:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const message = ctx.message.text;
    const value = Number(message);
    if (isNaN(value)) {
      await ctx.deleteMessage()
      replyBack(ctx, 'Пожалуйста, введи корректное число');
      return;
    }
    if (value < 0) {
      await ctx.deleteMessage()
      replyBack(ctx, 'Вес товара не может быть отрицательным');
      return;
    }
    ctx.wizard.state.calculation.weight = value;
    replyBack(ctx, 'Цена доставки по Китаю в юанях:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const message = ctx.message.text;
    const value = Number(message);
    if (isNaN(value)) {
      await ctx.deleteMessage()
      replyBack(ctx, 'Пожалуйста, введи корректное число');
      return;
    }

    if (value < 0) {
      await ctx.deleteMessage()
      replyBack(ctx, 'Цена доставки по Китаю в юанях не может быть отрицательной');
      return;
    }

    ctx.wizard.state.calculation.delivery = Number(value);

    // const { data } = await axios.get('https://www.nbrb.by/api/exrates/rates/431');
    const usd = 3.27
      // Number(data.Cur_OfficialRate.toFixed(2));

    const { total, productTotalPrice, deliveryPrice, chinaDeliveryBLR } = calculationResult(ctx.wizard.state.calculation, usd);

    let result = `Цена выкупа: ${moneyFormatterWithSign(productTotalPrice)}\n`;
    result += `Цена доставки: ${moneyFormatterWithSign(deliveryPrice)}\n`;
    if (chinaDeliveryBLR) result += `Цена доставки по Китаю: ${moneyFormatterWithSign(deliveryPrice)}\n`;
    result += `Курс доллара: ${moneyFormatterWithSign(usd)}\n`;
    result += `Общая стоимость товара ${moneyFormatterWithSign(total)}\n\n`
    result += 'Если вы не из Гомеля - следует учитывать стоимость европочты'

    ctx.reply(result);
    return ctx.scene.leave();
  },
);

newExpense.action('/start', async (ctx) => {
  ctx.reply('Для работы с ботом, введите команду /start');
  ctx.scene.leave()
})

const calculationResult = (data, usd) => {
  const { weight, price, delivery } = data;

  const toBLR = (value) => value * 0.6;
  const productPriceBLR = Number(toBLR(price).toFixed(2));
  const productTotalPrice = Number((productPriceBLR + ((productPriceBLR / 100) * 5)).toFixed(2));
  const deliveryPrice = Number((weight * 7.5 * usd).toFixed(2));
  const chinaDeliveryBLR = Number(toBLR(delivery).toFixed(2));

  return {
    total: Number((productTotalPrice + deliveryPrice + chinaDeliveryBLR).toFixed(2)),
    chinaDeliveryBLR,
    deliveryPrice,
    productTotalPrice,
  }
}