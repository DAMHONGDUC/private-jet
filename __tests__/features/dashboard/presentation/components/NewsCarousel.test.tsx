import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithStore } from '@test-utils/test-store';
import { NewsCarousel } from '@/features/dashboard/presentation/components/NewsCarousel';

test('pages through the published stories once it knows its width', async () => {
  await renderWithStore(<NewsCarousel />);

  const pager = await screen.findByTestId('news-pager');
  await fireEvent(pager, 'layout', { nativeEvent: { layout: { width: 360, height: 220 } } });

  expect(screen.getByTestId('news-title-0')).toHaveTextContent('Night departures to Dubai');
  expect(screen.queryByText(/Draft/)).toBeNull();
});
