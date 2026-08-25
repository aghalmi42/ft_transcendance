
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  findMyConversations(@CurrentUser() user: User) {
    return this.chatService.findMyConversations(user.id);
  }

  @Post('with/:userId')
  findOrCreate(@CurrentUser() user: User, @Param('userId') otherUserId: string) {
    return this.chatService.findOrCreateConversation(user, otherUserId);
  }

  @Get(':id/messages')
  findMessages(@CurrentUser() user: User, @Param('id') id: string) {
    return this.chatService.findMessages(user, id);
  }

  @Post(':id/messages')
  sendMessage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user, id, dto);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.chatService.markAsRead(user, id);
  }
}
