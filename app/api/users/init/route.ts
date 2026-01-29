import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existen usuarios en la base de datos. Use GET /api/users para obtenerlos.' 
        },
        { status: 400 }
      );
    }

    const users = await User.insertMany([
      {
        name: 'Jorge Torres',
        phone: '555-123-4567',
        address: 'Av. Reforma 123, CDMX',
      },
      {
        name: 'Nelly García',
        phone: '555-987-6543',
        address: 'Calle Juárez 45, Guadalajara',
      },
      {
        name: 'Emma Espinoza',
        phone: '555-456-7890',
        address: 'Blvd. Las Américas 678, Monterrey',
      },
      {
        name: 'Michelle López',
        phone: '555-321-1122',
        address: 'Calle Hidalgo 890, Puebla',
      },
    ]);

    return NextResponse.json(
      { 
        success: true, 
        message: `${users.length} usuarios creados exitosamente`,
        data: users 
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al inicializar usuarios' },
      { status: 500 }
    );
  }
}
