import { NextRequest, NextResponse } from 'next/server';
import CircuitDataset from '@/models/CircuitDataset';
import { dbConnect } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const newEntry = new CircuitDataset({
            ...body,
            metadata: {
                ...body.metadata,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        await newEntry.save();
        return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
    } catch (error) {
        console.error('Error saving to dataset:', error);
        return NextResponse.json({ error: 'Failed to save dataset entry' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const page = parseInt(searchParams.get('page') || '1');

        const entries = await CircuitDataset.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await CircuitDataset.countDocuments();

        return NextResponse.json({
            data: entries,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching dataset:', error);
        return NextResponse.json({ error: 'Failed to fetch dataset' }, { status: 500 });
    }
}