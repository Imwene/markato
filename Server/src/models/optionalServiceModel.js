import { Schema, model } from 'mongoose';

const optionalServiceSchema = new Schema({
    id: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
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
  
  export const OptionalService = model('OptionalService', optionalServiceSchema);