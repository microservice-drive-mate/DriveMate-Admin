import { useCallback, useState } from "react";
import { userService } from "@/services";
import { useAsyncData } from "@/hooks/useAsyncData";
import { FileUploader } from "@/components/common/FileUploader";
import { getRenderableMediaUrl } from "@/lib";
import { ALLOWED_IMAGE_MIMES, ALLOWED_DOCUMENT_MIMES } from "@/constants/media";
import type { MediaReference } from "@/types/media.types";
import type { UserDocument, UserDocumentType, AddDocumentPayload } from "@/types/user-profile.types";

const DOC_ACCEPT = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_DOCUMENT_MIMES];

const DOC_TYPE_LABELS: Record<UserDocumentType, string> = {
  ID_CARD_FRONT: "CCCD mặt trước",
  ID_CARD_BACK: "CCCD mặt sau",
  PORTRAIT: "Ảnh chân dung",
  HEALTH_CERTIFICATE: "Giấy khám sức khoẻ",
  OTHER: "Khác",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f9c74f",
  APPROVED: "#4ade80",
  REJECTED: "#f87171",
};

interface Props {
  userId: string;
}

interface AddForm {
  type: UserDocumentType;
  file: MediaReference | null;
  title: string;
}

const INITIAL_FORM: AddForm = { type: "ID_CARD_FRONT", file: null, title: "" };

export function DocumentsTab({ userId }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddForm>(INITIAL_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [viewError, setViewError] = useState("");

  const load = useCallback(
    () => userService.getDocuments(userId),
    [userId],
  );
  const { data: docs, loading, error, refetch } = useAsyncData<UserDocument[]>(load, {
    initialData: [],
    enabled: true,
    retainPreviousData: false,
  });

  const handleAdd = async () => {
    if (!form.file) { setFormError("Vui lòng tải lên tệp tài liệu"); return; }
    setSaving(true);
    setFormError("");
    const payload: AddDocumentPayload = {
      type: form.type,
      mediaFileId: form.file.mediaFileId,
      title: form.title.trim() || undefined,
    };
    const res = await userService.addDocument(userId, payload);
    setSaving(false);
    if (res.success) {
      setForm(INITIAL_FORM);
      setShowAdd(false);
      refetch();
    } else {
      setFormError(res.error);
    }
  };

  const handleView = async (doc: UserDocument) => {
    setOpeningId(doc.id);
    setViewError("");
    try {
      const url = await getRenderableMediaUrl(doc.mediaFileId);
      window.open(url, "_blank", "noopener");
    } catch {
      setViewError("Không mở được tệp. Vui lòng thử lại.");
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="card-surface student-detail__chart-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h2>Tài Liệu</h2>
        <button
          style={{ background: "rgba(99,102,241,0.15)", border: "1px solid #6366f1", color: "#a5b4fc", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}
          onClick={() => { setShowAdd((v) => !v); setFormError(""); }}
        >
          {showAdd ? "Hủy" : "+ Thêm tài liệu"}
        </button>
      </div>

      {showAdd && (
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
          {formError && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 8 }}>{formError}</div>}
          <div style={{ display: "grid", gap: 10, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Loại tài liệu *</div>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as UserDocumentType }))}
                disabled={saving}
                style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "#f0f0f0", padding: "6px 8px", fontSize: 13 }}
              >
                {(Object.keys(DOC_TYPE_LABELS) as UserDocumentType[]).map((t) => (
                  <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Tệp tài liệu *</div>
              <FileUploader
                value={form.file}
                onChange={(next) => setForm((f) => ({ ...f, file: next }))}
                disabled={saving}
                accept={DOC_ACCEPT}
                label="Bấm hoặc kéo thả tệp vào đây"
              />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Tiêu đề (tùy chọn)</div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              disabled={saving}
              placeholder="VD: CCCD của Nguyễn Văn A"
              style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "#f0f0f0", padding: "6px 8px", fontSize: 13, boxSizing: "border-box" }}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={saving}
            style={{ background: "#6366f1", border: "none", color: "#fff", borderRadius: 6, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      )}

      {loading && <p style={{ color: "rgba(255,255,255,0.4)", padding: "12px 0" }}>Đang tải...</p>}
      {error && <p style={{ color: "#f87171", fontSize: 13 }}>{error}</p>}
      {viewError && <p style={{ color: "#f87171", fontSize: 13 }}>{viewError}</p>}
      {!loading && docs.length === 0 && (
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, padding: "10px 0" }}>Chưa có tài liệu nào.</p>
      )}
      {docs.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, textTransform: "uppercase" }}>
              <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 600 }}>Loại</th>
              <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 600 }}>Tiêu đề</th>
              <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 600 }}>Trạng thái</th>
              <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 600 }}>File</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "8px 0" }}>{DOC_TYPE_LABELS[doc.type] ?? doc.type}</td>
                <td style={{ padding: "8px" }}>{doc.title ?? doc.originalName ?? "—"}</td>
                <td style={{ padding: "8px" }}>
                  {doc.status ? (
                    <span style={{ color: STATUS_COLORS[doc.status] ?? "#f0f0f0", fontSize: 12, fontWeight: 600 }}>
                      {STATUS_LABELS[doc.status] ?? doc.status}
                    </span>
                  ) : "—"}
                </td>
                <td style={{ padding: "8px" }}>
                  <button
                    type="button"
                    onClick={() => handleView(doc)}
                    disabled={openingId === doc.id}
                    style={{ background: "none", border: "none", color: "#a5b4fc", fontSize: 12, cursor: "pointer", padding: 0 }}
                  >
                    {openingId === doc.id ? "Đang mở..." : "Xem file"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
