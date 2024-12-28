import { Schema, model } from 'mongoose';

const scentSchema = new Schema({
    id: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }, { timestamps: true });
  
  export const Scent = model('Scent', scentSchema);