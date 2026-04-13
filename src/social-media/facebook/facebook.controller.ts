import {
  Controller, Get, Post,
  Body, Req, Res,
  UseGuards, UnauthorizedException,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FacebookService } from './facebook.service';
import { CreatePostDto } from './dto/post.dto';


@Controller('facebook')
export class FacebookController {
  constructor(
    private readonly facebookService: FacebookService,
    private readonly jwtService: JwtService,
  ) {}


  @UseGuards(AuthGuard)
  @Get('auth')
  getAuthUrl(@Req() req) {
    const userId = req.user.id;
    const token  = req.headers.authorization?.split(' ')[1];
    const state  = Buffer.from(JSON.stringify({ userId, token })).toString('base64');
    return { url: this.facebookService.getOAuthUrl(state) };
  }


@Get('callback')
async handleCallback(
  @Query('code')  code: string,
  @Query('state') state: string,
  @Res() res: Response,
) {
  let userId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    userId = decoded.userId;
    this.jwtService.verify(decoded.token);
  } catch {
    throw new UnauthorizedException('Invalid or expired session');
  }

  await this.facebookService.exchangeCodeForToken(code, userId);

  // ✅ Redirect to frontend — not json
  return res.redirect('http://localhost:5173/facebook');
}


  @UseGuards(AuthGuard)
  @Get('pages')
  async getPages(@Req() req) {
    return this.facebookService.getPages(req.user.id);
  }


  @UseGuards(AuthGuard)
  @Post('select-page')
  async selectPage(@Req() req, @Body('pageId') pageId: string) {
    return this.facebookService.selectPage(req.user.id, pageId);
  }



@Post('post')
async createPost(@Body() dto: CreatePostDto) {
  return this.facebookService.postToPage(dto);
}

  @UseGuards(AuthGuard)
@Get('my-tokens')
async getMyTokens(@Req() req) {
  return this.facebookService.getMyTokens(req.user.id);
}

@UseGuards(AuthGuard)
@Post('direct-post')
async directPost(@Req() req, @Body() body: { message: string; title?: string; imageUrl?: string; hashtags?: string[] }) {
  return this.facebookService.directPost({
    userId: req.user.id,
    message: body.message,
    title: body.title,
    imageUrl: body.imageUrl,
    hashtags: body.hashtags,
  })
}

}