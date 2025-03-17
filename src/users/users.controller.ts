import { Controller, Get, Post, Body, UseGuards, Request, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SignInDto, SignUpDto } from 'src/dto/users.dto';
import { Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async signup(@Body() body: SignUpDto) {
    return this.usersService.signup(body.email, body.name, body.password);
  }

  @Post('signin')
async signin(@Body() body: SignInDto, @Res() res: Response) {
  const userData = await this.usersService.signin(body.email, body.password);

  res.cookie('jwt', userData.token, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return res.json({ message: 'Login successful', token: userData.token });
}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('protected')
  @ApiOperation({ summary: 'Access protected route' })
  @ApiResponse({ 
    status: 200, 
    description: 'You have access!',
    schema: { 
      example: { 
        message: 'You have access!', 
        user: { name: 'John Doe', email: 'test@example.com' } 
      } 
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProtectedData(@Request() req) {
    return { 
      message: 'You have access!', 
      user: { name: req.user.name, email: req.user.email }
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out the user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully', schema: { example: { message: 'Logged out successfully' } } })
  async logout(@Res() res: Response) {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    return res.json({ message: 'Logged out successfully' });
  }
}
