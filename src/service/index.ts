import pool from "../db";

const initializeChatSession = () => ({
    is_create_order_process: false,
    last_messageId: null,
    is_send_photo: false,
    is_admin: false,
    is_set_admin_process: false,
    first_name: '',
    second_name: '',
    is_owner: false,
    username: '',
});

export const dbService = {

    getSessions: async () => {
        const res = await pool.query('SELECT * FROM user_sessions');
        return res.rows;
    },

    getUserSession: async (chatId: number) => {
        const res = await pool.query('SELECT * FROM user_sessions WHERE chat_id = $1', [chatId]);

        if (!res.rows[0]) {
            const newSession = initializeChatSession()
            dbService.saveUserSession(chatId, newSession);
            return newSession;
        }
        return res.rows[0];
    },

    saveUserSession: async (chatId: number, session: any) => {
        await pool.query(
          `INSERT INTO user_sessions (chat_id, is_create_order_process, last_message_id, is_send_photo, is_admin, is_set_admin_process, first_name, second_name, is_owner, username)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (chat_id) 
           DO UPDATE SET 
             is_create_order_process = $2,
             last_message_id = $3,
             is_send_photo = $4,
             is_admin = $5,
             is_set_admin_process = $6,
             first_name = $7,
             second_name = $8,
             is_owner = $9,
             username = $10
             `,
          [
            chatId,
            session.is_create_order_process,
            session.last_message_id,
            session.is_send_photo,
            session.is_admin,
            session.is_set_admin_process,
            session.first_name,
            session.second_name,
            session.is_owner,
            session.username
        ]
        );
      },

    addAdmin: async (username: string) => {
        await pool.query('INSERT INTO admins (username) VALUES ($1) ON CONFLICT DO NOTHING', [username]);
    },

    deleteAdmin: async (username: string) => {
        await pool.query('DELETE FROM admins WHERE username = $1;', [username]);
    },

    addChatWithAdmin: async (admin_username: string, chat_id: number) => {
        await pool.query('INSERT INTO admins_chats (admin_username, chat_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [admin_username, chat_id]);
    },

    getAdmins: async() => {
        const res = await pool.query('SELECT * FROM admins');
        return res.rows
    },

    getChatsWithAdmins: async() => {
        const res = await pool.query('SELECT * FROM admins_chats');
        return res.rows
    },

    createOrder: async (session: { chatId: number, message: string, username: string, firstName: string, secondName: string, messageId: number }) => {

        const { chatId, message, username, firstName, secondName, messageId } = session
        const query = `
            INSERT INTO orders (session_chat_id, message, username, first_name, second_name, message_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
    
        try {
            const result = await pool.query(query, [chatId, message, username, firstName, secondName, messageId]);
            return result.rows[0]; // Возвращаем только созданный заказ
        } catch (err) {
            console.error('Ошибка при создании заказа:', err);
            throw err;
        }
    },

    getAllOrders: async () => {
        const query = 'SELECT * FROM orders ORDER BY created_at DESC;';
    
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (err) {
            console.error('Ошибка при получении всех заказов:', err);
            throw err;
        }
    },

    getOrdersBySessionId: async (chatId: number) => {
        const query = `
            SELECT * FROM orders
            WHERE session_chat_id = $1
            ORDER BY created_at DESC;
        `;
    
        try {
            const result = await pool.query(query, [chatId]);
            return result.rows; // Возвращаем только заказы для определённой сессии
        } catch (err) {
            console.error('Ошибка при получении заказов для сессии:', err);
            throw err;
        }
    },


    saveMesageLog: async (msg: any) => {
        const chatId = msg.chat.id;
        const username = msg.chat.username || null;
        const text = msg.text;          
        await pool.query(
            'INSERT INTO message_logs (chat_id, username, message) VALUES ($1, $2, $3)',
            [chatId, username, text]
        );
    }
}