import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithStore } from '@test-utils/test-store';
import { BookingScreen } from '@/features/booking/presentation/screens/BookingScreen';

describe('BookingScreen', () => {
  it('shows the domain validation message and does not book', async () => {
    const onBooked = jest.fn();
    await renderWithStore(<BookingScreen flightId="BJ-101" onBooked={onBooked} />);

    await fireEvent.press(await screen.findByTestId('confirm-booking'));

    expect(screen.getByTestId('booking-error')).toHaveTextContent('Enter the full name of every passenger.');
    expect(onBooked).not.toHaveBeenCalled();
  });

  it('prices every passenger and books them', async () => {
    const onBooked = jest.fn();
    await renderWithStore(<BookingScreen flightId="BJ-101" onBooked={onBooked} />);

    await fireEvent.press(await screen.findByTestId('passengers-increment'));
    expect(screen.getByTestId('passenger-count')).toHaveTextContent('2');
    expect(screen.getByTestId('booking-total')).toHaveTextContent('€5,800');

    await fireEvent.changeText(screen.getByTestId('passenger-name-0'), 'Duc Dam');
    await fireEvent.changeText(screen.getByTestId('passenger-name-1'), 'An Tran');
    await fireEvent.changeText(screen.getByTestId('contact-email'), 'duc@example.com');
    await fireEvent.press(screen.getByTestId('confirm-booking'));

    await waitFor(() => expect(onBooked).toHaveBeenCalledWith('bk-1'));
  });

  it('caps passengers at the seats left', async () => {
    await renderWithStore(<BookingScreen flightId="BJ-102" onBooked={jest.fn()} />);

    const increment = await screen.findByTestId('passengers-increment');
    await fireEvent.press(increment);
    await fireEvent.press(increment);

    expect(screen.getByTestId('passenger-count')).toHaveTextContent('2');
  });
});
