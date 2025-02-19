// @ts-nocheck
import { Context, Scenes, Telegraf, session } from 'telegraf';
import { greeting } from './text';
import { callback } from './callback';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { scences } from './scenes';

const ENVIRONMENT = process.env.NODE_ENV_1 || '';

const isDev = ENVIRONMENT !== 'production'
const isTest = ENVIRONMENT === 'test'

console.log('isTest', isTest)
const BOT_TOKEN = isTest ? process.env.BOT_TOKEN_TEST : process.env.BOT_TOKEN_DEV;

const bot = new Telegraf(BOT_TOKEN);

bot.telegram.setMyCommands([
  {
    command: '/start',
    description: 'Начало работы'
  },
  {
    command: '/calculation',
    description: 'Выполнить расчеты'
  }
])

const stage = new Scenes.Stage(scences);
bot.use(session());
bot.use(stage.middleware());

bot.command('calculation', (ctx: Context) => ctx.scene.enter('calculation_scene'));

bot.on('message', greeting());
bot.on('callback_query', callback())

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
isDev && development(bot);
