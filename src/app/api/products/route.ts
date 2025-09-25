import { getProducts, GetProductsResponse } from '@/lib/handlers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest
): Promise<NextResponse<GetProductsResponse>> {
  const products = await getProducts()

  return NextResponse.json(products)
}