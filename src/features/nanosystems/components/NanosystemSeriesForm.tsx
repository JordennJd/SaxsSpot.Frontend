/* eslint-disable */
// @ts-nocheck
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {ParticleKindMap, type CommonParticleGenerationParameters, type GetNanosystemGenerationOptionsQuery, type MassGenerateNanoSystemOptions} from "../api/nanosystemTypes";
import {fetchNanosystemMassGenerationParameters, runMassGeneration} from '../api/nanosystemApi';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useToastContext } from '../../../contexts/ToastContext';

export const NanosystemSeriesForm = () => {
  const { showSuccess, showError } = useToastContext();
  const [sizeInputType, setSizeInputType] = useState<'globalSize' | 'concentration'>('concentration');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GetNanosystemGenerationOptionsQuery>({
    defaultValues: {
      count: 3,
      particleKind: 0,
      epsilonFrom: 1,
      epsilonTo: 1,
      particleCountFrom: 10000,
      particleCountTo: 10000,
      globalSizeFrom: null,
      globalSizeTo: null,
      numericalConcentrationFrom: 0.2,
      numericalConcentrationTo: 0.2,
      excessFrom: 1,
      excessTo: 1.1,
      maxParticleSizeFrom: 3,
      maxParticleSizeTo: 3,
      minParticleSizeFrom: 1,
      minParticleSizeTo: 1,
      kFrom: 2,
      kTo: 2,
      thetaFrom: 3,
      thetaTo: 3
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const particleKind = watch("particleKind");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOptions, setGenerationOptions] = useState<MassGenerateNanoSystemOptions | null>(null);

  const onSubmit = async (data: GetNanosystemGenerationOptionsQuery) => {
    try{
      const result = await fetchNanosystemMassGenerationParameters(data)
        setIsModalOpen(true);
        setGenerationOptions(result);
    }
    catch(e: any){
      const response = await e.response;
      setApiErrors(response.data.errors);
    }
  };

  const handleGenerate = async () => {
    if (!generationOptions) return;
    
    try {
      setIsGenerating(true);
      const runResult = await runMassGeneration(generationOptions)
      showSuccess(
        'Generation Started', 
        `Nanosystem generation job has been queued successfully with ID: ${runResult}`,
        6000
      );

    } catch (error) {
      showError(
        'Generation Failed', 
        error?.message || 'Unable to start nanosystem generation. Please try again.'
      );
      console.error('Start generating failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  const updateOptionField = (index: number, field: keyof CommonParticleGenerationParameters, value: any) => {
    if (!generationOptions) return;
    
    const newOptions = [...generationOptions.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    };
    
    setGenerationOptions({
      ...generationOptions,
      options: newOptions
    });
  };

  const getError = (fieldName: keyof GetNanosystemGenerationOptionsQuery) => 
    errors[fieldName]?.message || apiErrors[fieldName]?.[0];

  return (
<>
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Nanosystem Parameters
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Count */}
          <div>
            <Label htmlFor="count">Count</Label>
            <Input
              id="count"
              type="number"
              {...register("count", { valueAsNumber: true })}
              error={getError("count")}
            />
          </div>

          <div>
            <Label>Particle Kind</Label>
            <div className="flex space-x-4 mt-1">
              {Object.entries(ParticleKindMap).map(([value, label]) => (
                <label key={value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={value}
                    {...register("particleKind")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Particle Count Range */}
          <div className="md:col-span-2 border-t pt-4">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
              Particle Count Range
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="particleCountFrom">From</Label>
                <Input
                  id="particleCountFrom"
                  type="number"
                  {...register("particleCountFrom", { valueAsNumber: true })}
                  error={getError("particleCountFrom")}
                />
              </div>
              <div>
                <Label htmlFor="ParticleCountTo">To</Label>
                <Input
                  id="particleCountTo"
                  type="number"
                  {...register("particleCountTo", { valueAsNumber: true })}
                  error={getError("particleCountTo")}
                />
              </div>
            </div>
          </div>

          {/* Size Parameters */}
          <div className="md:col-span-2 border-t pt-4">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
              Size Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="maxParticleSizeFrom">Max Size From</Label>
                <Input
                  id="maxParticleSizeFrom"
                  type="number"
                  step="0.01"
                  {...register("maxParticleSizeFrom", { valueAsNumber: true })}
                  error={getError("maxParticleSizeFrom")}
                />
              </div>
              <div>
                <Label htmlFor="MaxParticleSizeTo">Max Size To</Label>
                <Input
                  id="maxParticleSizeTo"
                  type="number"
                  step="0.01"
                  {...register("maxParticleSizeTo", { valueAsNumber: true })}
                  error={getError("maxParticleSizeTo")}
                />
              </div>
              <div>
                <Label htmlFor="minParticleSizeFrom">Min Size From</Label>
                <Input
                  id="minParticleSizeFrom"
                  type="number"
                  step="0.01"
                  {...register("minParticleSizeFrom", { valueAsNumber: true })}
                  error={getError("minParticleSizeFrom")}
                />
              </div>
              <div>
                <Label htmlFor="MinParticleSizeTo">Min Size To</Label>
                <Input
                  id="minParticleSizeTo"
                  type="number"
                  step="0.01"
                  {...register("minParticleSizeTo", { valueAsNumber: true })}
                  error={getError("minParticleSizeTo")}
                />
              </div>
            </div>
          </div>

          {/* Size/Concentration Toggle */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  checked={sizeInputType === 'concentration'}
                  onChange={() => setSizeInputType('concentration')}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Use Concentration</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  checked={sizeInputType === 'globalSize'}
                  onChange={() => setSizeInputType('globalSize')}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Use Global Size</span>
              </label>
            </div>

            {sizeInputType === 'concentration' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="NumericalConcentrationFrom">Concentration From</Label>
                  <Input
                    id="NumericalConcentrationFrom"
                    type="number"
                    step="0.0001"
                    {...register("numericalConcentrationFrom", { valueAsNumber: true })}
                    error={getError("numericalConcentrationFrom")}
                  />
                </div>
                <div>
                  <Label htmlFor="NumericalConcentrationTo">Concentration To</Label>
                  <Input
                    id="NumericalConcentrationTo"
                    type="number"
                    step="0.0001"
                    {...register("numericalConcentrationTo", { valueAsNumber: true })}
                    error={getError("numericalConcentrationTo")}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="globalSizeFrom">Global Size From</Label>
                  <Input
                    id="globalSizeFrom"
                    type="number"
                    step="0.01"
                    {...register("globalSizeFrom", { valueAsNumber: true })}
                    error={getError("globalSizeFrom")}
                  />
                </div>
                <div>
                  <Label htmlFor="globalSizeTo">Global Size To</Label>
                  <Input
                    id="globalSizeTo"
                    type="number"
                    step="0.01"
                    {...register("globalSizeTo", { valueAsNumber: true })}
                    error={getError("globalSizeTo")}
                  />
                </div>
              </div>
            )}
          </div>

          {particleKind !== 0 && (
            <div className="md:col-span-2 border-t pt-4">
              <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
                Epsilon Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="EpsilonFrom">Epsilon From</Label>
                  <Input
                    id="EpsilonFrom"
                    type="number"
                    step="0.01"
                    {...register("epsilonFrom", { valueAsNumber: true })}
                    error={getError("epsilonFrom")}
                  />
                </div>
                <div>
                  <Label htmlFor="EpsilonTo">Epsilon To</Label>
                  <Input
                    id="EpsilonTo"
                    type="number"
                    step="0.01"
                    {...register("epsilonTo", { valueAsNumber: true })}
                    error={getError("epsilonTo")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Excess Parameters */}
          <div className="md:col-span-2 border-t pt-4">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
              Excess Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="ExcessFrom">Excess From</Label>
                <Input
                  id="ExcessFrom"
                  type="number"
                  step="0.01"
                  {...register("excessFrom", { valueAsNumber: true })}
                  error={getError("excessFrom")}
                />
              </div>
              <div>
                <Label htmlFor="ExcessTo">Excess To</Label>
                <Input
                  id="ExcessTo"
                  type="number"
                  step="0.01"
                  {...register("excessTo", { valueAsNumber: true })}
                  error={getError("excessTo")}
                />
              </div>
            </div>
          </div>

          {/* K Parameters */}
          <div className="md:col-span-2 border-t pt-4">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
              K Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="KFrom">K From</Label>
                <Input
                  id="KFrom"
                  type="number"
                  step="0.01"
                  {...register("kFrom", { valueAsNumber: true })}
                  error={getError("kFrom")}
                />
              </div>
              <div>
                <Label htmlFor="KTo">K To</Label>
                <Input
                  id="KTo"
                  type="number"
                  step="0.01"
                  {...register("kTo", { valueAsNumber: true })}
                  error={getError("kTo")}
                />
              </div>
            </div>
          </div>

          {/* Theta Parameters */}
          <div className="md:col-span-2 border-t pt-4">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
              Theta Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="ThetaFrom">Theta From</Label>
                <Input
                  id="ThetaFrom"
                  type="number"
                  step="0.1"
                  {...register("thetaFrom", { valueAsNumber: true })}
                  error={getError("thetaFrom")}
                />
              </div>
              <div>
                <Label htmlFor="ThetaTo">Theta To</Label>
                <Input
                  id="ThetaTo"
                  type="number"
                  step="0.1"
                  {...register("thetaTo", { valueAsNumber: true })}
                  error={getError("thetaTo")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Loading..' : 'Get generating options'}
          </button>
        </div>
      </form>
    </div>
 <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
 <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
 <div className="fixed inset-0 flex items-center justify-center p-4">
   <DialogPanel className="w-full max-w-4xl rounded bg-white dark:bg-gray-800 p-6 max-h-[90vh] overflow-y-auto">
     <DialogTitle className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
       Generated Options
     </DialogTitle>

     {generationOptions && (
       <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {generationOptions.options.map((option, index) => (
             <div key={index} className="border rounded-lg p-4 dark:border-gray-600">
               <h3 className="font-medium text-lg mb-3">Option #{index + 1}</h3>
               <div className="space-y-2">
                 <div>
                   <Label>Particle Count</Label>
                   <Input
                     type="number"
                     value={option.count}
                     onChange={(e: any) => updateOptionField(index, 'count', Number(e.target.value))}
                   />
                 </div>
                 <div>
                   <Label>Min Size</Label>
                   <Input
                     type="number"
                     step="0.01"
                     value={option.minSize}
                     onChange={(e) => updateOptionField(index, 'minSize', Number(e.target.value))}
                   />
                 </div>
                 <div>
                   <Label>Max Size</Label>
                   <Input
                     type="number"
                     step="0.01"
                     value={option.maxSize}
                     onChange={(e) => updateOptionField(index, 'maxSize', Number(e.target.value))}
                   />
                 </div>
                 {particleKind !== 0 && (
                   <div>
                     <Label>Epsilon</Label>
                     <Input
                       type="number"
                       step="0.01"
                       value={option.epsilon || ''}
                       onChange={(e) => updateOptionField(index, 'epsilon', Number(e.target.value))}
                     />
                   </div>
                 )}
                 <div>
                   <Label>Excess</Label>
                   <Input
                     type="number"
                     step="0.01"
                     value={option.excess}
                     onChange={(e) => updateOptionField(index, 'excess', Number(e.target.value))}
                   />
                 </div>
                 <div>
                   <Label>K</Label>
                   <Input
                     type="number"
                     step="0.01"
                     value={option.k}
                     onChange={(e) => updateOptionField(index, 'k', Number(e.target.value))}
                   />
                 </div>
                 <div>
                   <Label>Theta</Label>
                   <Input
                     type="number"
                     step="0.1"
                     value={option.theta}
                     onChange={(e) => updateOptionField(index, 'theta', Number(e.target.value))}
                   />
                 </div>
                 {sizeInputType === 'concentration' ? (
                   <div>
                     <Label>Concentration</Label>
                     <Input
                       type="number"
                       step="0.0001"
                       value={option.numericalConcentration}
                       onChange={(e) => updateOptionField(index, 'numericalConcentration', Number(e.target.value))}
                     />
                   </div>
                 ) : (
                   <div>
                     <Label>Global Size</Label>
                     <Input
                       type="number"
                       step="0.01"
                       value={option.globalSize || ''}
                       onChange={(e) => updateOptionField(index, 'globalSize', Number(e.target.value))}
                     />
                   </div>
                 )}
               </div>
             </div>
           ))}
         </div>

         <div className="flex justify-end space-x-3 pt-4">
           <button
             type="button"
             onClick={() => setIsModalOpen(false)}
             className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
           >
             Cancel
           </button>
           <button
             type="button"
             onClick={handleGenerate}
             disabled={isGenerating}
             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
           >
             {isGenerating ? 'Generating...' : 'Generate Nanosystems'}
           </button>
         </div>
       </div>
     )}
   </DialogPanel>
 </div>
</Dialog>
</>
  );
};

// Reusable components
const Label = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    {children}
  </label>
);

const Input = ({ type, ...props }) => (
  <div>
    <input
      type={type}
      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
      {...props}
    />
  </div>
);