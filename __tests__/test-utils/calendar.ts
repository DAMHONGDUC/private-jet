import { fireEvent, screen } from '@testing-library/react-native';

/** Pages the open calendar sheet forward to `day`, picks it and, unless told not to, confirms. */
export async function pickCalendarDay(
  day: string,
  { time, confirm = true }: { time?: string; confirm?: boolean } = {},
) {
  for (
    let page = 0;
    page < 24 && !screen.queryByTestId(`calendar-${day}`);
    page++
  ) {
    await fireEvent.press(screen.getByTestId('calendar-next-month'));
  }
  await fireEvent.press(screen.getByTestId(`calendar-${day}`));
  if (time) {
    await fireEvent.press(screen.getByTestId(`calendar-time-${time}`));
  }
  if (confirm) {
    await fireEvent.press(screen.getByTestId('calendar-done'));
  }
}
