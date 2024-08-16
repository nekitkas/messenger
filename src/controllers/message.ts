import prisma from '../utils/prisma.ts';
import type { Request, Response } from 'express';

export const newMessage = async (req: Request, res: Response): Promise<any> => {
  const { userId, chatId, content } = req.body;
  try {
    const message = await prisma.message.create({
      data: {
        content: content,
        chat: {
          connect: {
            id: chatId
          }
        },
        sender: {
          connect: {
            id: userId
          }
        }
      },
    });

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

export const listChatMessages = async (req: Request, res: Response): Promise<any> => {
  const id = Number(req.params.id)
  try {
    const messages = await prisma.message.findMany({
      where: {
        chatId: id
      },
      select: {
        content: true,
        sender: {
          select: {
            username: true
          }
        }
      }
    });

    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: error })
  }
}
