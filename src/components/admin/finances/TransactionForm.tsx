import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Euro, TrendingUp, TrendingDown } from 'lucide-react';
import { TransactionFormData } from '@/types/finances';
import { useFinances } from '@/hooks/useFinances';

const transactionSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  amount: z.number().min(0.01, 'Le montant doit être positif'),
  type: z.enum(['income', 'expense'] as const),
  description: z.string().optional(),
});

type FormData = z.infer<typeof transactionSchema>;

export const TransactionForm = () => {
  const [document, setDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTransaction } = useFinances();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'income'
    }
  });

  const watchedType = watch('type');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setDocument(file || null);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    const formData: TransactionFormData = {
      title: data.title,
      amount: data.amount,
      type: data.type,
      description: data.description,
      document: document || undefined
    };

    const success = await addTransaction(formData);
    
    if (success) {
      reset();
      setDocument(null);
      // Reset file input
      const fileInput = window.document.getElementById('document') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Transaction Type */}
      <div className="space-y-3">
        <Label htmlFor="type" className="text-base font-medium">Type de transaction</Label>
        <RadioGroup
          value={watchedType}
          onValueChange={(value) => setValue('type', value as 'income' | 'expense')}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="income" id="income" />
            <Label htmlFor="income" className="flex items-center gap-2 cursor-pointer">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Recette
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expense" id="expense" />
            <Label htmlFor="expense" className="flex items-center gap-2 cursor-pointer">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Dépense
            </Label>
          </div>
        </RadioGroup>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          placeholder="Ex: Cotisation membre, Achat équipement..."
          {...register('title')}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Montant (€) *</Label>
        <div className="relative">
          <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="pl-10"
            {...register('amount', { valueAsNumber: true })}
            aria-describedby={errors.amount ? "amount-error" : undefined}
          />
        </div>
        {errors.amount && (
          <p id="amount-error" className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <Textarea
          id="description"
          placeholder="Détails supplémentaires..."
          rows={3}
          {...register('description')}
        />
      </div>

      {/* Document Upload */}
      <div className="space-y-2">
        <Label htmlFor="document">Document justificatif (optionnel)</Label>
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                {document ? (
                  <>
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">{document.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span className="text-sm">Cliquez pour uploader un document</span>
                  </>
                )}
              </div>
              <Input
                id="document"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                PDF, DOC, DOCX, JPG, PNG (max 10MB)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer la Transaction'}
      </Button>
    </form>
  );
};