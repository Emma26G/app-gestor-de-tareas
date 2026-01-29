import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import mongoose from 'mongoose';
import { isValidObjectId, toObjectId } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const userId = request.headers.get('x-user-id');
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de tarea no válido' },
        { status: 400 }
      );
    }

    const taskId = toObjectId(id);

    const task = await Task.findOne({ _id: taskId, status: { $ne: 'deleted' } })
      .populate('user', 'name phone address')
      .lean();

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    let isOwner = false;
    if (userId && isValidObjectId(userId)) {
      const userObjectId = toObjectId(userId);
      const taskUserId = typeof task.user === 'object' && task.user !== null && '_id' in task.user
        ? task.user._id.toString()
        : task.user ? String(task.user) : undefined;
      isOwner = taskUserId === userObjectId.toString();
    }

    return NextResponse.json(
      { 
        success: true, 
        data: {
          ...task,
          isOwner
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const userId = request.headers.get('x-user-id');
    const { id } = params;
    const body = await request.json();

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json(
        { success: false, error: 'Usuario no válido o no proporcionado' },
        { status: 400 }
      );
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de tarea no válido' },
        { status: 400 }
      );
    }

    const { title, description, status, dueDate, comments, responsible, tags, progressStatus } = body;

    const userObjectId = toObjectId(userId);
    const taskId = toObjectId(id);

    const existingTask = await Task.findOne({ _id: taskId, user: userObjectId });
    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    if (status && !['pendiente', 'en-progreso', 'completada'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'El status debe ser: pendiente, en-progreso o completada' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (comments !== undefined) updateData.comments = comments;
    if (responsible !== undefined) updateData.responsible = responsible;
    if (tags !== undefined) updateData.tags = tags;
    
    if (status !== undefined) {
      const currentProgressStatus = existingTask.progressStatus || [];
      const lastStatus = currentProgressStatus[currentProgressStatus.length - 1];
      
      if (!lastStatus || lastStatus.status !== status) {
        updateData.progressStatus = [
          ...currentProgressStatus,
          { status, date: new Date() }
        ];
      }
    }
    
    if (progressStatus !== undefined) {
      updateData.progressStatus = progressStatus;
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name phone address');

    return NextResponse.json(
      { success: true, data: task },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const userId = request.headers.get('x-user-id');
    const { id } = params;

    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json(
        { success: false, error: 'Usuario no válido o no proporcionado' },
        { status: 400 }
      );
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de tarea no válido' },
        { status: 400 }
      );
    }

    const userObjectId = toObjectId(userId);
    const taskId = toObjectId(id);

    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: userObjectId },
      { status: 'deleted' },
      { new: true }
    );

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Tarea eliminada correctamente' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
