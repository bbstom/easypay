import { useLocation } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import BlogManagePage from './BlogManagePage';
import BlogCategoryManagePage from './BlogCategoryManagePage';

const BlogManageContainer = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'articles';

  return (
    <AdminLayout>
      {activeTab === 'articles' && <BlogManagePage />}
      {activeTab === 'categories' && <BlogCategoryManagePage />}
    </AdminLayout>
  );
};

export default BlogManageContainer;
