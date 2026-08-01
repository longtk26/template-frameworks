import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserUsecase } from '../usecases/create-user.usecase';
import { GetUserUsecase } from '../usecases/get-user.usecase';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from './dtos/create-user.dto';
import { GetUserResponseDto } from './dtos/get-user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUsecase: CreateUserUsecase,
    private readonly getUserUsecase: GetUserUsecase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    return this.createUserUsecase.execute(dto);
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<GetUserResponseDto> {
    return this.getUserUsecase.execute(id);
  }
}
