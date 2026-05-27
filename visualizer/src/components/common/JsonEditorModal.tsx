"use client"

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, Eye, Pencil, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { CircuitData } from '@/types/circuit';

interface JsonEditorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: {
        prompt: string;
        generatedJson: any;
        fixedJson: any;
        metadata: CircuitData['metadata'];
    };
    onSave: (fixedJson: any, annotations: any) => void;
    emitChangedJson?: (jsonString: string) => void;
}

export default function JsonEditorModal({
    open,
    onOpenChange,
    initialData,
    onSave,
    emitChangedJson
}: JsonEditorModalProps) {
    const [editMode, setEditMode] = useState(true);
    const [jsonString, setJsonString] = useState(JSON.stringify(initialData.fixedJson || initialData.generatedJson, null, 2));
    const [annotations, setAnnotations] = useState({
        corrections: [] as any[],
        notes: ''
    });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setJsonString(JSON.stringify(initialData.fixedJson || initialData.generatedJson, null, 2));
        setAnnotations({
            corrections: [],
            notes: ''
        });
        setEditMode(true);
    }, [initialData]);

    useEffect(() => {
        if (editMode && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [editMode]);


    const handleSave = () => {
        try {
            const parsedJson = JSON.parse(jsonString);
            onSave(parsedJson, annotations);
            toast.success('Dataset entry saved successfully');
            onOpenChange(false);
        } catch (error) {
            toast.error('Invalid JSON format');
        }
    };

    const handleJsonChange = (value: string) => {
        setJsonString(value);
        if(emitChangedJson) emitChangedJson(value);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        {editMode ? (
                            <div className="flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-blue-500" />
                                <span>Edit JSON</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-green-500" />
                                <span>View JSON</span>
                            </div>
                        )}
                    </DialogTitle>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={editMode}
                                    onCheckedChange={setEditMode}
                                    id="edit-mode"
                                />
                                <Label htmlFor="edit-mode" className="text-sm font-medium">
                                    Edit Mode
                                </Label>
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                            Prompt: {initialData.prompt.substring(0, 50)}...
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto flex flex-col">
                    {editMode ? (
                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">
                                    Edit JSON carefully. Syntax errors will prevent saving.
                                </span>
                            </div>
                            <Textarea
                                ref={textareaRef}
                                value={jsonString}
                                onChange={(e) => handleJsonChange(e.target.value)}
                                className="font-mono text-sm flex-1 resize-none border-2 border-gray-200 focus:border-blue-500 min-h-[300px]"
                                spellCheck={false}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto bg-gray-50 rounded-lg border p-4">
                            <pre className="text-sm font-mono text-gray-800">
                                {jsonString}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 pt-4 border-t">
                    <div>
                        <Label htmlFor="notes" className="text-sm font-medium">
                            Annotations & Notes
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Add notes about corrections made, issues found, or improvements needed..."
                            value={annotations.notes}
                            onChange={(e) => setAnnotations({ ...annotations, notes: e.target.value })}
                            className="mt-2 min-h-[80px]"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                            Document any changes or observations for dataset quality
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="px-6 bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save to Dataset
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}