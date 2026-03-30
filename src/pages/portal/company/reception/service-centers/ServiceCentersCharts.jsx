import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return `rgba(15, 118, 110, ${alpha})`;
  }
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function centerFullName(c, isAr) {
  const full = isAr ? c.nameAr || c.name : c.name || c.code;
  return full || c.code || '';
}

/** Axis label: shorter when many centers (e.g. 60) so the chart stays readable. */
function centerAxisLabel(c, isAr, compact) {
  if (compact) {
    const code = (c.code || '').trim();
    if (code.length <= 14) return code || '—';
    return `${code.slice(0, 12)}…`;
  }
  const text = centerFullName(c, isAr);
  if (text.length <= 22) return text;
  return `${text.slice(0, 20)}…`;
}

/**
 * Vertical grouped columns: each service center × allocated vs arrived.
 * Many centers (e.g. 60): horizontal scroll + compact x labels; tooltip shows full name.
 */
export function ServiceCentersBarChart({
  token,
  centers,
  allocatedLabel,
  arrivedLabel,
  isAr,
  minHeight = 440,
}) {
  const n = centers.length;
  const compactAxis = n > 18;
  /** ~pixels per category so grouped bars stay readable; scroll when total width > container */
  const slotPx = n > 45 ? 42 : n > 30 ? 46 : n > 18 ? 52 : 64;
  const chartInnerMinWidth = Math.max(520, n * slotPx);
  const tickFontSize = n > 45 ? 8 : n > 28 ? 9 : 10;

  const { data, options } = useMemo(() => {
    const axisLabels = centers.map((c) => centerAxisLabel(c, isAr, compactAxis));
    const fullNames = centers.map((c) => centerFullName(c, isAr));
    /** مخصص = success، واصل = primary (متسق مع صفحة الاستقبال) */
    const allocatedColor = token.colorSuccess;
    const arrivedColor = token.colorPrimary;

    const dataObj = {
      labels: axisLabels,
      datasets: [
        {
          label: allocatedLabel,
          data: centers.map((c) => c.totalAllocated ?? 0),
          backgroundColor: hexToRgba(allocatedColor, 0.82),
          borderColor: allocatedColor,
          borderWidth: 1,
          borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
          borderSkipped: false,
          maxBarThickness: compactAxis ? 18 : 26,
        },
        {
          label: arrivedLabel,
          data: centers.map((c) => c.totalIntegrated ?? 0),
          backgroundColor: hexToRgba(arrivedColor, 0.82),
          borderColor: arrivedColor,
          borderWidth: 1,
          borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
          borderSkipped: false,
          maxBarThickness: compactAxis ? 18 : 26,
        },
      ],
    };

    const opts = {
      rtl: isAr,
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 520, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      datasets: {
        bar: {
          categoryPercentage: n > 40 ? 0.75 : 0.82,
          barPercentage: 0.9,
        },
      },
      plugins: {
        legend: {
          position: 'top',
          align: isAr ? 'end' : 'start',
          rtl: isAr,
          labels: {
            color: token.colorText,
            usePointStyle: true,
            pointStyle: 'rectRounded',
            padding: 16,
            font: { size: 12, weight: '500' },
          },
        },
        tooltip: {
          backgroundColor: token.colorBgElevated,
          titleColor: token.colorText,
          bodyColor: token.colorTextSecondary,
          borderColor: token.colorBorderSecondary,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            title(items) {
              const i = items[0]?.dataIndex;
              if (i == null) return '';
              return fullNames[i] || axisLabels[i];
            },
          },
        },
      },
      scales: {
        x: {
          stacked: false,
          grid: { display: false },
          ticks: {
            color: token.colorTextSecondary,
            font: { size: tickFontSize, weight: '500' },
            maxRotation: compactAxis ? 55 : 40,
            minRotation: compactAxis ? 45 : 0,
            autoSkip: false,
            padding: 4,
          },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          stacked: false,
          grid: {
            color: token.colorBorderSecondary,
            drawBorder: false,
            tickLength: 0,
          },
          ticks: {
            color: token.colorTextSecondary,
            font: { size: 11 },
            padding: 8,
            precision: 0,
          },
          border: { display: false },
        },
      },
    };

    return { data: dataObj, options: opts };
  }, [centers, allocatedLabel, arrivedLabel, isAr, token, compactAxis, tickFontSize, n]);

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        borderRadius: token.borderRadius,
      }}
      role="region"
      aria-label="Service centers chart"
    >
      <div style={{ height: minHeight, minWidth: chartInnerMinWidth, position: 'relative' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

/**
 * Totals: arrived vs remaining (of allocated).
 */
export function TotalsMixDoughnut({
  token,
  totals,
  arrivedLabel,
  remainingLabel,
  isAr,
  title,
}) {
  const { data, options } = useMemo(() => {
    const alloc = totals.alloc || 0;
    const arr = totals.arr || 0;
    const remaining = Math.max(0, alloc - arr);
    const arrivedColor = token.colorPrimary;
    const muted = token.colorFillSecondary;

    const dataObj = {
      labels: [arrivedLabel, remainingLabel],
      datasets: [
        {
          data: alloc > 0 ? [arr, remaining] : [0, 1],
          backgroundColor:
            alloc > 0
              ? [hexToRgba(arrivedColor, 0.9), muted]
              : [token.colorFillQuaternary, token.colorFillQuaternary],
          borderWidth: 2,
          borderColor: token.colorBgContainer,
          hoverOffset: 6,
        },
      ],
    };

    const opts = {
      rtl: isAr,
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      animation: { duration: 600, easing: 'easeOutQuart' },
      plugins: {
        title: {
          display: !!title,
          text: title,
          color: token.colorTextSecondary,
          font: { size: 12, weight: '600' },
          padding: { bottom: 12 },
        },
        legend: {
          position: 'bottom',
          rtl: isAr,
          labels: {
            color: token.colorText,
            usePointStyle: true,
            padding: 14,
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: token.colorBgElevated,
          titleColor: token.colorText,
          bodyColor: token.colorTextSecondary,
          borderColor: token.colorBorderSecondary,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label(ctx) {
              const v = ctx.raw ?? 0;
              const pct = alloc > 0 ? Math.round((Number(v) / alloc) * 100) : 0;
              return `${ctx.label}: ${v} (${pct}%)`;
            },
          },
        },
      },
    };

    return { data: dataObj, options: opts };
  }, [totals.alloc, totals.arr, arrivedLabel, remainingLabel, isAr, token, title]);

  return (
    <div
      style={{
        height: 260,
        width: '100%',
        maxWidth: 280,
        margin: '0 auto',
        position: 'relative',
      }}
    >
      <Doughnut data={data} options={options} />
    </div>
  );
}
