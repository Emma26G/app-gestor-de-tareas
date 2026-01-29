import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IProgressStatus {
  status: 'pendiente' | 'en-progreso' | 'completada';
  date: Date;
}

export interface ITask extends Document {
  title: string;
  description: string;
  progressStatus: IProgressStatus[];
  status: 'active' | 'inactive' | 'deleted';
  dueDate: Date;
  comments?: string;
  responsible?: string;
  tags?: string[];
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressStatusSchema = new Schema({
  status: {
    type: String,
    enum: ['pendiente', 'en-progreso', 'completada'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { _id: false });

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },
    progressStatus: {
      type: [ProgressStatusSchema],
      required: [true, 'El estatus de progreso es obligatorio'],
      default: [{ status: 'pendiente', date: Date.now }],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'deleted'],
      required: [true, 'El estatus es obligatorio'],
      default: 'active',
    },
    dueDate: {
      type: Date,
      required: [true, 'La fecha de entrega es obligatoria'],
    },
    comments: {
      type: String,
      trim: true,
    },
    responsible: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio'],
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Task) {
  delete mongoose.models.Task;
}

const Task: Model<ITask> = mongoose.model<ITask>('Task', TaskSchema);

export default Task;
