import { useLocation } from 'react-router-dom';
import './Header.css';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard Tổng Quan',
  '/dashboard/giang-vien': 'Dashboard Giảng Viên',
  '/users': 'Quản Lý Người Dùng',
  '/students': 'Quản Lý Học Viên',
  '/courses': 'Quản Lý Khóa Học',
  '/questions': 'Ngân Hàng Câu Hỏi',
  '/exam-config': 'Cấu Hình Đề Thi',
};

export function Header() {
  const { pathname } = useLocation();
  const title = ROUTE_LABELS[pathname] ?? 'DriveMate Admin';

  return (
    <header className="header">
      <span className="header__title">{title}</span>
      <div className="header__user">
        <span>Admin</span>
        <div className="header__avatar">A</div>
      </div>
    </header>
  );
}
