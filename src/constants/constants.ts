export const KEYBOARDS = {
    START: [
        [
            {
                text: '🛒 Оформить заказ',
                callback_data: '/order',
            }
        ],
        [
            {
                text: '☎️ О нас',
                callback_data: '/contacts'
            },
        ],
        [
            {
                text: '💻 Рассчитать стоимость',
                callback_data: '/calculation'
            }
        ],
        [
            {
                text: '🤝 Условия',
                callback_data: '/conditions',
            }
        ],
        [
            {
                text: '🏫 Пройти обучение',
                callback_data: '/education',
            }
        ],
    ],
    ADMIN: [
        [
            {
                text: '👨‍💻Режим администратора',
                callback_data: '/admin',
            },
        ]
    ],
    BACK: [
        [
            {
                text: '⬅️ Назад',
                callback_data: '/back',
            },
        ]
    ],
    MAIN: [
        [
            {
                text: '🏠 На главную',
                callback_data: '/start',
            },
        ]
    ],

    CANCEL: [
        [
            {
                text: '🔴 Отмена',
                callback_data: '/back',
            },
        ]
    ],

    ORDER: [
        [
            {
                text: '🟢 Перейти к оформлению',
                callback_data: '/create_order',
            },
        ],
        [
            {
                text: '🏫 Гайд',
                url: 'https://drive.google.com/file/d/1cOX4YoP2uwrBgksWMQm1fAB1CyBJOTDO/view?fbclid=PAZXh0bgNhZW0CMTEAAabCWoamAWtX5tmBvUbMutyyNSJlhbE38VmIgBJb0-6Kz_nSvK4IG4ugDJM_aem_C44DmseW-pkT3_NlIvEl2A'
            }
        ],
    ],
    NEW_ORDER: [
        [
            {
                text: '🛒 Новый заказ',
                callback_data: '/create_order',
            },
        ]
    ],

    ADMIN_BUTTONS: [
        [
            {
                text: 'Список активных чатов',
                callback_data: '/admin_sessions',
            },
        ],
        [
            {
                text: 'Назначить администратора',
                callback_data: '/admin_set_admin',
            },
        ],
        [
            {
                text: 'Удалить администратора',
                callback_data: '/admin_delete_admin'
            }
        ],
        [
            {
                text: 'Список администраторов',
                callback_data: '/admin_admins_list',
            },
        ],
        [
            {
                text: 'Список заказов',
                callback_data: '/admin_order_list',
            },
        ],
    ],


    LINKS: {
        CONTACTS: [
            [
                {
                    text: 'Реквизиты',
                    callback_data: '/credentials'
                }
            ],
            [
                {
                    text: 'Инстаграмм',
                    url: 'https://www.instagram.com/dardaryya?igsh=MTkxam92cmwzdmdqOQ=='
                },
            ]
        ],

        CONDITIONS: [
            [
                {
                    text: 'Условия розница',
                    url: 'https://telegra.ph/Usloviya-Roznica-12-21'
                },
            ],
            [
                {
                    text: 'Условия ОПТ',
                    url: 'https://telegra.ph/Usloviya-OPT-12-21-2'
                },
            ],
            [
                {
                    text: 'Условия для самовыкупа',
                    url: 'https://telegra.ph/Usloviya-dlya-samovykupa-12-21'
                },
            ],
            [
                {
                    text: 'Ответственность сторон',
                    url: 'https://telegra.ph/Otvetstvennost-storon-12-21'
                }
            ],
            [
                {
                    text: '📄 Договора',
                    callback_data: '/agreements',
                }
            ],
        ],
        AGREEMENTS: [
            [
                {
                    text: '📄 Договор выкуп',
                    url: 'https://disk.yandex.by/i/xkm9du6VGXqk6g?fbclid=PAZXh0bgNhZW0CMTEAAaYWJlNFze01pE0oDDL_GfPd-q2QiZDGZcqjKHQI9iH73RitkeUqq4DbgLg_aem_Df8fGx5oWEVQGHLj2NpSzw'
                },
            ],
            [
                {
                    text: '📄 Договор обучение',
                    url: 'https://disk.yandex.by/i/lIQS0B3KtqjKVA?fbclid=PAZXh0bgNhZW0CMTEAAabp3sn-wOpHaTfh_FkHq1L4cj8xeWLvwpQUo-XnKXXef48g5eYmlvgwkug_aem_tBezr_efIyplmcjsh-nQVg'
                },
            ]
        ]
    }
}

export const MAIN_ADMIN = 'alexeiiiii';
export const SUB_MAIN_ADMIN = ['Mazhako'];
export const DELETE_ADMIN_UNIQ_PREFIX = '/delete_admin--'

export const MAIN_ADMINS = [MAIN_ADMIN, ...SUB_MAIN_ADMIN];