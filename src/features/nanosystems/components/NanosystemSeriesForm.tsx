import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {ParticleKindMap, type GetNanosystemGenerationOptionsQuery} from "../api/nanosystemTypes";
import { fetchNanosystemMassGenerationParameters } from '../api/nanosystemApi';
import type { AxiosError } from 'axios';

export const NanosystemSeriesForm = () => {
  const [sizeInputType, setSizeInputType] = useState<'globalSize' | 'concentration'>('concentration');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GetNanosystemGenerationOptionsQuery>({
    defaultValues: {
      Count: 3,
      ParticleKind: "0",
      EpsilonFrom: 1,
      EpsilonTo: 1,
      ParticleCountFrom: 10000,
      ParticleCountTo: 10000,
      GlobalSizeFrom: null,
      GlobalSizeTo: null,
      NumericalConcentrationFrom: 0.2,
      NumericalConcentrationTo: 0.2,
      ExcessFrom: 1,
      ExcessTo: 1.1,
      MaxParticleSizeFrom: 1,
      MaxParticleSizeTo: 2,
      MinParticleSizeFrom: 1,
      MinParticleSizeTo: 3,
      KFrom: 2,
      KTo: 2,
      ThetaFrom: 3,
      ThetaTo: 3
    }
  });

  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const particleKind = watch("ParticleKind");

  const onSubmit = async (data: GetNanosystemGenerationOptionsQuery) => {
    try{
        let result = await fetchNanosystemMassGenerationParameters(data)
        console.log(result);
    }
    catch(e){
      let response = await e.response;
      setApiErrors(response.data.errors);
    }
  };

  const getError = (fieldName: keyof GetNanosystemGenerationOptionsQuery) => 
    errors[fieldName]?.message || apiErrors[fieldName]?.[0];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Nanosystem Parameters
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Count */}
          <div>
            <Label htmlFor="Count">Count</Label>
            <Input
              id="Count"
              type="number"
              {...register("Count", { valueAsNumber: true })}
              error={getError("Count")}
            />
          </div>

          {/* Particle Kind */}
          <div>
            <Label>Particle Kind</Label>
            <div className="flex space-x-4 mt-1">
              {Object.entries(ParticleKindMap).map(([value, label]) => (
                <label key={value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={value}
                    {...register("ParticleKind")}
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
                <Label htmlFor="ParticleCountFrom">From</Label>
                <Input
                  id="ParticleCountFrom"
                  type="number"
                  {...register("ParticleCountFrom", { valueAsNumber: true })}
                  error={getError("ParticleCountFrom")}
                />
              </div>
              <div>
                <Label htmlFor="ParticleCountTo">To</Label>
                <Input
                  id="ParticleCountTo"
                  type="number"
                  {...register("ParticleCountTo", { valueAsNumber: true })}
                  error={getError("ParticleCountTo")}
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
                <Label htmlFor="MaxParticleSizeFrom">Max Size From</Label>
                <Input
                  id="MaxParticleSizeFrom"
                  type="number"
                  step="0.01"
                  {...register("MaxParticleSizeFrom", { valueAsNumber: true })}
                  error={getError("MaxParticleSizeFrom")}
                />
              </div>
              <div>
                <Label htmlFor="MaxParticleSizeTo">Max Size To</Label>
                <Input
                  id="MaxParticleSizeTo"
                  type="number"
                  step="0.01"
                  {...register("MaxParticleSizeTo", { valueAsNumber: true })}
                  error={getError("MaxParticleSizeTo")}
                />
              </div>
              <div>
                <Label htmlFor="MinParticleSizeFrom">Min Size From</Label>
                <Input
                  id="MinParticleSizeFrom"
                  type="number"
                  step="0.01"
                  {...register("MinParticleSizeFrom", { valueAsNumber: true })}
                  error={getError("MinParticleSizeFrom")}
                />
              </div>
              <div>
                <Label htmlFor="MinParticleSizeTo">Min Size To</Label>
                <Input
                  id="MinParticleSizeTo"
                  type="number"
                  step="0.01"
                  {...register("MinParticleSizeTo", { valueAsNumber: true })}
                  error={getError("MinParticleSizeTo")}
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
                    {...register("NumericalConcentrationFrom", { valueAsNumber: true })}
                    error={getError("NumericalConcentrationFrom")}
                  />
                </div>
                <div>
                  <Label htmlFor="NumericalConcentrationTo">Concentration To</Label>
                  <Input
                    id="NumericalConcentrationTo"
                    type="number"
                    step="0.0001"
                    {...register("NumericalConcentrationTo", { valueAsNumber: true })}
                    error={getError("NumericalConcentrationTo")}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="GlobalSizeFrom">Global Size From</Label>
                  <Input
                    id="GlobalSizeFrom"
                    type="number"
                    step="0.01"
                    {...register("GlobalSizeFrom", { valueAsNumber: true })}
                    error={getError("GlobalSizeFrom")}
                  />
                </div>
                <div>
                  <Label htmlFor="GlobalSizeTo">Global Size To</Label>
                  <Input
                    id="GlobalSizeTo"
                    type="number"
                    step="0.01"
                    {...register("GlobalSizeTo", { valueAsNumber: true })}
                    error={getError("GlobalSizeTo")}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Epsilon Parameters - only shown when particleKind is not sphere */}
          {particleKind !== "0" && (
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
                    {...register("EpsilonFrom", { valueAsNumber: true })}
                    error={getError("EpsilonFrom")}
                  />
                </div>
                <div>
                  <Label htmlFor="EpsilonTo">Epsilon To</Label>
                  <Input
                    id="EpsilonTo"
                    type="number"
                    step="0.01"
                    {...register("EpsilonTo", { valueAsNumber: true })}
                    error={getError("EpsilonTo")}
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
                  {...register("ExcessFrom", { valueAsNumber: true })}
                  error={getError("ExcessFrom")}
                />
              </div>
              <div>
                <Label htmlFor="ExcessTo">Excess To</Label>
                <Input
                  id="ExcessTo"
                  type="number"
                  step="0.01"
                  {...register("ExcessTo", { valueAsNumber: true })}
                  error={getError("ExcessTo")}
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
                  {...register("KFrom", { valueAsNumber: true })}
                  error={getError("KFrom")}
                />
              </div>
              <div>
                <Label htmlFor="KTo">K To</Label>
                <Input
                  id="KTo"
                  type="number"
                  step="0.01"
                  {...register("KTo", { valueAsNumber: true })}
                  error={getError("KTo")}
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
                  {...register("ThetaFrom", { valueAsNumber: true })}
                  error={getError("ThetaFrom")}
                />
              </div>
              <div>
                <Label htmlFor="ThetaTo">Theta To</Label>
                <Input
                  id="ThetaTo"
                  type="number"
                  step="0.1"
                  {...register("ThetaTo", { valueAsNumber: true })}
                  error={getError("ThetaTo")}
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
  );
};

// Reusable components
const Label = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    {children}
  </label>
);

const Input = ({ id, type, step, error, ...props }: any) => (
  <div>
    <input
      id={id}
      type={type}
      step={step}
      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
        error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
);