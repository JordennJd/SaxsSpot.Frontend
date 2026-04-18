/* eslint-disable */
// @ts-nocheck
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {ParticleKindMap, type CommonParticleGenerationParameters, type GetNanosystemGenerationOptionsQuery, type MassGenerateNanoSystemOptions} from "../api/nanosystemTypes";
import {fetchNanosystemMassGenerationParameters, runMassGeneration} from '../api/nanosystemApi';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useToastContext } from '../../../contexts/ToastContext';
import {
  CubeIcon,
  HashtagIcon,
  ArrowsRightLeftIcon,
  BeakerIcon,
  ScaleIcon,
  VariableIcon,
  PlusCircleIcon,
  XMarkIcon,
  PlayIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

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
      disableIntersectionOptimizations: false,
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
      kFrom: 3,
      kTo: 3,
      thetaFrom: 0.4,
      thetaTo: 0.4,
      pointCountFrom: 5000000,
      pointCountTo: 5000000
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const particleKind = watch("particleKind");
  const disableIntersectionOptimizations = watch('disableIntersectionOptimizations');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOptions, setGenerationOptions] = useState<MassGenerateNanoSystemOptions | null>(null);
  const [zoneCount, setZoneCount] = useState<number>(20);
  const [needAnalysis, setNeedAnalysis] = useState<boolean>(true);
  const [needMetrics, setNeedMetrics] = useState<boolean>(false);

  const onSubmit = async (data: GetNanosystemGenerationOptionsQuery) => {
    try{
      const result = await fetchNanosystemMassGenerationParameters(data)
      setIsModalOpen(true);
      setGenerationOptions(result.result);
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
      const seriesSatOnly =
        particleKind !== 0 && !!disableIntersectionOptimizations;
      const runResult = await runMassGeneration({
        ...generationOptions,
        zoneCount,
        needAnalysis,
        needMetrics,
        disableIntersectionOptimizations: seriesSatOnly || undefined,
        options: generationOptions.options.map((o) => ({
          ...o,
          disableIntersectionOptimizations:
            particleKind !== 0 &&
            (seriesSatOnly || !!o.disableIntersectionOptimizations),
        })),
      })
      showSuccess(
          'Generation Started',
          `Nanosystem generation job has been queued successfully with ID: ${runResult}`,
          6000
      );
      setIsModalOpen(false);

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
        <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 -mx-6 -mt-6 px-6 py-5 rounded-t-2xl mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <CubeIcon className="h-7 w-7" />
              Nanosystem Series Generator
            </h2>
            <p className="text-blue-100 mt-1">Generate multiple nanosystems with varying parameters</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Settings */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  Basic Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <div>
                    <Label htmlFor="count" icon={HashtagIcon}>Count</Label>
                    <Input
                        id="count"
                        type="number"
                        {...register("count", { valueAsNumber: true })}
                        error={getError("count")}
                    />
                  </div>

                  <div>
                    <Label icon={CubeIcon}>Particle Kind</Label>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {Object.entries(ParticleKindMap).map(([value, label]) => (
                          <label key={value} className="flex items-center space-x-2 cursor-pointer">
                            <div className="relative">
                              <input
                                  type="radio"
                                  value={value}
                                  {...register("particleKind")}
                                  className="sr-only"
                              />
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center 
                            ${particleKind == value ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                {particleKind == value && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                              </div>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                          </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Particle Count Range */}
              <div className="md:col-span-2">
                <SectionTitle icon={HashtagIcon}>Particle Count Range</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
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

              {/* Size/Concentration Toggle */}
              <div className="md:col-span-2">
                <SectionTitle icon={BeakerIcon}>Size Determination</SectionTitle>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <div className="flex items-center space-x-6 mb-6">
                    <ToggleButton
                        active={sizeInputType === 'concentration'}
                        onClick={() => setSizeInputType('concentration')}
                        icon={BeakerIcon}
                    >
                      Use Concentration
                    </ToggleButton>
                    <ToggleButton
                        active={sizeInputType === 'globalSize'}
                        onClick={() => setSizeInputType('globalSize')}
                        icon={ScaleIcon}
                    >
                      Use Global Size
                    </ToggleButton>
                  </div>

                  {sizeInputType === 'concentration' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="NumericalConcentrationFrom">Concentration From</Label>
                          <Input
                              id="NumericalConcentrationFrom"
                              type="number"
                              step="any"
                              {...register("numericalConcentrationFrom", { valueAsNumber: true })}
                              error={getError("numericalConcentrationFrom")}
                          />
                        </div>
                        <div>
                          <Label htmlFor="NumericalConcentrationTo">Concentration To</Label>
                          <Input
                              id="NumericalConcentrationTo"
                              type="number"
                              step="any"
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
                              step="any"
                              {...register("globalSizeFrom", { valueAsNumber: true })}
                              error={getError("globalSizeFrom")}
                          />
                        </div>
                        <div>
                          <Label htmlFor="globalSizeTo">Global Size To</Label>
                          <Input
                              id="globalSizeTo"
                              type="number"
                              step="any"
                              {...register("globalSizeTo", { valueAsNumber: true })}
                              error={getError("globalSizeTo")}
                          />
                        </div>
                      </div>
                  )}
                </div>
              </div>

              {particleKind !== 0 && (
                  <div className="md:col-span-2">
                    <SectionTitle icon={VariableIcon}>Epsilon Parameters</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                      <div>
                        <Label htmlFor="EpsilonFrom">Epsilon From</Label>
                        <Input
                            id="EpsilonFrom"
                            type="number"
                            step="any"
                            {...register("epsilonFrom", { valueAsNumber: true })}
                            error={getError("epsilonFrom")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="EpsilonTo">Epsilon To</Label>
                        <Input
                            id="EpsilonTo"
                            type="number"
                            step="any"
                            {...register("epsilonTo", { valueAsNumber: true })}
                            error={getError("epsilonTo")}
                        />
                      </div>
                    </div>
                  </div>
              )}

              {/* Excess Parameters */}
              <div className="md:col-span-2">
                <SectionTitle icon={VariableIcon}>Excess Parameters</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <div>
                    <Label htmlFor="ExcessFrom">Excess From</Label>
                    <Input
                        id="ExcessFrom"
                        type="number"
                        step="any"
                        {...register("excessFrom", { valueAsNumber: true })}
                        error={getError("excessFrom")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ExcessTo">Excess To</Label>
                    <Input
                        id="ExcessTo"
                        type="number"
                        step="any"
                        {...register("excessTo", { valueAsNumber: true })}
                        error={getError("excessTo")}
                    />
                  </div>
                </div>
              </div>

              {/* K Parameters */}
              <div className="md:col-span-2">
                <SectionTitle icon={VariableIcon}>K Parameters</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <div>
                    <Label htmlFor="KFrom">K From</Label>
                    <Input
                        id="KFrom"
                        type="number"
                        step="any"
                        {...register("kFrom", { valueAsNumber: true })}
                        error={getError("kFrom")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="KTo">K To</Label>
                    <Input
                        id="KTo"
                        type="number"
                        step="any"
                        {...register("kTo", { valueAsNumber: true })}
                        error={getError("kTo")}
                    />
                  </div>
                </div>
              </div>

              {/* Theta Parameters */}
              <div className="md:col-span-2">
                <SectionTitle icon={VariableIcon}>Theta Parameters</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <div>
                    <Label htmlFor="ThetaFrom">Theta From</Label>
                    <Input
                        id="ThetaFrom"
                        type="number"
                        step="any"
                        {...register("thetaFrom", { valueAsNumber: true })}
                        error={getError("thetaFrom")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ThetaTo">Theta To</Label>
                    <Input
                        id="ThetaTo"
                        type="number"
                        step="any"
                        {...register("thetaTo", { valueAsNumber: true })}
                        error={getError("thetaTo")}
                    />
                  </div>
                </div>
              </div>

              {/* Analysis & series run options */}
              <div className="md:col-span-2">
                <SectionTitle icon={VariableIcon}>Analysis &amp; run options</SectionTitle>
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div>
                    <Label htmlFor="zoneCount">Zone Count</Label>
                    <Input
                        id="zoneCount"
                        type="number"
                        value={zoneCount}
                        onChange={(e) => setZoneCount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pointCountFrom">Point Count From</Label>
                    <Input
                        id="pointCountFrom"
                        type="number"
                        {...register("pointCountFrom", { valueAsNumber: true })}
                        error={getError("pointCountFrom")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pointCountTo">Point Count To</Label>
                    <Input
                        id="pointCountTo"
                        type="number"
                        {...register("pointCountTo", { valueAsNumber: true })}
                        error={getError("pointCountTo")}
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={needAnalysis}
                          onChange={(e) => setNeedAnalysis(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Need Analysis</span>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={needMetrics}
                          onChange={(e) => setNeedMetrics(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Need Metrics</span>
                    </label>
                  </div>
                  </div>
                  {particleKind !== 0 && (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white/60 dark:bg-gray-800/40 px-4 py-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          {...register('disableIntersectionOptimizations')}
                        />
                        <span>
                          <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                            Disable intersection shortcuts (SAT only, check against all placed particles)
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Parallelepipeds only. Applies to this series run and to every generated option unless overridden per option in the preview step.
                          </span>
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                  type="button"
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-sm text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                {isSubmitting ? 'Loading...' : 'Generate Options'}
              </button>
            </div>
          </form>
        </div>

        {/* Options Modal */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-5xl rounded-2xl bg-white dark:bg-gray-800 p-6 max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <DocumentArrowDownIcon className="h-7 w-7" />
                  Generated Options
                </DialogTitle>
                <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {generationOptions && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {generationOptions.options.map((option, index) => (
                          <div key={index} className="border rounded-xl p-4 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30">
                            <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                              <HashtagIcon className="h-4 w-4 text-blue-500" />
                              Option #{index + 1}
                            </h3>
                            <div className="space-y-3">
                              <div>
                                <Label>Particle Count</Label>
                                <Input
                                    type="number"
                                    value={option.count}
                                    onChange={(e: any) => updateOptionField(index, 'count', Number(e.target.value))}
                                />
                              </div>
                              {particleKind !== 0 && (
                                  <div>
                                    <Label>Epsilon</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={option.epsilon || ''}
                                        onChange={(e) => updateOptionField(index, 'epsilon', Number(e.target.value))}
                                    />
                                  </div>
                              )}
                              {particleKind !== 0 && (
                                  <div className="flex items-center pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                                      <input
                                          type="checkbox"
                                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                          checked={!!option.disableIntersectionOptimizations}
                                          onChange={(e) =>
                                              updateOptionField(index, 'disableIntersectionOptimizations', e.target.checked)
                                          }
                                      />
                                      <span>SAT-only intersection (no shortcuts)</span>
                                    </label>
                                  </div>
                              )}
                              <div>
                                <Label>Excess</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={option.excess}
                                    onChange={(e) => updateOptionField(index, 'excess', Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label>K</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={option.k}
                                    onChange={(e) => updateOptionField(index, 'k', Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label>Theta</Label>
                                <Input
                                    type="number"
                                    step="0.00000001"
                                    value={option.theta}
                                    onChange={(e) => updateOptionField(index, 'theta', Number(e.target.value))}
                                />
                              </div>
                              {sizeInputType === 'concentration' ? (
                                  <div>
                                    <Label>Concentration</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={option.numericalConcentration}
                                        onChange={(e) => updateOptionField(index, 'numericalConcentration', Number(e.target.value))}
                                    />
                                  </div>
                              ) : (
                                  <div>
                                    <Label>Global Size</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={option.globalSize || ''}
                                        onChange={(e) => updateOptionField(index, 'globalSize', Number(e.target.value))}
                                    />
                                  </div>
                              )}
                            </div>
                          </div>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                          type="button"
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-sm text-sm font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        <PlayIcon className="h-5 w-5" />
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
const Label = ({ htmlFor, children, icon: Icon }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </label>
);

const Input = ({ type, error, ...props }) => (
    <div>
      <input
          type={type}
          className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors
        ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

const SectionTitle = ({ children, icon: Icon }) => (
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </h3>
);

const ToggleButton = ({ active, onClick, children, icon: Icon }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors
      ${active
            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
);