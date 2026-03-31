interface TestimonialDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TestimonialDetailPage({ params }: TestimonialDetailPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-4 text-3xl font-bold">Detalle del Testimonio</h1>
      <p className="text-muted-foreground">ID: {id}</p>
      {/* TODO: Implement success case detail view */}
    </div>
  );
}
