import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: nodemailer.Transporter | null;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<string>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    this.from = this.configService.get<string>('SMTP_FROM') || 'no-reply@ft-transcendence.local';

    this.transporter = host
      ? nodemailer.createTransport({
          host,
          port: port ? Number(port) : 587,
          secure: Number(port) === 465,
          auth: user && pass ? { user, pass } : undefined,
        })
      : null;
  }

  private async send(to: string, subject: string, text: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`SMTP not configured — would have sent "${subject}" to ${to}`);
      return false;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text });
      return true;
    } catch (err) {
      this.logger.error(`Failed to send "${subject}" to ${to}: ${err instanceof Error ? err.message : err}`);
      return false;
    }
  }

  sendAccountDeletionConfirmation(to: string, username: string): Promise<boolean> {
    return this.send(
      to,
      'ft_transcendence — Votre compte a été supprimé',
      `Bonjour ${username},\n\nConformément à votre demande, votre compte ft_transcendence et l'ensemble des données associées ont été supprimés.\n\nSi vous n'êtes pas à l'origine de cette action, contactez-nous immédiatement.\n\n— L'équipe ft_transcendence`,
    );
  }

  sendDataExportConfirmation(to: string, username: string): Promise<boolean> {
    return this.send(
      to,
      'ft_transcendence — Export de vos données (RGPD)',
      `Bonjour ${username},\n\nUn export de l'ensemble de vos données personnelles vient d'être généré depuis votre compte ft_transcendence.\n\nSi vous n'êtes pas à l'origine de cette demande, contactez-nous immédiatement et envisagez de changer votre mot de passe.\n\n— L'équipe ft_transcendence`,
    );
  }
}
