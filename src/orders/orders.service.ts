import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartsService } from '../carts/carts.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartsService: CartsService,
    private ordersGateway: OrdersGateway,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    // Get current cart
    const cart = await this.prisma.cart.findFirst({
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

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate order totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.menuItem.price) * item.quantity,
      0,
    );
    const deliveryFee = createOrderDto.deliveryFee || 2.99;
    const tax = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + deliveryFee + tax + (createOrderDto.tip || 0);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order
    const order = await this.prisma.order.create({
      data: {
        userId,
        restaurantId: cart.restaurantId,
        orderNumber,
        totalAmount,
        deliveryFee,
        tax,
        tip: createOrderDto.tip,
        deliveryAddress: createOrderDto.deliveryAddress,
        paymentMethod: createOrderDto.paymentMethod,
        paymentStatus: createOrderDto.paymentStatus || 'pending',
        specialInstructions: createOrderDto.specialInstructions,
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
        items: {
          create: cart.items.map(item => ({
            menuItemId: item.menuItemId,
            name: item.menuItem.name,
            price: item.menuItem.price,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
          })),
        },
        tracking: {
          create: {
            status: 'pending',
            estimatedArrival: new Date(Date.now() + 45 * 60 * 1000),
          },
        },
      },
      include: {
        items: true,
        tracking: true,
        restaurant: true,
      },
    });

    // Clear the cart
    await this.cartsService.clearCart(userId);

    // Notify about new order
    this.ordersGateway.notifyNewOrder(order);

    return order;
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        tracking: true,
        restaurant: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: true,
        tracking: true,
        restaurant: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async trackOrder(userId: string, id: string) {
    const order = await this.findOne(userId, id);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      tracking: order.tracking,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      actualDeliveryTime: order.actualDeliveryTime,
      restaurant: {
        id: order.restaurant.id,
        name: order.restaurant.name,
        address: order.restaurant.address,
        phone: order.restaurant.phone,
      },
    };
  }

  async updateOrderStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const { status, driverId, driverName, driverPhone, driverLocation } = updateOrderStatusDto;

    // Check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { tracking: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Update order status
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status,
        actualDeliveryTime: status === 'delivered' ? new Date() : undefined,
        tracking: {
          update: {
            status,
            driverId,
            driverName,
            driverPhone,
            driverLocation,
            estimatedArrival: updateOrderStatusDto.estimatedArrival,
          },
        },
      },
      include: {
        tracking: true,
        restaurant: true,
      },
    });

    // Notify about order status update
    this.ordersGateway.notifyOrderStatusUpdate(updatedOrder);

    return updatedOrder;
  }
}
