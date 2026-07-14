import { Container, Button } from '../components/ui';

export function NotFound() {
  return (
    <Container className="flex flex-col items-center py-32 text-center">
      <p className="font-serif text-6xl font-semibold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Button to="/" className="mt-8">Back to home</Button>
    </Container>
  );
}
