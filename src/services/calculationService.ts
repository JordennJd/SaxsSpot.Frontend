import { 
  fetchCalculationsByNanosystem, 
  RunCalculation, 
  PlotChart 
} from '@/features/calculation/api/calculationApi';
import type { 
  CalculationDto, 
  RunCalculationRequest, 
  PlotChartRequest 
} from '@/features/calculation/api/calculationTypes';

export class CalculationService {
  static async getCalculationsByNanosystem(
    nanosystemId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<CalculationDto[]> {
    try {
      const response = await fetchCalculationsByNanosystem(nanosystemId, page, pageSize);
      return response.result.data;
    } catch (error) {
      console.error('Error fetching calculations:', error);
      throw new Error('Failed to fetch calculations');
    }
  }

  static async startCalculation(params: RunCalculationRequest): Promise<void> {
    try {
      await RunCalculation(params);
    } catch (error) {
      console.error('Error starting calculation:', error);
      throw new Error('Failed to start calculation');
    }
  }

  static async generateChart(request: PlotChartRequest): Promise<string> {
    try {
      const result = await PlotChart(request);
      return CalculationService.wrapChartInHtml(result);
    } catch (error) {
      console.error('Error generating chart:', error);
      throw new Error('Failed to generate chart');
    }
  }

  private static wrapChartInHtml(chartData: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Chart</title>
          <script src="https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/mpld3@0.5.10/dist/mpld3.min.js"></script>
          <style>
              html, body {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
              }
              #chart-container {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background: white;
                  padding-bottom: 100px;
              }
              .mpld3-figure {
                  margin: 0 auto;
                  display: block;
              }
          </style>
      </head>
      <body>
          <div id="chart-container">${chartData}</div>
          <script>
              window.addEventListener('resize', function() {
                  if(window.mpld3) {
                      const figures = document.querySelectorAll('.mpld3-figure');
                      figures.forEach(fig => {
                          const id = fig.id;
                          const spec = JSON.parse(fig.dataset.mpld3 || '{}');
                          window.mpld3.draw_figure(id, spec);
                      });
                  }
              });
          </script>
      </body>
      </html>
    `;
  }

  static createDefaultCalculationParams(systemId: string): RunCalculationRequest {
    return {
      qVectorSpaceParameters: {
        spaceMethod: 0,
        scaleMethod: 0,
        spaceParameter: 0.01,
        start: 0.02,
        end: 0.4
      },
      phiVectorSpaceParameters: {
        spaceMethod: 0,
        scaleMethod: 0,
        spaceParameter: 0.01,
        start: 0.02,
        end: 0.04
      },
      thetaVectorSpaceParameters: {
        spaceMethod: 0,
        scaleMethod: 0,
        spaceParameter: 0.01,
        start: 0.02,
        end: 0.04
      },
      systemId,
      requestId: ""
    };
  }

  static createDefaultChartRequest(calculationIds: string[]): PlotChartRequest {
    return {
      CalculatesId: calculationIds,
      ChartTitle: "Scattering",
      XAxis: "Q",
      YAxis: "I",
      ScaleMethodsX: "Linear",
      ScaleMethodsY: "Linear",
    };
  }
} 