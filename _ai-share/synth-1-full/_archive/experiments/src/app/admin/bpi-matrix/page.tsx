'use client';
import React from 'react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Save, PlusCircle, Edit, Trash2, Info, Copy } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  detailedMatrixParameters as initialDetailedMatrixParameters,
  segments as initialSegments,
  matrixData as initialMatrixData,
  parameters as initialParameters,
  valueClasses,
  highlightClasses,
} from '@/lib/bpi-matrix-data';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter as DialogFooterComponent,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClassifierDialog } from '@/components/admin/classifier-dialog';
import { ParameterGroupsDialog } from '@/components/admin/bpi-matrix/parameter-groups-dialog';
import { CreateParameterDialog } from '@/components/admin/bpi-matrix/create-parameter-dialog';

export default function BPIMatrixPage() {
  const { toast } = useToast();
  const [parameters, setParameters] = useState(initialParameters);
  const [segments, setSegments] = useState(initialSegments);
  const [matrixData, setMatrixData] = useState(initialMatrixData);
  const [detailedMatrixParameters, setDetailedMatrixParameters] = useState(
    initialDetailedMatrixParameters
  );

  // New state from previous request
  const [classificationData, setClassificationData] = useState(
    initialSegments.map((s, i) => ({
      id: i + 1,
      group: s.group || 'Без группы',
      segment: s.name,
      description: s.description,
    }))
  );

  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [activeSegments, setActiveSegments] = useState<boolean[]>(() =>
    Array(segments.length).fill(true)
  );

  const [isCreateSegmentDialogOpen, setIsCreateSegmentDialogOpen] = useState(false);
  const [isCreateParameterDialogOpen, setIsCreateParameterDialogOpen] = useState(false);

  const [newSegment, setNewSegment] = useState({ name: '', description: '', group: '' });

  const [isClassifierOpen, setIsClassifierOpen] = useState(false);
  const [isParamGroupsOpen, setIsParamGroupsOpen] = useState(false);

  const [editingOption, setEditingOption] = useState<{
    paramIndex: number;
    optionIndex: number;
  } | null>(null);
  const [editingOptionValue, setEditingOptionValue] = useState('');

  const segmentGroups = useMemo(
    () => [...new Set(classificationData.map((c) => c.group))],
    [classificationData]
  );

  const handleMatrixDataChange = (paramIndex: number, segmentIndex: number, value: string) => {
    const newData = [...matrixData];
    newData[paramIndex].values[segmentIndex] = value;
    setMatrixData(newData);
  };

  const handleScoreChange = (
    paramIndex: number,
    optionIndex: number,
    segmentIndex: number,
    value: string
  ) => {
    const newScore = parseFloat(value) / 100;
    if (isNaN(newScore) || newScore < 0 || newScore > 1) return;

    const newMatrixData = [...matrixData];
    if (!newMatrixData[paramIndex].scores) {
      newMatrixData[paramIndex].scores = [];
    }
    if (!newMatrixData[paramIndex].scores[optionIndex]) {
      newMatrixData[paramIndex].scores[optionIndex] = Array(segments.length).fill(0);
    }
    newMatrixData[paramIndex].scores[optionIndex][segmentIndex] = newScore;
    setMatrixData(newMatrixData);
  };

  const handleSave = () => {
    toast({
      title: 'Логика сохранена',
      description: 'Изменения в матрицах были успешно сохранены (симуляция).',
    });
  };

  const handleCreateNewSegment = () => {
    if (!newSegment.name || !newSegment.group) return;
    const newId = `S${segments.length + 1}`;
    const newSeg = {
      code: newId,
      name: newSegment.name,
      description: newSegment.description,
      group: newSegment.group,
    };
    setSegments((prev) => [...prev, newSeg]);
    setClassificationData((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        group: newSegment.group,
        segment: newSegment.name,
        description: newSegment.description,
      },
    ]);
    setActiveSegments((prev) => [...prev, true]);
    setMatrixData((prev) =>
      prev.map((row) => ({
        ...row,
        values: [...row.values, '–'],
        scores: row.scores ? row.scores.map((sRow) => [...sRow, 0]) : [],
      }))
    );

    setIsCreateSegmentDialogOpen(false);
    setNewSegment({ name: '', description: '', group: '' });
  };

  const handleCreateNewParameter = (newParameterData: any) => {
    const { name, group, weights, options } = newParameterData;
    const newId = `P${parameters.length + 1}`;
    setParameters((prev) => [...prev, { id: newId, name: name, group: group, description: '' }]);
    setDetailedMatrixParameters((prev) => [
      ...prev,
      {
        id: newId,
        name: name,
        options: options.map((opt: any) => ({ label: opt.label, value: 0 })),
      },
    ]);
    setMatrixData((prev) => [
      ...prev,
      {
        name: name,
        values: weights,
        scores: options.map((opt: any) => opt.scores.map((s: number) => s / 100)),
      },
    ]);

    setIsCreateParameterDialogOpen(false);
  };

  const addOption = (paramIndex: number) => {
    const newDetailedParams = [...detailedMatrixParameters];
    if (!newDetailedParams[paramIndex].options) {
      newDetailedParams[paramIndex].options = [];
    }
    newDetailedParams[paramIndex].options.push({ label: 'Новый вариант', value: 0 });
    setDetailedMatrixParameters(newDetailedParams);

    const newMatrixData = [...matrixData];
    if (!newMatrixData[paramIndex].scores) {
      newMatrixData[paramIndex].scores = [];
    }
    newMatrixData[paramIndex].scores.push(Array(segments.length).fill(0));
    setMatrixData(newMatrixData);
  };

  const deleteOption = (paramIndex: number, optionIndex: number) => {
    const newDetailedParams = [...detailedMatrixParameters];
    newDetailedParams[paramIndex].options.splice(optionIndex, 1);
    setDetailedMatrixParameters(newDetailedParams);

    const newMatrixData = [...matrixData];
    if (newMatrixData[paramIndex].scores) {
      newMatrixData[paramIndex].scores.splice(optionIndex, 1);
    }
    setMatrixData(newMatrixData);
  };

  const saveOption = (paramIndex: number, optionIndex: number) => {
    const newDetailedParams = [...detailedMatrixParameters];
    newDetailedParams[paramIndex].options[optionIndex].label = editingOptionValue;
    setDetailedMatrixParameters(newDetailedParams);
    setEditingOption(null);
  };

  const getParamWeightForSegment = (paramIndex: number, segmentIndex: number | null) => {
    if (segmentIndex === null) return null;
    const value = matrixData[paramIndex]?.values[segmentIndex];
    return value ? value.charAt(0) : null;
  };

  const getFitHighlightClass = (fitScore: number) => {
    if (fitScore >= 0.85) return 'bg-green-500/30';
    if (fitScore >= 0.6) return 'bg-yellow-500/20';
    if (fitScore > 0.3) return 'bg-orange-500/10';
    return 'bg-muted/10';
  };

  const handleToggleSegment = (index: number) => {
    setActiveSegments((prev) => {
      const newActive = [...prev];
      newActive[index] = !newActive[index];
      return newActive;
    });
  };

  return (
    <TooltipProvider>
      <CabinetPageContent maxWidth="full" className="space-y-4">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-base font-bold">
              Матрица Brand Positioning Index (BPI)
            </h1>
            <p className="text-muted-foreground">
              Эта матрица используется для классификации брендов на основе их ключевых параметров.
            </p>
          </div>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Сохранить изменения
          </Button>
        </header>
        <div className="mt-4 space-y-1 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Легенда важности параметра по сегменту:</p>
          <p>
            <span className="inline-block w-6 font-bold text-red-500">R</span> — Required
            (критически важен, вес 3)
          </p>
          <p>
            <span className="inline-block w-6 font-bold text-orange-500">O</span> — Optional (важен,
            вес 2)
          </p>
          <p>
            <span className="inline-block w-6 font-bold text-yellow-500">Y</span> — Secondary
            (второстепенный, вес 1)
          </p>
          <p>
            <span className="inline-block w-6 font-bold">–</span> — Не релевантно (вес 0)
          </p>
          <p className="mt-2 text-xs">
            *Для P8 (Discount Intensity) значение R означает высокую скидочную активность, а Y —
            низкую.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() => setIsParamGroupsOpen(true)}
              >
                <CardTitle className="hover:underline">Параметры (P)</CardTitle>
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {parameters.map((p, index) => {
                  const weight = getParamWeightForSegment(index, selectedSegment);
                  const styleClass = weight ? highlightClasses[weight] : '';
                  return (
                    <Tooltip key={p.id}>
                      <TooltipTrigger asChild>
                        <li
                          className={cn('cursor-help rounded-md p-1 transition-colors', styleClass)}
                        >
                          <span className="inline-block w-8 font-mono font-semibold">{p.id}</span>
                          {p.name}
                        </li>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{p.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateParameterDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Создать параметр
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => setIsClassifierOpen(true)}
                >
                  <CardTitle className="hover:underline">Справочник сегментов (S)</CardTitle>
                </Button>
                {selectedSegment !== null && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSegment(null)}>
                    <X className="mr-1 h-4 w-4" />
                    Сбросить
                  </Button>
                )}
              </div>
              <CardDescription>Отключите сегменты, чтобы исключить их из расчетов.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {segments.map((s, index) => (
                  <li
                    key={s.code}
                    className={cn(
                      'flex items-center gap-2 rounded-md p-1 transition-colors',
                      selectedSegment === index && 'bg-secondary'
                    )}
                  >
                    <Checkbox
                      id={`segment-${s.code}`}
                      checked={activeSegments[index]}
                      onCheckedChange={() => handleToggleSegment(index)}
                    />
                    <label
                      htmlFor={`segment-${s.code}`}
                      className="flex-1 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedSegment(index);
                      }}
                    >
                      <span className="inline-block w-8 font-mono font-semibold">{s.code}</span>
                      {s.name}
                    </label>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateSegmentDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Создать сегмент
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Матрица весов</CardTitle>
            <CardDescription>
              Значения R/O/Y/– определяют важность каждого параметра для попадания в тот или иной
              сегмент.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[1200px] table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-10 w-20 bg-background/95 text-center">
                      Параметр
                    </TableHead>
                    {segments.map((segment, index) => (
                      <TableHead
                        key={segment.code}
                        className={cn(
                          'w-12 p-0 text-center transition-opacity',
                          !activeSegments[index] && 'opacity-40'
                        )}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="flex h-full w-full cursor-pointer items-center justify-center p-3.5"
                              onClick={() => setSelectedSegment(index)}
                            >
                              {segment.code}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-bold">{segment.name}</p>
                            <p className="text-xs text-muted-foreground">{segment.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrixData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="sticky left-0 z-10 bg-background/95 p-0 text-center text-xs font-medium">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex h-full w-full cursor-help items-center justify-center p-2 font-mono">
                              {parameters[rowIndex]?.id}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{parameters[rowIndex]?.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      {row.values.map((value, index) => {
                        const isSpecialCase = rowIndex === 7 && index === 19; // P8, S20
                        const cellClass = valueClasses[value.charAt(0)] || '';
                        return (
                          <TableCell
                            key={index}
                            className={cn(
                              'p-0 text-center font-mono text-xs transition-opacity',
                              !activeSegments[index] && 'opacity-40'
                            )}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Select
                                  value={value}
                                  onValueChange={(v) => handleMatrixDataChange(rowIndex, index, v)}
                                >
                                  <SelectTrigger
                                    className={cn(
                                      'h-auto border-none p-2 text-center font-mono focus:ring-0',
                                      cellClass
                                    )}
                                  >
                                    <SelectValue> {isSpecialCase ? 'R*' : value} </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="R">R</SelectItem>
                                    <SelectItem value="O">O</SelectItem>
                                    <SelectItem value="Y">Y</SelectItem>
                                    <SelectItem value="–">–</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TooltipTrigger>
                              {isSpecialCase && (
                                <TooltipContent>
                                  <p>Низкая интенсивность скидок → Стабильность</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Детализированная матрица (Fit Score)</CardTitle>
            <CardDescription>
              Насколько каждый вариант ответа соответствует "идеальному" профилю сегмента (от 0 до
              100). Чем зеленее, тем лучше.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[1600px] table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-10 w-20 bg-background/95 text-center">
                      Параметр
                    </TableHead>
                    <TableHead className="sticky left-[5rem] z-10 w-64 bg-background/95 text-left">
                      Вариант ответа
                    </TableHead>
                    {segments.map((segment, index) => (
                      <TableHead
                        key={segment.code}
                        className={cn(
                          'w-12 p-0 text-center transition-opacity',
                          !activeSegments[index] && 'opacity-40'
                        )}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex h-full w-full cursor-default items-center justify-center p-3.5">
                              {segment.code}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-bold">{segment.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailedMatrixParameters.map((param, paramIndex) => (
                    <React.Fragment key={param.id}>
                      {(param.options || []).map((option, optionIndex) => (
                        <TableRow key={`${param.id}-${optionIndex}`}>
                          {optionIndex === 0 && (
                            <TableCell
                              rowSpan={(param.options || []).length + 1}
                              className="sticky left-0 z-10 bg-background/95 p-0 pt-2 text-center align-top text-xs font-medium"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="h-full w-full cursor-help p-2 font-mono">
                                    {param.id}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{param.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          )}
                          <TableCell className="group sticky left-[5rem] z-10 flex items-center justify-between bg-background/95 text-xs">
                            {editingOption?.paramIndex === paramIndex &&
                            editingOption?.optionIndex === optionIndex ? (
                              <Input
                                value={editingOptionValue}
                                onChange={(e) => setEditingOptionValue(e.target.value)}
                                autoFocus
                                onBlur={() => saveOption(paramIndex, optionIndex)}
                                onKeyDown={(e) =>
                                  e.key === 'Enter' && saveOption(paramIndex, optionIndex)
                                }
                              />
                            ) : (
                              <span>{option.label}</span>
                            )}
                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  setEditingOption({ paramIndex, optionIndex });
                                  setEditingOptionValue(option.label);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => deleteOption(paramIndex, optionIndex)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                          {(
                            matrixData[paramIndex]?.scores?.[optionIndex] ||
                            Array(segments.length).fill(0)
                          ).map((score, segmentIndex) => (
                            <TableCell
                              key={segmentIndex}
                              className={cn(
                                'p-0 text-center transition-opacity',
                                getFitHighlightClass(score),
                                !activeSegments[segmentIndex] && 'opacity-40'
                              )}
                            >
                              <Input
                                type="number"
                                value={Math.round(score * 100)}
                                onChange={(e) =>
                                  handleScoreChange(
                                    paramIndex,
                                    optionIndex,
                                    segmentIndex,
                                    e.target.value
                                  )
                                }
                                className="h-auto w-full border-none bg-transparent p-2 text-center text-xs focus-visible:ring-1 focus-visible:ring-ring"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      <TableRow>
                        {param.options.length === 0 && (
                          <TableCell className="sticky left-0 z-10 bg-background/95"></TableCell>
                        )}
                        <TableCell
                          className="sticky left-[5rem] z-10 bg-background/95 text-xs"
                          colSpan={param.options.length > 0 ? 1 : 2}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => addOption(paramIndex)}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" /> Добавить вариант
                          </Button>
                        </TableCell>
                        <TableCell colSpan={segments.length}></TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </CabinetPageContent>

      <Dialog open={isCreateSegmentDialogOpen} onOpenChange={setIsCreateSegmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новый сегмент</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-group">Группа сегмента</Label>
              <Select
                onValueChange={(value) => setNewSegment((prev) => ({ ...prev, group: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите группу..." />
                </SelectTrigger>
                <SelectContent>
                  {segmentGroups.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">Создать новую группу...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-name">Название</Label>
              <Input
                id="item-name"
                value={newSegment.name}
                onChange={(e) => setNewSegment((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-description">Описание</Label>
              <Textarea
                id="item-description"
                value={newSegment.description}
                onChange={(e) =>
                  setNewSegment((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooterComponent>
            <Button variant="outline" onClick={() => setIsCreateSegmentDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateNewSegment}>Создать</Button>
          </DialogFooterComponent>
        </DialogContent>
      </Dialog>

      <CreateParameterDialog
        isOpen={isCreateParameterDialogOpen}
        onOpenChange={setIsCreateParameterDialogOpen}
        parameterGroups={useMemo(() => [...new Set(parameters.map((p) => p.group))], [parameters])}
        segments={segments}
        onSave={handleCreateNewParameter}
      />

      <ClassifierDialog
        isOpen={isClassifierOpen}
        onOpenChange={setIsClassifierOpen}
        classificationData={classificationData}
      />

      <ParameterGroupsDialog
        isOpen={isParamGroupsOpen}
        onOpenChange={setIsParamGroupsOpen}
        parameters={parameters}
      />
    </TooltipProvider>
  );
}
