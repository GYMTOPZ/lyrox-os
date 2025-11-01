import { Controller, Get, Post, Body } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('status')
  getStatus() {
    return this.whatsappService.getStatus();
  }

  @Get('qr')
  getQRCode() {
    const qr = this.whatsappService.getQRCode();
    return {
      qrCode: qr,
      message: qr
        ? 'Scan this QR code with WhatsApp'
        : 'No QR code available. Client may already be authenticated.',
    };
  }

  @Post('send')
  async sendMessage(@Body() body: { to: string; message: string }) {
    await this.whatsappService.sendMessage(body.to, body.message);
    return { success: true, message: 'Message sent' };
  }
}
