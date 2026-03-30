import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - Dashboard statistics (requires auth, works offline)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Products statistics
    const totalProducts = await db.product.count()
    
    // Get all products to calculate low stock
    const allProducts = await db.product.findMany({
      select: { id: true, stock: true, minStock: true, name: true, sku: true }
    })
    
    const lowStockProducts = allProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length
    const outOfStockProducts = allProducts.filter(p => p.stock <= 0).length
    const lowStockAlerts = allProducts.filter(p => p.stock <= p.minStock).slice(0, 10)
    
    // Sales statistics
    const totalSales = await db.sale.count()
    const todaySales = await db.sale.count({
      where: { createdAt: { gte: startOfDay } }
    })
    const monthSales = await db.sale.count({
      where: { createdAt: { gte: startOfMonth } }
    })
    
    const totalRevenue = await db.sale.aggregate({
      _sum: { total: true }
    })
    
    const todayRevenue = await db.sale.aggregate({
      where: { createdAt: { gte: startOfDay } },
      _sum: { total: true }
    })
    
    const monthRevenue = await db.sale.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { total: true }
    })
    
    // Purchase statistics
    const totalPurchases = await db.purchase.count()
    const monthPurchases = await db.purchase.count({
      where: { createdAt: { gte: startOfMonth } }
    })
    
    const totalPurchasesAmount = await db.purchase.aggregate({
      _sum: { total: true }
    })
    
    // Clients and suppliers
    const totalClients = await db.client.count()
    const totalSuppliers = await db.supplier.count()
    
    // Sales by day (last 7 days)
    const salesByDay = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const startOfDayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const endOfDayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      
      const daySales = await db.sale.aggregate({
        where: {
          createdAt: {
            gte: startOfDayDate,
            lt: endOfDayDate
          }
        },
        _sum: { total: true },
        _count: true
      })
      
      salesByDay.push({
        date: startOfDayDate.toISOString().split('T')[0],
        revenue: daySales._sum.total || 0,
        count: daySales._count
      })
    }
    
    // Top products
    const topProducts = await db.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    })
    
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId }
        })
        return {
          ...product,
          totalSold: item._sum.quantity
        }
      })
    )
    
    // Recent activities
    let recentActivities = []
    try {
      recentActivities = await db.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, username: true, name: true, role: true } } }
      })
    } catch (e) {}
    
    return NextResponse.json({
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      },
      sales: {
        total: totalSales,
        today: todaySales,
        month: monthSales,
        totalRevenue: totalRevenue._sum.total || 0,
        todayRevenue: todayRevenue._sum.total || 0,
        monthRevenue: monthRevenue._sum.total || 0
      },
      purchases: {
        total: totalPurchases,
        month: monthPurchases,
        totalAmount: totalPurchasesAmount._sum.total || 0
      },
      clients: {
        total: totalClients
      },
      suppliers: {
        total: totalSuppliers
      },
      salesByDay,
      topProducts: topProductsWithDetails,
      recentActivities,
      lowStockAlerts
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 })
  }
}
