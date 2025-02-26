const Prisma = require('../db/db');
module.exports.getConversation = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const conversations = await Prisma.conversation.findMany({
            where: {
                participants: {
                    some: { id: userId },
                },
            },
            select: {
                id: true,
                updatedAt: true,
                lastMessageContent: true,
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        number: true,
                        status: true,
                        unreadCounts: true,
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
    }
};
module.exports.createConversation = async (req, res) => {
    const currUserId = req.userId;
    const { id: userId } = req.body;

    if (!currUserId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    if (!userId) {
        return res.status(400).json({ success: false, message: 'Missing userId' });
    }

    if (currUserId === userId) {
        return res
            .status(400)
            .json({ success: false, message: 'Cannot create conversation with self' });
    }
    try {
        const existingConversation = await Prisma.conversation.findFirst({
            where: {
                participants: {
                    every: {
                        id: {
                            in: [currUserId, userId],
                        },
                    },
                },
            },
        });

        if (existingConversation) {
            return res.status(201).json({ success: true, message: 'Conversation already exists' });
        }

        const newConversation = await Prisma.conversation.create({
            data: {
                participants: {
                    connect: [{ id: currUserId }, { id: userId }],
                },
                lastMessageContent: '',
            },
            select: {
                id: true,
                updatedAt: true,
                lastMessageContent: true,
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        number: true,
                        status: true,
                    },
                },
            },
        });

        res.status(201).json({ success: true, data: newConversation });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
module.exports.getUsers = async (req, res) => {
    const filter = req.query.filter;
    if (!filter) {
        return res.status(400).json({ success: false, message: 'Missing filter' });
    }
    try {
        const users = await Prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: filter, mode: 'insensitive' } },
                    { number: { contains: filter, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                number: true,
            },
        });
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'No users found' });
        }
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
module.exports.getMessages = async (req, res) => {
    const conversationId = req.params.conversationId;
    if (!conversationId) {
        return res.status(400).json({ success: false, message: 'Missing conversationId' });
    }

    try {
        const messages = await Prisma.message.findMany({
            where: {
                conversationId,
            },
            select: {
                id: true,
                content: true,
                status: true,
                createdAt: true,
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        number: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports.send = async (req, res) => {
    const senderId = req.userId;
    const { content, conversationId } = req.body;

    if (!senderId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    if (!content || !conversationId) {
        return res
            .status(400)
            .json({ success: false, message: 'Missing content or conversationId' });
    }

    try {
        const result = await Prisma.$transaction(async (prisma) => {
            const newMessage = await prisma.message.create({
                data: {
                    content,
                    senderId,
                    conversationId,
                    status: 'SENT',
                },
                select: {
                    id: true,
                    content: true,
                    status: true,
                    createdAt: true,
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            number: true,
                            status: true,
                        },
                    },
                },
            });

            await prisma.conversation.update({
                where: { id: conversationId },
                data: {
                    lastMessageContent: content,
                    updatedAt: new Date(),
                },
            });

            return newMessage;
        });

        res.status(201).json({ success: true, data: result });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// module.exports.markAsRead = async (req, res) => {
//     await Prisma.unreadCount.updateMany({
//         where: { userId: req.userId, conversationId: req.params.conversationId },
//         data: { count: 0 },
//     });
//     res.status(200).json({ success: true });
// };
