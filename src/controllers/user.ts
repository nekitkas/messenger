import type { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import redis from '../utils/redis';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '../constants/constants.ts';
import type { AuthRequest } from '../middleware/token.ts';

interface UserRequest extends Request {
  body: {
    name: string,
    email: string,
    password: string
  }
}

interface LoginRequest extends Request {
  body: {
    email: string,
    password: string,
  }
}

export const logIn = async (req: LoginRequest, res: Response): Promise<any> => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
        AND: {
          passwordHash: password,
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: ACCESS_TOKEN_EXPIRY.seconds });
    const refreshToken = jwt.sign({ userId: user.id}, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: REFRESH_TOKEN_EXPIRY.seconds });
    const key = 'refreshToken:' + user.id
    await redis.set(key, refreshToken, 'EX', REFRESH_TOKEN_EXPIRY.seconds);

    const test = await redis.get(key)
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: ACCESS_TOKEN_EXPIRY.millisecond }); // 1 minute
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: REFRESH_TOKEN_EXPIRY.millisecond }); // 3 minutes

    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

export const createUser = async (req: UserRequest, res: Response): Promise<any> => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    res.status(400).json({ message: "Missing name, email or password"})
  }
  try {
    const user = await prisma.user.create({
      data: {
        username: name,
        email: email,
        passwordHash: password,
      },
    });
    res.json(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(400).json({ message: "Email or username already exists"});
        return
      }
      console.error(error.message)
      res.status(400).json({ error: error.message })
      return
    }
  }
}

export const getUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await prisma.user.findMany();

    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error })
  }
}

export const getUser = async (req: AuthRequest, res: Response): Promise<any> => {
  const id = req.userId;
  console.log('iddddddddddddddddd',id);
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id
      }
    });

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error })
  }
}


export const listUserChats = async (req: Request, res: Response): Promise<any> => {
  const id = Number(req.params.id)
  try {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: id
          }
        }
      }
    });

    res.json(chats)
  } catch (error) {
    res.status(500).json({ error: error })
  }
}
