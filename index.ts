import express from 'express';
import userRoutes from './src/routes/user';
import chatRoutes from './src/routes/chat';
import messageRoutes from './src/routes/message';
import tokenRoutes from './src/routes/token';
import cors from 'cors';
import expressListRoutes from 'express-list-routes';
import { log } from './src/middleware/log.ts';
import cookieParse from 'cookie-parser';

const app = express();

app.use(cors({
  origin:true,
  credentials: true
}));
app.use(cookieParse());
app.use(express.json());
app.use(log);
app.use(chatRoutes);
app.use(messageRoutes);
app.use(userRoutes);
app.use(tokenRoutes);
expressListRoutes(app);


const start = async () => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

void start();
