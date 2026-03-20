import React, { useState } from 'react';
import { Button, DatePicker, Radio, Space, TimePicker, Typography, message } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

/**
 * Schedule: ONCE (Riyadh wall time, parsed server-side) or DAILY_RANGE + HH:mm.
 * Calls onSchedule with payload fields merged by parent (title, message, userIds).
 */
export function NotificationSchedulePanel({ isAr, submitting, disabled, onSchedule, timeZoneHint }) {
  const [scheduleKind, setScheduleKind] = useState('ONCE');
  const [onceAt, setOnceAt] = useState(null);
  const [range, setRange] = useState(null);
  const [dailyTime, setDailyTime] = useState(() => dayjs().hour(9).minute(0).second(0).millisecond(0));

  const handleSchedule = async () => {
    if (disabled) {
      message.warning(isAr ? 'اختر مستلمين أولاً' : 'Select recipients first');
      return;
    }
    if (scheduleKind === 'ONCE') {
      if (!onceAt) {
        message.warning(isAr ? 'حدد التاريخ والوقت' : 'Pick date & time');
        return;
      }
      await onSchedule({
        scheduleKind: 'ONCE',
        scheduledAt: onceAt.format('YYYY-MM-DDTHH:mm:ss'),
      });
      return;
    }
    if (!range || !range[0] || !range[1]) {
      message.warning(isAr ? 'حدد نطاق التواريخ' : 'Pick date range');
      return;
    }
    await onSchedule({
      scheduleKind: 'DAILY_RANGE',
      rangeStartDate: range[0].format('YYYY-MM-DD'),
      rangeEndDate: range[1].format('YYYY-MM-DD'),
      dailyTimeLocal: dailyTime ? dailyTime.format('HH:mm') : '09:00',
    });
  };

  return (
    <div>
      {timeZoneHint ? (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
          {timeZoneHint}
        </Typography.Paragraph>
      ) : null}
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Radio.Group value={scheduleKind} onChange={(e) => setScheduleKind(e.target.value)}>
          <Radio value="ONCE">{isAr ? 'مرة واحدة (تاريخ ووقت)' : 'One-time (date & time)'}</Radio>
          <Radio value="DAILY_RANGE">{isAr ? 'يوميًا ضمن فترة' : 'Daily within a date range'}</Radio>
        </Radio.Group>

        {scheduleKind === 'ONCE' ? (
          <DatePicker
            showTime
            style={{ width: '100%', maxWidth: 360 }}
            format="YYYY-MM-DD HH:mm"
            value={onceAt}
            onChange={setOnceAt}
          />
        ) : (
          <Space wrap align="start">
            <RangePicker value={range} onChange={setRange} />
            <TimePicker value={dailyTime} onChange={setDailyTime} format="HH:mm" minuteStep={5} needConfirm={false} />
          </Space>
        )}

        <Button type="default" loading={submitting} disabled={disabled} onClick={handleSchedule}>
          {isAr ? 'جدولة الإشعار' : 'Schedule notification'}
        </Button>
      </Space>
    </div>
  );
}
