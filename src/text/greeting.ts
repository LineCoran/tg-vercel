import { Context } from 'telegraf';
import createDebug from 'debug';
import { KEYBOARDS, MAIN_ADMINS } from '../constants/constants';
import { createCategoryOptions, getStartMsg } from '../shared';
import { dbService } from '../service';
import { getAdmins, getChatsWithAdmins, sendMessage, sendOrEditMessage } from '../helpers';

const debug = createDebug('bot:greeting_text');

/* @ts-ignore */
/* tslint:disable */

const greeting = () => async (ctx: any) => {
  try {

    const chatId = ctx.update.message.chat.id;
    const text = ctx.update.message.text;

    console.log('ctx', ctx);
    console.log('message_id', ctx.update.message.message_id);

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
            await dbService.addAdmin(justName)
            return sendMessage(ctx, chatId, `Пользователь ${text} успешно добавлен!`, createCategoryOptions([], { isMain: true }));
        } catch(error) {
            return sendMessage(ctx, chatId, `Не удалось сохранить пользователя ${text}. Попробуйте еще раз.`, createCategoryOptions([], { isMain: true }));
        }
        
    }

    if (session.is_create_order_process) {

        if (!ctx.update.message.photo) return sendMessage(ctx, chatId, 'Вы не отправили скриншот с товаром! Повторите отправку.', createCategoryOptions([], { isCancel: true }))
        if (!ctx.update.message.caption) return sendMessage(ctx, chatId, 'Вы не отправили описание заказа! Повторите отправку.', createCategoryOptions([], { isCancel: true }));

        try {
            const admins = await getChatsWithAdmins();
            admins.forEach((adminChatId: any) => {
                ctx.forwardMessage(adminChatId, chatId, ctx.update.message.message_id)
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
        }
    }


    switch (text) {
        case '/start':
          const admins =  await getAdmins()
          const chat = ctx.update.message.chat
          console.log('chat', chat)
            if (admins.includes(chat.username)) {
                try {
                    session.is_admin = true;
                    session.is_owner = MAIN_ADMINS.includes(chat.username);
                    await dbService.addChatWithAdmin(chat.username, chatId);
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
            session.first_name = chat.first_name || 'unkwon first_name';
            session.second_name = chat.last_name || 'unkwon last_name';
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
