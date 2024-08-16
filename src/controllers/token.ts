import jwt from 'jsonwebtoken';
import redis from '../utils/redis.ts';
import type { Request, Response } from 'express';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '../constants/constants.ts';
import type { TokenPayload } from '../middleware/token.ts';

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  console.log('refreshToken', refreshToken);
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const payload: TokenPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as TokenPayload;
    console.log('payload', payload.userId);
    const key = 'refreshToken:' + payload.userId
    console.log('redis key : ', key);
    const storedToken = await redis.get(key);
    console.log('storedToken', storedToken);
    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign({ userId: payload.userId }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: ACCESS_TOKEN_EXPIRY.seconds });
    const newRefreshToken = jwt.sign({ userId: payload.userId }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: REFRESH_TOKEN_EXPIRY.seconds });

    await redis.set(key, newRefreshToken, 'EX', REFRESH_TOKEN_EXPIRY.seconds);

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: ACCESS_TOKEN_EXPIRY.millisecond });
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, maxAge: REFRESH_TOKEN_EXPIRY.millisecond });

    res.status(200).json({ message: "Token refreshed"});
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
