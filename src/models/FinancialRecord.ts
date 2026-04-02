import mongoose, { Schema, Document } from 'mongoose';

interface IFinancialRecord extends Document {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  isDeleted: boolean;
  updatedAt: Date;
}

const financialRecordSchema = new Schema<IFinancialRecord>(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    type: {
      type: String,
      enum: ['INCOME', 'EXPENSE'],
      required: [true, 'Type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
  },
  {
    timestamps: true,
  }
);

financialRecordSchema.index({ createdBy: 1 });
financialRecordSchema.index({ type: 1 });
financialRecordSchema.index({ category: 1 });
financialRecordSchema.index({ date: 1 });

export const FinancialRecord = mongoose.model<IFinancialRecord>(
  'FinancialRecord',
  financialRecordSchema
);
