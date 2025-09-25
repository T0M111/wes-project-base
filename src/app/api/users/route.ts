import { NextRequest, NextResponse } from 'next/server'
import { ErrorResponse, createUser, CreateUserResponse } from '@/lib/handlers'

export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateUserResponse> | NextResponse<ErrorResponse>> {
  const body = await request.json()

  if (
    !body.email ||
    !body.password ||
    !body.name ||
    !body.surname ||
    !body.address ||
    !body.birthdate
  ) {
    return NextResponse.json(
      {
        error: 'WRONG_PARAMS',
        message: 'Request parameters are wrong or missing.',
      },
      { status: 400 }
    )
  }

  const userId = await createUser(body)

  if (userId === null) {
    return NextResponse.json(
      {
        error: 'SIGNUP_FAIL',
        message: 'E-mail address already exists.',
      },
      { status: 400 }
    )
  }

  const headers = new Headers()
  headers.append('Location', `/api/users/${userId._id}`)
  return NextResponse.json(userId, { status: 201, headers: headers })
}