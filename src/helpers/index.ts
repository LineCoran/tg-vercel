import { DELETE_ADMIN_UNIQ_PREFIX } from "../constants/constants";
import { dbService } from "../service";

export const sendMessage = async (ctx: any, chatId: number, text: string, options: any) => {
    const session = await dbService.getUserSession(chatId);
  try {
      const sentMessage = await ctx.sendMessage(text, options);
      session.last_message_id = sentMessage.message_id;
      await dbService.saveUserSession(chatId, session);
  } catch (error) {
    const sentMessage = await ctx.sendMessage(text, options);
    session.last_message_id = sentMessage.message_id
    await dbService.saveUserSession(chatId, session);
  }
};

export const sendOrEditMessage = async (ctx: any, chatId: number, newText: string, options: any) => {
    const session = await dbService.getUserSession(chatId);
    const lastMessageId = session?.last_message_id;
  
    try {
      if (lastMessageId) {
        await ctx.editMessageText(
          newText, 
          {
            message_id: lastMessageId,
            ...options
          }
        );
      } else {
        const sentMessage = await ctx.sendMessage(newText, options);
        session.last_message_id = sentMessage.message_id;
        dbService.saveUserSession(chatId, session);
      }
    } catch (error) {
      console.error('Ошибка редактирования/отправки сообщения:', error);
  
      const sentMessage = await ctx.sendMessage(newText, options);
      session.last_message_id = sentMessage.message_id;
      dbService.saveUserSession(chatId, session);
    }
};

export const createAdminsListToDelete = (admins: any) => {

    const result: any[] = [];

    admins.forEach(({ username }: any) => {
        result.push(
            [
                {
                    text: `Удалить ${username}`,
                    callback_data: `${DELETE_ADMIN_UNIQ_PREFIX}${username}`,
                }
            ]
        )
    })

    return result;
}

export const getAdmins = async () => {
    const result: any = [];

    try {
        const admins = await dbService.getAdmins();
        admins.forEach(admin => result.push(admin));

    } catch (error) {
        console.log(error)
        return [];
    }

    return result
}

