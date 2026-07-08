'use client';

import React, { useState } from 'react';
import { Upload, File, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function VendorDocumentUpload() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; date: string }[]>([]);

  const handleUpload = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      setUploadedFiles((prev) => [
        { name: `certificate_${Date.now()}.pdf`, date: new Date().toISOString() },
        ...prev,
      ]);
      toast({
        title: 'Успешно',
        description: 'Документ загружен и отправлен на проверку.',
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Загрузка документов</CardTitle>
        <CardDescription className="text-xs">
          Загрузите сертификаты (ISO, OEKO-TEX) или результаты аудита.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-border-default bg-bg-surface2/30 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center">
          <Upload className="text-text-muted mb-2 h-8 w-8" />
          <p className="text-text-primary mb-1 text-sm font-medium">Перетащите файлы сюда</p>
          <p className="text-text-muted mb-4 text-xs">PDF, JPG, PNG до 10MB</p>
          <Button onClick={handleUpload} disabled={isUploading} size="sm">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              'Выбрать файл'
            )}
          </Button>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
              Недавние загрузки
            </h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="border-border-subtle bg-bg-surface flex items-center justify-between rounded border p-2"
                >
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-blue-500" />
                    <span className="text-text-primary text-xs font-medium">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-[10px]">
                      {new Date(file.date).toLocaleDateString()}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
