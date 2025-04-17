import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { RemoveCartItemDto } from './dto/remove-cart-item.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@ApiTags('Carts')
@Controller('carts')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth()
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Returns the current cart' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentCart(@Request() req) {
    return this.cartsService.getCurrentCart(req.user.id);
  }

  @Post('current/add_item')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 200, description: 'Item added to cart' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async addItem(@Request() req, @Body() addCartItemDto: AddCartItemDto) {
    return this.cartsService.addItem(req.user.id, addCartItemDto);
  }

  @Post('current/update_item')
  @ApiOperation({ summary: 'Update cart item' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateItem(@Request() req, @Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartsService.updateItem(req.user.id, updateCartItemDto);
  }

  @Post('current/remove_item')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeItem(@Request() req, @Body() removeCartItemDto: RemoveCartItemDto) {
    return this.cartsService.removeItem(req.user.id, removeCartItemDto);
  }

  @Post('current/clear')
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clearCart(@Request() req) {
    return this.cartsService.clearCart(req.user.id);
  }
}
