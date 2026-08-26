import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    // Remote authentication (OAuth 2.0) — 42 intranet.
    @Get('42/status')
    fortyTwoStatus() {
        return { configured: this.authService.isFortyTwoConfigured() };
    }

    @Get('42')
    loginWithFortyTwo(@Res() res: Response) {
        try {
            const url = this.authService.getFortyTwoAuthorizeUrl();
            res.redirect(url);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Échec de la connexion 42.';
            res.redirect(`${this.authService.getFrontendUrl()}/?oauth_error=${encodeURIComponent(message)}`);
        }
    }

    @Get('42/callback')
    async fortyTwoCallback(
        @Query('code') code: string | undefined,
        @Query('state') state: string | undefined,
        @Res() res: Response,
    ) {
        const frontendUrl = this.authService.getFrontendUrl();
        try {
            this.authService.verifyOAuthState(state);
            if (!code) throw new Error('Code manquant.');
            const { accessToken } = await this.authService.loginWithFortyTwoCode(code);
            res.redirect(`${frontendUrl}/?oauth_token=${encodeURIComponent(accessToken)}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Échec de la connexion 42.';
            res.redirect(`${frontendUrl}/?oauth_error=${encodeURIComponent(message)}`);
        }
    }
}
