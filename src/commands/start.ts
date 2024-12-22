import { Context } from 'telegraf';
import createDebug from 'debug';

import { author, name, version } from '../../package.json';
import { getStartMsg } from '../shared';
import { dbService } from '../service';



const start = () => async (msg: any) => {
  // const message = `*${name} ${version}*\n${author}`;
  // debug(`Triggered "about" command with message \n${message}`);
  // await ctx.replyWithMarkdownV2(message, { parse_mode: 'Markdown' });



//   const chatId = msg.update.message.chat.id;
//   const text = msg.update.text;
  
      
//   const session = await dbService.getUserSession(chatId);


//   const admins =  await getAdmins()
//   if (admins.includes(msg.chat.username)) {
//       try {
//           session.is_admin = true;
//           session.is_owner = MAIN_ADMINS.includes(msg.chat.username);
//           await dbService.addChatWithAdmin(msg.chat.username, chatId);
//           let welcomeMsg = `Привет ${msg.chat.first_name} ${msg.chat.last_name}!\n`
//           welcomeMsg += session.is_owner ? `Ты идентифицирован как Главный администратор!\n` : 'Ты идентифицирован как администратор!'
//           if (session.is_owner) {
//               welcomeMsg += `Дополнительное меню в самом низу "Режим администратора" видно только тебе.\n`;
//               welcomeMsg += `Ты можешь назначать и удалять администраторов.\n`;
//               welcomeMsg += `Тебя невозможно удалить из списка администраторов.\n`;
//               welcomeMsg += `Заказы, которые создают пользователи приходят тебе и всем администраторам которых ты назначил.\n`;
//           } else {
//               welcomeMsg += `Я буду отправлять тебе все заказы которые будут приходить!`
//           }
          
//           await msg.sendMessage(welcomeMsg);
//       } catch (error: any) {
//           await msg.sendMessage(`Что-то пошло не так... Ошибка ${error.message}`);
//       }
//   }

//   const startMsg = getStartMsg(session.is_owner);
//   const sentMessage = await msg.sendMessage(startMsg.text, startMsg.options );
//   session.last_message_id = sentMessage.message_id;
//   session.first_name = msg.chat.first_name || 'unkwon first_name';
//   session.second_name = msg.chat.last_name || 'unkwon last_name';
//   session.username = msg.chat?.username;
//   dbService.saveUserSession(chatId, session);


};

export { start };
