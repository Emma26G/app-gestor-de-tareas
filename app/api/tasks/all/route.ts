import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const tasks = await Task.find({ status: { $ne: 'deleted' } })
      .populate('user', 'name phone address')
      .sort({ createdAt: -1 })
      .select('title description progressStatus status dueDate tags responsible user createdAt')
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
