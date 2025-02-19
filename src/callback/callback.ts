import { dbService } from '../service';
import { createCategoryOptions, getStartMsg } from '../shared';
import { KEYBOARDS, MAIN_ADMIN, MAIN_ADMINS } from '../constants/constants';
import { createReadStream } from 'fs';
import { createAdminsListToDelete, sendOrEditMessage } from '../helpers';
import dayjs = require('dayjs');

const DELETE_ADMIN_UNIQ_PREFIX = '/delete_admin--'

const callback = () => async (ctx: any) => {
    const chatId = ctx.update.callback_query.message?.chat.id;
    const callback_query = ctx.update.callback_query.data;

    if (callback_query === '/calculation') {
        ctx.scene.enter('calculation_scene')
        return
    }
    try {
        const session = await dbService.getUserSession(chatId);
        if (callback_query.includes(DELETE_ADMIN_UNIQ_PREFIX)) {
            const adminUserNameToDelete = callback_query.replaceAll(DELETE_ADMIN_UNIQ_PREFIX, '')
            if (MAIN_ADMINS.includes(adminUserNameToDelete)) {
                return sendOrEditMessage(ctx, chatId, `Пользователя @${adminUserNameToDelete} невозможно удалить из списка администраторов!`, createCategoryOptions([], { isMain: true }));
            }
    
            try {
                const deletedAdminChatId = await dbService.deleteAdmin(adminUserNameToDelete);
                if (deletedAdminChatId) ctx.telegram.sendMessage(deletedAdminChatId, 'Вы были удалены из списка администраторов!')
                return sendOrEditMessage(ctx, chatId, `Пользователь @${adminUserNameToDelete} успешно удален из списка администраторов!`, createCategoryOptions([], { isMain: true }))    
            } catch(error: any) {
                console.log(error)
                return sendOrEditMessage(ctx, chatId, `Не удалось удалить пользователя @${adminUserNameToDelete}. Попробуйте позже! ${error.message}`, createCategoryOptions([], { isMain: true }))    
            }
    
        }
    
        switch (callback_query) {
            case '/back':
                const { text, options } = getStartMsg(session.is_owner)
                session.is_create_order_process = false;
                session.is_set_admin_process = false;
                await dbService.saveUserSession(chatId, session);
                return sendOrEditMessage(ctx, chatId, text, options );
            case '/contacts':
                return  sendOrEditMessage(ctx, chatId, '\n' +
                  'Привет 👋 \n' +
                  '\n' +
                  'Меня зовут Даша! Я занимаюсь выкупом и доставкой товаров из Китая под ключ 🔑 \n' +
                  '\n' +
                  'Занимаюсь я этим более 3 лет. Поэтому с вашим грузом точно всё будет в порядке!\n' +
                  '\n' +
                  'Я привезла более 10 тонн, различных категорий, товара.\n' +
                  '\n' +
                  'С отзывами моих клиентов вы можете ознакомиться на моей страничке в «Instagram». Ссылка на нее есть в разделе «Контакты»\n' +
                  '\n' +
                  'Если вы еще не скачали все приложения - у меня есть бесплатный Гайд. А если хотите научиться заказывать сами - обучение.\n' +
                  '\n' +
                  'Жду ваш заказ 😉', createCategoryOptions(KEYBOARDS.LINKS.CONTACTS, { isBack: true })
                )
            case '/conditions':
                return sendOrEditMessage(ctx, chatId, 'Условия:', createCategoryOptions(KEYBOARDS.LINKS.CONDITIONS, { isBack: true }))
            case '/agreements':
                return sendOrEditMessage(ctx, chatId, 'Договора:', createCategoryOptions(KEYBOARDS.LINKS.AGREEMENTS, { isBack: true }))
            case '/education':
                return sendOrEditMessage(ctx, chatId, `База WeChat - 50 BYN\nДоставка - 150 BYN\nВыкуп - 200 BYN\nВыкуп и доставка - 300 BYN\nКонсультация по официальному ввозу - 500 BYN`, createCategoryOptions([], { isBack: true }))
            case '/order':            
                const photoPath = './assets/order_form.jpg';
                if (!session.is_send_photo) {
                    session.is_send_photo = true;
                    dbService.saveUserSession(chatId, session);
                    await ctx.sendPhoto(chatId, createReadStream(photoPath), { caption: 'Пример оформления' });
                    return ctx.sendMessage('Выберите действие в меню ниже:', createCategoryOptions(KEYBOARDS.ORDER, { isBack: true }))
                } else {
                    return sendOrEditMessage(ctx, chatId, 'Выберите действие в меню ниже:', createCategoryOptions(KEYBOARDS.ORDER, { isBack: true }))
                }
                
            case '/credentials':
                return sendOrEditMessage(ctx, chatId, `Получатель: ИП Чуянова Дарья Александровна\nУНП : 491643105\nНомер счёта : BY74POIS30130163001701933001\nБанк : ОАО «Паритетбанк»\nБИК : POISBY2X\nКОД ПЛАТЕЖА (вводить только при необходимости) : 90401\nНазначение платежа : Оказание услуг`, createCategoryOptions([], { isBack: true }))    
            case '/create_order':
                session.is_create_order_process = true;
                dbService.saveUserSession(chatId, session);
                return sendOrEditMessage(ctx, chatId, 'Пришлите скрин с текстом:', createCategoryOptions([], { isCancel: true }))
            case '/admin':
                return sendOrEditMessage(ctx, chatId, 'Различные кнопочки:', createCategoryOptions(KEYBOARDS.ADMIN_BUTTONS, { isBack: true }))
    
            case '/admin_admins_list':
                let msg = ''
                const admins = await dbService.getAdmins();
                const filteredAdmins = admins.filter(admin => admin.username !== MAIN_ADMIN);
                filteredAdmins.forEach((admin, index) => msg += `${index + 1}. @${admin.username} - ID чата: ${admin.chat_id}\n`)
                return sendOrEditMessage(ctx, chatId, `Список администраторов:\n ${msg}`, createCategoryOptions([], { isBack: true } ))
            case '/admin_sessions':
    
            try {
                const allSession = await dbService.getSessions();
                let msgForSession = `Всего сессий: ${allSession.length}\n`
                allSession.forEach((sessionItem, index) => msgForSession += `${index + 1}.\nИмя: ${sessionItem.first_name} ${sessionItem.second_name}\nНик: ${sessionItem.username}\n Чат ID: ${sessionItem.chat_id}\n Дата: ${sessionItem.timestamp}\n\n\n`)
                return sendOrEditMessage(ctx, chatId, `Список всех сессий:\n${msgForSession}`, createCategoryOptions([], { isBack: true } ))
    
            } catch (error: any) {
                return sendOrEditMessage(ctx, chatId, `Не удалось получить список сессий. Попробуйте позже. Error: ${error.message}`, createCategoryOptions([], { isBack: true } ))
            }
    
            case '/admin_set_admin':
                session.is_set_admin_process = true;
                dbService.saveUserSession(chatId, session);
                return sendOrEditMessage(ctx, chatId, 'Пришлите id пользователя в формате @alexeiiiii:', createCategoryOptions([], { isCancel: true }))
            case '/admin_delete_admin':
                const adminsToDelete = await dbService.getAdmins();
                const filteredAdminsToDelete = adminsToDelete.filter(admin => admin.username !== MAIN_ADMIN);
                const buttonWithAdminsToDelete = createAdminsListToDelete(filteredAdminsToDelete);
                if (buttonWithAdminsToDelete.length === 0) return sendOrEditMessage(ctx, chatId, 'Список администраторов пуст. Удалять некого.', createCategoryOptions([], { isMain: true }))    
                return sendOrEditMessage(ctx, chatId, 'Выберите пользователя для удаления из списка администраторов', createCategoryOptions(buttonWithAdminsToDelete, { isCancel: true }))    
            case '/admin_order_list':
                try {
                    const allOrders = await dbService.getAllOrders();
                    const filteredAllOrders = allOrders.filter((item: any) => item.created_at);
                    const users: string[] = [];
                    const totalOrdersCounts = filteredAllOrders.length;
                    const minDate = filteredAllOrders.at(-1).created_at;
                    const maxDate = filteredAllOrders[0].created_at;
                    filteredAllOrders.forEach(order => users.push(order.username))
                    let msgForAllOrders = `Всего сделано заказов: ${totalOrdersCounts} шт.\n`;
                    msgForAllOrders += `Период с ${dayjs(minDate).format('YYYY.MM.DD HH:mm')} по ${dayjs(maxDate).format('YYYY.MM.DD HH:mm')}\n`;
                    msgForAllOrders += `Пользователи сделавшие заказ: ${Array.from(new Set(users)).length}`;

                    return sendOrEditMessage(ctx, chatId, `Информация по всем заказам:\n\n${msgForAllOrders}`, createCategoryOptions([], { isBack: true } ))
        
                } catch (error: any) {
                    return sendOrEditMessage(ctx, chatId, `Не удалось получить список всех заказов. Попробуйте позже. Error: ${error.message}`, createCategoryOptions([], { isBack: true } ))
                }
            default:
                return;
        }
    
    } catch(e) {
        console.log(e)
    }
};

export { callback };
