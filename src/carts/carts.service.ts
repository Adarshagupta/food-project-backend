import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { RemoveCartItemDto } from './dto/remove-cart-item.dto';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  async getCurrentCart(userId: string) {
    // Find active cart for user
    let cart = await this.prisma.cart.findFirst({
      where: {
        userId,
        status: 'active',
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Create new cart if none exists
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          status: 'active',
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.menuItem.price) * item.quantity,
      0,
    );

    return {
      ...cart,
      subtotal,
    };
  }

  async addItem(userId: string, addCartItemDto: AddCartItemDto) {
    const { menu_item_id, quantity, specialInstructions } = addCartItemDto;

    // Check if menu item exists
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menu_item_id },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menu_item_id} not found`);
    }

    // Get current cart or create new one
    let cart = await this.prisma.cart.findFirst({
      where: {
        userId,
        status: 'active',
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          status: 'active',
          restaurantId: menuItem.restaurantId,
        },
      });
    }

    // Check if cart already has items from a different restaurant
    if (cart.restaurantId && cart.restaurantId !== menuItem.restaurantId) {
      // Get existing items
      const existingItems = await this.prisma.cartItem.findMany({
        where: { cartId: cart.id },
        include: { menuItem: true },
      });

      if (existingItems.length > 0) {
        throw new BadRequestException(
          'Cannot add items from different restaurants to the same cart',
        );
      }

      // Update cart with restaurant ID
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { restaurantId: menuItem.restaurantId },
      });
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        menuItemId: menu_item_id,
      },
    });

    if (existingItem) {
      // Update quantity of existing item
      const updatedItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          specialInstructions: specialInstructions || existingItem.specialInstructions,
        },
        include: {
          menuItem: true,
        },
      });

      return this.getCurrentCart(userId);
    }

    // Add new item to cart
    const cartItem = await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        menuItemId: menu_item_id,
        quantity,
        specialInstructions,
      },
      include: {
        menuItem: true,
      },
    });

    return this.getCurrentCart(userId);
  }

  async updateItem(userId: string, updateCartItemDto: UpdateCartItemDto) {
    const { cart_item_id, quantity } = updateCartItemDto;

    // Check if cart item exists and belongs to user
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cart_item_id,
        cart: {
          userId,
          status: 'active',
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cart_item_id} not found`);
    }

    // Update cart item
    const updatedItem = await this.prisma.cartItem.update({
      where: { id: cart_item_id },
      data: {
        quantity,
        specialInstructions: updateCartItemDto.specialInstructions,
      },
      include: {
        menuItem: true,
      },
    });

    return this.getCurrentCart(userId);
  }

  async removeItem(userId: string, removeCartItemDto: RemoveCartItemDto) {
    const { cart_item_id } = removeCartItemDto;

    // Check if cart item exists and belongs to user
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cart_item_id,
        cart: {
          userId,
          status: 'active',
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cart_item_id} not found`);
    }

    // Delete cart item
    await this.prisma.cartItem.delete({
      where: { id: cart_item_id },
    });

    return { message: 'Cart item removed successfully' };
  }

  async clearCart(userId: string) {
    // Find active cart for user
    const cart = await this.prisma.cart.findFirst({
      where: {
        userId,
        status: 'active',
      },
    });

    if (!cart) {
      return { message: 'Cart is already empty' };
    }

    // Delete all items in cart
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Cart cleared successfully' };
  }
}
