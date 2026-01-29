import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { isValidObjectId, toObjectId } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userId = request.headers.get('x-user-id');
    
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json(
        { success: false, error: 'Usuario no válido o no proporcionado' },
        { status: 400 }
      );
    }

    const userObjectId = toObjectId(userId);
    
    const tasks = await Task.find({ user: userObjectId, status: 'active' })
      .populate('user', 'name phone address')
      .sort({ createdAt: -1 })
      .select('title description progressStatus status dueDate tags responsible createdAt user')
      .lean();

    return NextResponse.json(
      { success: true, data: tasks },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener las tareas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const userId = request.headers.get('x-user-id');
    const body = await request.json();

    const { title, description, status, dueDate, comments, responsible, tags } = body;

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json(
        { success: false, error: 'Usuario no válido o no proporcionado' },
        { status: 400 }
      );
    }

    if (!title || !description || !status || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios: title, description, status, dueDate' },
        { status: 400 }
      );
    }

    if (!['pendiente', 'en-progreso', 'completada'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'El status debe ser: pendiente, en-progreso o completada' },
        { status: 400 }
      );
    }

    const progressStatus = [{ status, date: new Date() }];
    const userObjectId = toObjectId(userId);

    const task = await Task.create({
      title,
      description,
      progressStatus,
      status: 'active',
      dueDate: new Date(dueDate),
      comments: comments || '',
      responsible: responsible || '',
      tags: tags || [],
      user: userObjectId,
    });

    const populatedTask = await Task.findById(task._id).populate('user', 'name phone address').lean();

    return NextResponse.json(
      { success: true, data: populatedTask },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
