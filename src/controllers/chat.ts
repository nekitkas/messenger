import prisma from '../utils/prisma.ts';
import type { Request, Response } from 'express';

interface CreateChatRequest extends Request {
  body: {
    isGroup: boolean,
    groupName: string | null,
    creatorId: number
  }
}

export const newChat = async (req: CreateChatRequest, res: Response): Promise<any> => {
  const { creatorId, isGroup, groupName } = req.body;
  try {
    const chat = await prisma.chat.create({
      data: {
        isGroup: isGroup,
        groupName: groupName || null,
        creator: {
          connect: {
            id: creatorId
          }
        },
        members: {
          create: {
            userId: creatorId
          }
        }
      },
    });

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

export const getChats = async (req: Request, res: Response): Promise<any> => {
  try {
    const chats = await prisma.chat.findMany();

    res.json(chats)
  } catch (error) {
    res.status(500).json({ error: error })
  }
}

export const getChat = async (req: Request, res: Response): Promise<any> => {
  const id = Number(req.params.id)
  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: id
      }
    });

    res.json(chat)
  } catch (error) {
    res.status(500).json({ error: error })
  }
}

export const joinChat = async (req: Request, res: Response): Promise<any> => {
  const { userId, chatId } = req.body;
  try {
    const chat = await prisma.chat.update({
      where: {
        id: chatId,
        AND: {
          isGroup: true
        }
      },
      data: {
        members: {
          create: {
            userId: userId
          }
        }
      }
    });

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

export const listChatMembers = async (req: Request, res: Response): Promise<any> => {
  const id = Number(req.params.id)
  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: id
      },
      include: {
        members: true
      }
    });

    res.json(chat)
  } catch (error) {
    res.status(500).json({ error: error })
  }
}
