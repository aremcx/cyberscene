import { ContentListPage } from './ContentListPage';
import { ContentType } from '../db/schema';

export function NewsPage() {
  return (
    <ContentListPage
      title="Cybersecurity News"
      description="Latest cybersecurity news, breaches, and industry developments."
      contentType={ContentType.NEWS}
      icon="📰"
    />
  );
}
