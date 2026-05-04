import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Shared placeholder for nav links pointing at unbuilt pages.
export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>Coming soon</CardDescription>
        </CardHeader>
        {description && (
          <CardContent>
            <p className="text-gray-600">{description}</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
