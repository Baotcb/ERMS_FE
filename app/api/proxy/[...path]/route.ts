import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ermsbe-dcbtdfezebashgb7.southeastasia-01.azurewebsites.net'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  pathArray: string[],
  method: string
) {
  const path = pathArray.join('/')
  const apiPrefix = path.startsWith('api/') ? '' : 'api/'
  const url = `${API_BASE_URL}/${apiPrefix}${path}`

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    console.log('All request headers:', Object.fromEntries(request.headers.entries()))

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    console.log('Proxy request:', method, url)
    console.log('Auth header present:', !!authHeader)
    if (authHeader) {
      headers['Authorization'] = authHeader
      console.log('Auth header:', authHeader.substring(0, 50) + '...')
    }
    
    const body = method !== 'GET' && method !== 'DELETE' 
      ? await request.text() 
      : undefined
    
    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    console.log('API response status:', response.status)
    console.log('API response headers:', Object.fromEntries(response.headers.entries()))

    const data = await response.text()
    console.log('API response data (first 200 chars):', data.substring(0, 200))

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Proxy request failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
