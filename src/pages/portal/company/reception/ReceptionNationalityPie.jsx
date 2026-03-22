import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Typography } from 'antd';

ChartJS.register(ArcElement, Tooltip);

const { Text } = Typography;

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

/**
 * Compact doughnut: arrived vs not yet (of allocated) with % in the center.
 */
export function ReceptionNationalityPie({
  token,
  allocated,
  arrived,
  arrivedLabel,
  pendingLabel,
  percent,
}) {
  const remaining = Math.max(0, allocated - arrived);
  const muted = token.colorFillSecondary;

  const { data, options } = useMemo(() => {
    const arrivedColor = token.colorPrimary;
    const dataObj = {
      labels: [arrivedLabel, pendingLabel],
      datasets: [
        {
          data: allocated > 0 ? [arrived, remaining] : [0, 1],
          backgroundColor:
            allocated > 0
              ? [hexToRgba(arrivedColor, 0.92), muted]
              : [token.colorFillQuaternary, token.colorFillQuaternary],
          borderWidth: 0,
          hoverOffset: 3,
        },
      ],
    };

    const opts = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: allocated > 0,
          backgroundColor: token.colorBgElevated,
          titleColor: token.colorText,
          bodyColor: token.colorTextSecondary,
          borderColor: token.colorBorderSecondary,
          borderWidth: 1,
          padding: 8,
          cornerRadius: 8,
          callbacks: {
            label(ctx) {
              const v = ctx.raw ?? 0;
              const p = allocated > 0 ? Math.round((Number(v) / allocated) * 100) : 0;
              return `${ctx.label}: ${v} (${p}%)`;
            },
          },
        },
      },
    };

    return { data: dataObj, options: opts };
  }, [allocated, arrived, arrivedLabel, pendingLabel, muted, token]);

  return (
    <div
      style={{
        position: 'relative',
        height: 132,
        width: 132,
        margin: '0 auto',
      }}
    >
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          flexDirection: 'column',
        }}
      >
        <Text
          strong
          style={{
            fontSize: 20,
            lineHeight: 1.1,
            color: allocated > 0 ? token.colorText : token.colorTextSecondary,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {allocated > 0 ? `${percent}%` : '—'}
        </Text>
        {allocated > 0 ? (
          <Text type="secondary" style={{ fontSize: 10, marginTop: 2 }}>
            {arrived}/{allocated}
          </Text>
        ) : null}
      </div>
    </div>
  );
}
