import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const users = await User.find()
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(
      { success: true, data: users },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener los usuarios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { name, phone, address } = body;

    if (!name || !phone || !address) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios: name, phone, address' },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      phone,
      address,
    });

    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
