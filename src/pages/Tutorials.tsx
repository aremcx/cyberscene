import { ContentListPage } from './ContentListPage';
import { ContentType } from '../db/schema';

export function TutorialsPage() {
  return (
    <ContentListPage
      title="Tutorials"
      description="Step-by-step guides and hands-on tutorials for cybersecurity professionals."
      contentType={ContentType.TUTORIAL}
      icon="📚"
    />
  );
}
