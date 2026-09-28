import { ContentListPage } from './ContentListPage';
import { ContentType } from '../db/schema';

export function ResearchPage() {
  return (
    <ContentListPage
      title="Research"
      description="Original security research, analysis, and technical deep-dives."
      contentType={ContentType.RESEARCH}
      icon="🔬"
    />
  );
}
