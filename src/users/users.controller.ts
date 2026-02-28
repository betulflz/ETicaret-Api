import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { parseDataTableQuery } from '../common/dto/datatable-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ========================================
  // DataTable Server-Side Processing
  // GET /users/datatable?draw=1&start=0&length=10&...
  // ========================================
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Get('datatable')
  findAllDataTable(@Query() query: Record<string, any>) {
    const dtQuery = parseDataTableQuery(query);
    return this.usersService.findAllDataTable(dtQuery);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // "me" rotaları :id rotalarından önce olmalı
  @UseGuards(AuthGuard)
  @Get('me')
  findMe(@Req() req: any) {
    const userId = req.user['sub'];
    return this.usersService.findMe(userId);
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user['sub'];
    return this.usersService.updateMe(userId, updateUserDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}