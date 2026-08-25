
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('users')
  searchUsers(@Query() searchDto: SearchQueryDto) {
    return this.searchService.searchUsers(searchDto.q);
  }

  @Get('posts')
  searchPosts(@Query() searchDto: SearchQueryDto) {
    return this.searchService.searchPosts(searchDto.q);
  }

  @Get()
  searchAll(@Query() searchDto: SearchQueryDto) {
    return this.searchService.searchAll(searchDto.q);
  }
}

