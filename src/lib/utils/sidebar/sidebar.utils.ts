import { SidebarStructureDto } from '@/lib/types/supabase.type';
import { getPublishedLessons } from '@/lib/utils/lesson/lesson.utils';

export const getDefaultSidebarOptions = async (): Promise<
  SidebarStructureDto[]
> => {
  const lessons = await getPublishedLessons();

  return [
    {
      group_id: 'manual-testing',
      group_name: 'Manual Testing',
      icon: 'folder',
      open_icon: 'folder',
      position: 1,
      sidebar_items: lessons.map(lesson => ({
        item_id: lesson.id,
        item_name: lesson.title,
        item_icon: 'file',
        position: lesson.order_index,
        href: `/workspace/lessons/${lesson.slug}`,
      })),
    },
  ];
};
