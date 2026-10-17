import { AuthMockDataSource } from '@/features/auth/data/datasources/auth-mock-data-source';
import { AuthRepositoryImpl } from '@/features/auth/data/repositories/auth-repository-impl';
import { DEMO_CREDENTIALS, initialsOf, validateCredentials } from '@/features/auth/domain/entities/user';
import { RestoreSession, SignIn, SignOut, UpdateProfile } from '@/features/auth/domain/usecases/auth';

function setup() {
  const repository = new AuthRepositoryImpl(new AuthMockDataSource(0));
  return {
    restore: new RestoreSession(repository),
    signIn: new SignIn(repository),
    signOut: new SignOut(repository),
    update: new UpdateProfile(repository),
  };
}

test('opens signed in to the demo account, as installed', async () => {
  expect(await setup().restore.execute()).toMatchObject({ fullName: 'Alexander Reed', email: DEMO_CREDENTIALS.email });
});

test('signs out, refuses a wrong password and signs back in', async () => {
  const auth = setup();
  await auth.signOut.execute();
  expect(await auth.restore.execute()).toBeNull();

  await expect(auth.signIn.execute({ ...DEMO_CREDENTIALS, password: 'wrong-one' })).rejects.toMatchObject({
    code: 'UNAUTHORIZED',
  });
  await expect(auth.signIn.execute({ email: 'nope', password: 'whatever' })).rejects.toMatchObject({
    code: 'VALIDATION',
  });

  const user = await auth.signIn.execute({ email: ' DEMO@blackjet.app ', password: DEMO_CREDENTIALS.password });
  expect(user.id).toBe('usr-demo');
  expect(await auth.restore.execute()).not.toBeNull();
});

test('edits the profile of the signed-in member', async () => {
  const auth = setup();
  await auth.restore.execute();

  await expect(auth.update.execute({ fullName: 'A', phone: '+1 415 555 0142' })).rejects.toMatchObject({
    code: 'VALIDATION',
  });
  const user = await auth.update.execute({ fullName: ' Alex Reed ', phone: '+44 20 7946 0958' });

  expect(user).toMatchObject({ fullName: 'Alex Reed', phone: '+44 20 7946 0958' });
});

test('checks the sign-in form and makes initials', () => {
  expect(validateCredentials({ email: 'a@b.co', password: '123' })).toMatch(/at least 6/);
  expect(validateCredentials(DEMO_CREDENTIALS)).toBeNull();
  expect(initialsOf('Alexander Reed')).toBe('AR');
  expect(initialsOf('Cher')).toBe('C');
});
