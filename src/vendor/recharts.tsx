'use client';

import React from 'react';

type AnyRecord = Record<string, unknown>;

type MarkerComponent<P = AnyRecord> = React.FC<P> & { displayName: string };

interface ResponsiveContainerProps {
  width?: string | number;
  height?: string | number;
  children: React.ReactNode;
}

interface BarChartProps {
  data: unknown[];
  layout?: 'horizontal' | 'vertical';
  margin?: AnyRecord;
  children?: React.ReactNode;
}

interface BarProps {
  dataKey: string;
  fill?: string;
  stackId?: string;
  name?: string;
  radius?: number[];
  children?: React.ReactNode;
  [key: string]: unknown;
}

interface AxisProps {
  dataKey?: string;
  domain?: [number | string, number | string];
  [key: string]: unknown;
}

interface CellProps {
  fill?: string;
}

function createMarker<P = AnyRecord>(displayName: string): MarkerComponent<P> {
  const Component = (() => null) as unknown as MarkerComponent<P>;
  Component.displayName = displayName;
  return Component;
}

export const Cell = createMarker<CellProps>('Cell');
export const CartesianGrid = createMarker('CartesianGrid');
export const XAxis = createMarker<AxisProps>('XAxis');
export const YAxis = createMarker<AxisProps>('YAxis');
export const Tooltip = createMarker('Tooltip');
export const Legend = createMarker('Legend');

export const Bar = createMarker<BarProps>('Bar');

export function ResponsiveContainer({ children }: ResponsiveContainerProps) {
  return <div className="h-full w-full">{children}</div>;
}

function getDisplayName(node: React.ReactNode) {
  if (!React.isValidElement(node)) return '';
  const type = node.type as { displayName?: string; name?: string };
  return type.displayName || type.name || '';
}

function toChildrenArray(children: React.ReactNode) {
  return React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement[];
}

function formatLegendLabel(label: string) {
  return label
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (letter) => letter.toUpperCase())
    .trim();
}

function extractChartConfig(children: React.ReactNode) {
  const nodes = toChildrenArray(children);
  const bars = nodes.filter((node) => getDisplayName(node) === 'Bar');
  const xAxis = nodes.find((node) => getDisplayName(node) === 'XAxis');
  const yAxis = nodes.find((node) => getDisplayName(node) === 'YAxis');
  const hasLegend = nodes.some((node) => getDisplayName(node) === 'Legend');

  return {
    bars: bars.map((bar) => {
      const barProps = bar.props as BarProps;
      const cellColors = toChildrenArray(barProps.children)
        .filter((node) => getDisplayName(node) === 'Cell')
        .map((node) => ((node.props as CellProps).fill ?? '#0056D2'));

      return {
        dataKey: barProps.dataKey,
        fill: barProps.fill ?? '#0056D2',
        name: barProps.name ?? formatLegendLabel(barProps.dataKey),
        cellColors,
      };
    }),
    xAxis: (xAxis?.props as AxisProps | undefined) ?? {},
    yAxis: (yAxis?.props as AxisProps | undefined) ?? {},
    hasLegend,
  };
}

function DefaultBars({
  data,
  xAxis,
  yAxis,
  bars,
}: {
  data: unknown[];
  xAxis: AxisProps;
  yAxis: AxisProps;
  bars: Array<{ dataKey: string; fill: string; name: string; cellColors: string[] }>;
}) {
  const bar = bars[0];
  if (!bar) return null;

  const values = data.map((entry) => Number((entry as AnyRecord)[bar.dataKey] ?? 0));
  const upperDomain = typeof yAxis.domain?.[1] === 'number' ? yAxis.domain[1] : Math.max(...values, 1);
  const ticks = Array.from({ length: 5 }, (_, index) => Math.round((upperDomain / 4) * (4 - index)));

  return (
    <div className="grid h-full w-full grid-cols-[40px_1fr] gap-3">
      <div className="relative h-full">
        {ticks.map((tick, index) => (
          <span
            key={`${tick}-${index}`}
            className="absolute left-0 -translate-y-1/2 text-[11px] text-cgray-500"
            style={{ top: `${(index / 4) * 100}%` }}
          >
            {tick}
          </span>
        ))}
      </div>

      <div className="relative flex h-full items-stretch pt-3">
        <div className="absolute inset-0">
          {ticks.map((_, index) => (
            <div
              key={index}
              className="absolute left-0 right-0 border-t border-cgray-200"
              style={{ top: `${(index / 4) * 100}%` }}
            />
          ))}
        </div>

        <div className="relative grid h-full w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-3">
          {data.map((entry, index) => {
            const item = entry as AnyRecord;
            const value = Number(item[bar.dataKey] ?? 0);
            const fill = bar.cellColors[index] ?? bar.fill;
            const label = String(item[xAxis.dataKey ?? 'name'] ?? '');
            const height = upperDomain > 0 ? (value / upperDomain) * 100 : 0;

            return (
              <div key={`${label}-${index}`} className="flex h-full flex-col justify-end gap-2">
                <div className="relative flex-1">
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-t-lg"
                    style={{ height: `${height}%`, background: fill }}
                    title={`${label}: ${value}`}
                  />
                </div>
                <div className="text-center text-xs text-cgray-500">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VerticalStackedBars({
  data,
  yAxis,
  bars,
  showLegend,
}: {
  data: unknown[];
  yAxis: AxisProps;
  bars: Array<{ dataKey: string; fill: string; name: string; cellColors: string[] }>;
  showLegend: boolean;
}) {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      {showLegend ? (
        <div className="flex flex-wrap gap-4 text-xs text-cgray-600">
          {bars.map((bar) => (
            <span key={bar.dataKey} className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: bar.fill }} />
              {bar.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col justify-between gap-4">
        {data.map((entry, index) => {
          const item = entry as AnyRecord;
          const label = String(item[yAxis.dataKey ?? 'name'] ?? `Row ${index + 1}`);
          const total = bars.reduce((sum, bar) => sum + Number(item[bar.dataKey] ?? 0), 0);

          return (
            <div key={`${label}-${index}`} className="grid grid-cols-[96px_1fr] items-center gap-4">
              <span className="text-xs text-cgray-600">{label}</span>
              <div className="flex h-5 overflow-hidden rounded-full bg-cgray-100">
                {bars.map((bar) => {
                  const value = Number(item[bar.dataKey] ?? 0);
                  const width = total > 0 ? (value / total) * 100 : 0;
                  return (
                    <div
                      key={`${label}-${bar.dataKey}`}
                      style={{ width: `${width}%`, background: bar.fill }}
                      title={`${label} - ${bar.name}: ${value}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BarChart({ data, layout = 'horizontal', children }: BarChartProps) {
  const { bars, xAxis, yAxis, hasLegend } = extractChartConfig(children);

  return (
    <div className="h-full w-full">
      {layout === 'vertical' ? (
        <VerticalStackedBars data={data} yAxis={yAxis} bars={bars} showLegend={hasLegend} />
      ) : (
        <DefaultBars data={data} xAxis={xAxis} yAxis={yAxis} bars={bars} />
      )}
    </div>
  );
}
