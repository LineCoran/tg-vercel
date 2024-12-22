import { KEYBOARDS } from "../constants/constants";

interface IParams {
    isBack?: boolean;
    isCancel?: boolean;
    isMain?: boolean;
}
export const createCategoryOptions = (inline_keyboard: any, options: IParams = {isBack: false, isMain: false, isCancel: false}) => {

    if (options.isBack) inline_keyboard = [...inline_keyboard, ...KEYBOARDS.BACK ]
    if (options.isMain) inline_keyboard = [...inline_keyboard, ...KEYBOARDS.MAIN ]
    if (options.isCancel) inline_keyboard = [...inline_keyboard, ...KEYBOARDS.CANCEL ]
  
    return {
        reply_markup: JSON.stringify({ inline_keyboard })
    };
  };

  
export const getStartMsg = (isOwner: boolean): any => {
    let buttons = [...KEYBOARDS.START]
    if (isOwner) buttons = [...buttons, ...KEYBOARDS.ADMIN]
    return {
        text: 'Вы находитесь в главном меню. Выберите действие!',
        options: createCategoryOptions(buttons),
    }
}

export const getMinMaxDates = (orders: any)=> {
    const { minDate, maxDate } = orders.reduce(
        (acc: any, order: any) => {
          const createdAt = order.created_at;
      
          if (createdAt < acc.minDate) acc.minDate = createdAt;
          if (createdAt > acc.maxDate) acc.maxDate = createdAt;
      
          return acc;
        },
        { minDate: new Date(Infinity), maxDate: new Date(-Infinity) } // Начальные значения
      );

      return {
        minDate,
        maxDate,
      }
}
