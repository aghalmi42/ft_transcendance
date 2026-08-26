import { Controller, Post, Param, UseGuards, Patch, Get, Delete } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request/:receiverId')
  sendRequest(@CurrentUser() user: User, @Param('receiverId') receiverId: string) {
    return this.friendsService.sendFriendRequest(user, receiverId);
  }

  @Patch('accept/:requestId')
  acceptRequest(@CurrentUser() user: User, @Param('requestId') requestId: string) {
    return this.friendsService.acceptFriendRequest(user, requestId);
  }

  @Patch('decline/:requestId')
  declineRequest(@CurrentUser() user: User, @Param('requestId') requestId: string) {
    return this.friendsService.declineFriendRequest(user, requestId);
  }

  @Delete(':friendId')
  removeFriend(@CurrentUser('id') userId: string, @Param('friendId') friendId: string) {
    return this.friendsService.removeFriend(userId, friendId);
  }

  @Get()
  getFriends(@CurrentUser('id') userId: string) {
    return this.friendsService.getFriendsList(userId);
  }
}