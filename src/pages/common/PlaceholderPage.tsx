import { EmptyState } from "../../components/common/EmptyState";
import { PageHeader } from "../../components/common/PageHeader";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <section className="dashboard-content">
      <PageHeader title={title} description={description} />
      <div className="ongoing">
        <EmptyState title={`${title} is coming soon`} message="This route is ready for its page content." icon="map" />
      </div>
    </section>
  );
}
