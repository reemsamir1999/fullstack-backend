import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import 'dotenv/config';

const jwtSecret = process.env.JWT_SECRET || "default_secret"; 

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async signup(email: string, name: string, password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return this.userModel.create({ email, name, password: hashedPassword });
  }

  async signin(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign(
  { id: user._id, email: user.email },
  jwtSecret as string,
  { expiresIn: "1h" }
);

    return { message: 'Login successful', token };
  }
}
