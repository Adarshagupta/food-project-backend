import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user orders' })
  @ApiResponse({ status: 200, description: 'Returns all user orders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    return this.ordersService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the order' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.ordersService.findOne(req.user.id, id);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Track order by ID' })
  @ApiResponse({ status: 200, description: 'Returns order tracking information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async trackOrder(@Request() req, @Param('id') id: string) {
    return this.ordersService.trackOrder(req.user.id, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (Admin/Driver)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
  }
}
