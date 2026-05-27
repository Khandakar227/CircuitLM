import mongoose, { Schema, Document } from 'mongoose';

export interface ICircuitDataset extends Document {
    prompt: string;
    generatedJson: any;
    fixedJson: any;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        version: string;
        totalComponents: number;
        totalConnections: number;
        createdBy?: string;
    };
    annotations: {
        corrections: {
            field: string;
            oldValue: any;
            newValue: any;
            reason: string;
        }[];
        notes: string;
    };
}

const CircuitDatasetSchema: Schema = new Schema({
    prompt: { type: String, required: true },
    generatedJson: { type: Schema.Types.Mixed, required: true },
    fixedJson: { type: Schema.Types.Mixed },
    metadata: {
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        version: String,
        totalComponents: Number,
        totalConnections: Number,
        createdBy: String
    },
    annotations: {
        corrections: [{
            field: String,
            oldValue: Schema.Types.Mixed,
            newValue: Schema.Types.Mixed,
            reason: String
        }],
        notes: String
    }
});

export default mongoose.models.CircuitDataset ||
    mongoose.model<ICircuitDataset>('CircuitDataset', CircuitDatasetSchema);