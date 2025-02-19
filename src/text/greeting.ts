import { Context } from 'telegraf';
//@ts-nocheck
import createDebug from 'debug';
import { KEYBOARDS, MAIN_ADMINS } from '../constants/constants';
import { createCategoryOptions, getStartMsg } from '../shared';
import { dbService } from '../service';
import { getAdmins, sendMessage, sendOrEditMessage } from '../helpers';

const debug = createDebug('bot:greeting_text');

/* @ts-ignore */
/* tslint:disable */

const greeting = () => async (ctx: any) => {
  try {

    const chatId = ctx.update.message.chat.id;
    const text = ctx.update.message.text;
    const session = await dbService.getUserSession(chatId);

    if (text === '/start') {
        session.is_create_order_process = false;
        session.is_set_admin_process = false;
    }

    if (session.is_set_admin_process) {
        const isValidUser = text.includes('@') && text.length > 1;

        if (!isValidUser) return sendMessage(ctx, chatId, `Отсутствует специальный символ '@' или длина меньше 2 символов! Повторите попытку`, createCategoryOptions([], { isMain: true }));
        const justName = text.replaceAll('@', '')

        try {
            const sessions = await dbService.getSessions();
            const existUser = sessions.find((session) => session.username === justName) || { chat_id: null };
            await dbService.addAdmin(justName, existUser.chat_id);
            if (existUser.chat_id) ctx.telegram.sendMessage(existUser.chat_id, 'Вас добавили в список администраторов!');
            session.is_set_admin_process = false;
            await dbService.saveUserSession(chatId, session)
            return sendMessage(ctx, chatId, `Пользователь ${text} успешно добавлен!`, createCategoryOptions([], { isMain: true }));
        } catch(error) {
            session.is_set_admin_process = false;
            await dbService.saveUserSession(chatId, session)
          // @ts-ignore
            return sendMessage(ctx, chatId, `Не удалось сохранить пользователя ${text}. Попробуйте еще раз. ${error.message}`, createCategoryOptions([], { isMain: true }));
        }
    }

    if (session.is_create_order_process) {

        if (!ctx.update.message.photo) return sendMessage(ctx, chatId, 'Вы не отправили скриншот с товаром! Повторите отправку.', createCategoryOptions([], { isCancel: true }))
        if (!ctx.update.message.caption) return sendMessage(ctx, chatId, 'Вы не отправили описание заказа! Повторите отправку.', createCategoryOptions([], { isCancel: true }));

        try {
            const admins = await getAdmins();
            admins.forEach(async ({ chat_id }: { chat_id: number }) => {
              try {
                await ctx.forwardMessage(chat_id, chatId, ctx.update.message.message_id)
              } catch (e) {
                console.log('error', e)
              }
            })
            session.is_create_order_process = false;
            await dbService.saveUserSession(chatId, session)

            dbService.createOrder({
                chatId: session.chat_id,
                username: session.username,
                firstName: session.first_name,
                secondName: session.second_name,
                message: ctx.update.message.caption,
                messageId: ctx.update.message.message_id
            })
            if (session.is_admin) {
                return await sendMessage(ctx, chatId, 'Заказ успешно оформлен!', createCategoryOptions(KEYBOARDS.NEW_ORDER, { isMain: true }));
            } else {
                return await sendOrEditMessage(ctx, chatId, 'Заказ успешно оформлен!', createCategoryOptions(KEYBOARDS.NEW_ORDER, { isMain: true }));
            }
            
        } catch (error: any) {
            await sendOrEditMessage(ctx, chatId, `Не удалось оформить заказ. Повторите попытку позже. Error: ${error.message}`, createCategoryOptions([], { isMain: true }));
            return
        }
    }


    switch (text) {
      case '/start':
          const adminsCollection: Partial<Record<string, number>> = {}
          const admins = await getAdmins()
          admins.forEach((admin: any) => adminsCollection[admin.username] = admin.chat_id)
          const chat = ctx.update.message.chat

          const isOwner = MAIN_ADMINS.includes(chat.username);
          session.is_owner = isOwner;
            if (chat.username in adminsCollection || isOwner) {
                try {

                  try {
                    if (!adminsCollection[chat.username]) await dbService.updateAdminChatId(chat.username, chatId)
                  } catch (error) {
                    // @ts-ignore
                    await ctx.sendMessage(`Произошла ошибка при сохранении чата. Обратитесь в поддержку. Error: ${error.message}`);
                  }
                    session.is_admin = true;
                    session.is_owner = MAIN_ADMINS.includes(chat.username);
                    let welcomeMsg = `Привет ${chat.first_name} ${chat.last_name}!\n`
                    welcomeMsg += session.is_owner ? `Ты идентифицирован как Главный администратор!\n` : 'Ты идентифицирован как администратор!'
                    if (session.is_owner) {
                        welcomeMsg += `Дополнительное меню в самом низу "Режим администратора" видно только тебе.\n`;
                        welcomeMsg += `Ты можешь назначать и удалять администраторов.\n`;
                        welcomeMsg += `Тебя невозможно удалить из списка администраторов.\n`;
                        welcomeMsg += `Заказы, которые создают пользователи приходят тебе и всем администраторам которых ты назначил.\n`;
                    } else {
                        welcomeMsg += `Я буду отправлять тебе все заказы которые будут приходить!`
                    }
                    
                    await ctx.sendMessage(welcomeMsg);
                } catch (error: any) {
                    await ctx.sendMessage(`Что-то пошло не так... Ошибка ${error.message}`);
                }
            }

            const { text, options } = getStartMsg(session.is_owner);
            const sentMessage = ctx.sendMessage(text, options );
            session.last_message_id = sentMessage.message_id;
            session.first_name = chat.first_name || 'first_name';
            session.second_name = chat.last_name || 'last_name';
            session.username = chat.username;
            dbService.saveUserSession(chatId, session);
        default:
            return;
    }
} catch (error) {
    console.error('Ошибка обработки сообщения:', error);
}
};

export { greeting };
