'use client';
import { workshop2DevWarn } from '@/lib/production/workshop2-dev-log';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PhysicalTestLog, TestCategory } from '@/lib/types/material-testing';
import { CheckCircle2, XCircle, Plus, FlaskConical } from 'lucide-react';

interface Workshop2MaterialTestingLogsPanelProps {
  materialId: string;
  collectionId?: string;
  articleId?: string;
}

function buildTestingQuery(input: {
  materialId: string;
  collectionId?: string;
  articleId?: string;
}): string {
  const params = new URLSearchParams({ materialId: input.materialId });
  if (input.collectionId?.trim()) params.set('collectionId', input.collectionId.trim());
  if (input.articleId?.trim()) params.set('articleId', input.articleId.trim());
  return params.toString();
}

export function Workshop2MaterialTestingLogsPanel({
  materialId,
  collectionId,
  articleId,
}: Workshop2MaterialTestingLogsPanelProps) {
  const [logs, setLogs] = useState<PhysicalTestLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [category, setCategory] = useState<TestCategory>('shrinkage');
  const [resultValue, setResultValue] = useState('');
  const [isPass, setIsPass] = useState<'true' | 'false'>('true');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [articleId, collectionId, materialId]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/brand/workshop2/materials/testing?${buildTestingQuery({ materialId, collectionId, articleId })}`
      );
      if (!response.ok) throw new Error('Failed to fetch testing logs');
      const data = (await response.json()) as {
        testingLogs?: PhysicalTestLog[];
        testingLog?: PhysicalTestLog;
      };
      setLogs(data.testingLogs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultValue.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/brand/workshop2/materials/testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId,
          collectionId,
          articleId,
          testCategory: category,
          resultValue,
          isPass: isPass === 'true',
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to add test log');

      const data = (await response.json()) as { testingLog: PhysicalTestLog };
      setLogs([data.testingLog, ...logs]);

      // Reset form
      setResultValue('');
      setNotes('');
      setIsAdding(false);
    } catch (err) {
      workshop2DevWarn('component', 'Error adding test log:', { cause: err });
      // Could add toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Physical Testing</CardTitle>
          <CardDescription>Loading test logs...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Physical Testing</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Physical Testing
          </CardTitle>
          <CardDescription>Log and review material quality tests.</CardDescription>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          variant={isAdding ? 'outline' : 'default'}
          size="sm"
        >
          {isAdding ? (
            'Cancel'
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" /> Log Test
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 space-y-4 rounded-lg border bg-muted/50 p-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Test Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TestCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shrinkage">Shrinkage</SelectItem>
                    <SelectItem value="pilling">Pilling</SelectItem>
                    <SelectItem value="colorfastness">Colorfastness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="result">Result Value</Label>
                <Input
                  id="result"
                  value={resultValue}
                  onChange={(e) => setResultValue(e.target.value)}
                  placeholder="e.g., -2% warp, Grade 4"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Pass / Fail</Label>
                <Select value={isPass} onValueChange={(v: 'true' | 'false') => setIsPass(v)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Pass</SelectItem>
                    <SelectItem value="false">Fail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details about the test..."
                rows={2}
              />
            </div>

            <Button type="submit" disabled={isSubmitting || !resultValue.trim()}>
              {isSubmitting ? 'Saving...' : 'Save Test Log'}
            </Button>
          </form>
        )}

        {logs.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-muted-foreground">
            No physical tests logged yet.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col justify-between rounded-lg border bg-card p-4 sm:flex-row sm:items-center"
              >
                <div className="mb-2 space-y-1 sm:mb-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{log.testCategory}</span>
                    {log.isPass ? (
                      <Badge className="border-green-200 bg-green-500/10 text-green-600 hover:bg-green-500/20">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Pass
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="border-red-200 bg-red-500/10 text-red-600 hover:bg-red-500/20"
                      >
                        <XCircle className="mr-1 h-3 w-3" /> Fail
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Result:</span> {log.resultValue}
                  </div>
                  {log.notes && (
                    <div className="text-sm italic text-muted-foreground">"{log.notes}"</div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground sm:text-right">
                  {new Date(log.testedAt).toLocaleDateString()}
                  <br />
                  {new Date(log.testedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
