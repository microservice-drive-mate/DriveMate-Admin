import { NavLink, useNavigate } from 'react-router-dom';
import type { NavItem } from '../../types';
import { useAuthStore } from '../../store/authStore';
import './Sidebar.css';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard Tổng Quan', path: '/dashboard', icon: '📊' },
  { label: 'Dashboard Giảng Viên', path: '/dashboard/giang-vien', icon: '👨‍🏫' },
  { label: 'Quản Lý Người Dùng', path: '/users', icon: '👥' },
  { label: 'Quản Lý Học Viên', path: '/students', icon: '🎓' },
  { label: 'Quản Lý Khóa Học', path: '/courses', icon: '📚' },
  { label: 'Ngân Hàng Câu Hỏi', path: '/questions', icon: '❓' },
  { label: 'Cấu Hình Đề Thi', path: '/exam-config', icon: '⚙️' },
];

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__logo-text">Driving School</span>
        <span className="sidebar__logo-sub">Quản Lý Luyện Thi</span>
      </div>
      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `sidebar__nav-item${isActive ? ' sidebar__nav-item--active' : ''}`
            }
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={handleLogout}>
          <span className="sidebar__nav-icon">→</span>
          Đăng Xuất
        </button>
      </div>
    </aside>
  );
}
