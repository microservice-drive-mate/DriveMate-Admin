import { useCallback, useEffect, useState } from 'react';
import { auditService } from '@/services';
import type { AuditLog, AuditLogListParams } from '@/types/audit.types';
import Pagination from '../../components/Pagination';
import { DEFAULT_PAGE_SIZE } from '../../constants/pagination';
import './AuditLogPage.css';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN');
}

interface Filters {
  serviceName: string;
  action: string;
  resourceType: string;
  actorId: string;
  from: string;
  to: string;
}

const DEFAULT_FILTERS: Filters = {
  serviceName: '',
  action: '',
  resourceType: '',
  actorId: '',
  from: '',
  to: '',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async (p: number, f: Filters) => {
    setLoading(true);
    setError('');
    const params: AuditLogListParams = {
      page: p,
      size: DEFAULT_PAGE_SIZE,
      ...(f.serviceName ? { serviceName: f.serviceName } : {}),
      ...(f.action ? { action: f.action } : {}),
      ...(f.resourceType ? { resourceType: f.resourceType } : {}),
      ...(f.actorId ? { actorId: f.actorId } : {}),
      ...(f.from ? { from: f.from } : {}),
      ...(f.to ? { to: f.to } : {}),
    };
    const res = await auditService.list(params);
    if (res.success) {
      setLogs(res.data.items);
      setTotal(res.data.total);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs(page, filters);
  }, [page, filters, fetchLogs]);

  const handleFilter = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

  return (
    <div className="audit-page">
      <div className="audit-page__header">
        <div>
          <h1>Audit Logs</h1>
          <p>Lịch sử thao tác bảo mật và nghiệp vụ quan trọng</p>
        </div>
      </div>

      <div className="audit-filters">
        <input
          value={filters.serviceName}
          onChange={(e) => handleFilter({ serviceName: e.target.value })}
          placeholder="Service (vd: course-service)"
          className="audit-filters__input"
        />
        <input
          value={filters.action}
          onChange={(e) => handleFilter({ action: e.target.value })}
          placeholder="Hành động (vd: COURSE_ARCHIVED)"
          className="audit-filters__input"
        />
        <input
          value={filters.resourceType}
          onChange={(e) => handleFilter({ resourceType: e.target.value })}
          placeholder="Loại resource (vd: COURSE)"
          className="audit-filters__input"
        />
        <input
          value={filters.actorId}
          onChange={(e) => handleFilter({ actorId: e.target.value })}
          placeholder="Actor ID"
          className="audit-filters__input"
        />
        <input
          type="date"
          value={filters.from}
          onChange={(e) => handleFilter({ from: e.target.value ? `${e.target.value}T00:00:00.000Z` : '' })}
          className="audit-filters__input"
          title="Từ ngày"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => handleFilter({ to: e.target.value ? `${e.target.value}T23:59:59.999Z` : '' })}
          className="audit-filters__input"
          title="Đến ngày"
        />
        <button
          className="audit-filters__reset"
          onClick={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
        >
          Đặt lại
        </button>
      </div>

      {error && <div className="audit-page__error">{error}</div>}

      <div className="audit-table-wrap">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Service</th>
              <th>Hành động</th>
              <th>Loại resource</th>
              <th>Actor role</th>
              <th>Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="audit-table__loading">Đang tải...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="audit-table__loading">Không có dữ liệu.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="audit-table__row" onClick={() => setSelected(log)}>
                  <td>{formatDate(log.occurredAt)}</td>
                  <td><span className="audit-chip">{log.serviceName}</span></td>
                  <td className="audit-table__action">{log.action}</td>
                  <td>{log.resourceType}</td>
                  <td>{log.actorRole}</td>
                  <td>
                    <span className={`audit-outcome audit-outcome--${log.outcome.toLowerCase()}`}>
                      {log.outcome}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={DEFAULT_PAGE_SIZE}
        label="bản ghi"
        onChange={setPage}
      />

      {selected && (
        <div className="audit-detail__overlay" onClick={() => setSelected(null)}>
          <div className="audit-detail" onClick={(e) => e.stopPropagation()}>
            <div className="audit-detail__header">
              <span>Chi tiết Audit Log</span>
              <button onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="audit-detail__body">
              {[
                ['ID', selected.id],
                ['Event ID', selected.eventId],
                ['Service', selected.serviceName],
                ['Hành động', selected.action],
                ['Loại resource', selected.resourceType],
                ['Resource ID', selected.resourceId],
                ['Actor ID', selected.actorId],
                ['Actor Role', selected.actorRole],
                ['Kết quả', selected.outcome],
                ['IP', selected.ipAddress ?? '—'],
                ['HTTP Method', selected.httpMethod ?? '—'],
                ['Request Path', selected.requestPath ?? '—'],
                ['Thời gian', formatDate(selected.occurredAt)],
                ['Correlation ID', selected.correlationId],
              ].map(([label, value]) => (
                <div key={label} className="audit-detail__row">
                  <span className="audit-detail__label">{label}</span>
                  <span className="audit-detail__value">{value}</span>
                </div>
              ))}
              {Object.keys(selected.metadata).length > 0 && (
                <div className="audit-detail__row">
                  <span className="audit-detail__label">Metadata</span>
                  <pre className="audit-detail__meta">{JSON.stringify(selected.metadata, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
