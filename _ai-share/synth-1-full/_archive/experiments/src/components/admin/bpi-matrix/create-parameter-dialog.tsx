'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { SegmentInfo } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { valueClasses } from '@/lib/bpi-matrix-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CreateParameterDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  parameterGroups: string[];
  segments: SegmentInfo[];
  onSave: (data: any) => void;
}

const defaultScores: Record<string, number> = {
  R: 85,
  O: 60,
  Y: 35,
  '–': 10,
};

export function CreateParameterDialog({
  isOpen,
  onOpenChange,
  parameterGroups,
  segments,
  onSave,
}: CreateParameterDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [group, setGroup] = useState('');
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [newGroup, setNewGroup] = useState('');
  const [options, setOptions] = useState<{ label: string; scores: number[] }[]>([]);
  const [weights, setWeights] = useState<string[]>(Array(segments.length).fill('–'));

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setGroup('');
      setIsNewGroup(false);
      setNewGroup('');
      setOptions([]);
      setWeights(Array(segments.length).fill('–'));
    }
  }, [isOpen, segments.length]);

  const addOption = () => {
    const defaultScoresArray = weights.map((w) => defaultScores[w]);
    setOptions([...options, { label: '', scores: defaultScoresArray }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOptionLabel = (index: number, label: string) => {
    const newOptions = [...options];
    newOptions[index].label = label;
    setOptions(newOptions);
  };

  const updateWeight = (segmentIndex: number, weight: string) => {
    const newWeights = [...weights];
    newWeights[segmentIndex] = weight;
    setWeights(newWeights);

    // Update default scores for all options based on new weight
    setOptions((prevOptions) =>
      prevOptions.map((opt) => {
        const newScores = [...opt.scores];
        newScores[segmentIndex] = defaultScores[weight];
        return { ...opt, scores: newScores };
      })
    );
  };

  const updateScore = (optionIndex: number, segmentIndex: number, score: number) => {
    const newOptions = [...options];
    if (score >= 0 && score <= 100) {
      newOptions[optionIndex].scores[segmentIndex] = score;
      setOptions(newOptions);
    }
  };

  const handleSave = () => {
    const finalGroup = isNewGroup ? newGroup : group;
    if (!name || !finalGroup) {
      // Add validation feedback
      return;
    }
    onSave({ name, description, group: finalGroup, weights, options });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] flex-col sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Создать новый параметр</DialogTitle>
          <DialogDescription>
            Заполните информацию о новом параметре, его веса для сегментов и варианты ответов.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-hidden">
          <ScrollArea className="-mr-6 h-full pr-4">
            <div className="space-y-6 px-1 py-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="param-name">Название</Label>
                  <Input id="param-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Группа</Label>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(v) => {
                        setGroup(v);
                        setIsNewGroup(v === 'new');
                      }}
                      value={isNewGroup ? 'new' : group}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите группу..." />
                      </SelectTrigger>
                      <SelectContent>
                        {parameterGroups.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                        <SelectItem value="new">Создать новую группу...</SelectItem>
                      </SelectContent>
                    </Select>
                    {isNewGroup && (
                      <Input
                        placeholder="Название новой группы"
                        value={newGroup}
                        onChange={(e) => setNewGroup(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="param-desc">Описание</Label>
                <Textarea
                  id="param-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Матрица весов для нового параметра</Label>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {segments.map((s) => (
                          <TableHead key={s.code} className="p-1 text-center font-mono text-xs">
                            {s.code}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        {weights.map((w, i) => (
                          <TableCell key={i} className="p-0">
                            <Select value={w} onValueChange={(v) => updateWeight(i, v)}>
                              <SelectTrigger
                                className={cn(
                                  'h-auto border-none p-2 text-center font-mono focus:ring-0',
                                  valueClasses[w]
                                )}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="R">R</SelectItem>
                                <SelectItem value="O">O</SelectItem>
                                <SelectItem value="Y">Y</SelectItem>
                                <SelectItem value="–">–</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Варианты ответов и Fit Score</Label>
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить ответ
                  </Button>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Вариант ответа</TableHead>
                        {segments.map((s) => (
                          <TableHead key={s.code} className="p-1 text-center font-mono text-xs">
                            {s.code}
                          </TableHead>
                        ))}
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {options.map((opt, optIndex) => (
                        <TableRow key={optIndex}>
                          <TableCell className="p-1">
                            <Input
                              value={opt.label}
                              onChange={(e) => updateOptionLabel(optIndex, e.target.value)}
                              placeholder={`Вариант ${optIndex + 1}`}
                            />
                          </TableCell>
                          {opt.scores.map((score, segIndex) => (
                            <TableCell key={segIndex} className="p-1">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={score}
                                onChange={(e) =>
                                  updateScore(optIndex, segIndex, parseInt(e.target.value))
                                }
                                className="h-8 w-12 text-center"
                              />
                            </TableCell>
                          ))}
                          <TableCell className="p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeOption(optIndex)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить параметр</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
